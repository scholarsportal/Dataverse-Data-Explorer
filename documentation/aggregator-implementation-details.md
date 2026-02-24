# Aggregator Implementation Details

## Overview

This document provides detailed implementation guidance for the custom aggregators, particularly the percentage-based aggregators that require access to row/column totals.

## Aggregator Architecture

### Base Aggregator Pattern

All aggregators follow this pattern:

```typescript
type Aggregator = (values: number[]) => number;
```

However, percentage aggregators need additional context (row/column totals), so we use a factory pattern.

## Implementation Approaches

### Approach 1: Two-Pass Calculation (Recommended)

Calculate base values first, then apply percentage transformation.

**Step 1: Calculate Base Pivot Table**

```typescript
// First pass: Calculate with sum aggregator
const baseConfig = {
  rows: this.rows(),
  cols: this.cols(),
  aggregator: sumAggregator(),
  valueField: 'value',
};
const baseResult = pivotEngine.pivot(data, baseConfig);
```

**Step 2: Transform to Percentages**

```typescript
// Second pass: Transform base result to percentages
function transformToRowPercentages(result: PivotResult): PivotResult {
  const transformedData: { [rowKey: string]: { [colKey: string]: number } } = {};

  result.rowKeys.forEach((rowKey) => {
    transformedData[rowKey] = {};
    const rowTotal = result.rowTotals[rowKey] || 0;

    result.colKeys.forEach((colKey) => {
      const cellValue = result.data[rowKey]?.[colKey] || 0;
      transformedData[rowKey][colKey] = rowTotal > 0 ? (cellValue / rowTotal) * 100 : 0;
    });
  });

  // Recalculate totals for percentage table
  const rowTotals = Object.keys(transformedData).reduce(
    (acc, rowKey) => {
      acc[rowKey] = 100; // Row percentages always sum to 100
      return acc;
    },
    {} as { [key: string]: number },
  );

  const colTotals = result.colKeys.reduce(
    (acc, colKey) => {
      acc[colKey] = result.rowKeys.reduce((sum, rowKey) => {
        return sum + (transformedData[rowKey]?.[colKey] || 0);
      }, 0);
      return acc;
    },
    {} as { [key: string]: number },
  );

  return {
    data: transformedData,
    rowKeys: result.rowKeys,
    colKeys: result.colKeys,
    rowTotals,
    colTotals,
    grandTotal: result.rowKeys.length * 100, // Sum of all row percentages
  };
}
```

### Approach 2: Context-Aware Aggregator Factory

Create aggregators that have access to the full pivot context.

```typescript
interface AggregatorContext {
  rowKey: string;
  colKey: string;
  rowTotal: number;
  colTotal: number;
  grandTotal: number;
}

type ContextualAggregator = (values: number[], context: AggregatorContext) => number;

function createRowPercentageAggregator(): ContextualAggregator {
  return (values: number[], context: AggregatorContext): number => {
    const cellValue = values.reduce((sum, val) => sum + val, 0);
    return context.rowTotal > 0 ? (cellValue / context.rowTotal) * 100 : 0;
  };
}
```

**Modified PivotEngine for Context-Aware Aggregators:**

```typescript
class PivotEngine {
  pivot(
    data: PivotDataRow[],
    config: PivotConfig & {
      aggregator?: Aggregator | ContextualAggregator;
      useContext?: boolean;
    },
  ): PivotResult {
    // ... existing code ...

    if (config.useContext && this.isContextualAggregator(config.aggregator)) {
      // Calculate totals first
      const baseResult = this.pivot(data, {
        ...config,
        aggregator: sumAggregator(),
        useContext: false,
      });

      // Then apply contextual aggregator
      return this.applyContextualAggregator(data, config, baseResult);
    }

    // ... rest of implementation ...
  }

  private applyContextualAggregator(data: PivotDataRow[], config: PivotConfig, baseResult: PivotResult): PivotResult {
    const contextualAggregator = config.aggregator as ContextualAggregator;
    const transformedData: { [rowKey: string]: { [colKey: string]: number } } = {};

    baseResult.rowKeys.forEach((rowKey) => {
      transformedData[rowKey] = {};
      baseResult.colKeys.forEach((colKey) => {
        const context: AggregatorContext = {
          rowKey,
          colKey,
          rowTotal: baseResult.rowTotals[rowKey] || 0,
          colTotal: baseResult.colTotals[colKey] || 0,
          grandTotal: baseResult.grandTotal,
        };

        // Get original values for this cell
        const cellValues = this.getCellValues(data, rowKey, colKey, config);
        transformedData[rowKey][colKey] = contextualAggregator(cellValues, context);
      });
    });

    // Recalculate totals
    return this.recalculateTotals(transformedData, baseResult);
  }
}
```

