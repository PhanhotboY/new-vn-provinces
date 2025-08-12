// Analytics and statistics features for Vietnam administrative data
import { getProvinceData, getWardData, getWardsByProvinceId } from '../cache';
import { Province } from '../provinces/types';
import { Ward } from '../wards';

export interface ProvinceStats {
	province: Province;
	wardCount: number;
}

export interface NationalStats {
	totalProvinces: number;
	totalWards: number;
	averageWardsPerProvince: number;
	largestProvince: {
		province: Province;
		wardCount: number;
	};
	smallestProvince: {
		province: Province;
		wardCount: number;
	};
}

export interface RegionStats {
	regionName: string;
	provinces: Province[];
	totalWards: number;
	averageWardsPerProvince: number;
}

/**
 * Get detailed statistics for a specific province
 */
export const getProvinceStats = async (
	provinceId: string
): Promise<ProvinceStats | null> => {
	const [provinces, wards] = await Promise.all([
		getProvinceData(),
		getWardsByProvinceId(provinceId),
	]);

	const province = provinces.find((p) => p.idProvince === provinceId);
	if (!province) return null;

	return {
		province,
		wardCount: wards.length,
	};
};

/**
 * Get national statistics for all of Vietnam
 */
export const getNationalStats = async (): Promise<NationalStats> => {
	const [provinces, wards] = await Promise.all([
		getProvinceData(),
		getWardData(),
	]);

	// Calculate province statistics
	const provinceStats = await Promise.all(
		provinces.map(async (province) => {
			const provinceWards = await getWardsByProvinceId(province.idProvince);

			return {
				province,
				wardCount: provinceWards.length,
			};
		})
	);

	// Find largest and smallest provinces
	const sortedByWards = provinceStats.sort((a, b) => b.wardCount - a.wardCount);
	const largestProvince = sortedByWards[0];
	const smallestProvince = sortedByWards[sortedByWards.length - 1];

	const averageWardsPerProvince = wards.length / provinces.length;

	return {
		totalProvinces: provinces.length,
		totalWards: wards.length,
		averageWardsPerProvince: Math.round(averageWardsPerProvince * 100) / 100,
		largestProvince,
		smallestProvince,
	};
};

/**
 * Get statistics by region (North, Central, South)
 */
export const getRegionStats = async (): Promise<RegionStats[]> => {
	const provinces = await getProvinceData();

	// Define regions based on province IDs (simplified classification)
	const regions = {
		North: provinces.filter((p) => parseInt(p.idProvince) <= 30),
		Central: provinces.filter(
			(p) => parseInt(p.idProvince) > 30 && parseInt(p.idProvince) <= 70
		),
		South: provinces.filter((p) => parseInt(p.idProvince) > 70),
	};

	const regionStats = await Promise.all(
		Object.entries(regions).map(async ([regionName, regionProvinces]) => {
			let totalWards = 0;
			for (const province of regionProvinces) {
				const wards = await getWardsByProvinceId(province.idProvince);
				totalWards += wards.length;
			}
			const averageWardsPerProvince =
				regionProvinces.length > 0 ? totalWards / regionProvinces.length : 0;

			return {
				regionName,
				provinces: regionProvinces,
				totalWards,
				averageWardsPerProvince:
					Math.round(averageWardsPerProvince * 100) / 100,
			};
		})
	);

	return regionStats;
};

/**
 * Get top N provinces by ward count
 */
export const getTopProvincesByWards = async (
	limit: number = 10
): Promise<
	Array<{
		province: Province;
		wardCount: number;
	}>
> => {
	const provinces = await getProvinceData();

	const provinceStats = await Promise.all(
		provinces.map(async (province) => {
			const wards = await getWardsByProvinceId(province.idProvince);
			return {
				province,
				wardCount: wards.length,
			};
		})
	);

	return provinceStats
		.sort((a, b) => b.wardCount - a.wardCount)
		.slice(0, limit);
};

/**
 * Get distribution of wards per province
 */
export const getWardDistribution = async (): Promise<{
	min: number;
	max: number;
	average: number;
	median: number;
	distribution: Record<number, number>;
}> => {
	const provinces = await getProvinceData();

	const wardCounts = await Promise.all(
		provinces.map(async (province) => {
			const wards = await getWardsByProvinceId(province.idProvince);
			return wards.length;
		})
	);

	const sorted = wardCounts.sort((a, b) => a - b);
	const min = sorted[0];
	const max = sorted[sorted.length - 1];
	const average =
		wardCounts.reduce((sum, count) => sum + count, 0) / wardCounts.length;
	const median =
		sorted.length % 2 === 0
			? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
			: sorted[Math.floor(sorted.length / 2)];

	// Create distribution map
	const distribution: Record<number, number> = {};
	wardCounts.forEach((count) => {
		distribution[count] = (distribution[count] || 0) + 1;
	});

	return {
		min,
		max,
		average: Math.round(average * 100) / 100,
		median,
		distribution,
	};
};
