// Centralized cache and index management for performance optimization
import { Province } from '../provinces/types';
import { Ward } from '../wards/types';
import {
	createSearchIndex,
	createIdMap,
	createHierarchicalMap,
	normalizeText,
} from '../utils';

// Lazy loading flags
let isProvinceDataLoaded = false;
let isWardDataLoaded = false;

// Data storage
let provinceData: Province[] = [];
let wardData: Ward[] = [];

// Index maps for fast lookup
let provinceIdMap: Map<string, Province>;
let wardIdMap: Map<string, Ward>;

// Hierarchical maps
let wardsByProvinceMap: Map<string, Ward[]>;

// Search indexes
let provinceSearchIndex: Map<string, Province[]>;
let wardSearchIndex: Map<string, Ward[]>;

/**
 * Lazy load province data and create indexes
 */
export const loadProvinceData = async (): Promise<void> => {
	if (isProvinceDataLoaded) return;

	const { provinceData: data } = await import('../seeds/vietnam');
	provinceData = data;

	// Create indexes
	provinceIdMap = createIdMap(provinceData, 'idProvince');
	provinceSearchIndex = createSearchIndex(provinceData);

	isProvinceDataLoaded = true;
};

/**
 * Lazy load ward data and create indexes
 */
export const loadWardData = async (): Promise<void> => {
	if (isWardDataLoaded) return;

	const { wardData: data } = await import('../seeds/vietnam');
	wardData = data;

	// Create indexes
	wardIdMap = createIdMap(wardData, 'idWard');
	wardsByProvinceMap = createHierarchicalMap(wardData, 'idProvince');
	wardSearchIndex = createSearchIndex(wardData);

	isWardDataLoaded = true;
};

/**
 * Get province data (with lazy loading)
 */
export const getProvinceData = async (): Promise<Province[]> => {
	await loadProvinceData();
	return provinceData;
};

/**
 * Get ward data (with lazy loading)
 */
export const getWardData = async (): Promise<Ward[]> => {
	await loadWardData();
	return wardData;
};

/**
 * Get province by ID (O(1) lookup)
 */
export const getProvinceById = async (
	id: string
): Promise<Province | undefined> => {
	await loadProvinceData();
	return provinceIdMap.get(id);
};

/**
 * Get ward by ID (O(1) lookup)
 */
export const getWardById = async (id: string): Promise<Ward | undefined> => {
	await loadWardData();
	return wardIdMap.get(id);
};

/**
 * Get wards by province ID (O(1) lookup)
 */
export const getWardsByProvinceId = async (
	provinceId: string
): Promise<Ward[]> => {
	await loadWardData();
	return wardsByProvinceMap.get(provinceId) || [];
};

/**
 * Search provinces by name (using index)
 */
export const searchProvinces = async (query: string): Promise<Province[]> => {
	await loadProvinceData();
	const normalizedQuery = normalizeText(query);
	const results = new Set<Province>();

	// Exact and prefix matches
	for (const [key, provinces] of provinceSearchIndex.entries()) {
		if (key.includes(normalizedQuery) || normalizedQuery.includes(key)) {
			provinces.forEach((province) => results.add(province));
		}
	}

	return Array.from(results);
};

/**
 * Search wards by name (using index)
 */
export const searchWards = async (query: string): Promise<Ward[]> => {
	await loadWardData();
	const normalizedQuery = normalizeText(query);
	const results = new Set<Ward>();

	// Exact and prefix matches
	for (const [key, wards] of wardSearchIndex.entries()) {
		if (key.includes(normalizedQuery) || normalizedQuery.includes(key)) {
			wards.forEach((ward) => results.add(ward));
		}
	}

	return Array.from(results);
};

/**
 * Check if province ID is valid (O(1) lookup)
 */
export const isValidProvinceId = async (id: string): Promise<boolean> => {
	await loadProvinceData();
	return provinceIdMap.has(id);
};
