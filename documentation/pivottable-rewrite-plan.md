# PivotTable Rewrite Plan

## Overview

This document details the technical implementation plan for rewriting the PivotTable functionality in TypeScript, removing unused features and adding custom Data Explorer functionality.

## Architecture Overview

### Core Components

```
┌─────────────────────────────────────────────────────────┐
│                   PivotEngine                           │
│  - Data processing                                       │
│  - Pivot calculation                                    │
│  - Aggregation                                          │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                 Aggregators                              │
│  - Sum                                                  │
│  - Row Percentage                                       │
│  - Column Percentage                                    │
│  - Total Percentage                                     │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                 Renderers                                │
│  - Table Renderer (Angular Component)                   │
└─────────────────────────────────────────────────────────┘
```

## Data Structures

### Input Data Format

```typescript
interface PivotDataRow {
  [columnName: string]: string | number;
  value: number; // The value to aggregate
}

// Example:
const data: PivotDataRow[] = [
  { 'Variable A - Label A': 'Category 1', 'Variable B - Label B': 'X', value: 10 },
  { 'Variable A - Label A': 'Category 1', 'Variable B - Label B': 'Y', value: 20 },
  { 'Variable A - Label A': 'Category 2', 'Variable B - Label B': 'X', value: 15 },
];
```

### Pivot Configuration

```typescript
interface PivotConfig {
  rows: string[]; // Array of column names for rows
  cols: string[]; // Array of column names for columns
  aggregator: Aggregator; // Aggregator function
  valueField?: string; // Field name containing values (default: 'value')
}
```

### Pivot Result

```typescript
interface PivotResult {
  data: {
    [rowKey: string]: {
      [colKey: string]: number;
    };
  };
  rowKeys: string[];
  colKeys: string[];
  rowTotals: { [rowKey: string]: number };
  colTotals: { [colKey: string]: number };
  grandTotal: number;
}
```

## Core Implementation

### 1. PivotEngine Class

**File**: `libs/pivot-table/src/lib/core/pivot-engine.ts`

```typescript
import { PivotConfig, PivotResult, PivotDataRow } from '../types';

export class PivotEngine {
  /**
   * Processes data and creates a pivot table
   */
  pivot(data: PivotDataRow[], config: PivotConfig): PivotResult {
    const { rows, cols, aggregator, valueField = 'value' } = config;

    // Step 1: Extract unique row and column keys
    const rowKeys = this.extractUniqueKeys(data, rows);
    const colKeys = this.extractUniqueKeys(data, cols);

    // Step 2: Group data by row and column combinations
    const groupedData = this.groupData(data, rows, cols, valueField);

    // Step 3: Aggregate values for each cell
    const aggregatedData = this.aggregateData(groupedData, rowKeys, colKeys, aggregator);

    // Step 4: Calculate totals
    const rowTotals = this.calculateRowTotals(aggregatedData, rowKeys, colKeys);
    const colTotals = this.calculateColTotals(aggregatedData, rowKeys, colKeys);
    const grandTotal = this.calculateGrandTotal(rowTotals);

    return {
      data: aggregatedData,
      rowKeys,
      colKeys,
      rowTotals,
      colTotals,
      grandTotal,
    };
  }

  private extractUniqueKeys(data: PivotDataRow[], fields: string[]): string[] {
    const keySet = new Set<string>();

    data.forEach((row) => {
      const key = fields
        .map((field) => String(row[field] || ''))
        .filter(Boolean)
        .join(' - ');

      if (key) {
        keySet.add(key);
      }
    });

    return Array.from(keySet).sort();
  }

  private groupData(data: PivotDataRow[], rowFields: string[], colFields: string[], valueField: string): Map<string, Map<string, number[]>> {
    const grouped = new Map<string, Map<string, number[]>>();

    data.forEach((row) => {
      const rowKey = this.buildKey(row, rowFields);
      const colKey = this.buildKey(row, colFields);

      if (!rowKey || !colKey) return;

      if (!grouped.has(rowKey)) {
        grouped.set(rowKey, new Map());
      }

      const rowGroup = grouped.get(rowKey)!;
      if (!rowGroup.has(colKey)) {
        rowGroup.set(colKey, []);
      }

      const value = Number(row[valueField]) || 0;
      rowGroup.get(colKey)!.push(value);
    });

    return grouped;
  }

  private buildKey(row: PivotDataRow, fields: string[]): string {
    return (
      fields
        .map((field) => String(row[field] || ''))
        .filter(Boolean)
        .join(' - ') || ''
    );
  }

  private aggregateData(groupedData: Map<string, Map<string, number[]>>, rowKeys: string[], colKeys: string[], aggregator: Aggregator): { [rowKey: string]: { [colKey: string]: number } } {
    const result: { [rowKey: string]: { [colKey: string]: number } } = {};

    rowKeys.forEach((rowKey) => {
      result[rowKey] = {};
      const rowGroup = groupedData.get(rowKey);

      colKeys.forEach((colKey) => {
        const values = rowGroup?.get(colKey) || [];
        result[rowKey][colKey] = aggregator(values);
      });
    });

    return result;
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

  private calculateGrandTotal(rowTotals: { [rowKey: string]: number }): number {
    return Object.values(rowTotals).reduce((sum, total) => sum + total, 0);
  }
}
```

