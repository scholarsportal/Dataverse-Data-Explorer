# NgRx Signal Store Migration Guide

## Overview

This document provides guidance for migrating from the traditional NgRx global store to NgRx Signal Store for the cross-tabulation feature.

## Why Signal Store?

### Benefits

1. **Native Signals**: Built on Angular signals for fine-grained reactivity
2. **Less Boilerplate**: No need for actions, reducers, and selectors
3. **Better Performance**: Signals provide automatic change detection optimization
4. **Type Safety**: Better TypeScript inference
5. **Simpler API**: More intuitive and easier to use
6. **Computed Values**: Built-in computed signals for derived state

### Comparison

**Traditional NgRx Store:**

```typescript
// Actions
export const CrossTabulationUIActions = createActionGroup({
  source: 'Cross Tabulation',
  events: {
    'Add to Selection': props<{ variableID: string; orientation: 'rows' | 'cols' }>(),
  },
});

// Reducer
export const uiReducer = createReducer(
  initialState,
  on(CrossTabulationUIActions.addToSelection, (state, { variableID, orientation }) => ({
    ...state,
    selection: [...state.selection, { variableID, orientation }],
  })),
);

// Selector
export const selectCrossTabSelection = createSelector(selectUIFeature, (state) => state.bodyState.crossTab.selection || []);

// Component Usage
store = inject(Store);
selection = this.store.selectSignal(selectCrossTabSelection);
this.store.dispatch(CrossTabulationUIActions.addToSelection({ variableID, orientation }));
```

**NgRx Signal Store:**

```typescript
// Store Definition
export const CrossTabulationStore = signalStore(
  { providedIn: 'root' },
  withState({ selection: [] }),
  withMethods((store) => ({
    addToSelection(variableID: string, orientation: 'rows' | 'cols') {
      store.patchState({
        selection: [...store.selection(), { variableID, orientation }],
      });
    },
  })),
);

// Component Usage
store = inject(CrossTabulationStore);
selection = this.store.selection; // Direct signal access
this.store.addToSelection(variableID, orientation); // Direct method call
```

## Migration Strategy

### Step 1: Create Signal Store

Create a new Signal Store for cross-tabulation state:

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
  missingCategories: { [variableID: string]: string[] };
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
  missingCategories: {},
};

export const CrossTabulationStore = signalStore(
  { providedIn: 'root' },
  withState<CrossTabulationState>(initialState),
  withComputed((store) => ({
    rowVariables: computed(() =>
      store
        .selection()
        .filter((v) => v.orientation === 'rows')
        .map((v) => v.variableID)
        .filter((id) => id.trim() !== ''),
    ),
    colVariables: computed(() =>
      store
        .selection()
        .filter((v) => v.orientation === 'cols')
        .map((v) => v.variableID)
        .filter((id) => id.trim() !== ''),
    ),
    hasSelection: computed(() => store.selection().some((v) => v.variableID.trim() !== '')),
    canCalculate: computed(() => store.hasData() && store.rowVariables().length > 0 && store.colVariables().length > 0),
  })),
  withMethods((store) => ({
    // Selection management
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
    removeByVariableID(variableID: string) {
      const newSelection = store.selection().filter((v) => v.variableID !== variableID);
      store.patchState({ selection: newSelection });
    },

    // Weight variable
    setWeightVariable(variableID: string | null) {
      store.patchState({ weightVariableID: variableID });
    },

    // Aggregator
    setAggregatorName(name: string) {
      store.patchState({ aggregatorName: name });
    },

    // Pivot data
    setPivotData(data: any[], rows: string[], cols: string[], hasData: boolean) {
      store.patchState({ data, rows, cols, hasData });
    },

    // Pivot result
    setPivotResult(result: PivotResult | null) {
      store.patchState({ pivotResult: result });
    },

    // Loading state
    setLoading(loading: boolean) {
      store.patchState({ isLoading: loading });
    },

    // Missing categories
    setMissingCategories(variableID: string, missing: string[]) {
      store.patchState({
        missingCategories: {
          ...store.missingCategories(),
          [variableID]: missing,
        },
      });
    },

    // Reset
    reset() {
      store.patchState(initialState);
    },
  })),
);
```

### Step 2: Update Components

**Before (Traditional NgRx):**

```typescript
@Component({...})
export class CrossTabulationComponent {
  store = inject(Store);

  variables = this.store.selectSignal(selectDatasetProcessedVariables);
  crossTabVariables = this.store.selectSignal(selectDatasetVariableCrossTabValues);
  selectedWeightVariable = this.store.selectSignal(selectSelectedWeightVariable);
  tableData = this.store.selectSignal(selectCrossTabulationData);

  addNewEmptyRow() {
    this.store.dispatch(
      CrossTabulationUIActions.addToSelection({
        variableID: '',
        orientation: '',
      })
    );
  }
}
```

**After (Signal Store):**

```typescript
import { CrossTabulationStore } from '@dataverse/data-explorer/stores';

@Component({...})
export class CrossTabulationComponent {
  // Inject Signal Store
  crossTabStore = inject(CrossTabulationStore);

  // Access state signals directly
  selection = this.crossTabStore.selection;
  pivotResult = this.crossTabStore.pivotResult;
  isLoading = this.crossTabStore.isLoading;
  aggregatorName = this.crossTabStore.aggregatorName;

