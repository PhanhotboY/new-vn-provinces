import { getWardById as getCachedWard } from '../cache';
import { Ward } from './types';

/**
 * Lấy thông tin một xã/phường theo mã (O(1) lookup)
 */
export const getWardById = async (
	communeId: string
): Promise<Ward | undefined> => {
	return await getCachedWard(communeId);
};