### 2. Aggregator Interface and Implementations

**File**: `libs/pivot-table/src/lib/core/aggregators.ts`

```typescript
export type Aggregator = (values: number[]) => number;

export interface AggregatorConfig {
  formatter?: (value: number) => string;
}

/**
 * Sum aggregator - sums all values
 */
export function sumAggregator(config: AggregatorConfig = {}): Aggregator {
  return (values: number[]): number => {
    return values.reduce((sum, val) => sum + val, 0);
  };
}

/**
 * Count aggregator - counts number of values
 */
export function countAggregator(config: AggregatorConfig = {}): Aggregator {
  return (values: number[]): number => {
    return values.length;
  };
}

/**
 * Average aggregator - calculates mean
 */
export function averageAggregator(config: AggregatorConfig = {}): Aggregator {
  return (values: number[]): number => {
    if (values.length === 0) return 0;
    const sum = values.reduce((s, v) => s + v, 0);
    return sum / values.length;
  };
}
```

**File**: `libs/data-explorer/src/lib/aggregators/data-explorer-aggregators.ts`

**Note**: Percentage aggregators require a two-pass calculation approach. See `aggregator-implementation-details.md` for full implementation details.

```typescript
import { PivotResult } from '@dataverse/pivot-table/types';

/**
 * Transforms a pivot result to row percentages
 * Each cell is calculated as a percentage of its row total
 */
export function transformToRowPercentages(result: PivotResult): PivotResult {
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
    grandTotal: result.rowKeys.length * 100,
  };
}

/**
 * Transforms a pivot result to column percentages
 * Each cell is calculated as a percentage of its column total
 */
export function transformToColumnPercentages(result: PivotResult): PivotResult {
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

  // Recalculate totals
  const rowTotals = result.rowKeys.reduce(
    (acc, rowKey) => {
      acc[rowKey] = result.colKeys.reduce((sum, colKey) => {
        return sum + (transformedData[rowKey]?.[colKey] || 0);
      }, 0);
      return acc;
    },
    {} as { [key: string]: number },
  );

  const colTotals = Object.keys(transformedData[result.rowKeys[0]] || {}).reduce(
    (acc, colKey) => {
      acc[colKey] = 100; // Column percentages always sum to 100
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
    grandTotal: result.colKeys.length * 100,
  };
}

/**
 * Transforms a pivot result to total percentages
 * Each cell is calculated as a percentage of the grand total
 */
export function transformToTotalPercentages(result: PivotResult): PivotResult {
  const transformedData: { [rowKey: string]: { [colKey: string]: number } } = {};
  const grandTotal = result.grandTotal || 0;

  result.rowKeys.forEach((rowKey) => {
    transformedData[rowKey] = {};
    result.colKeys.forEach((colKey) => {
      const cellValue = result.data[rowKey]?.[colKey] || 0;
      transformedData[rowKey][colKey] = grandTotal > 0 ? (cellValue / grandTotal) * 100 : 0;
    });
  });

  // Recalculate totals
  const rowTotals = result.rowKeys.reduce(
    (acc, rowKey) => {
      acc[rowKey] = result.colKeys.reduce((sum, colKey) => {
        return sum + (transformedData[rowKey]?.[colKey] || 0);
      }, 0);
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
    grandTotal: 100, // Total percentages always sum to 100
  };
}
```

