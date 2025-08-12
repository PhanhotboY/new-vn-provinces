const fs = require('node:fs');
const { vnUnits } = require('./vn-units.js');

function main() {
	try {
		// Array<{idProvince: string; name: string}>
		const provinces = vnUnits.map((unit) => ({
			idProvince: unit.Code,
			name: unit.FullName,
		}));

		// Array<{ idProvince: string; idWard: string; name: string }>
		const wards = vnUnits.flatMap((unit) =>
			unit.Wards.map((ward) => ({
				idProvince: unit.Code,
				idWard: ward.Code,
				name: ward.FullName,
			}))
		);

		fs.writeFileSync(
			'../vietnam/province.json',
			JSON.stringify(provinces, null, 2)
		);
		fs.writeFileSync('../vietnam/ward.json', JSON.stringify(wards, null, 2));

		console.log('Migration completed successfully.');
	} catch (err) {
		console.error('Error during migration:', err);
	}
}

main();
