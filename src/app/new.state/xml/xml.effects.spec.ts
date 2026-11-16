import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Action } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { firstValueFrom, Observable, of } from 'rxjs';

import { XmlEffects } from './xml.effects';
import { XmlManipulationActions } from './xml.actions';
import { initialState as xmlInitialState } from './xml.reducer';
import { DdiService } from '../../services/ddi.service';
import { ImportVariableFormTemplate } from './xml.interface';

describe('XmlEffects import (issue #197)', () => {
  let actions$: Observable<Action>;
  let effects: XmlEffects;
  let store: MockStore;
  let ddi: DdiService;

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

  // Two groups in the dataset share the name "Demographics".
  const datasetXml =
    '<codeBook><dataDscr>' +
    '<varGrp ID="VG1" var="v1"><labl>Demographics</labl></varGrp>' +
    '<varGrp ID="VG2" var="v2"><labl>Demographics</labl></varGrp>' +
    '<var ID="v1" name="PROV"></var><var ID="v2" name="AGE"></var>' +
    '</dataDscr></codeBook>';

  const clashingImport =
    '<codeBook><dataDscr>' +
    '<varGrp ID="VG9" var="i1"><labl>Demographics</labl></varGrp>' +
    '<var ID="i1" name="PROV"></var>' +
    '</dataDscr></codeBook>';

  const cleanImport =
    '<codeBook><dataDscr>' +
    '<varGrp ID="VG9" var="i1"><labl>Regions</labl></varGrp>' +
    '<var ID="i1" name="PROV"></var>' +
    '</dataDscr></codeBook>';

  const crossTabulation = { v1: ['1', '2'], v2: ['30', '40'] };

  function stateWith(pendingImport: unknown = null) {
    return {
      xml: { ...xmlInitialState, dataset: ddi.XMLtoJSON(datasetXml) },
      dataset: { crossTabulation, pendingImport },
    };
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        XmlEffects,
        provideMockActions(() => actions$),
        provideMockStore({ initialState: { xml: xmlInitialState, dataset: {} } }),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    store = TestBed.inject(MockStore);
    ddi = TestBed.inject(DdiService);
    store.setState(stateWith());
    effects = TestBed.inject(XmlEffects);
  });

  function startImport(
    importedXmlString: string,
    variableTemplate: ImportVariableFormTemplate = template,
  ): Promise<Action> {
    actions$ = of(
      XmlManipulationActions.startImportMetadata({
        importedXmlString,
        variableTemplate,
      }),
    );
    return firstValueFrom(effects.convertImportedDatasetToXML$);
  }

  it('applies the import straight away when no group name clashes', async () => {
    const action = await startImport(cleanImport);
    expect(action).toEqual(
      XmlManipulationActions.importConversionSuccess({
        importDdiData: ddi.XMLtoJSON(cleanImport),
        variableTemplate: template,
        crossTabValues: crossTabulation,
      }),
    );
  });

  it('asks for a decision instead of applying when a group name clashes', async () => {
    const action = await startImport(clashingImport);
    expect(action).toEqual(
      XmlManipulationActions.importGroupReviewRequired({
        importDdiData: ddi.XMLtoJSON(clashingImport),
        variableTemplate: template,
        groupClashes: [
          {
            label: 'Demographics',
            existing: [
              { id: 'VG1', variableCount: 1, variableNames: ['PROV'] },
              { id: 'VG2', variableCount: 1, variableNames: ['AGE'] },
            ],
            imported: [{ id: '0', variableCount: 1, variableNames: ['PROV'] }],
          },
        ],
      }),
    );
  });

  it('does not ask about groups when groups are not being imported', async () => {
    const withoutGroups = { ...template, groups: false };
    const action = await startImport(clashingImport, withoutGroups);
    expect(action.type).toBe(
      XmlManipulationActions.importConversionSuccess.type,
    );
  });

  it('rejects a file that is not a DDI codebook with variables', async () => {
    const action = await startImport('<html><body>not a codebook</body></html>');
    expect(action.type).toBe(XmlManipulationActions.importConversionError.type);
  });

  it('rejects text that is not XML at all', async () => {
    const action = await startImport('just some text');
    expect(action.type).toBe(XmlManipulationActions.importConversionError.type);
  });

  it("applies the pending import with the user's group choices", async () => {
    const importDdiData = ddi.XMLtoJSON(clashingImport);
    store.setState(
      stateWith({ importDdiData, variableTemplate: template, groupClashes: [] }),
    );
    const groupResolutions = { Demographics: { action: 'keepBoth' as const } };
    actions$ = of(
      XmlManipulationActions.confirmImportGroupChoices({ groupResolutions }),
    );
    const action = await firstValueFrom(effects.applyReviewedImport$);
    expect(action).toEqual(
      XmlManipulationActions.importConversionSuccess({
        importDdiData,
        variableTemplate: template,
        groupResolutions,
        crossTabValues: crossTabulation,
      }),
    );
  });

  it('reports an error when choices arrive with no import pending', async () => {
    actions$ = of(
      XmlManipulationActions.confirmImportGroupChoices({ groupResolutions: {} }),
    );
    const action = await firstValueFrom(effects.applyReviewedImport$);
    expect(action.type).toBe(XmlManipulationActions.importConversionError.type);
  });
});