### 3. Number Formatter

**File**: `libs/pivot-table/src/lib/core/formatters.ts`

```typescript
export interface NumberFormatOptions {
  digitsAfterDecimal?: number;
  thousandsSeparator?: string;
  decimalSeparator?: string;
}

export function numberFormatter(options: NumberFormatOptions = {}): (value: number) => string {
  const { digitsAfterDecimal = 0, thousandsSeparator = ',', decimalSeparator = '.' } = options;

  return (value: number): string => {
    if (isNaN(value) || !isFinite(value)) {
      return '0';
    }

    // Round to specified decimal places
    const rounded = Math.round(value * Math.pow(10, digitsAfterDecimal)) / Math.pow(10, digitsAfterDecimal);

    // Split into integer and decimal parts
    const parts = rounded.toString().split('.');
    let integerPart = parts[0];
    let decimalPart = parts[1] || '';

    // Add thousands separator
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);

    // Format decimal part
    if (digitsAfterDecimal > 0) {
      decimalPart = decimalPart.padEnd(digitsAfterDecimal, '0');
      return `${integerPart}${decimalSeparator}${decimalPart}`;
    }

    return integerPart;
  };
}
```

### 4. Table Renderer (Angular Component)

**File**: `libs/pivot-table/src/lib/renderers/table-renderer.component.ts`

```typescript
import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PivotResult } from '../types';
import { numberFormatter, NumberFormatOptions } from '../formatters';

@Component({
  selector: 'dct-pivot-table',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="pivot-table-container">
      <table class="pivot-table">
        <thead>
          <tr>
            <th class="pvtAxisLabel" [attr.colspan]="rowFields.length">
              {{ rowFields.join(' / ') }}
            </th>
            <th class="pvtColLabel" [attr.colspan]="result.colKeys.length">
              {{ colFields.join(' / ') }}
            </th>
            <th class="pvtTotalLabel">Total</th>
          </tr>
          <tr>
            <th *ngFor="let rowField of rowFields" class="pvtAxisLabel">
              {{ rowField }}
            </th>
            <th *ngFor="let colKey of result.colKeys" class="pvtColLabel">
              {{ colKey }}
            </th>
            <th class="pvtTotalLabel">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let rowKey of result.rowKeys">
            <td *ngFor="let rowField of rowFields" class="pvtRowLabel">
              {{ getRowLabelPart(rowKey, rowField) }}
            </td>
            <td *ngFor="let colKey of result.colKeys" class="pvtVal">
              {{ formatValue(result.data[rowKey]?.[colKey] || 0) }}
            </td>
            <td class="pvtRowTotalLabel">
              {{ formatValue(result.rowTotals[rowKey] || 0) }}
            </td>
          </tr>
          <tr class="pvtGrandTotal">
            <td *ngFor="let rowField of rowFields" class="pvtTotalLabel">Total</td>
            <td *ngFor="let colKey of result.colKeys" class="pvtTotal">
              {{ formatValue(result.colTotals[colKey] || 0) }}
            </td>
            <td class="pvtGrandTotal">
              {{ formatValue(result.grandTotal) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [
    `
      .pivot-table {
        @apply table w-full;
      }

      .pvtAxisLabel {
        @apply border text-base-content bg-base-100;
      }

      .pvtColLabel {
        @apply font-semibold bg-secondary-content text-base-content border;
      }

      .pvtRowLabel {
        @apply font-semibold bg-primary-content border;
      }

      .pvtVal {
        @apply border;
      }

      .pvtTotal {
        @apply border;
      }

      .pvtRowTotalLabel {
        @apply border text-base-content;
      }

      .pvtTotalLabel {
        @apply border;
      }

      .pvtGrandTotal {
        @apply bg-base-200 border;
      }
    `,
  ],
})
export class TableRendererComponent implements OnInit {
  @Input() result!: PivotResult;
  @Input() rowFields: string[] = [];
  @Input() colFields: string[] = [];
  @Input() formatOptions: NumberFormatOptions = { digitsAfterDecimal: 1 };

  private formatter = numberFormatter(this.formatOptions);

  ngOnInit() {
    this.formatter = numberFormatter(this.formatOptions);
  }

  formatValue(value: number): string {
    return this.formatter(value);
  }

  getRowLabelPart(rowKey: string, fieldIndex: number): string {
    const parts = rowKey.split(' - ');
    return parts[fieldIndex] || '';
  }
}
```

