import { searchWards } from '../cache';
import compare from 'natural-compare';
import { Ward } from './types';
import { memoize } from '../utils';

/**
 * Tìm xã/phường theo tên (tìm kiếm tối ưu với index)
 */
const _searchWardByName = async (name: string): Promise<Ward[]> => {
	const results = await searchWards(name);
	return results.sort((a, b) => compare(a.name, b.name));
};

// Memoize search results for better performance
export const searchWardByName = memoize(_searchWardByName);
