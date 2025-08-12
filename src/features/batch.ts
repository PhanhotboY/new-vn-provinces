// Batch operations for better performance when dealing with multiple items
import {
	getProvinceById,
	getWardsByProvinceId,
	isValidProvinceId,
} from '../cache';
import { Province } from '../provinces/types';
import { getWardById, Ward } from '../wards';

export interface BatchResult<T> {
	success: T[];
	failed: string[];
}

/**
 * Get multiple provinces by IDs in a single batch operation
 */
export const getProvincesBatch = async (
	provinceIds: string[]
): Promise<BatchResult<Province>> => {
	const results = await Promise.allSettled(
		provinceIds.map((id) => getProvinceById(id))
	);

	const success: Province[] = [];
	const failed: string[] = [];

	results.forEach((result, index) => {
		if (result.status === 'fulfilled' && result.value) {
			success.push(result.value);
		} else {
			failed.push(provinceIds[index]);
		}
	});

	return { success, failed };
};

/**
 * Get multiple wards by IDs in a single batch operation
 */
export const getWardsBatch = async (
	wardIds: string[]
): Promise<BatchResult<Ward>> => {
	const results = await Promise.allSettled(
		wardIds.map((id) => getWardById(id))
	);

	const success: Ward[] = [];
	const failed: string[] = [];

	results.forEach((result, index) => {
		if (result.status === 'fulfilled' && result.value) {
			success.push(result.value);
		} else {
			failed.push(wardIds[index]);
		}
	});

	return { success, failed };
};

/**
 * Get wards for multiple provinces in a single batch operation
 */
export const getWardsForProvincesBatch = async (
	provinceIds: string[]
): Promise<Record<string, Ward[]>> => {
	const results = await Promise.allSettled(
		provinceIds.map(async (id) => ({
			provinceId: id,
			wards: await getWardsByProvinceId(id),
		}))
	);

	const output: Record<string, Ward[]> = {};

	results.forEach((result) => {
		if (result.status === 'fulfilled') {
			output[result.value.provinceId] = result.value.wards;
		}
	});

	return output;
};

/**
 * Validate multiple province IDs in a single batch operation
 */
export const validateProvinceIdsBatch = async (
	provinceIds: string[]
): Promise<Record<string, boolean>> => {
	const results = await Promise.allSettled(
		provinceIds.map(async (id) => ({
			id,
			isValid: await isValidProvinceId(id),
		}))
	);

	const output: Record<string, boolean> = {};

	results.forEach((result) => {
		if (result.status === 'fulfilled') {
			output[result.value.id] = result.value.isValid;
		}
	});

	return output;
};

/**
 * Get full address information for multiple commune IDs
 */
export const getFullAddressesBatch = async (
	wardIds: string[]
): Promise<
	Array<{
		wardId: string;
		ward?: Ward;
		province?: Province;
		fullAddress?: string;
	}>
> => {
	const results = await Promise.allSettled(
		wardIds.map(async (wardId) => {
			const ward = await getWardById(wardId);
			if (!ward) {
				return { wardId };
			}

			const province = await getProvinceById(ward.idProvince);
			if (!province) {
				return { wardId, ward, province };
			}

			const fullAddress = `${ward.name}, ${province.name}`;

			return {
				wardId,
				ward,
				province,
				fullAddress,
			};
		})
	);

	return results.map((result, index) => {
		if (result.status === 'fulfilled') {
			return result.value;
		}
		return { wardId: wardIds[index] };
	});
};

/**
 * Batch operation to get statistics for multiple provinces
 */
export const getProvinceStatsBatch = async (
	provinceIds: string[]
): Promise<
	Array<{
		province: Province;
		wardCount: number;
	}>
> => {
	const results = await Promise.allSettled(
		provinceIds.map(async (provinceId) => {
			const [province, wards] = await Promise.all([
				getProvinceById(provinceId),
				getWardsByProvinceId(provinceId),
			]);

			if (!province) throw new Error(`Province ${provinceId} not found`);

			return {
				province,
				wardCount: wards.length,
			};
		})
	);

	return results
		.filter(
			(result): result is PromiseFulfilledResult<any> =>
				result.status === 'fulfilled'
		)
		.map((result) => result.value);
};