### 5. Signal Store for Cross Tabulation

**File**: `libs/data-explorer/src/lib/stores/cross-tabulation.store.ts`

```typescript
import { signalStore, withState, withComputed, withMethods } from '@ngrx/signals';
import { PivotResult } from '@dataverse/pivot-table';
import { computed } from '@angular/core';

export interface CrossTabulationState {
  selection: Array<{ variableID: string; orientation: 'rows' | 'cols' | '' }>;
  weightVariableID: string | null;
  aggregatorName: string;
  pivotResult: PivotResult | null;
  isLoading: boolean;
  data: any[];
  rows: string[];
  cols: string[];
  hasData: boolean;
}

const initialState: CrossTabulationState = {
  selection: [
    { variableID: '', orientation: 'rows' },
    { variableID: '', orientation: 'cols' },
  ],
  weightVariableID: null,
  aggregatorName: 'Count',
  pivotResult: null,
  isLoading: false,
  data: [],
  rows: [],
  cols: [],
  hasData: false,
};

export const CrossTabulationStore = signalStore(
  { providedIn: 'root' },
  withState<CrossTabulationState>(initialState),
  withComputed((store) => ({
    rowVariables: computed(() =>
      store
        .selection()
        .filter((v) => v.orientation === 'rows')
        .map((v) => v.variableID),
    ),
    colVariables: computed(() =>
      store
        .selection()
        .filter((v) => v.orientation === 'cols')
        .map((v) => v.variableID),
    ),
    hasSelection: computed(() => store.selection().length > 0),
    canCalculate: computed(() => store.hasData() && store.rowVariables().length > 0 && store.colVariables().length > 0),
  })),
  withMethods((store) => ({
    addToSelection(variableID: string, orientation: 'rows' | 'cols' | '') {
      store.patchState({
        selection: [...store.selection(), { variableID, orientation }],
      });
    },
    updateSelection(index: number, variableID: string, orientation: 'rows' | 'cols' | '') {
      const newSelection = [...store.selection()];
      newSelection[index] = { variableID, orientation };
      store.patchState({ selection: newSelection });
    },
    removeFromSelection(index: number) {
      const newSelection = store.selection().filter((_, i) => i !== index);
      store.patchState({ selection: newSelection });
    },
    setWeightVariable(variableID: string | null) {
      store.patchState({ weightVariableID: variableID });
    },
    setAggregatorName(name: string) {
      store.patchState({ aggregatorName: name });
    },
    setPivotData(data: any[], rows: string[], cols: string[], hasData: boolean) {
      store.patchState({ data, rows, cols, hasData });
    },
    setPivotResult(result: PivotResult | null) {
      store.patchState({ pivotResult: result });
    },
    setLoading(loading: boolean) {
      store.patchState({ isLoading: loading });
    },
  })),
);
```

### 6. Updated Cross Table Component

**File**: `src/app/components/body/cross-tabulation/cross-table/cross-table.component.ts`

```typescript
import { Component, effect, ElementRef, inject, input, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PivotEngine, PivotResult } from '@dataverse/pivot-table';
import { sumAggregator } from '@dataverse/pivot-table/aggregators';
import { TableRendererComponent } from '@dataverse/pivot-table/renderers';
import { transformToRowPercentages, transformToColumnPercentages, transformToTotalPercentages } from '@dataverse/data-explorer/aggregators';
import { CrossTabulationStore } from '@dataverse/data-explorer/stores';

@Component({
  selector: 'dct-cross-table',
  standalone: true,
  imports: [CommonModule, TranslateModule, TableRendererComponent],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="[&_table]:w-full">
      @if (pivotResult(); as result) {
        <dct-pivot-table [result]="result" [rowFields]="rows()" [colFields]="cols()" [formatOptions]="{ digitsAfterDecimal: 1 }" />
      }
    </div>
  `,
  styleUrl: './cross-table.component.css',
})
export class CrossTableComponent {
  @ViewChild('output') outputElement?: ElementRef;
  data = input.required<any>();
  rows = input.required<string[]>();
  cols = input.required<string[]>();
  hasData = input.required<boolean>();
  selectedViewOption = input<string>('Count');
  aggregatorName = input.required<string>();