  // Access computed signals
  rowVariables = this.crossTabStore.rowVariables;
  colVariables = this.crossTabStore.colVariables;
  canCalculate = this.crossTabStore.canCalculate;

  // Still use global store for other data (if not migrated)
  globalStore = inject(Store);
  variables = this.globalStore.selectSignal(selectDatasetProcessedVariables);

  addNewEmptyRow() {
    // Direct method call - no dispatch needed
    this.crossTabStore.addToSelection('', '');
  }

  onWeightChange(event: { value: Variable | null }) {
    const variableID = event?.value?.['@_ID'] ?? null;
    this.crossTabStore.setWeightVariable(variableID);
  }
}
```

### Step 3: Update Data Processing

If data processing logic needs to be moved to the store, use `withHooks`:

```typescript
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';

export const CrossTabulationStore = signalStore(
  { providedIn: 'root' },
  withState<CrossTabulationState>(initialState),
  withComputed((store) => ({
    // ... computed signals
  })),
  withMethods((store) => ({
    // ... methods
  })),
  withHooks({
    onInit(store) {
      // Initialize or subscribe to external data sources
      // This runs when the store is first created
    },
    onDestroy(store) {
      // Cleanup if needed
    },
  }),
);
```

## Integration with PivotTable

### Updating Cross Table Component

```typescript
import { CrossTabulationStore } from '@dataverse/data-explorer/stores';

@Component({...})
export class CrossTableComponent {
  private store = inject(CrossTabulationStore);
  private pivotEngine = new PivotEngine();

  // Access store signals
  pivotResult = this.store.pivotResult;
  data = this.store.data;
  rows = this.store.rows;
  cols = this.store.cols;
  hasData = this.store.hasData;
  aggregatorName = this.store.aggregatorName;

  constructor(
    private liveAnnouncer: LiveAnnouncer,
    private translate: TranslateService,
  ) {
    effect(() => {
      if (this.data().length > 0 && this.hasData()) {
        this.createTable();
      }
    });
  }

  createTable() {
    const baseResult = this.pivotEngine.pivot(this.data(), {
      rows: this.rows(),
      cols: this.cols(),
      aggregator: sumAggregator(),
      valueField: 'value',
    });

    const transformed = this.transformResult(baseResult, this.aggregatorName());
    this.store.setPivotResult(transformed);
  }

  private transformResult(baseResult: PivotResult, aggregatorName: string): PivotResult {
    // ... transformation logic
  }
}
```

## Migration Checklist

### Phase 1: Setup

- [ ] Install `@ngrx/signals` package
- [ ] Create Signal Store structure
- [ ] Define state interface

### Phase 2: Store Implementation

- [ ] Implement `withState` for initial state
- [ ] Implement `withComputed` for derived state
- [ ] Implement `withMethods` for state mutations
- [ ] Add `withHooks` if needed for side effects

### Phase 3: Component Migration

- [ ] Update components to inject Signal Store
- [ ] Replace `store.selectSignal()` with direct signal access
- [ ] Replace `store.dispatch()` with direct method calls
- [ ] Update templates to use new signals

### Phase 4: Data Integration

- [ ] Integrate with PivotTable library
- [ ] Connect data processing to store
- [ ] Update selectors/computed values

### Phase 5: Testing

- [ ] Write unit tests for Signal Store
- [ ] Test component integration
- [ ] Test computed signals
- [ ] Test state mutations

### Phase 6: Cleanup

- [ ] Remove old actions (if fully migrated)
- [ ] Remove old reducers (if fully migrated)
- [ ] Remove old selectors (if fully migrated)
- [ ] Update documentation

## Best Practices

1. **Keep Stores Focused**: One store per feature domain
2. **Use Computed Signals**: For derived state instead of recalculating in components
3. **Immutable Updates**: Always create new objects/arrays when updating state
4. **Type Safety**: Use TypeScript interfaces for state
5. **Testing**: Test stores in isolation with unit tests
6. **Performance**: Computed signals are memoized automatically

## Common Patterns

### Pattern 1: Loading State

```typescript
withMethods((store) => ({
  async loadData() {
    store.setLoading(true);
    try {
      const data = await fetchData();
      store.patchState({ data, isLoading: false });
    } catch (error) {
      store.patchState({ isLoading: false });
      // Handle error
    }
  },
}));
```

### Pattern 2: Conditional Updates

```typescript
withMethods((store) => ({
  updateIfValid(value: string) {
    if (value.trim() !== '') {
      store.patchState({ value });
    }
  },
}));
```

### Pattern 3: Batch Updates

```typescript
withMethods((store) => ({
  updateMultiple(updates: Partial<CrossTabulationState>) {
    store.patchState(updates);
  },
}));
```

## Troubleshooting

### Issue: Signals not updating

**Solution**: Ensure you're using `patchState` or returning new state objects. Signals only update when references change.

### Issue: Computed signals not recalculating

**Solution**: Check that computed signals depend on other signals from the same store. External dependencies won't trigger updates.

### Issue: Store not provided

**Solution**: Ensure the store is provided in the component's injector or use `{ providedIn: 'root' }` in the store definition.

## References

- [NgRx Signal Store Documentation](https://ngrx.io/docs/signals/overview)
- [Angular Signals Documentation](https://angular.dev/guide/signals)
- [NgRx Signal Store API](https://ngrx.io/api/signals)
