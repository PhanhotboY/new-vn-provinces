import { getAllProvince } from './getAllProvinces';
import { getAllProvincesSorted } from './getAllProvincesSorted';
import { getWardsByProvinceId } from './getWardsByProvinceId';
import { isValidProvinceId } from './isValidProvinceId';
import { searchProvinceByName } from './searchProvinceByName';
import { Province } from './types';

export type { Province };
export {
	getAllProvince,
	getAllProvincesSorted,
	getWardsByProvinceId,
	isValidProvinceId,
	searchProvinceByName,
};