  // Inject Signal Store
  private store = inject(CrossTabulationStore);
  private pivotEngine = new PivotEngine();
  private baseResultCache: PivotResult | null = null;
  private lastDataHash: string = '';

  // Access store signals
  pivotResult = this.store.pivotResult;

  constructor(
    private liveAnnouncer: LiveAnnouncer,
    private translate: TranslateService,
  ) {
    effect(() => {
      if (this.data() && (this.rows() || this.cols())) {
        this.createTable();
      }
    });
  }

  createTable() {
    if (!this.data() || !this.hasData()) {
      return;
    }

    // Create data hash for caching
    const dataHash = JSON.stringify(this.data()) + JSON.stringify(this.rows()) + JSON.stringify(this.cols());

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

    // Transform based on selected aggregator (cheap operation)
    const transformedResult = this.transformResult(this.baseResultCache!, this.aggregatorName());

    // Update store with result
    this.store.setPivotResult(transformedResult);

    // Announce table creation
    let txt: string = '';
    this.translate.get('CROSS_TABULATION.TABLE_MESSAGE').subscribe((res: string) => {
      txt = res;
    });
    setTimeout(() => {
      this.liveAnnouncer.announce(txt);
    }, 2000);
  }

  private transformResult(baseResult: PivotResult, aggregatorName: string): PivotResult {
    switch (aggregatorName) {
      case 'Count as Fraction of Rows':
        return transformToRowPercentages(baseResult);
      case 'Count as Fraction of Columns':
        return transformToColumnPercentages(baseResult);
      case 'Count as Fraction of Total':
        return transformToTotalPercentages(baseResult);
      case 'Count':
      default:
        return baseResult;
    }
  }
}
```

## Key Differences from Original PivotTable

### Removed Features

1. **jQuery Dependency**: Completely removed
2. **Built-in Charts**: Not included (using custom Chart.js component)
3. **UI Controls**: Not included (handled by parent component)
4. **Multiple Renderers**: Only table renderer implemented
5. **Unused Aggregators**: Only implemented what's needed

### Added Features

1. **TypeScript Types**: Full type safety
2. **Custom Aggregators**: Row/Column/Total percentage calculations
3. **Angular Integration**: Native Angular component
4. **Modular Design**: Easy to extend and customize
5. **Framework Agnostic Core**: Core logic can be reused

## Testing Strategy

### Unit Tests

- Test PivotEngine with various data configurations
- Test aggregators independently
- Test formatters with edge cases
- Test table renderer component
- Test percentage transformation functions (see `aggregator-implementation-details.md`)

### Integration Tests

- Test full pivot table creation flow
- Test with real Data Explorer data
- Test aggregator switching
- Test accessibility features
- Test caching behavior

## Additional Documentation

For detailed implementation of percentage aggregators and transformation functions, see:

- `aggregator-implementation-details.md` - Comprehensive guide to percentage calculations

## Performance Considerations

1. **Lazy Calculation**: Only calculate when data changes
2. **Memoization**: Cache pivot results when inputs don't change
3. **Virtual Scrolling**: For large tables (future enhancement)
4. **OnPush Change Detection**: Use in Angular components

## Migration Checklist

- [ ] Create Nx libraries structure
- [ ] Implement PivotEngine core logic
- [ ] Implement sum aggregator
- [ ] Implement number formatter
- [ ] Implement table renderer component
- [ ] Implement custom percentage aggregators
- [ ] Update cross-table component
- [ ] Remove jQuery and pivottable dependencies
- [ ] Update build configuration
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Update documentation
- [ ] Performance testing
- [ ] Accessibility testing
