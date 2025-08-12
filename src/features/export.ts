// Export utilities for Vietnam administrative data
import { getProvinceData, getWardData, getWardsByProvinceId } from '../cache';
import { Province } from '../provinces/types';
import { Ward } from '../wards';

export interface ExportOptions {
	format: 'json' | 'csv' | 'xml' | 'sql';
	includeHierarchy?: boolean;
	filterByProvince?: string[];
	customFields?: string[];
	tableName?: string; // For SQL export
}

export interface FlattenedAddress {
	provinceId: string;
	provinceName: string;
	wardId: string;
	wardName: string;
}

/**
 * Export provinces data in various formats
 */
export const exportProvinces = async (
	options: ExportOptions
): Promise<string> => {
	const provinces = await getProvinceData();

	switch (options.format) {
		case 'json':
			return JSON.stringify(provinces, null, 2);

		case 'csv':
			return exportProvincesToCSV(provinces);

		case 'xml':
			return exportProvincesToXML(provinces);

		case 'sql':
			return exportProvincesToSQL(provinces, options.tableName || 'provinces');

		default:
			throw new Error(`Unsupported format: ${options.format}`);
	}
};

/**
 * Export wards data in various formats
 */
export const exportWards = async (options: ExportOptions): Promise<string> => {
	let wards = await getWardData();

	// Filter by provinces if specified
	if (options.filterByProvince && options.filterByProvince.length > 0) {
		wards = wards.filter((d) =>
			options.filterByProvince!.includes(d.idProvince)
		);
	}

	switch (options.format) {
		case 'json':
			return JSON.stringify(wards, null, 2);

		case 'csv':
			return exportWardsToCSV(wards);

		case 'xml':
			return exportWardsToXML(wards);

		case 'sql':
			return exportWardsToSQL(wards, options.tableName || 'wards');

		default:
			throw new Error(`Unsupported format: ${options.format}`);
	}
};

/**
 * Export flattened address data with full hierarchy
 */
export const exportFlattenedAddresses = async (
	options: ExportOptions
): Promise<string> => {
	const [provinces, wards] = await Promise.all([
		getProvinceData(),
		getWardData(),
	]);

	// Create lookup maps for performance
	const provinceMap = new Map(provinces.map((p) => [p.idProvince, p]));

	const flattenedData: FlattenedAddress[] = wards.map((ward) => {
		const province = provinceMap.get(ward.idProvince);

		return {
			provinceId: province?.idProvince || '',
			provinceName: province?.name || '',
			wardId: ward.idWard,
			wardName: ward.name,
		};
	});

	// Apply filters
	let filteredData = flattenedData;
	if (options.filterByProvince && options.filterByProvince.length > 0) {
		filteredData = filteredData.filter((item) =>
			options.filterByProvince!.includes(item.provinceId)
		);
	}

	switch (options.format) {
		case 'json':
			return JSON.stringify(filteredData, null, 2);

		case 'csv':
			return exportFlattenedToCSV(filteredData);

		case 'xml':
			return exportFlattenedToXML(filteredData);

		case 'sql':
			return exportFlattenedToSQL(
				filteredData,
				options.tableName || 'addresses'
			);

		default:
			throw new Error(`Unsupported format: ${options.format}`);
	}
};

/**
 * Export hierarchical data for specific provinces
 */
export const exportHierarchicalData = async (
	provinceIds: string[],
	options: ExportOptions
): Promise<string> => {
	const hierarchicalData = await Promise.all(
		provinceIds.map(async (provinceId) => {
			const [provinces, wards] = await Promise.all([
				getProvinceData(),
				getWardsByProvinceId(provinceId),
			]);

			const province = provinces.find((p) => p.idProvince === provinceId);
			if (!province) return null;

			return {
				...province,
				wards,
			};
		})
	);

	const validData = hierarchicalData.filter(Boolean);

	switch (options.format) {
		case 'json':
			return JSON.stringify(validData, null, 2);

		case 'xml':
			return exportHierarchicalToXML(validData);

		default:
			throw new Error(
				`Format ${options.format} is not supported for hierarchical data`
			);
	}
};

