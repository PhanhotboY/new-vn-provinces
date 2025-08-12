import { getWardsByProvinceId as getCachedWards } from '../cache';
import { Ward } from '../wards/types';

export const getWardsByProvinceId = async (
	provinceId: string
): Promise<Ward[]> => {
	return await getCachedWards(provinceId);
};
