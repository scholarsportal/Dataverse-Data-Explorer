import { initialState, xmlReducer } from './xml.reducer';
import { XmlManipulationActions } from './xml.actions';
import {
  ddiJSONStructure,
  ImportVariableFormTemplate,
  Variable,
  VariableGroup,
  XmlState,
} from './xml.interface';
import { makeVariable } from './variable.mock';

describe('xmlReducer import (issue #197)', () => {
  const template: ImportVariableFormTemplate = {
    groups: true,
    label: true,
    literalQuestion: true,
    interviewQuestion: true,
    postQuestion: true,
    universe: true,
    notes: true,
    weight: true,
  };

  function ddi(variables: Variable[], groups?: VariableGroup[]): ddiJSONStructure {
    return {
      codeBook: {
        dataDscr: { var: variables, ...(groups ? { varGrp: groups } : {}) },
      },
    } as ddiJSONStructure;
  }

  function loadedState(): XmlState {
    return {
      ...initialState,
      info: { secureUploadUrl: 'https://example.test/upload', fileID: 7 },
      dataset: ddi(
        [makeVariable('v1', 'PROV', []), makeVariable('v2', 'AGE', [])],
        [
          { '@_ID': 'VG1', labl: 'Demographics', '@_var': 'v1' },
          { '@_ID': 'VG2', labl: 'Demographics', '@_var': 'v2' },
        ],
      ),
    };
  }

  const importDdiData = ddi(
    [
      makeVariable('i1', 'PROV', [], {
        labl: { '#text': 'Province (imported)', '@_level': 'variable' },
        '@_wgt-var': 'iGONE',
      }),
    ],
    [{ '@_ID': 'VG9', labl: 'Demographics', '@_var': 'i1' }],
  );

  it('applies the import and records a summary for the import panel', () => {
    const state = xmlReducer(
      loadedState(),
      XmlManipulationActions.importConversionSuccess({
        importDdiData,
        variableTemplate: template,
      }),
    );
    expect(state.dataset?.codeBook.dataDscr.var[0].labl['#text']).toBe(
      'Province (imported)',
    );
    expect(state.info?.importedSuccess).toBe(true);
    expect(state.info?.importSummary).toEqual({
      variablesInFile: 1,
      variablesMatched: 1,
      groupsImported: 1,
      unmatchedWeights: [
        { variableID: 'v1', variableName: 'PROV', importedWgtVar: 'iGONE' },
      ],
      uncomputedWeights: [],
    });
    expect(state.info?.unmatchedImportedWeights).toEqual(
      state.info?.importSummary?.unmatchedWeights,
    );
  });

  it('keeps the rest of the dataset info', () => {
    const state = xmlReducer(
      loadedState(),
      XmlManipulationActions.importConversionSuccess({
        importDdiData,
        variableTemplate: template,
      }),
    );
    expect(state.info?.secureUploadUrl).toBe('https://example.test/upload');
    expect(state.info?.fileID).toBe(7);
  });

  it('replaces the groups by default', () => {
    const state = xmlReducer(
      loadedState(),
      XmlManipulationActions.importConversionSuccess({
        importDdiData,
        variableTemplate: template,
      }),
    );
    expect(state.dataset?.codeBook.dataDscr.varGrp).toEqual([
      { '@_ID': 'VG3', labl: 'Demographics', '@_var': 'v1' },
    ]);
  });

  it("applies the user's choice for a clashing group name", () => {
    const state = xmlReducer(
      loadedState(),
      XmlManipulationActions.importConversionSuccess({
        importDdiData,
        variableTemplate: template,
        groupResolutions: {
          Demographics: { action: 'merge', targets: { '0': 'VG2' } },
        },
      }),
    );
    expect(state.dataset?.codeBook.dataDscr.varGrp).toEqual([
      { '@_ID': 'VG1', labl: 'Demographics', '@_var': 'v1' },
      { '@_ID': 'VG2', labl: 'Demographics', '@_var': 'v2 v1' },
    ]);
  });

  it('returns the same state when the file has nothing to import', () => {
    const before = loadedState();
    const state = xmlReducer(
      before,
      XmlManipulationActions.importConversionSuccess({
        importDdiData: {} as ddiJSONStructure,
        variableTemplate: template,
      }),
    );
    expect(state).toBe(before);
  });

  it('returns the same state when no dataset is loaded', () => {
    const state = xmlReducer(
      initialState,
      XmlManipulationActions.importConversionSuccess({
        importDdiData,
        variableTemplate: template,
      }),
    );
    expect(state).toBe(initialState);
  });
});