// Helper functions for CSV export
function exportProvincesToCSV(provinces: Province[]): string {
	const headers = ['idProvince', 'name'];
	const rows = provinces.map((p) => [p.idProvince, `"${p.name}"`]);
	return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

function exportWardsToCSV(wards: Ward[]): string {
	const headers = ['idProvince', 'idWard', 'name'];
	const rows = wards.map((w) => [w.idProvince, w.idWard, `"${w.name}"`]);
	return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

function exportFlattenedToCSV(data: FlattenedAddress[]): string {
	const headers = ['provinceId', 'provinceName', 'wardId', 'wardName'];
	const rows = data.map((item) => [
		item.provinceId,
		`"${item.provinceName}"`,
		item.wardId,
		`"${item.wardName}"`,
	]);
	return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

// Helper functions for XML export
function exportProvincesToXML(provinces: Province[]): string {
	const items = provinces
		.map(
			(p) =>
				`  <province>\n    <idProvince>${p.idProvince}</idProvince>\n    <name><![CDATA[${p.name}]]></name>\n  </province>`
		)
		.join('\n');
	return `<?xml version="1.0" encoding="UTF-8"?>\n<provinces>\n${items}\n</provinces>`;
}

function exportWardsToXML(wards: Ward[]): string {
	const items = wards
		.map(
			(w) =>
				`  <ward>\n    <idProvince>${w.idProvince}</idProvince>\n    <idWard>${w.idWard}</idWard>\n    <name><![CDATA[${w.name}]]></name>\n  </ward>`
		)
		.join('\n');
	return `<?xml version="1.0" encoding="UTF-8"?>\n<wards>\n${items}\n</wards>`;
}

function exportFlattenedToXML(data: FlattenedAddress[]): string {
	const items = data
		.map(
			(item) =>
				`  <address>\n    <provinceId>${item.provinceId}</provinceId>\n    <provinceName><![CDATA[${item.provinceName}]]></provinceName>\n     <wardId>${item.wardId}</wardId>\n    <wardName><![CDATA[${item.wardName}]]></wardName>\n  </address>`
		)
		.join('\n');
	return `<?xml version="1.0" encoding="UTF-8"?>\n<addresses>\n${items}\n</addresses>`;
}

function exportHierarchicalToXML(data: any[]): string {
	const items = data
		.map((province) => {
			const wards = province.wards
				.map((ward: any) => {
					return `    <ward>\n      <idWard>${ward.idWard}</idWard>\n      <name><![CDATA[${ward.name}]]></name>\n    </ward>`;
				})
				.join('\n');
			return `  <province>\n    <idProvince>${province.idProvince}</idProvince>\n    <name><![CDATA[${province.name}]]></name>\n    <wards>\n${wards}\n    </wards>\n  </province>`;
		})
		.join('\n');
	return `<?xml version="1.0" encoding="UTF-8"?>\n<hierarchy>\n${items}\n</hierarchy>`;
}

// Helper functions for SQL export
function exportProvincesToSQL(
	provinces: Province[],
	tableName: string
): string {
	const values = provinces
		.map((p) => `('${p.idProvince}', '${p.name.replace(/'/g, "''")}')`)
		.join(',\n  ');
	return `CREATE TABLE ${tableName} (\n  idProvince VARCHAR(2) PRIMARY KEY,\n  name NVARCHAR(255) NOT NULL\n);\n\nINSERT INTO ${tableName} (idProvince, name) VALUES\n  ${values};`;
}

function exportWardsToSQL(wards: Ward[], tableName: string): string {
	const values = wards
		.map(
			(w) =>
				`('${w.idProvince}', '${w.idWard}', '${w.name.replace(/'/g, "''")}')`
		)
		.join(',\n  ');
	return `CREATE TABLE ${tableName} (\n  idProvince VARCHAR(2) NOT NULL,\n  idWard VARCHAR(3) PRIMARY KEY,\n  name NVARCHAR(255) NOT NULL\n);\n\nINSERT INTO ${tableName} (idProvince, idWard, name) VALUES\n  ${values};`;
}

function exportFlattenedToSQL(
	data: FlattenedAddress[],
	tableName: string
): string {
	const values = data
		.map(
			(item) =>
				`('${item.provinceId}', '${item.provinceName.replace(/'/g, "''")}', '${item.wardId}', '${item.wardName.replace(/'/g, "''")}')`
		)
		.join(',\n  ');
	return `CREATE TABLE ${tableName} (\n  provinceId VARCHAR(2) NOT NULL,\n  provinceName NVARCHAR(255) NOT NULL,\n  wardId VARCHAR(5) NOT NULL,\n  wardName NVARCHAR(255) NOT NULL\n);\n\nINSERT INTO ${tableName} (provinceId, provinceName, wardId, wardName) VALUES\n  ${values};`;
}
