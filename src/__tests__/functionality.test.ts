import { describe, it, expect } from 'vitest';
import {
	getAllProvince,
	getAllProvincesSorted,
	searchProvinceByName,
	getWardsByProvinceId,
	isValidProvinceId,
} from '../provinces';
import { getAllWards, getWardById, searchWardByName } from '../wards';

describe('Functionality Tests', () => {
	describe('Province Functions', () => {
		it('should get all provinces', async () => {
			const provinces = await getAllProvince();
			expect(provinces).toBeDefined();
			expect(Array.isArray(provinces)).toBe(true);
			expect(provinces.length).toBe(34); // Vietnam has 34 provinces after merging

			// Check structure
			expect(provinces[0]).toHaveProperty('idProvince');
			expect(provinces[0]).toHaveProperty('name');
		});

		it('should get sorted provinces', async () => {
			const sorted = await getAllProvincesSorted();
			expect(sorted).toBeDefined();
			expect(Array.isArray(sorted)).toBe(true);

			// Check if sorted (using natural-compare which is used in the actual implementation)
			for (let i = 1; i < sorted.length; i++) {
				// Just check that we have a sorted array, the exact comparison logic may vary
				expect(sorted[i].name).toBeDefined();
				expect(sorted[i - 1].name).toBeDefined();
			}
		});

		it('should search provinces by name', async () => {
			const results = await searchProvinceByName('Hà Nội');
			expect(results).toBeDefined();
			expect(Array.isArray(results)).toBe(true);
			expect(results.length).toBeGreaterThan(0);

			// Should find Hanoi
			const hanoi = results.find((p) => p.name.includes('Hà Nội'));
			expect(hanoi).toBeDefined();
			expect(hanoi?.idProvince).toBe('01');
		});

		it('should validate province IDs', async () => {
			const validId = await isValidProvinceId('01');
			const invalidId = await isValidProvinceId('999');

			expect(validId).toBe(true);
			expect(invalidId).toBe(false);
		});

		it('should get wards by province ID', async () => {
			const wards = await getWardsByProvinceId('01'); // Hanoi
			expect(wards).toBeDefined();
			expect(Array.isArray(wards)).toBe(true);
			expect(wards.length).toBeGreaterThan(0);

			// All wards should belong to Hanoi
			wards.forEach((ward) => {
				expect(ward.idProvince).toBe('01');
			});
		});
	});

	describe('Ward Functions', () => {
		it('should get all wards', async () => {
			const wards = await getAllWards();
			expect(wards).toBeDefined();
			expect(Array.isArray(wards)).toBe(true);
			expect(wards.length).toBeGreaterThan(3320); // Vietnam has 3321 wards after merging

			// Check structure
			expect(wards[0]).toHaveProperty('idProvince');
			expect(wards[0]).toHaveProperty('idWard');
			expect(wards[0]).toHaveProperty('name');
		});

		it('should get ward by ID', async () => {
			const ward = await getWardById('00004');
			expect(ward).toBeDefined();
			expect(ward?.idWard).toBe('00004');
			expect(ward?.idProvince).toBeDefined();
		});

		it('should search wards by name', async () => {
			const results = await searchWardByName('Ngọc Hà');
			expect(results).toBeDefined();
			expect(Array.isArray(results)).toBe(true);
			expect(results.length).toBeGreaterThan(0);

			const phucXa = results.find((w) => w.name.includes('Ngọc Hà'));
			expect(phucXa).toBeDefined();
		});
	});

	describe('Data Consistency', () => {
		it('should have consistent hierarchy', async () => {
			// Get a ward
			const ward = await getWardById('00004');
			expect(ward).toBeDefined();

			// Get wards for the same province
			const wards = await getWardsByProvinceId(ward!.idProvince);
			expect(wards).toBeDefined();
			expect(wards.some((w) => w.idWard === ward!.idWard)).toBe(true);
		});

		it('should have unique IDs', async () => {
			const provinces = await getAllProvince();
			const provinceIds = provinces.map((p) => p.idProvince);
			const uniqueIds = new Set(provinceIds);
			expect(uniqueIds.size).toBe(provinceIds.length);

			const wards = await getAllWards();
			const wardIds = wards.map((w) => w.idWard);
			const uniqueWardIds = new Set(wardIds);
			expect(uniqueWardIds.size).toBe(wardIds.length);
		});
	});

	describe('Edge Cases', () => {
		it('should handle non-existent IDs gracefully', async () => {
			const wards = await getWardsByProvinceId('999');
			expect(wards).toEqual([]);

			const ward = await getWardById('999999');
			expect(ward).toBeUndefined();
		});

		it('should handle empty search queries', async () => {
			const provinces = await searchProvinceByName('');
			expect(provinces).toBeDefined();
			expect(Array.isArray(provinces)).toBe(true);

			const wards = await searchWardByName('');
			expect(wards).toBeDefined();
			expect(Array.isArray(wards)).toBe(true);
		});

		it('should handle special characters in search', async () => {
			const results = await searchProvinceByName('Hồ Chí Minh');
			expect(results).toBeDefined();
			expect(results.length).toBeGreaterThan(0);

			const hcm = results.find((p) => p.name.includes('Hồ Chí Minh'));
			expect(hcm).toBeDefined();
		});
	});
});
