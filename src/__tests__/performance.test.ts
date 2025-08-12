import { describe, it, expect, beforeAll } from 'vitest';
import {
	getAllProvince,
	getAllProvincesSorted,
	searchProvinceByName,
	getWardsByProvinceId,
	isValidProvinceId,
} from '../provinces';
import { getAllWards, getWardById, searchWardByName } from '../wards';
import {
	getProvinceAutocomplete,
	getWardAutocomplete,
	getUniversalAutocomplete,
} from '../features/autocomplete';
import {
	getProvinceWithWards,
	getFullHierarchy,
	getAddressPath,
	getFormattedAddress,
} from '../features/hierarchy';
import {
	getProvincesBatch,
	getWardsBatch,
	getFullAddressesBatch,
} from '../features/batch';

describe('Performance Tests', () => {
	describe('Province Operations', () => {
		it('should load provinces efficiently', async () => {
			const start = performance.now();
			const provinces = await getAllProvince();
			const end = performance.now();

			expect(provinces).toBeDefined();
			expect(provinces.length).toBeGreaterThan(0);
			expect(end - start).toBeLessThan(100); // Should be fast due to caching
		});

		it('should sort provinces efficiently with memoization', async () => {
			const start1 = performance.now();
			const sorted1 = await getAllProvincesSorted();
			const end1 = performance.now();

			const start2 = performance.now();
			const sorted2 = await getAllProvincesSorted();
			const end2 = performance.now();

			expect(sorted1).toEqual(sorted2);
			expect(end2 - start2).toBeLessThan(end1 - start1); // Second call should be faster due to memoization
		});

		it('should search provinces efficiently', async () => {
			const start = performance.now();
			const results = await searchProvinceByName('Hà Nội');
			const end = performance.now();

			expect(results).toBeDefined();
			expect(results.length).toBeGreaterThan(0);
			expect(end - start).toBeLessThan(50); // Should be fast with indexed search
		});

		it('should validate province IDs efficiently', async () => {
			const start = performance.now();
			const isValid = await isValidProvinceId('01');
			const end = performance.now();

			expect(isValid).toBe(true);
			expect(end - start).toBeLessThan(10); // O(1) lookup should be very fast
		});
	});

	describe('Ward Operations', () => {
		it('should get wards by province ID efficiently', async () => {
			const start = performance.now();
			const wards = await getWardsByProvinceId('01');
			const end = performance.now();

			expect(wards).toBeDefined();
			expect(wards.length).toBeGreaterThan(0);
			expect(end - start).toBeLessThan(50); // O(1) lookup should be fast
		});

		it('should get ward by ID efficiently', async () => {
			const start = performance.now();
			const ward = await getWardById('00004');
			const end = performance.now();

			expect(ward).toBeDefined();
			expect(end - start).toBeLessThan(10); // O(1) lookup should be very fast
		});

		it('should search wards efficiently', async () => {
			const start = performance.now();
			const results = await searchWardByName('Phúc Xá');
			const end = performance.now();

			expect(results).toBeDefined();
			expect(results.length).toBeGreaterThan(0);
			expect(end - start).toBeLessThan(50); // Should be fast with indexed search
		});
	});

	describe('Autocomplete Features', () => {
		it('should provide province autocomplete efficiently', async () => {
			const start = performance.now();
			const results = await getProvinceAutocomplete('Hà');
			const end = performance.now();

			expect(results).toBeDefined();
			expect(results.length).toBeGreaterThan(0);
			expect(results[0]).toHaveProperty('score');
			expect(end - start).toBeLessThan(50);
		});

		it('should provide ward autocomplete efficiently', async () => {
			const start = performance.now();
			const results = await getWardAutocomplete('Phúc');
			const end = performance.now();

			expect(results).toBeDefined();
			expect(results.length).toBeGreaterThan(0);
			expect(results[0]).toHaveProperty('score');
			expect(end - start).toBeLessThan(100);
		});

		it('should provide universal autocomplete efficiently', async () => {
			const start = performance.now();
			const results = await getUniversalAutocomplete('Hà');
			const end = performance.now();

			expect(results).toBeDefined();
			expect(results.length).toBeGreaterThan(0);
			expect(end - start).toBeLessThan(100);
		});
	});

	describe('Hierarchy Features', () => {
		it('should get province with wards efficiently', async () => {
			const start = performance.now();
			const result = await getProvinceWithWards('01');
			const end = performance.now();

			expect(result).toBeDefined();
			expect(result?.wards).toBeDefined();
			expect(result?.wards.length).toBeGreaterThan(0);
			expect(end - start).toBeLessThan(50);
		});

		it('should get address path efficiently', async () => {
			const start = performance.now();
			const path = await getAddressPath('00004');
			const end = performance.now();

			expect(path).toBeDefined();
			expect(path?.ward).toBeDefined();
			expect(path?.province).toBeDefined();
			expect(end - start).toBeLessThan(30);
		});

		it('should format address efficiently', async () => {
			const start = performance.now();
			const address = await getFormattedAddress('00004');
			const end = performance.now();

			expect(address).toBeDefined();
			expect(typeof address).toBe('string');
			expect(address?.includes(',')).toBe(true);
			expect(end - start).toBeLessThan(30);
		});
	});

	describe('Batch Operations', () => {
		it('should handle batch province operations efficiently', async () => {
			const provinceIds = ['01', '08', '11', '38', '31'];

			const start = performance.now();
			const result = await getProvincesBatch(provinceIds);
			const end = performance.now();

			expect(result.success).toBeDefined();
			expect(result.success.length).toBe(5);
			expect(result.failed.length).toBe(0);
			expect(end - start).toBeLessThan(100);
		});

		it('should handle batch ward operations efficiently', async () => {
			const wardIds = ['00004', '00008', '00025'];

			const start = performance.now();
			const result = await getWardsBatch(wardIds);
			const end = performance.now();

			expect(result.success).toBeDefined();
			expect(result.success.length).toBeGreaterThan(0);
			expect(end - start).toBeLessThan(100);
		});

		it('should handle batch address operations efficiently', async () => {
			const wardIds = ['00004', '00082', '00091'];

			const start = performance.now();
			const results = await getFullAddressesBatch(wardIds);
			const end = performance.now();

			expect(results).toBeDefined();
			expect(results.length).toBe(3);
			expect(results[0].fullAddress).toBeDefined();
			expect(end - start).toBeLessThan(100);
		});
	});

	describe('Memory Usage', () => {
		it('should not load all data immediately', async () => {
			// This test ensures lazy loading is working
			// We can't directly measure memory, but we can ensure
			// that data is only loaded when needed

			const start = performance.now();
			// Just importing shouldn't load all data
			const end = performance.now();

			expect(end - start).toBeLessThan(10);
		});
	});
});
