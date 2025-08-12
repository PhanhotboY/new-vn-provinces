// Advanced fuzzy search and matching utilities
import { normalizeText } from '../utils';
import { getProvinceData, getWardData } from '../cache';
import { Province } from '../provinces/types';
import { Ward } from '../wards';

export interface FuzzySearchOptions {
	threshold?: number; // Minimum similarity score (0-1)
	maxResults?: number; // Maximum number of results
	includeScore?: boolean; // Include similarity score in results
	caseSensitive?: boolean; // Case sensitive matching
	exactMatchBonus?: number; // Bonus score for exact matches
	prefixMatchBonus?: number; // Bonus score for prefix matches
	wordMatchBonus?: number; // Bonus score for word matches
}

export interface FuzzySearchResult<T> {
	item: T;
	score: number;
	matches: {
		field: string;
		value: string;
		score: number;
		type: 'exact' | 'prefix' | 'word' | 'fuzzy';
	}[];
}

export interface AdvancedSearchOptions extends FuzzySearchOptions {
	searchFields?: string[]; // Fields to search in
	filters?: {
		provinceId?: string;
		type?: 'province' | 'ward';
	};
	sortBy?: 'score' | 'name' | 'relevance';
	groupBy?: 'type' | 'province';
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
	const matrix = Array(str2.length + 1)
		.fill(null)
		.map(() => Array(str1.length + 1).fill(null));

	for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
	for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

	for (let j = 1; j <= str2.length; j++) {
		for (let i = 1; i <= str1.length; i++) {
			const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
			matrix[j][i] = Math.min(
				matrix[j][i - 1] + 1, // deletion
				matrix[j - 1][i] + 1, // insertion
				matrix[j - 1][i - 1] + indicator // substitution
			);
		}
	}

	return matrix[str2.length][str1.length];
}

/**
 * Calculate similarity score between two strings
 */
function calculateSimilarity(str1: string, str2: string): number {
	if (str1 === str2) return 1;

	const maxLength = Math.max(str1.length, str2.length);
	if (maxLength === 0) return 1;

	const distance = levenshteinDistance(str1, str2);
	return 1 - distance / maxLength;
}

/**
 * Calculate Jaro-Winkler similarity
 */
function jaroWinklerSimilarity(str1: string, str2: string): number {
	if (str1 === str2) return 1;

	const len1 = str1.length;
	const len2 = str2.length;

	if (len1 === 0 || len2 === 0) return 0;

	const matchWindow = Math.floor(Math.max(len1, len2) / 2) - 1;
	if (matchWindow < 0) return 0;

	const str1Matches = new Array(len1).fill(false);
	const str2Matches = new Array(len2).fill(false);

	let matches = 0;
	let transpositions = 0;

	// Find matches
	for (let i = 0; i < len1; i++) {
		const start = Math.max(0, i - matchWindow);
		const end = Math.min(i + matchWindow + 1, len2);

		for (let j = start; j < end; j++) {
			if (str2Matches[j] || str1[i] !== str2[j]) continue;
			str1Matches[i] = true;
			str2Matches[j] = true;
			matches++;
			break;
		}
	}

	if (matches === 0) return 0;

	// Find transpositions
	let k = 0;
	for (let i = 0; i < len1; i++) {
		if (!str1Matches[i]) continue;
		while (!str2Matches[k]) k++;
		if (str1[i] !== str2[k]) transpositions++;
		k++;
	}

	const jaro =
		(matches / len1 +
			matches / len2 +
			(matches - transpositions / 2) / matches) /
		3;

	// Jaro-Winkler prefix bonus
	let prefix = 0;
	for (let i = 0; i < Math.min(len1, len2, 4); i++) {
		if (str1[i] === str2[i]) prefix++;
		else break;
	}

	return jaro + 0.1 * prefix * (1 - jaro);
}

/**
 * Advanced fuzzy search with multiple algorithms
 */
function fuzzyMatch(
	query: string,
	target: string,
	options: FuzzySearchOptions = {}
): { score: number; type: 'exact' | 'prefix' | 'word' | 'fuzzy' } {
	const normalizedQuery = options.caseSensitive ? query : normalizeText(query);
	const normalizedTarget = options.caseSensitive
		? target
		: normalizeText(target);

	// Exact match
	if (normalizedQuery === normalizedTarget) {
		return { score: 1 + (options.exactMatchBonus || 0), type: 'exact' };
	}

	// Prefix match
	if (normalizedTarget.startsWith(normalizedQuery)) {
		const score = 0.9 + (options.prefixMatchBonus || 0);
		return { score, type: 'prefix' };
	}

	// Word match
	const targetWords = normalizedTarget.split(/\s+/);
	const queryWords = normalizedQuery.split(/\s+/);

	let wordMatches = 0;
	for (const queryWord of queryWords) {
		for (const targetWord of targetWords) {
			if (
				targetWord.startsWith(queryWord) ||
				queryWord.startsWith(targetWord)
			) {
				wordMatches++;
				break;
			}
		}
	}

	if (wordMatches > 0) {
		const wordScore =
			(wordMatches / Math.max(queryWords.length, targetWords.length)) * 0.8;
		return { score: wordScore + (options.wordMatchBonus || 0), type: 'word' };
	}

	// Fuzzy match using multiple algorithms
	const levenshteinScore = calculateSimilarity(
		normalizedQuery,
		normalizedTarget
	);
	const jaroWinklerScore = jaroWinklerSimilarity(
		normalizedQuery,
		normalizedTarget
	);

	// Weighted average of different algorithms
	const fuzzyScore = levenshteinScore * 0.6 + jaroWinklerScore * 0.4;

	return { score: fuzzyScore, type: 'fuzzy' };
}

