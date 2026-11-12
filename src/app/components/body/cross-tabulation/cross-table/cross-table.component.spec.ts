import {
  ComponentFixture,
  fakeAsync,
  flush,
  TestBed,
} from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { CrossTableComponent } from './cross-table.component';
import { CrossTabDisplayMode } from '../../../../new.state/ui/util';

// Renders through the real PivotTable.js build (loaded by the test target's
// `scripts`), so these assert what the user actually sees in each cell.
describe('CrossTableComponent', () => {
  let fixture: ComponentFixture<CrossTableComponent>;

  const HH = 'HHLDSIZE - Household size';
  const SEX = 'GENDER - Gender of person';

  // Counts:            Female  Male
  //   1 person            1      3
  //   2 people            2      2
  const data = [
    { [HH]: '1 person', [SEX]: 'Female', value: 1 },
    { [HH]: '1 person', [SEX]: 'Male', value: 1 },
    { [HH]: '1 person', [SEX]: 'Male', value: 1 },
    { [HH]: '1 person', [SEX]: 'Male', value: 1 },
    { [HH]: '2 people', [SEX]: 'Female', value: 1 },
    { [HH]: '2 people', [SEX]: 'Female', value: 1 },
    { [HH]: '2 people', [SEX]: 'Male', value: 1 },
    { [HH]: '2 people', [SEX]: 'Male', value: 1 },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrossTableComponent, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(CrossTableComponent);
    fixture.componentRef.setInput('data', data);
    fixture.componentRef.setInput('rows', [HH]);
    fixture.componentRef.setInput('cols', [SEX]);
    fixture.componentRef.setInput('hasData', true);
  });

  function render(mode?: CrossTabDisplayMode): void {
    if (mode) {
      fixture.componentRef.setInput('displayMode', mode);
    }
    fixture.detectChanges();
    // Drain the delayed screen-reader announcement.
    flush();
  }

  function cells(selector: string): string[] {
    const host: HTMLElement = fixture.nativeElement;
    return Array.from(host.querySelectorAll(selector)).map(
      (cell) => cell.textContent ?? '',
    );
  }

  it('should create', fakeAsync(() => {
    render();
    expect(fixture.componentInstance).toBeTruthy();
  }));

  it('shows weighted counts by default', fakeAsync(() => {
    render();
    expect(cells('td.pvtVal')).toEqual(['1.0', '3.0', '2.0', '2.0']);
    expect(cells('td.pvtGrandTotal')).toEqual(['8.0']);
  }));

  it('shows each cell as a share of its row (issue #190)', fakeAsync(() => {
    render('ROW_PERC');
    expect(cells('td.pvtVal')).toEqual(['25.0%', '75.0%', '50.0%', '50.0%']);
    expect(cells('td.rowTotal')).toEqual(['100.0%', '100.0%']);
  }));

  it('shows each cell as a share of its column (issue #190)', fakeAsync(() => {
    render('COL_PERC');
    expect(cells('td.pvtVal')).toEqual(['33.3%', '60.0%', '66.7%', '40.0%']);
    expect(cells('td.colTotal')).toEqual(['100.0%', '100.0%']);
  }));

  it('shows each cell as a share of the grand total (issue #190)', fakeAsync(() => {
    render('TOTAL_PERC');
    expect(cells('td.pvtVal')).toEqual(['12.5%', '37.5%', '25.0%', '25.0%']);
    expect(cells('td.pvtGrandTotal')).toEqual(['100.0%']);
  }));

  it('re-renders when the display mode changes (issue #190)', fakeAsync(() => {
    render();
    expect(cells('td.pvtVal')[0]).toBe('1.0');
    render('ROW_PERC');
    expect(cells('td.pvtVal')[0]).toBe('25.0%');
    render('SHOW_VALUE');
    expect(cells('td.pvtVal')[0]).toBe('1.0');
  }));

  it('falls back to counts for an unknown display mode', fakeAsync(() => {
    render('NOT_A_MODE' as CrossTabDisplayMode);
    expect(cells('td.pvtVal')).toEqual(['1.0', '3.0', '2.0', '2.0']);
  }));
});
