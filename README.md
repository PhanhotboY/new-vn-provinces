# 🇻🇳 Vietnam Provinces JS

This package is a fork of
[vietnam-provinces-js](https://www.npmjs.com/package/vietnam-provinces-js) with
the following modifications:

- Update provinces and wards after merging following the most recent effective
  decree:
  [19/2025/QĐ-TTg](https://thuvienphapluat.vn/van-ban/Bo-may-hanh-chinh/Quyet-dinh-19-2025-QD-TTg-Bang-danh-muc-va-ma-so-cac-don-vi-hanh-chinh-Viet-Nam-663707.aspx)

---

**Vietnam Provinces JS** is a high-performance JavaScript/TypeScript library
that provides a comprehensive list of provinces and wards in Vietnam. It
features advanced search capabilities, autocomplete, hierarchical data
navigation, and optimized performance with lazy loading and caching.

[![NPM Version](https://img.shields.io/npm/v/new-vn-provinces)](https://www.npmjs.com/package/new-vn-provinces)
[![License](https://img.shields.io/npm/l/new-vn-provinces)](https://github.com/phanhotboy/new-vn-provinces/blob/main/LICENSE)
[![GitHub Issues](https://img.shields.io/github/issues/phanhotboy/new-vn-provinces)](https://github.com/phanhotboy/new-vn-provinces/issues)

## 🚀 Performance Highlights

- **⚡ 10x faster** initial load with lazy loading
- **🔍 50x faster** ID lookups with O(1) hash maps
- **💾 8x less** memory usage with smart caching
- **🎯 Tree-shakable** - only load what you need
- **🔄 Memoized** expensive operations for instant repeated calls

---

## 📦 Installation

You can install this library via **npm** or **yarn**:

```sh
# Using npm
npm install new-vn-provinces
```

```sh
# Using yarn
yarn add new-vn-provinces
```

---

## 🚀 **Features Overview**

### Core Functions (All Async)

- **Provinces:** `getAllProvince()`, `searchProvinceByName()`,
  `getWardsByProvinceId()`, `isValidProvinceId()`
- **Wards:** `getAllWards()`, `searchWardByName()`, `getWardById()`

### 🆕 New Advanced Features

- **🔍 Autocomplete:** Smart suggestions with scoring algorithm
- **🏗️ Hierarchy:** Navigate through administrative levels
- **📦 Batch Operations:** Process multiple items efficiently
- **📊 Analytics:** Comprehensive statistics and insights
- **✅ Validation:** Address verification and suggestions
- **📤 Export:** Multi-format data export (JSON, CSV, XML, SQL)
- **🔍 Fuzzy Search:** Advanced text matching with multiple algorithms
- **⚡ Performance Utils:** Caching, memoization, and optimization tools

---

## 🛠️ **Available Methods**

### **🌍 Province Methods**

| Function                                   | Description                                       |
| ------------------------------------------ | ------------------------------------------------- |
| `getAllProvince()`                         | Get a list of all provinces                       |
| `getAllProvincesSorted()`                  | Get a list of all provinces sorted alphabetically |
| `getWardsByProvinceId(provinceId: string)` | Get a list of wards within a specific province    |
| `isValidProvinceId(provinceId: string)`    | Check if a province ID is valid                   |
| `searchProvinceByName(name: string)`       | Search for a province by name (fuzzy search)      |

#### 📌 **Example Usage**

```ts
import {
	getAllProvince,
	searchProvinceByName,
} from 'new-vn-provinces/provinces';

// All functions are now async
const provinces = await getAllProvince();
console.log(provinces);

const results = await searchProvinceByName('hanoi');
console.log(results);
```

📌 **Output:**

```json
[{ "idProvince": "01", "name": "Thành phố Hà Nội" }]
```

---

### **�️ Ward Methods**

| Function                         | Description                              |
| -------------------------------- | ---------------------------------------- |
| `getAllWards()`                  | Get a list of all wards                  |
| `getWardById(wardId: string)`    | Get details of a ward by ID              |
| `searchWardByName(name: string)` | Search for a ward by name (fuzzy search) |

#### 📌 **Example Usage**

```ts
import { getAllWards, getWardById } from 'new-vn-provinces/wards';

const wards = await getAllWards();
console.log(wards);

const ward = await getWardById('26734');
console.log(ward);
```

📌 **Output:**

```json
{ "idProvince": "01", "idWard": "26734", "name": "Phường Phúc Xá" }
```

---

## 🆕 **New Advanced Features**

### **🔍 Autocomplete System**

Smart autocomplete with scoring algorithm for better user experience:

```ts
import {
	getProvinceAutocomplete,
	getWardAutocomplete,
	getUniversalAutocomplete,
} from 'new-vn-provinces/features/autocomplete';

// Province autocomplete
const suggestions = await getProvinceAutocomplete('Hà', 5);
// Returns: [{ type: 'province', id: '01', name: 'Thành phố Hà Nội', score: 95 }]

// Ward autocomplete
const wardSuggestions = await getWardAutocomplete('Phúc', '01', 5);
// Returns: [{ type: 'ward', id: '26734', name: 'Phường Phúc Xá', parentName: 'Thành phố Hà Nội', score: 90 }]

// Universal search across all types
const allSuggestions = await getUniversalAutocomplete('Hà', 10);
```

### **🏗️ Hierarchical Data Navigation**

Navigate through the administrative hierarchy efficiently:

```ts
import {
	getProvinceWithWards,
	getAddressPath,
	getFormattedAddress,
} from 'new-vn-provinces/features/hierarchy';

// Get province with all its wards
const hanoi = await getProvinceWithWards('01');

// Get address path for a ward
const path = await getAddressPath('26734');
// Returns: { province: {...}, ward: {...} }

// Get formatted address string
const address = await getFormattedAddress('26734');
// Returns: "Phường Phúc Xá, Thành phố Hà Nội"
```

### **📦 Batch Operations**

Process multiple items efficiently in a single operation:

```ts
import {
	getProvincesBatch,
	getWardsBatch,
	getFullAddressesBatch,
} from 'new-vn-provinces/features/batch';

// Get multiple provinces at once
const result = await getProvincesBatch(['01', '79', '31']);
// Returns: { success: [...], failed: [] }

// Get multiple wards at once
const wardResult = await getWardsBatch(['26734', '26737', '26740']);
// Returns: { success: [...], failed: [] }

// Get full addresses for multiple wards
const addresses = await getFullAddressesBatch(['26734', '26737', '26740']);
```

### **📊 Analytics & Statistics**

Get comprehensive insights about Vietnam's administrative data:

```ts
import {
	getProvinceStats,
	getNationalStats,
	getRegionStats,
	getTopProvincesByWards,
} from 'new-vn-provinces/features/analytics';

// Get detailed province statistics
const hanoiStats = await getProvinceStats('01');
// Returns: ward count, largest/smallest wards, etc.

// Get national overview
const nationalStats = await getNationalStats();
// Returns: totals, averages, largest/smallest provinces

// Get top provinces by ward count
const topProvinces = await getTopProvincesByWards(5);
```

### **✅ Validation & Verification**

Validate addresses and get smart suggestions:

```ts
import {
	validateAddressHierarchy,
	validateAndSuggestAddress,
	batchValidateAddresses,
} from 'new-vn-provinces/features/validation';

// Validate complete address hierarchy (province -> ward)
const result = await validateAddressHierarchy('01', '26734');
// Returns: validation status, errors, warnings

// Smart validation with suggestions
const suggestions = await validateAndSuggestAddress('01');
// Returns: valid data + suggestions for next level

// Batch validate multiple addresses
const results = await batchValidateAddresses([...addresses]);
```

### **📤 Multi-Format Export**

Export data in various formats for integration:

```ts
import {
	exportProvinces,
	exportWards,
	exportFlattenedAddresses,
	exportHierarchicalData,
} from 'new-vn-provinces/features/export';

// Export to different formats
const jsonData = await exportProvinces({ format: 'json' });
const csvData = await exportProvinces({ format: 'csv' });
const xmlData = await exportProvinces({ format: 'xml' });
const sqlData = await exportProvinces({
	format: 'sql',
	tableName: 'provinces',
});

// Export ward data
const wardData = await exportWards({ format: 'json' });

// Export flattened address data
const flatData = await exportFlattenedAddresses({
	format: 'json',
	filterByProvince: ['01', '79'],
});
```

### **🔍 Advanced Fuzzy Search**

Powerful search with multiple algorithms and scoring:

```ts
import {
	fuzzySearchProvinces,
	fuzzySearchWards,
	universalFuzzySearch,
	suggestCorrections,
} from 'new-vn-provinces/features/fuzzy';

// Advanced fuzzy search with scoring
const results = await fuzzySearchProvinces('Ha Noi', {
	threshold: 0.5,
	maxResults: 10,
});

// Fuzzy search for wards
const wardResults = await fuzzySearchWards('Phuc Xa', {
	threshold: 0.3,
	provinceId: '01',
});

// Universal search across all types
const universal = await universalFuzzySearch('Phuong Sai Gon', {
	threshold: 0.3,
	filters: { provinceId: '79' },
	sortBy: 'relevance',
});

// Suggest corrections for misspelled queries
const corrections = await suggestCorrections('Ha Noi Viet Nam');
```

## 📊 **Performance Comparison**

| Operation            | Before | After    | Improvement     |
| -------------------- | ------ | -------- | --------------- |
| Initial Load         | 100ms  | 10ms     | **10x faster**  |
| Get by ID            | 50ms   | 1ms      | **50x faster**  |
| Search               | 200ms  | 20ms     | **10x faster**  |
| Sorted List (cached) | 100ms  | 1ms      | **100x faster** |
| Memory Usage         | 824KB  | ~100KB\* | **8x less**     |

\*Memory usage depends on which modules are actually used

## 🎯 **Migration Guide**

### Breaking Changes

All functions are now async and return Promises:

```ts
// Before (v1.x)
const provinces = getAllProvince();
const ward = getWardById('00001');

// After (v2.x)
const provinces = await getAllProvince();
const ward = await getWardById('00004');
```

## 📚 **Additional Resources**

- 📖 [Performance Guide](./PERFORMANCE_GUIDE.md) - Detailed performance
  optimizations
- 🚀 [Optimization Summary](./OPTIMIZATION_SUMMARY.md) - Complete optimization
  overview
- 🧪 [Basic Demo](./demo.js) - See core features in action
- 🎯 [Advanced Demo](./advanced-demo.js) - Showcase all advanced features

## 🎯 **Quick Start Examples**

### **Basic Usage**

```bash
npm install new-vn-provinces
```

```typescript
import { getAllProvince } from 'new-vn-provinces/provinces';
import { getWardById } from 'new-vn-provinces/wards';

const provinces = await getAllProvince();
const ward = await getWardById('26734');
```

### **Advanced Usage**

```typescript
// Analytics
import { getNationalStats } from 'new-vn-provinces/features/analytics';
const stats = await getNationalStats();

// Validation
import { validateAddressHierarchy } from 'new-vn-provinces/features/validation';
const isValid = await validateAddressHierarchy('01', '26734');

// Export
import { exportProvinces } from 'new-vn-provinces/features/export';
const csvData = await exportProvinces({ format: 'csv' });

// Fuzzy Search
import { universalFuzzySearch } from 'new-vn-provinces/features/fuzzy';
const results = await universalFuzzySearch('Ha Noi');
```

## 🏆 **Why Choose This Library?**

- ✅ **Production Ready**: Enterprise-grade performance and reliability
- ✅ **Comprehensive**: Complete Vietnam administrative data with 34 provinces
  and 3321 wards
- ✅ **High Performance**: 10-100x faster than traditional approaches
- ✅ **Memory Efficient**: 8x less memory usage with lazy loading
- ✅ **Developer Friendly**: TypeScript support, comprehensive documentation
- ✅ **Flexible**: Multiple import options, tree-shaking support
- ✅ **Feature Rich**: Analytics, validation, export, fuzzy search, and more
- ✅ **Well Tested**: Comprehensive test coverage for all functionality

## 📋 **Version History**

- **v3.0.0** (Latest) - Update provinces and wards after merging
- **v2.0.0** - Complete performance optimization and advanced features
- **v1.1.2** - Basic functionality with simple search

## 🔗 **Important Links**

- **📦 NPM Package**: https://www.npmjs.com/package/new-vn-provinces
- **📚 GitHub Repository**: https://github.com/phanhotboy/new-vn-provinces
- **📖 Documentation**: Complete guides and examples included
- **🐛 Issues**: https://github.com/phanhotboy/new-vn-provinces/issues
- **📝 Changelog**: [CHANGELOG.md](./CHANGELOG.md)

## 📞 **Support & Contributing**

- **Issues**: Report bugs or request features on GitHub
- **Contributions**: Pull requests are welcome
- **License**: MIT License
- **Author**: phanhotboy <nguyenduyphan2003@gmail.com>

---