/**
 * Fuzzy search provinces
 */
export const fuzzySearchProvinces = async (
	query: string,
	options: FuzzySearchOptions = {}
): Promise<FuzzySearchResult<Province>[]> => {
	const provinces = await getProvinceData();
	const threshold = options.threshold || 0.3;
	const maxResults = options.maxResults || 50;

	const results: FuzzySearchResult<Province>[] = [];

	for (const province of provinces) {
		const nameMatch = fuzzyMatch(query, province.name, options);

		if (nameMatch.score >= threshold) {
			results.push({
				item: province,
				score: nameMatch.score,
				matches: [
					{
						field: 'name',
						value: province.name,
						score: nameMatch.score,
						type: nameMatch.type,
					},
				],
			});
		}
	}

	return results.sort((a, b) => b.score - a.score).slice(0, maxResults);
};

/**
 * Fuzzy search wards
 */
export const fuzzySearchWards = async (
	query: string,
	options: FuzzySearchOptions = {}
): Promise<FuzzySearchResult<Ward>[]> => {
	const wards = await getWardData();
	const threshold = options.threshold || 0.3;
	const maxResults = options.maxResults || 50;

	const results: FuzzySearchResult<Ward>[] = [];

	for (const ward of wards) {
		const nameMatch = fuzzyMatch(query, ward.name, options);

		if (nameMatch.score >= threshold) {
			results.push({
				item: ward,
				score: nameMatch.score,
				matches: [
					{
						field: 'name',
						value: ward.name,
						score: nameMatch.score,
						type: nameMatch.type,
					},
				],
			});
		}
	}

	return results.sort((a, b) => b.score - a.score).slice(0, maxResults);
};

/**
 * Universal fuzzy search across all types
 */
export const universalFuzzySearch = async (
	query: string,
	options: AdvancedSearchOptions = {}
): Promise<{
	provinces: FuzzySearchResult<Province>[];
	wards: FuzzySearchResult<Ward>[];
	combined: Array<
		FuzzySearchResult<Province | Ward> & {
			type: 'province' | 'ward';
		}
	>;
}> => {
	const [provinces, wards] = await Promise.all([
		fuzzySearchProvinces(query, options),
		fuzzySearchWards(query, options),
	]);

	// Apply filters
	let filteredProvinces = provinces;
	let filteredWards = wards;

	if (options.filters?.provinceId) {
		filteredWards = wards.filter(
			(w) => w.item.idProvince === options.filters!.provinceId
		);
	}

	if (options.filters?.type) {
		switch (options.filters.type) {
			case 'province':
				filteredWards = [];
				break;

			case 'ward':
				filteredProvinces = [];
				break;
		}
	}

	// Combine results
	const combined = [
		...filteredProvinces.map((p) => ({ ...p, type: 'province' as const })),
		...filteredWards.map((w) => ({ ...w, type: 'ward' as const })),
	];

	// Sort combined results
	if (options.sortBy === 'name') {
		combined.sort((a, b) => a.item.name.localeCompare(b.item.name, 'vi'));
	} else if (options.sortBy === 'relevance') {
		// Custom relevance scoring: provinces > wards for same score
		combined.sort((a, b) => {
			if (a.score !== b.score) return b.score - a.score;
			const typeOrder = { province: 2, ward: 1 };
			return typeOrder[b.type] - typeOrder[a.type];
		});
	} else {
		// Default: sort by score
		combined.sort((a, b) => b.score - a.score);
	}

	return {
		provinces: filteredProvinces,
		wards: filteredWards,
		combined: combined.slice(0, options.maxResults || 50),
	};
};

/**
 * Find similar names (useful for detecting duplicates or variations)
 */
export const findSimilarNames = async (
	name: string,
	type: 'province' | 'ward',
	threshold: number = 0.8
): Promise<Array<{ item: Province | Ward; similarity: number }>> => {
	let data: (Province | Ward)[];

	switch (type) {
		case 'province':
			data = await getProvinceData();
			break;
		case 'ward':
			data = await getWardData();
			break;
	}

	const normalizedName = normalizeText(name);
	const results = [];

	for (const item of data) {
		const similarity = jaroWinklerSimilarity(
			normalizedName,
			normalizeText(item.name)
		);
		if (
			similarity >= threshold &&
			normalizeText(item.name) !== normalizedName
		) {
			results.push({ item, similarity });
		}
	}

	return results.sort((a, b) => b.similarity - a.similarity);
};

/**
 * Suggest corrections for misspelled names
 */
export const suggestCorrections = async (
	query: string,
	type?: 'province' | 'ward'
): Promise<
	Array<{
		suggestion: string;
		type: 'province' | 'ward';
		confidence: number;
		item: Province | Ward;
	}>
> => {
	const searchOptions: AdvancedSearchOptions = {
		threshold: 0.4,
		maxResults: 10,
		filters: type ? { type } : undefined,
	};

	const results = await universalFuzzySearch(query, searchOptions);

	return results.combined.map((result) => ({
		suggestion: result.item.name,
		type: result.type,
		confidence: result.score,
		item: result.item,
	}));
};