## Recommended Implementation: Hybrid Approach

Use Approach 1 (two-pass) for simplicity and clarity, with helper functions:

### Updated Cross Table Component

```typescript
import { signal } from '@angular/core';

export class CrossTableComponent {
  // ... existing code ...

  pivotResult = signal<PivotResult | null>(null);

  createTable() {
    if (!this.data() || !this.hasData()) {
      return;
    }

    // Always calculate base result first
    const baseResult = this.pivotEngine.pivot(this.data(), {
      rows: this.rows(),
      cols: this.cols(),
      aggregator: sumAggregator(),
      valueField: 'value',
    });

    // Transform based on selected aggregator
    const transformedResult = this.transformResult(baseResult, this.aggregatorName());

    this.pivotResult.set(transformedResult);

    // ... announce table creation ...
  }

  private transformResult(baseResult: PivotResult, aggregatorName: string): PivotResult {
    switch (aggregatorName) {
      case 'Count as Fraction of Rows':
        return this.transformToRowPercentages(baseResult);
      case 'Count as Fraction of Columns':
        return this.transformToColumnPercentages(baseResult);
      case 'Count as Fraction of Total':
        return this.transformToTotalPercentages(baseResult);
      case 'Count':
      default:
        return baseResult;
    }
  }

  private transformToRowPercentages(result: PivotResult): PivotResult {
    const transformedData: { [rowKey: string]: { [colKey: string]: number } } = {};

    result.rowKeys.forEach((rowKey) => {
      transformedData[rowKey] = {};
      const rowTotal = result.rowTotals[rowKey] || 0;

      result.colKeys.forEach((colKey) => {
        const cellValue = result.data[rowKey]?.[colKey] || 0;
        transformedData[rowKey][colKey] = rowTotal > 0 ? (cellValue / rowTotal) * 100 : 0;
      });
    });

    return {
      data: transformedData,
      rowKeys: result.rowKeys,
      colKeys: result.colKeys,
      rowTotals: this.calculateRowTotals(transformedData, result.rowKeys, result.colKeys),
      colTotals: this.calculateColTotals(transformedData, result.rowKeys, result.colKeys),
      grandTotal: this.calculateGrandTotal(transformedData, result.rowKeys, result.colKeys),
    };
  }

  private transformToColumnPercentages(result: PivotResult): PivotResult {
    const transformedData: { [rowKey: string]: { [colKey: string]: number } } = {};

    result.colKeys.forEach((colKey) => {
      const colTotal = result.colTotals[colKey] || 0;

      result.rowKeys.forEach((rowKey) => {
        if (!transformedData[rowKey]) {
          transformedData[rowKey] = {};
        }

        const cellValue = result.data[rowKey]?.[colKey] || 0;
        transformedData[rowKey][colKey] = colTotal > 0 ? (cellValue / colTotal) * 100 : 0;
      });
    });

    return {
      data: transformedData,
      rowKeys: result.rowKeys,
      colKeys: result.colKeys,
      rowTotals: this.calculateRowTotals(transformedData, result.rowKeys, result.colKeys),
      colTotals: this.calculateColTotals(transformedData, result.rowKeys, result.colKeys),
      grandTotal: this.calculateGrandTotal(transformedData, result.rowKeys, result.colKeys),
    };
  }

  private transformToTotalPercentages(result: PivotResult): PivotResult {
    const transformedData: { [rowKey: string]: { [colKey: string]: number } } = {};
    const grandTotal = result.grandTotal || 0;

    result.rowKeys.forEach((rowKey) => {
      transformedData[rowKey] = {};
      result.colKeys.forEach((colKey) => {
        const cellValue = result.data[rowKey]?.[colKey] || 0;
        transformedData[rowKey][colKey] = grandTotal > 0 ? (cellValue / grandTotal) * 100 : 0;
      });
    });

    return {
      data: transformedData,
      rowKeys: result.rowKeys,
      colKeys: result.colKeys,
      rowTotals: this.calculateRowTotals(transformedData, result.rowKeys, result.colKeys),
      colTotals: this.calculateColTotals(transformedData, result.rowKeys, result.colKeys),
      grandTotal: 100, // Total percentages always sum to 100
    };
  }

  private calculateRowTotals(data: { [rowKey: string]: { [colKey: string]: number } }, rowKeys: string[], colKeys: string[]): { [rowKey: string]: number } {
    const totals: { [rowKey: string]: number } = {};
    rowKeys.forEach((rowKey) => {
      totals[rowKey] = colKeys.reduce((sum, colKey) => sum + (data[rowKey]?.[colKey] || 0), 0);
    });
    return totals;
  }

  private calculateColTotals(data: { [rowKey: string]: { [colKey: string]: number } }, rowKeys: string[], colKeys: string[]): { [colKey: string]: number } {
    const totals: { [colKey: string]: number } = {};
    colKeys.forEach((colKey) => {
      totals[colKey] = rowKeys.reduce((sum, rowKey) => sum + (data[rowKey]?.[colKey] || 0), 0);
    });
    return totals;
  }

  private calculateGrandTotal(data: { [rowKey: string]: { [colKey: string]: number } }, rowKeys: string[], colKeys: string[]): number {
    return rowKeys.reduce((sum, rowKey) => {
      return sum + colKeys.reduce((rowSum, colKey) => rowSum + (data[rowKey]?.[colKey] || 0), 0);
    }, 0);
  }
}
```

