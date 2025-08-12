// Validation utilities for Vietnam administrative data
import { getProvinceById, getWardById, getWardsByProvinceId } from '../cache';
import { Province } from '../provinces/types';
import { Ward } from '../wards';

export interface ValidationResult {
	isValid: boolean;
	errors: string[];
	warnings: string[];
	data?: {
		province?: Province;
		ward?: Ward;
	};
}

export interface AddressValidationResult extends ValidationResult {
	hierarchy: {
		province?: Province;
		ward?: Ward;
	};
	suggestions?: {
		provinces?: Province[];
		wards?: Ward[];
	};
}

/**
 * Validate a province ID
 */
export const validateProvinceId = async (
	provinceId: string
): Promise<ValidationResult> => {
	const errors: string[] = [];
	const warnings: string[] = [];

	// Basic format validation
	if (!provinceId || typeof provinceId !== 'string') {
		errors.push('Province ID must be a non-empty string');
		return { isValid: false, errors, warnings };
	}

	if (!/^\d{2}$/.test(provinceId)) {
		warnings.push('Province ID should be a 2-digit number (e.g., "01", "79")');
	}

	// Check if province exists
	const province = await getProvinceById(provinceId);
	if (!province) {
		errors.push(`Province with ID "${provinceId}" does not exist`);
		return { isValid: false, errors, warnings };
	}

	return {
		isValid: true,
		errors,
		warnings,
		data: { province },
	};
};

/**
 * Validate a ward ID
 */
export const validateWardId = async (
	wardId: string
): Promise<ValidationResult> => {
	const errors: string[] = [];
	const warnings: string[] = [];

	// Basic format validation
	if (!wardId || typeof wardId !== 'string') {
		errors.push('Ward ID must be a non-empty string');
		return { isValid: false, errors, warnings };
	}

	if (!/^\d{5}$/.test(wardId)) {
		warnings.push(
			'Ward ID should be a 5-digit number (e.g., "00001", "00250")'
		);
	}

	// Check if ward exists
	const ward = await getWardById(wardId);
	if (!ward) {
		errors.push(`Ward with ID "${wardId}" does not exist`);
		return { isValid: false, errors, warnings };
	}

	return {
		isValid: true,
		errors,
		warnings,
		data: { ward },
	};
};

/**
 * Validate the hierarchical relationship between province, ward
 */
export const validateAddressHierarchy = async (
	provinceId: string,
	wardId: string
): Promise<AddressValidationResult> => {
	const errors: string[] = [];
	const warnings: string[] = [];
	const hierarchy: AddressValidationResult['hierarchy'] = {};

	// Validate each level individually
	const [provinceResult, wardResult] = await Promise.all([
		validateProvinceId(provinceId),
		validateWardId(wardId),
	]);

	// Collect individual validation errors
	errors.push(...provinceResult.errors, ...wardResult.errors);
	warnings.push(...provinceResult.warnings, ...wardResult.warnings);

	// If any individual validation failed, return early
	if (!provinceResult.isValid || !wardResult.isValid) {
		return { isValid: false, errors, warnings, hierarchy };
	}

	const province = provinceResult.data!.province!;
	const ward = wardResult.data!.ward!;

	hierarchy.province = province;
	hierarchy.ward = ward;

	// Validate hierarchical relationships
	if (ward.idProvince !== provinceId) {
		errors.push(
			`Ward "${ward.name}" (${wardId}) does not belong to province "${province.name}" (${provinceId})`
		);
	}

	return {
		isValid: errors.length === 0,
		errors,
		warnings,
		hierarchy,
	};
};

/**
 * Validate and suggest corrections for partial address data
 */
export const validateAndSuggestAddress = async (
	provinceId?: string,
	wardId?: string
): Promise<AddressValidationResult> => {
	const errors: string[] = [];
	const warnings: string[] = [];
	const hierarchy: AddressValidationResult['hierarchy'] = {};
	const suggestions: AddressValidationResult['suggestions'] = {};

	// If ward is provided, validate the full hierarchy
	if (wardId) {
		if (!provinceId) {
			warnings.push(
				'When ward ID is provided, province ID should also be provided for complete validation'
			);
		}

		const ward = await getWardById(wardId);
		if (ward) {
			hierarchy.ward = ward;

			// Auto-detect province if not provided
			if (!provinceId && hierarchy.ward) {
				const autoProvince = await getProvinceById(hierarchy.ward.idProvince);
				if (autoProvince) {
					hierarchy.province = autoProvince;
					warnings.push(
						`Auto-detected province: ${autoProvince.name} (${autoProvince.idProvince})`
					);
				}
			}
		} else {
			errors.push(`Ward with ID "${wardId}" does not exist`);
		}
	}

	// If province is provided, validate and suggest wards
	if (provinceId) {
		const province = await getProvinceById(provinceId);
		if (province) {
			if (!hierarchy.province) hierarchy.province = province;

			// Suggest wards in this province
			const wards = await getWardsByProvinceId(provinceId);
			if (wards.length > 0) {
				suggestions.wards = wards.slice(0, 10); // Limit to 10 suggestions
			}
		} else {
			errors.push(`Province with ID "${provinceId}" does not exist`);
		}
	}

	// Cross-validate hierarchy if multiple levels are provided
	if (provinceId && wardId && hierarchy.province && hierarchy.ward) {
		if (hierarchy.ward.idProvince !== provinceId) {
			errors.push(
				`Ward "${hierarchy.ward.name}" does not belong to province "${hierarchy.province.name}"`
			);
		}
	}

	return {
		isValid: errors.length === 0,
		errors,
		warnings,
		hierarchy,
		suggestions,
	};
};

/**
 * Batch validate multiple addresses
 */
export const batchValidateAddresses = async (
	addresses: Array<{
		provinceId?: string;
		wardId?: string;
	}>
): Promise<AddressValidationResult[]> => {
	return Promise.all(
		addresses.map(({ provinceId, wardId }) =>
			validateAndSuggestAddress(provinceId, wardId)
		)
	);
};

/**
 * Validate address format patterns
 */
export const validateAddressFormat = (address: {
	provinceId?: string;
	wardId?: string;
}): ValidationResult => {
	const errors: string[] = [];
	const warnings: string[] = [];

	// Validate ID formats
	if (address.provinceId && !/^\d{2}$/.test(address.provinceId)) {
		errors.push('Province ID must be a 2-digit number');
	}

	if (address.wardId && !/^\d{5}$/.test(address.wardId)) {
		errors.push('Ward ID must be a 5-digit number');
	}

	return {
		isValid: errors.length === 0,
		errors,
		warnings,
	};
};
