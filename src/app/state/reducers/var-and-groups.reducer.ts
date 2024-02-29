import { createReducer, on } from '@ngrx/store';
import * as VarAndGroupActions from '../actions/var-and-groups.actions';
import * as DatasetActions from '../actions/dataset.actions';
import { JSONStructure } from '../interface';

export interface VarAndGroupsState {
  selectedGroup: string | null;
  variablesSelected: {
    'all-variables': string[];
    [groupName: string]: string[];
  };
  variableMissingValues: {
    [variableID: string]: {
      [missingValue: string]: string;
    };
  };
  importSettings: {
    dataset: JSONStructure | null;
    selectedSettings: {
      variableGroups: boolean;
      labels: boolean;
      questionTexts: boolean;
      literalQuestion: boolean;
      interviewerQuestion: boolean;
      postQuestion: boolean;
      universe: boolean;
      variableNotes: boolean;
      weights: boolean;
    };
  };
}

export const initialState: VarAndGroupsState = {
  selectedGroup: null,
  variablesSelected: {
    'all-variables': [],
  },
  variableMissingValues: {},
  importSettings: {
    dataset: null,
    selectedSettings: {
      variableGroups: false,
      labels: false,
      questionTexts: false,
      literalQuestion: false,
      interviewerQuestion: false,
      postQuestion: false,
      universe: false,
      variableNotes: false,
      weights: false,
    },
  },
};

export const varAndGroupsReducer = createReducer(
  initialState,
  on(
    VarAndGroupActions.changeSelectedGroup,
    (state, { groupID }): VarAndGroupsState => ({
      ...state,
      selectedGroup: groupID,
    }),
  ),
  on(
    VarAndGroupActions.onSelectVariable,
    (state, { variableIDs }): VarAndGroupsState => {
      const newState: VarAndGroupsState = {
        ...state,
        variablesSelected: { ...state.variablesSelected }, // Create a shallow copy
      };

      if (state.selectedGroup) {
        newState.variablesSelected[state.selectedGroup] = variableIDs;
      } else {
        newState.variablesSelected['all-variables'] = variableIDs;
      }

      return newState;
    },
  ),
  on(
    VarAndGroupActions.changeImportSettingsSelected,
    (state, { settingName, change }) => ({
      ...state,
      importSettings: {
        ...state.importSettings,
        selectedSettings: {
          ...state.importSettings.selectedSettings,
          [settingName]: change,
        },
      },
    }),
  ),
  on(DatasetActions.metadataImportConversionSuccess, (state, { dataset }) => ({
    ...state,
    importSettings: {
      ...state.importSettings,
      dataset,
    },
  })),
);