## Utility Functions for Data Explorer

**File**: `libs/data-explorer/src/lib/utils/percentage-transformers.ts`

```typescript
import { PivotResult } from '@dataverse/pivot-table/types';

export class PercentageTransformers {
  static toRowPercentages(result: PivotResult): PivotResult {
    // Implementation as shown above
  }

  static toColumnPercentages(result: PivotResult): PivotResult {
    // Implementation as shown above
  }

  static toTotalPercentages(result: PivotResult): PivotResult {
    // Implementation as shown above
  }
}
```

## Formatting Considerations

### Percentage Formatting

When displaying percentages, use a different formatter:

```typescript
export function percentageFormatter(options: NumberFormatOptions = {}): (value: number) => string {
  const baseFormatter = numberFormatter({
    ...options,
    digitsAfterDecimal: options.digitsAfterDecimal ?? 1,
  });

  return (value: number): string => {
    return `${baseFormatter(value)}%`;
  };
}
```

### Usage in Component

```typescript
// In TableRendererComponent
@Input() isPercentage: boolean = false;

private getFormatter() {
  if (this.isPercentage) {
    return percentageFormatter(this.formatOptions);
  }
  return numberFormatter(this.formatOptions);
}
```

## Testing Examples

### Test Row Percentage Calculation

```typescript
describe('Row Percentage Transformer', () => {
  it('should calculate row percentages correctly', () => {
    const baseResult: PivotResult = {
      data: {
        'Row 1': { 'Col 1': 10, 'Col 2': 20 },
        'Row 2': { 'Col 1': 30, 'Col 2': 40 },
      },
      rowKeys: ['Row 1', 'Row 2'],
      colKeys: ['Col 1', 'Col 2'],
      rowTotals: { 'Row 1': 30, 'Row 2': 70 },
      colTotals: { 'Col 1': 40, 'Col 2': 60 },
      grandTotal: 100,
    };

    const result = PercentageTransformers.toRowPercentages(baseResult);

    // Row 1: 10/30 = 33.33%, 20/30 = 66.67%
    expect(result.data['Row 1']['Col 1']).toBeCloseTo(33.33, 1);
    expect(result.data['Row 1']['Col 2']).toBeCloseTo(66.67, 1);

    // Row totals should be 100%
    expect(result.rowTotals['Row 1']).toBeCloseTo(100, 1);
    expect(result.rowTotals['Row 2']).toBeCloseTo(100, 1);
  });
});
```

## Performance Notes

1. **Caching**: Cache base result when only aggregator type changes
2. **Memoization**: Memoize transformation functions
3. **Lazy Calculation**: Only transform when needed

```typescript
private baseResultCache: PivotResult | null = null;
private lastDataHash: string = '';

createTable() {
  const dataHash = JSON.stringify(this.data());

  // Recalculate base only if data changed
  if (dataHash !== this.lastDataHash) {
    this.baseResultCache = this.pivotEngine.pivot(this.data(), {
      rows: this.rows(),
      cols: this.cols(),
      aggregator: sumAggregator(),
      valueField: 'value',
    });
    this.lastDataHash = dataHash;
  }

  // Transform based on aggregator (cheap operation)
  const transformedResult = this.transformResult(
    this.baseResultCache!,
    this.aggregatorName()
  );

  this.pivotResult.set(transformedResult);
}
```
