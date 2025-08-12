import { getWardData } from '../cache';
import { Ward } from './types';

/**
 * Lấy danh sách tất cả xã/phường (lazy loading)
 */
export const getAllWards = async (): Promise<Ward[]> => {
	return await getWardData();
};
