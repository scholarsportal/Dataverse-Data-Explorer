import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { TranslateModule } from '@ngx-translate/core';

import { ImportComponent } from './import.component';
import {
  globalInitialState,
  ImportGroupClash,
  ImportSummary,
} from '../../new.state/xml/xml.interface';
import { XmlManipulationActions } from '../../new.state/xml/xml.actions';
import { selectImportSummary } from '../../new.state/xml/xml.selectors';
import {
  selectDatasetImportError,
  selectDatasetImportIdle,
  selectDatasetImportPending,
  selectDatasetImportReview,
  selectDatasetImportSuccess,
  selectImportGroupClashes,
} from '../../new.state/dataset/dataset.selectors';

type ImportStatus = 'idle' | 'pending' | 'review' | 'error' | 'success';

describe('ImportComponent', () => {
  let fixture: ComponentFixture<ImportComponent>;
  let store: MockStore;
  let dispatched: jasmine.Spy;

  const clashes: ImportGroupClash[] = [
    {
      label: 'Demographics',
      existing: [
        { id: 'VG1', variableCount: 2, variableNames: ['PROV', 'AGE'] },
        { id: 'VG2', variableCount: 1, variableNames: ['SEX'] },
      ],
      imported: [{ id: '0', variableCount: 1, variableNames: ['PROV'] }],
    },
    {
      label: 'Health',
      existing: [{ id: 'VG3', variableCount: 1, variableNames: ['SMOKE'] }],
      imported: [
        { id: '1', variableCount: 1, variableNames: ['SMOKE'] },
        { id: '2', variableCount: 1, variableNames: ['DRINK'] },
      ],
    },
  ];

  const summary: ImportSummary = {
    variablesInFile: 104,
    variablesMatched: 98,
    groupsImported: 6,
    unmatchedWeights: [
      { variableID: 'v2', variableName: 'AGE', importedWgtVar: 'iGONE' },
    ],
    uncomputedWeights: [{ variableID: 'v3', variableName: 'REGION6' }],
  };

  function create(
    status: ImportStatus,
    options: {
      groupClashes?: ImportGroupClash[];
      importSummary?: ImportSummary | null;
    } = {},
  ): void {
    store.overrideSelector(selectDatasetImportIdle, status === 'idle');
    store.overrideSelector(selectDatasetImportPending, status === 'pending');
    store.overrideSelector(selectDatasetImportReview, status === 'review');
    store.overrideSelector(selectDatasetImportError, status === 'error');
    store.overrideSelector(selectDatasetImportSuccess, status === 'success');
    store.overrideSelector(selectImportGroupClashes, options.groupClashes ?? []);
    store.overrideSelector(selectImportSummary, options.importSummary ?? null);
    dispatched = spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(ImportComponent);
    fixture.detectChanges();
  }

  function element(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function clashFieldsets(): HTMLFieldSetElement[] {
    return Array.from(element().querySelectorAll('[data-testid="group-clash"]'));
  }

  function radio(clashIndex: number, action: string): HTMLInputElement {
    return element().querySelector(
      `#group-${clashIndex}-${action}`,
    ) as HTMLInputElement;
  }

  function choose(clashIndex: number, action: string): void {
    radio(clashIndex, action).dispatchEvent(new Event('change'));
    fixture.detectChanges();
  }

  function clickButtonLabelled(key: string): void {
    const button = Array.from(element().querySelectorAll('button')).find(
      (candidate) => candidate.textContent?.includes(key),
    );
    expect(button).withContext(`button ${key}`).toBeTruthy();
    button?.click();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Without translation files the pipe renders the key, so tests can
      // find elements by key.
      imports: [ImportComponent, TranslateModule.forRoot()],
      providers: [provideMockStore({ initialState: globalInitialState })],
    }).compileComponents();
    store = TestBed.inject(MockStore);
  });

  it('should create', () => {
    create('idle');
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('starts from a clean slate each time the panel opens', () => {
    create('idle');
    expect(dispatched).toHaveBeenCalledOnceWith(
      XmlManipulationActions.resetImport(),
    );
  });

  it('offers no group decisions while nothing is waiting for review', () => {
    create('idle');
    expect(clashFieldsets().length).toBe(0);
  });

  describe('group name clashes (issue #197)', () => {
    beforeEach(() => create('review', { groupClashes: clashes }));

    it('lists every clashing name with the groups on both sides', () => {
      expect(clashFieldsets().length).toBe(2);
      const first = clashFieldsets()[0].textContent ?? '';
      expect(first).toContain('Demographics');
      expect(first).toContain('2: PROV, AGE');
      expect(first).toContain('1: SEX');
    });

    it('selects Replace for every name by default', () => {
      expect(radio(0, 'replace').checked).toBe(true);
      expect(radio(1, 'replace').checked).toBe(true);
      expect(element().querySelector('select')).toBeNull();
    });

    it('locks the section checkboxes while a decision is pending', () => {
      const sections = element().querySelector('fieldset') as HTMLFieldSetElement;
      expect(sections.disabled).toBe(true);
    });

    it('applies Replace for every name when the user changes nothing', () => {
      clickButtonLabelled('IMPORT.APPLY_IMPORT');
      expect(dispatched).toHaveBeenCalledWith(
        XmlManipulationActions.confirmImportGroupChoices({
          groupResolutions: {
            Demographics: { action: 'replace' },
            Health: { action: 'replace' },
          },
        }),
      );
    });

    it('applies Keep both for the name the user chose it for', () => {
      choose(1, 'keepBoth');
      clickButtonLabelled('IMPORT.APPLY_IMPORT');
      expect(dispatched).toHaveBeenCalledWith(
        XmlManipulationActions.confirmImportGroupChoices({
          groupResolutions: {
            Demographics: { action: 'replace' },
            Health: { action: 'keepBoth' },
          },
        }),
      );
    });

    it('asks which existing group to merge into, defaulting to the first', () => {
      choose(0, 'merge');
      const target = element().querySelector(
        '#group-0-target-0',
      ) as HTMLSelectElement;
      expect(target).toBeTruthy();
      expect(Array.from(target.options).map((option) => option.value)).toEqual([
        'VG1',
        'VG2',
      ]);
      clickButtonLabelled('IMPORT.APPLY_IMPORT');
      expect(dispatched).toHaveBeenCalledWith(
        XmlManipulationActions.confirmImportGroupChoices({
          groupResolutions: {
            Demographics: { action: 'merge', targets: { '0': 'VG1' } },
            Health: { action: 'replace' },
          },
        }),
      );
    });

    it('merges into the existing group the user picked', () => {
      choose(0, 'merge');
      const target = element().querySelector(
        '#group-0-target-0',
      ) as HTMLSelectElement;
      target.value = 'VG2';
      target.dispatchEvent(new Event('change'));
      fixture.detectChanges();
      clickButtonLabelled('IMPORT.APPLY_IMPORT');
      expect(dispatched).toHaveBeenCalledWith(
        XmlManipulationActions.confirmImportGroupChoices({
          groupResolutions: {
            Demographics: { action: 'merge', targets: { '0': 'VG2' } },
            Health: { action: 'replace' },
          },
        }),
      );
    });

    it('offers one merge target per imported group of the name', () => {
      choose(1, 'merge');
      expect(element().querySelector('#group-1-target-0')).toBeTruthy();
      expect(element().querySelector('#group-1-target-1')).toBeTruthy();
      clickButtonLabelled('IMPORT.APPLY_IMPORT');
      expect(dispatched).toHaveBeenCalledWith(
        XmlManipulationActions.confirmImportGroupChoices({
          groupResolutions: {
            Demographics: { action: 'replace' },
            Health: { action: 'merge', targets: { '1': 'VG3', '2': 'VG3' } },
          },
        }),
      );
    });

    it('forgets a merge target when the user switches away from Merge', () => {
      choose(0, 'merge');
      choose(0, 'keepBoth');
      expect(element().querySelector('select')).toBeNull();
      clickButtonLabelled('IMPORT.APPLY_IMPORT');
      expect(dispatched).toHaveBeenCalledWith(
        XmlManipulationActions.confirmImportGroupChoices({
          groupResolutions: {
            Demographics: { action: 'keepBoth' },
            Health: { action: 'replace' },
          },
        }),
      );
    });

    it('cancels without applying anything', () => {
      dispatched.calls.reset();
      clickButtonLabelled('IMPORT.CANCEL_IMPORT');
      expect(dispatched).toHaveBeenCalledOnceWith(
        XmlManipulationActions.resetImport(),
      );
    });
  });

  describe('import summary (issue #197)', () => {
    it('reports how much of the file was applied', () => {
      create('success', { importSummary: summary });
      const text = element().querySelector('.import-summary')?.textContent ?? '';
      expect(text).toContain('IMPORT.SUMMARY_VARIABLES');
      expect(text).toContain('IMPORT.SUMMARY_GROUPS');
    });

    it('names the variables whose weight could not be assigned', () => {
      create('success', { importSummary: summary });
      const list = element().querySelector('[data-testid="unmatched-weights"]');
      expect(list?.textContent).toContain('AGE');
    });

    it('names the variables whose weighted frequencies could not be calculated', () => {
      create('success', { importSummary: summary });
      const list = element().querySelector('[data-testid="uncomputed-weights"]');
      expect(list?.textContent).toContain('REGION6');
    });

    it('omits the weight warnings when every weight was applied', () => {
      create('success', {
        importSummary: { ...summary, unmatchedWeights: [], uncomputedWeights: [] },
      });
      expect(element().querySelector('[data-testid="unmatched-weights"]')).toBeNull();
      expect(element().querySelector('[data-testid="uncomputed-weights"]')).toBeNull();
    });

    it('omits the group line when groups were not imported', () => {
      create('success', { importSummary: { ...summary, groupsImported: null } });
      const text = element().querySelector('.import-summary')?.textContent ?? '';
      expect(text).not.toContain('IMPORT.SUMMARY_GROUPS');
    });

    it('does not show a summary before an import has succeeded', () => {
      create('idle', { importSummary: summary });
      expect(element().querySelector('.import-summary')).toBeNull();
    });
  });
});
