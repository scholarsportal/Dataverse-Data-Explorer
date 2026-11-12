import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CrossTabDisplayMode } from '../../../../new.state/ui/util';

declare const jQuery: any;

// Which total a percentage mode divides each cell by; null shows the sum.
const FRACTION_OF: Record<CrossTabDisplayMode, 'row' | 'col' | 'total' | null> =
  {
    SHOW_VALUE: null,
    ROW_PERC: 'row',
    COL_PERC: 'col',
    TOTAL_PERC: 'total',
  };

@Component({
  selector: 'dct-cross-table',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="[&_table]:w-full">
      <div #output id="output" class="pb-8"></div>
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
  displayMode = input<CrossTabDisplayMode>('SHOW_VALUE');
  element: ElementRef = inject(ElementRef);

  constructor(
    private liveAnnouncer: LiveAnnouncer,
    private translate: TranslateService,
  ) {
    effect(() => {
      // Read here so a change of display mode always re-renders the table
      const displayMode = this.displayMode();
      if (this.data() && (this.rows() || this.cols())) {
        this.createTable(displayMode);
      }
    });
  }

  createTable(displayMode: CrossTabDisplayMode = this.displayMode()) {
    if (!this.element?.nativeElement?.children) {
      console.log('Cannot build element');
      return;
    }
    const container = this.element.nativeElement;
    const inst = jQuery(container);
    const targetElement = inst.find('#output');
    if (!targetElement) {
      console.log('No element found');
      return;
    }

    // Clear existing content
    targetElement.empty();

    // Configure number formatting
    const numberFormat = jQuery.pivotUtilities.numberFormat;
    const intFormat = numberFormat({ digitsAfterDecimal: 1 });
    const percentFormat = numberFormat({
      digitsAfterDecimal: 1,
      scaler: 100,
      suffix: '%',
    });

    // Every observation carries its weight (1 when unweighted) in `value`,
    // so cells are sums of `value`; percentages divide that sum by the row,
    // column or grand total. An unrecognised mode falls back to the sum.
    const templates = jQuery.pivotUtilities.aggregatorTemplates;
    const weightedCount = templates.sum(intFormat);
    const fractionOf = FRACTION_OF[displayMode] ?? null;
    const aggregator = fractionOf
      ? templates.fractionOf(weightedCount, fractionOf, percentFormat)([
          'value',
        ])
      : weightedCount(['value']);

    // Create pivot table
    targetElement.pivot(this.data(), {
      rows: this.rows(),
      cols: this.cols(),
      aggregator,
      rendererName: 'Table',
      showUI: false,
    });
    let txt: string = '';
    this.translate
      .get('CROSS_TABULATION.TABLE_MESSAGE')
      .subscribe((res: string) => {
        txt = res;
      });
    setTimeout(() => {
      this.liveAnnouncer.announce(txt);
    }, 2000);
  }
}
