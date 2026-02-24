# Nx Migration Plan: PivotTable Integration

## Overview

This document outlines the plan for integrating a custom TypeScript PivotTable library into the Nx workspace structure, replacing the current jQuery-based `pivottable` dependency.

## Current State Analysis

### Current Dependencies

- **pivottable**: v2.23.0 (jQuery-based)
- **jquery**: v3.7.1
- **jquery-ui**: v1.13.2

### Current Usage

The PivotTable library is currently used in:

- `src/app/components/body/cross-tabulation/cross-table/cross-table.component.ts`

### Features Currently Used

1. **Sum Aggregator**: `jQuery.pivotUtilities.aggregatorTemplates.sum`
2. **Number Formatting**: `jQuery.pivotUtilities.numberFormat` (1 decimal place)
3. **Table Renderer**: `rendererName: 'Table'`
4. **No UI**: `showUI: false`

### Features NOT Used (Can Be Removed)

- Built-in chart renderers (using custom Chart.js component instead)
- UI controls (drag-and-drop interface)
- Other aggregators (count, average, etc.)
- Other renderers (heatmap, treemap, etc.)

### Planned Features (Not Currently Implemented)

- **ROW_PERC**: Count as Fraction of Rows
- **COL_PERC**: Count as Fraction of Columns
- **TOTAL_PERC**: Count as Fraction of Total

## State Management Approach

### NgRx Signal Store

This migration will use **NgRx Signal Store** instead of the traditional NgRx global store. Signal Store provides:

- **Native Signals**: Built on Angular signals for reactive state management
- **Simplified API**: Less boilerplate than traditional NgRx
- **Better Performance**: Signals provide fine-grained reactivity
- **Type Safety**: Full TypeScript support with better inference
- **Computed Values**: Built-in computed signals for derived state

### Migration from Global Store

The current implementation uses:

- `@ngrx/store` with reducers, actions, and selectors
- `store.selectSignal()` to get signals from selectors

The new implementation will use:

- `@ngrx/signals` with `signalStore()` function
- Direct signal access from store instances
- `withState()`, `withComputed()`, `withMethods()`, `withHooks()` for store configuration

## Proposed Nx Workspace Structure

### Library Organization

```
apps/
  dataverse-data-explorer/          # Main application
    src/
      app/
        components/
          body/
            cross-tabulation/       # Existing components
        new.state/
          cross-tabulation/        # Signal Store for cross-tabulation
            cross-tabulation.store.ts

libs/
  pivot-table/                       # New custom PivotTable library
    src/
      lib/
        core/
          pivot-engine.ts           # Core pivot calculation logic
          aggregators.ts            # Aggregator functions
          formatters.ts             # Number formatting utilities
        renderers/
          table-renderer.ts         # Table renderer implementation
          table-renderer.component.ts  # Angular component wrapper
        types/
          pivot-config.interface.ts # Configuration interfaces
          pivot-data.interface.ts   # Data structure interfaces
        utils/
          data-processor.ts         # Data transformation utilities
      index.ts                      # Public API exports
    project.json                    # Nx project configuration
    tsconfig.json
    package.json

  data-explorer/                    # Data Explorer specific utilities
    src/
      lib/
        aggregators/
          data-explorer-aggregators.ts  # Custom aggregators for Data Explorer
        formatters/
          data-explorer-formatters.ts   # Custom formatting for Data Explorer
        stores/
          cross-tabulation.store.ts     # Signal Store for cross-tabulation state
```

## Library Dependencies

### pivot-table Library

- **Dependencies**: None (pure TypeScript, framework-agnostic)
- **Peer Dependencies**: None
- **Purpose**: Core pivot table calculation and rendering logic

### data-explorer Library

- **Dependencies**: `@dataverse/pivot-table` (internal)
- **Purpose**: Data Explorer specific customizations

## Integration Points

### 1. Cross Table Component Integration

**Current Implementation:**

```typescript
// Uses jQuery and global pivottable
targetElement.pivot(this.data(), {
  rows: this.rows(),
  cols: this.cols(),
  aggregator: jQuery.pivotUtilities.aggregatorTemplates.sum(intFormat)(['value']),
  rendererName: 'Table',
  showUI: false,
});
```

**Proposed Implementation:**

```typescript
import { PivotEngine } from '@dataverse/pivot-table';
import { TableRenderer } from '@dataverse/pivot-table/renderers';
import { sumAggregator } from '@dataverse/pivot-table/aggregators';
import { numberFormatter } from '@dataverse/pivot-table/formatters';

// In component
private pivotEngine = new PivotEngine();
private tableRenderer = new TableRenderer();

createTable() {
  const config = {
    rows: this.rows(),
    cols: this.cols(),
    aggregator: sumAggregator({
      valueField: 'value',
      formatter: numberFormatter({ digitsAfterDecimal: 1 })
    })
  };

  const result = this.pivotEngine.pivot(this.data(), config);
  this.tableRenderer.render(this.outputElement.nativeElement, result);
}
```

