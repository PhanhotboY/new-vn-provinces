// Autocomplete functionality for better UX
import {
	getProvinceData,
	getWardData,
	loadProvinceData,
	loadWardData,
} from '../cache';
import { normalizeText } from '../utils';

export interface AutocompleteResult {
	type: 'province' | 'ward' | 'commune';
	id: string;
	name: string;
	parentName?: string;
	score: number;
}

/**
 * Get autocomplete suggestions for provinces
 */
export const getProvinceAutocomplete = async (
	query: string,
	limit: number = 10
): Promise<AutocompleteResult[]> => {
	await loadProvinceData();
	const provinces = await getProvinceData();
	const normalizedQuery = normalizeText(query);

	const results: AutocompleteResult[] = [];

	for (const province of provinces) {
		const normalizedName = normalizeText(province.name);
		let score = 0;

		// Exact match gets highest score
		if (normalizedName === normalizedQuery) {
			score = 100;
		}
		// Starts with query gets high score
		else if (normalizedName.startsWith(normalizedQuery)) {
			score = 90 - (normalizedName.length - normalizedQuery.length);
		}
		// Contains query gets medium score
		else if (normalizedName.includes(normalizedQuery)) {
			score = 70 - normalizedName.indexOf(normalizedQuery) * 2;
		}
		// Word starts with query gets lower score
		else {
			const words = normalizedName.split(/\s+/);
			for (const word of words) {
				if (word.startsWith(normalizedQuery)) {
					score = 50 - (word.length - normalizedQuery.length);
					break;
				}
			}
		}

		if (score > 0) {
			results.push({
				type: 'province',
				id: province.idProvince,
				name: province.name,
				score,
			});
		}
	}

	return results.sort((a, b) => b.score - a.score).slice(0, limit);
};

/**
 * Get autocomplete suggestions for wards
 */
export const getWardAutocomplete = async (
	query: string,
	provinceId?: string,
	limit: number = 10
): Promise<AutocompleteResult[]> => {
	await loadWardData();
	await loadProvinceData();

	const wards = await getWardData();
	const provinces = await getProvinceData();
	const provinceMap = new Map(provinces.map((p) => [p.idProvince, p.name]));

	const normalizedQuery = normalizeText(query);
	const results: AutocompleteResult[] = [];

	const filteredWards = provinceId
		? wards.filter((d) => d.idProvince === provinceId)
		: wards;

	for (const ward of filteredWards) {
		const normalizedName = normalizeText(ward.name);
		let score = 0;

		if (normalizedName === normalizedQuery) {
			score = 100;
		} else if (normalizedName.startsWith(normalizedQuery)) {
			score = 90 - (normalizedName.length - normalizedQuery.length);
		} else if (normalizedName.includes(normalizedQuery)) {
			score = 70 - normalizedName.indexOf(normalizedQuery) * 2;
		} else {
			const words = normalizedName.split(/\s+/);
			for (const word of words) {
				if (word.startsWith(normalizedQuery)) {
					score = 50 - (word.length - normalizedQuery.length);
					break;
				}
			}
		}

		if (score > 0) {
			results.push({
				type: 'ward',
				id: ward.idWard,
				name: ward.name,
				parentName: provinceMap.get(ward.idProvince),
				score,
			});
		}
	}

	return results.sort((a, b) => b.score - a.score).slice(0, limit);
};

/**
 * Universal autocomplete that searches across all types
 */
export const getUniversalAutocomplete = async (
	query: string,
	limit: number = 15
): Promise<AutocompleteResult[]> => {
	const [provinces, wards] = await Promise.all([
		getProvinceAutocomplete(query, Math.ceil(limit / 3)),
		getWardAutocomplete(query, undefined, Math.ceil(limit / 3)),
	]);

	const allResults = [...provinces, ...wards];

	return allResults.sort((a, b) => b.score - a.score).slice(0, limit);
};
