// Hierarchical data structures and navigation
import {
	getProvinceData,
	getProvinceById,
	getWardsByProvinceId,
	getWardById,
} from '../cache';
import { Province } from '../provinces/types';
import { Ward } from '../wards';

export interface ProvinceWithWards extends Province {
	wards: Ward[];
}

export interface FullHierarchy extends Province {
	wards: Ward[];
}

export interface AddressPath {
	province?: Province;
	ward?: Ward;
}

/**
 * Get province with all its wards
 */
export const getProvinceWithWards = async (
	provinceId: string
): Promise<ProvinceWithWards | null> => {
	const [province, wards] = await Promise.all([
		getProvinceById(provinceId),
		getWardsByProvinceId(provinceId),
	]);

	if (!province) return null;

	return {
		...province,
		wards,
	};
};

/**
 * Get full hierarchy for a province (province -> wards)
 */
export const getFullHierarchy = async (
	provinceId: string
): Promise<FullHierarchy | null> => {
	const province = await getProvinceById(provinceId);
	if (!province) return null;

	const wards = await getWardsByProvinceId(provinceId);

	return {
		...province,
		wards,
	};
};

/**
 * Get the full address path for a ward (ward -> province)
 */
export const getAddressPath = async (
	wardId: string
): Promise<AddressPath | null> => {
	const ward = await getWardById(wardId);
	if (!ward) return null;

	const province = await getProvinceById(ward.idProvince);
	if (!province) return { ward };

	return {
		province,
		ward,
	};
};

/**
 * Get formatted address string
 */
export const getFormattedAddress = async (
	wardId: string,
	format: 'full' | 'short' = 'full'
): Promise<string | null> => {
	const path = await getAddressPath(wardId);
	if (!path || !path.ward) return null;

	const parts: string[] = [];

	if (path.ward) parts.push(path.ward.name);
	if (path.province) parts.push(path.province.name);

	if (format === 'short' && parts.length > 2) {
		// Return only ward and province for short format
		return `${parts[0]}, ${parts[parts.length - 1]}`;
	}

	return parts.join(', ');
};

/**
 * Get all provinces with their ward counts
 */
export const getProvincesWithStats = async (): Promise<
	Array<Province & { wardCount: number }>
> => {
	const provinces = await getProvinceData();

	const provincesWithStats = await Promise.all(
		provinces.map(async (province) => {
			const wards = await getWardsByProvinceId(province.idProvince);
			return {
				...province,
				wardCount: wards.length,
			};
		})
	);

	return provincesWithStats;
};

/**
 * Validate address hierarchy (check if ward belongs to province)
 */
export const validateAddressHierarchy = async (
	provinceId: string,
	wardId: string
): Promise<boolean> => {
	const ward = await getWardById(wardId);
	if (!ward) return false;

	return ward.idProvince === provinceId;
};

/**
 * Get neighboring wards (wards in the same province)
 */
export const getNeighboringWards = async (wardId: string): Promise<Ward[]> => {
	const ward = await getWardById(wardId);
	if (!ward) return [];

	const allWards = await getWardsByProvinceId(ward.idProvince);
	return allWards.filter((w) => w.idWard !== wardId);
};