### 2. Custom Aggregators Integration

**Location**: `libs/data-explorer/src/lib/aggregators/data-explorer-aggregators.ts`

```typescript
import { Aggregator, AggregatorConfig } from '@dataverse/pivot-table';
import { numberFormatter } from '@dataverse/pivot-table/formatters';

export function rowPercentageAggregator(config: AggregatorConfig): Aggregator {
  // Implementation for ROW_PERC
}

export function columnPercentageAggregator(config: AggregatorConfig): Aggregator {
  // Implementation for COL_PERC
}

export function totalPercentageAggregator(config: AggregatorConfig): Aggregator {
  // Implementation for TOTAL_PERC
}
```

### 3. Signal Store Integration

**Location**: `libs/data-explorer/src/lib/stores/cross-tabulation.store.ts`

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
    setPivotResult(result: PivotResult | null) {
      store.patchState({ pivotResult: result });
    },
    setLoading(loading: boolean) {
      store.patchState({ isLoading: loading });
    },
  })),
);
```

**Usage in Component:**

```typescript
import { CrossTabulationStore } from '@dataverse/data-explorer/stores';

@Component({...})
export class CrossTabulationComponent {
  // Inject the store
  store = inject(CrossTabulationStore);

  // Access state signals directly
  selection = this.store.selection;
  pivotResult = this.store.pivotResult;
  isLoading = this.store.isLoading;

  // Access computed signals
  rowVariables = this.store.rowVariables;
  colVariables = this.store.colVariables;

  // Call methods
  addVariable(variableID: string, orientation: 'rows' | 'cols') {
    this.store.addToSelection(variableID, orientation);
  }
}
```

## Migration Strategy

### Phase 1: Create Nx Libraries

1. Generate `pivot-table` library using Nx
2. Generate `data-explorer` library using Nx
3. Set up proper TypeScript configurations
4. Configure build targets

### Phase 2: Implement Core PivotTable

1. Port core pivot calculation logic
2. Implement sum aggregator
3. Implement number formatter
4. Implement table renderer
5. Create Angular component wrapper

### Phase 3: Implement Custom Features

1. Add Data Explorer specific aggregators
2. Add custom formatting utilities
3. Integrate with existing chart component

### Phase 4: State Management Migration

1. Create Signal Store for cross-tabulation state
2. Migrate from global NgRx store to Signal Store
3. Update components to use Signal Store
4. Remove old reducers, actions, and selectors (if fully migrated)
5. Test state management integration

### Phase 5: PivotTable Migration

1. Update `cross-table.component.ts` to use new library
2. Integrate with Signal Store
3. Remove jQuery and pivottable dependencies
4. Update build configuration
5. Test and verify functionality

### Phase 6: Cleanup

1. Remove unused dependencies (jQuery, pivottable, old NgRx store if fully migrated)
2. Update documentation
3. Add unit tests for Signal Store
4. Performance optimization

## Build Configuration

### pivot-table Library

```json
{
  "targets": {
    "build": {
      "executor": "@nx/js:tsc",
      "options": {
        "outputPath": "dist/libs/pivot-table",
        "main": "libs/pivot-table/src/index.ts",
        "tsConfig": "libs/pivot-table/tsconfig.json",
        "assets": []
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    },
    "test": {
      "executor": "@nx/jest:jest"
    }
  }
}
```

## Benefits of Nx Structure

1. **Modularity**: PivotTable logic separated from application code
2. **Reusability**: Can be used in other applications if needed
3. **Testability**: Easier to unit test core logic
4. **Type Safety**: Full TypeScript support without jQuery types
5. **Tree Shaking**: Only import what's needed
6. **No jQuery Dependency**: Removes jQuery requirement
7. **Framework Agnostic Core**: Core logic can be used in other frameworks
8. **Better Build Performance**: Nx caching and incremental builds

## Dependencies

### To Add

- `@ngrx/signals` - For Signal Store functionality

### To Remove

After migration, the following can be removed:

- `pivottable` (v2.23.0)
- `jquery` (v3.7.1) - if not used elsewhere
- `jquery-ui` (v1.13.2) - if not used elsewhere
- `@ngrx/store` - If fully migrated to Signal Store (may keep for other features)
- `@ngrx/effects` - If fully migrated to Signal Store (may keep for other features)

## Next Steps

1. Review and approve this plan
2. Set up Nx workspace (if not already done)
3. Begin Phase 1 implementation
4. Create detailed technical specifications for each phase
