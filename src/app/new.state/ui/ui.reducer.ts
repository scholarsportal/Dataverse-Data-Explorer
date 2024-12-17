import { UIState } from './ui.interface';
import { createReducer, on } from '@ngrx/store';
import { CrossTabulationUIActions, VariableTabUIAction } from './ui.actions';
import { DatasetActions } from '../dataset/dataset.actions';
import {
  DataverseFetchActions,
  XmlManipulationActions,
} from '../xml/xml.actions';

export const initialState: UIState = {
  progress: 0,
  bodyToggle: 'variables',
  bodyState: {
    variables: {
      groupSelectedID: 'ALL',
      importComponentState: 'close',
      categoriesDeclaredMissing: {},
      variableSelectionContext: {
        ALL: [],
      },
      openVariable: {
        variableID: '',
        mode: 'VIEW_VAR',
      },
    },
    crossTab: {
      missingCategories: {},
      selection: [
        { variableID: '', orientation: 'rows' as const },
        { variableID: '', orientation: 'cols' as const },
      ],
      weight: {
        weighted: false,
        weightVariableID: '',
      },
    },
  },
};

export const uiReducer = createReducer(
  initialState,
  on(DataverseFetchActions.decodeSuccess, (state) => ({
    ...state,
    progress: 22,
  })),
  on(DataverseFetchActions.decodeAndFetchDDISuccess, (state) => ({
    ...state,
    progress: 44,
  })),
  on(DataverseFetchActions.completeCrossTabFetch, (state) => ({
    ...state,
    progress: 77,
  })),
  on(VariableTabUIAction.navigateToVariableTab, (state) => ({
    ...state,
    bodyToggle: 'variables' as const,
  })),
  on(VariableTabUIAction.changeSelectedGroupID, (state, { groupID }) => ({
    ...state,
    bodyState: {
      ...state.bodyState,
      variables: {
        ...state.bodyState.variables,
        groupSelectedID: groupID,
        importComponentState: 'close' as const,
      },
    },
  })),
  on(VariableTabUIAction.changeOpenVariable, (state, { variableID, mode }) => ({
    ...state,
    bodyState: {
      ...state.bodyState,
      variables: {
        ...state.bodyState.variables,
        openVariable: {
          variableID: mode ? variableID : '',
          mode: mode ?? state.bodyState.variables.openVariable.mode,
        },
      },
    },
  })),
  on(
    VariableTabUIAction.changeVariableSelectionContext,
    (state, { variableIDs, selectedGroup }) => ({
      ...state,
      bodyState: {
        ...state.bodyState,
        variables: {
          ...state.bodyState.variables,
          variableSelectionContext: {
            ...state.bodyState.variables.variableSelectionContext,
            [selectedGroup]: variableIDs,
          },
        },
      },
    }),
  ),
  on(XmlManipulationActions.removeVariablesFromGroup, (state, { groupID }) => ({
    ...state,
    bodyState: {
      ...state.bodyState,
      variables: {
        ...state.bodyState.variables,
        variableSelectionContext: {
          ...state.bodyState.variables.variableSelectionContext,
          [groupID]: [],
        },
      },
    },
  })),
  on(VariableTabUIAction.openVariableImportMenu, (state) => ({
    ...state,
    bodyState: {
      ...state.bodyState,
      variables: {
        ...state.bodyState.variables,
        importComponentState: 'open' as const,
      },
    },
  })),
  on(VariableTabUIAction.closeVariableImportMenu, (state) => ({
    ...state,
    bodyState: {
      ...state.bodyState,
      variables: {
        ...state.bodyState.variables,
        importComponentState: 'close' as const,
      },
    },
  })),
  on(
    VariableTabUIAction.changeMissingCategories,
    (state, { variableID, categories }) => ({
      ...state,
      bodyState: {
        ...state.bodyState,
        variables: {
          ...state.bodyState.variables,
          categoriesDeclaredMissing: {
            ...state.bodyState.variables.categoriesDeclaredMissing,
            [variableID]: categories,
          },
        },
      },
    }),
  ),
  on(CrossTabulationUIActions.navigateToCrossTabulationTab, (state) => ({
    ...state,
    bodyToggle: 'cross-tab' as const,
  })),
  on(
    CrossTabulationUIActions.addToSelection,
    (state, { variableID, orientation }) => ({
      ...state,
      bodyState: {
        ...state.bodyState,
        crossTab: {
          ...state.bodyState.crossTab,
          selection: [
            ...state.bodyState.crossTab.selection,
            {
              variableID,
              orientation,
            },
          ],
        },
      },
    }),
  ),
  on(
    CrossTabulationUIActions.changeValueInGivenIndex,
    (state, { variableID, orientation, index }) => {
      const newSelection = structuredClone(state.bodyState.crossTab.selection);
      newSelection[index] = { variableID, orientation };
      return {
        ...state,
        bodyState: {
          ...state.bodyState,
          crossTab: {
            ...state.bodyState.crossTab,
            selection: newSelection,
          },
        },
      };
    },
  ),
  on(
    CrossTabulationUIActions.changeMissingCategories,
    (state, { variableID, missing }) => {
      return {
        ...state,
        bodyState: {
          ...state.bodyState,
          crossTab: {
            ...state.bodyState.crossTab,
            missingCategories: {
              ...state.bodyState.crossTab.missingCategories,
              [variableID]: missing,
            },
          },
        },
      };
    },
  ),
  on(
    DatasetActions.updateCrossTabValues,
    (state, { variableID, orientation = '', index = -1 }) => {
      const newSelection = structuredClone(state.bodyState.crossTab.selection);
      if (index === -1) {
        newSelection[newSelection.length] = {
          ...newSelection[newSelection.length],
          variableID,
          orientation,
        };
      } else {
        newSelection[index] = {
          ...newSelection[index],
          variableID,
          orientation,
        };
      }
      return {
        ...state,
        bodyState: {
          ...state.bodyState,
          crossTab: {
            ...state.bodyState.crossTab,
            selection: newSelection,
          },
        },
      };
    },
  ),
  on(
    CrossTabulationUIActions.removeVariableUsingVariableID,
    (state, { variableID }) => {
      const newSelection = state.bodyState.crossTab.selection;
      const changedSelection: {
        variableID: string;
        orientation: '' | 'rows' | 'cols';
      }[] = [];
      newSelection.forEach((value) => {
        if (value.variableID !== variableID) {
          changedSelection.push(value);
        }
      });
      return {
        ...state,
        bodyState: {
          ...state.bodyState,
          crossTab: {
            ...state.bodyState.crossTab,
            selection: changedSelection,
          },
        },
      };
    },
  ),
  on(CrossTabulationUIActions.removeVariablesUsingIndex, (state, { index }) => {
    const selection = [...state.bodyState.crossTab.selection];
    selection.splice(index, 1);
    return {
      ...state,
      bodyState: {
        ...state.bodyState,
        crossTab: {
          ...state.bodyState.crossTab,
          selection: selection,
        },
      },
    };
  }),
  on(
    CrossTabulationUIActions.addWeightVariableToSelection,
    (state, { variableID, crossTabValues }) => {
      return {
        ...state,
        bodyState: {
          ...state.bodyState,
          crossTab: {
            ...state.bodyState.crossTab,
            weight: {
              weighted: true,
              weightVariableID: variableID,
            },
          },
        },
      };
    },
  ),
);
