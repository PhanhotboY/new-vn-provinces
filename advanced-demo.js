// Advanced demo script showcasing all new features of vietnam-provinces-js
const {
	getProvinceStats,
	getNationalStats,
	getTopProvincesByWards,
} = require('./dist/analytics.js');

const {
	validateAddressHierarchy,
	validateAndSuggestAddress,
	batchValidateAddresses,
} = require('./dist/validation.js');

const {
	exportProvinces,
	exportFlattenedAddresses,
} = require('./dist/export.js');

const {
	fuzzySearchProvinces,
	universalFuzzySearch,
	suggestCorrections,
} = require('./dist/fuzzy.js');

async function runAdvancedDemo() {
	console.log('🚀 Vietnam Provinces JS - Advanced Features Demo\n');

	// Analytics Demo
	console.log('📊 ANALYTICS FEATURES');
	console.log('='.repeat(50));

	console.time('⚡ Get Hanoi statistics');
	const hanoiStats = await getProvinceStats('01');
	console.timeEnd('⚡ Get Hanoi statistics');
	console.log(`📍 ${hanoiStats?.province.name}:`);
	console.log(`   • Wards: ${hanoiStats?.wardCount}`);

	console.time('⚡ Get national statistics');
	const nationalStats = await getNationalStats();
	console.timeEnd('⚡ Get national statistics');
	console.log('🇻🇳 National Statistics:');
	console.log(`   • Total provinces: ${nationalStats.totalProvinces}`);
	console.log(`   • Total wards: ${nationalStats.totalWards}`);
	console.log(
		`   • Avg wards/province: ${nationalStats.averageWardsPerProvince}`
	);
	console.log(
		`   • Largest province: ${nationalStats.largestProvince.province.name} (${nationalStats.largestProvince.wardCount} wards)`
	);
	console.log(
		`   • Smallest province: ${nationalStats.smallestProvince.province.name} (${nationalStats.smallestProvince.wardCount} wards)\n`
	);

	console.time('⚡ Get top provinces by wards');
	const topProvinces = await getTopProvincesByWards(5);
	console.timeEnd('⚡ Get top provinces by wards');
	console.log('🏆 Top 5 Provinces by Ward Count:');
	topProvinces.forEach((item, index) => {
		console.log(
			`   ${index + 1}. ${item.province.name}: ${item.wardCount} wards`
		);
	});
	console.log();

	// Validation Demo
	console.log('✅ VALIDATION FEATURES');
	console.log('='.repeat(50));

	console.time('⚡ Validate address hierarchy');
	const validationResult = await validateAddressHierarchy('01', '00004');
	console.timeEnd('⚡ Validate address hierarchy');
	console.log('🔍 Address Validation Result:');
	console.log(`   • Valid: ${validationResult.isValid}`);
	console.log(`   • Errors: ${validationResult.errors.length}`);
	console.log(`   • Warnings: ${validationResult.warnings.length}`);
	if (validationResult.hierarchy.province) {
		console.log(`   • Province: ${validationResult.hierarchy.province.name}`);
		console.log(`   • Ward: ${validationResult.hierarchy.ward?.name}`);
	}
	console.log();

	console.time('⚡ Validate and suggest');
	const suggestionResult = await validateAndSuggestAddress('01');
	console.timeEnd('⚡ Validate and suggest');
	console.log('💡 Address Suggestions:');
	console.log(`   • Province: ${suggestionResult.hierarchy.province?.name}`);
	console.log(
		`   • Available wards: ${suggestionResult.suggestions?.wards?.length || 0}`
	);
	if (suggestionResult.suggestions?.wards) {
		console.log('   • Sample wards:');
		suggestionResult.suggestions.wards.slice(0, 3).forEach((ward) => {
			console.log(`     - ${ward.name}`);
		});
	}
	console.log();

	console.time('⚡ Batch validate addresses');
	const batchResults = await batchValidateAddresses([
		{ provinceId: '01', wardId: '00004' },
		{ provinceId: '79', wardId: '26740' },
		{ provinceId: '99', wardId: '99999' }, // Invalid
	]);
	console.timeEnd('⚡ Batch validate addresses');
	console.log('📦 Batch Validation Results:');
	batchResults.forEach((result, index) => {
		console.log(
			`   ${index + 1}. Valid: ${result.isValid}, Errors: ${result.errors.length}`
		);
	});
	console.log();

	// Export Demo
	console.log('📤 EXPORT FEATURES');
	console.log('='.repeat(50));

	console.time('⚡ Export provinces to JSON');
	const provincesJson = await exportProvinces({ format: 'json' });
	console.timeEnd('⚡ Export provinces to JSON');
	console.log(`📄 Exported provinces JSON: ${provincesJson.length} characters`);

	console.time('⚡ Export provinces to CSV');
	const provincesCSV = await exportProvinces({ format: 'csv' });
	console.timeEnd('⚡ Export provinces to CSV');
	console.log(
		`📊 Exported provinces CSV: ${provincesCSV.split('\n').length} lines`
	);

	console.time('⚡ Export flattened addresses');
	const flattenedData = await exportFlattenedAddresses({
		format: 'json',
		filterByProvince: ['01'], // Only Hanoi
	});
	console.timeEnd('⚡ Export flattened addresses');
	const flattenedCount = JSON.parse(flattenedData).length;
	console.log(
		`🗂️ Exported flattened addresses for Hanoi: ${flattenedCount} records`
	);
	console.log();

	// Fuzzy Search Demo
	console.log('🔍 FUZZY SEARCH FEATURES');
	console.log('='.repeat(50));

	console.time('⚡ Fuzzy search provinces');
	const fuzzyProvinces = await fuzzySearchProvinces('Ha Noi', {
		threshold: 0.3,
	});
	console.timeEnd('⚡ Fuzzy search provinces');
	console.log('🔎 Fuzzy search results for "Ha Noi":');
	fuzzyProvinces.slice(0, 3).forEach((result) => {
		console.log(
			`   • ${result.item.name} (score: ${result.score.toFixed(3)}, type: ${result.matches[0].type})`
		);
	});
	console.log();

	console.time('⚡ Universal fuzzy search');
	const universalResults = await universalFuzzySearch('Phường Sài Gòn', {
		threshold: 0.3,
		maxResults: 8,
	});
	console.timeEnd('⚡ Universal fuzzy search');
	console.log('🌐 Universal search results for "Phường Sài Gòn":');
	universalResults.combined.forEach((result) => {
		console.log(
			`   • ${result.type}: ${result.item.name} (score: ${result.score.toFixed(3)})`
		);
	});
	console.log();

	console.time('⚡ Suggest corrections');
	const corrections = await suggestCorrections('Ha Noi Viet Nam');
	console.timeEnd('⚡ Suggest corrections');
	console.log('💭 Correction suggestions for "Ha Noi Viet Nam":');
	corrections.slice(0, 5).forEach((suggestion) => {
		console.log(
			`   • ${suggestion.suggestion} (${suggestion.type}, confidence: ${suggestion.confidence.toFixed(3)})`
		);
	});
	console.log();

	// Advanced Search Demo
	console.log('🎯 ADVANCED SEARCH SCENARIOS');
	console.log('='.repeat(50));

	console.time('⚡ Search with filters');
	const filteredSearch = await universalFuzzySearch('Phuong', {
		threshold: 0.4,
		maxResults: 5,
		filters: { provinceId: '01', type: 'ward' },
	});
	console.timeEnd('⚡ Search with filters');
	console.log('🎯 Filtered search for "Phuong" in Hanoi wards:');
	filteredSearch.wards.forEach((result) => {
		console.log(`   • ${result.item.name} (score: ${result.score.toFixed(3)})`);
	});
	console.log();

	// Performance Summary
	console.log('⚡ PERFORMANCE SUMMARY');
	console.log('='.repeat(50));
	console.log('✅ All advanced features completed successfully!');
	console.log('📊 Analytics: Fast statistical computations');
	console.log('✅ Validation: Comprehensive address validation');
	console.log('📤 Export: Multiple format support (JSON, CSV, XML, SQL)');
	console.log('🔍 Fuzzy Search: Advanced matching algorithms');
	console.log('🎯 Filtering: Precise search with multiple criteria');
	console.log('💾 Memory Efficient: Lazy loading and caching');
	console.log('🚀 High Performance: Optimized for speed and accuracy');

	console.log(
		'\n🎉 Advanced demo completed! The library now offers enterprise-grade features.'
	);
}

// Run the advanced demo
runAdvancedDemo().catch(console.error);
