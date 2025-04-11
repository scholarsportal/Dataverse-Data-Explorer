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

declare const jQuery: any;

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
  aggregatorName = input.required<string>();
  element: ElementRef = inject(ElementRef);

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

    // Create pivot table
    targetElement.pivot(this.data(), {
      rows: this.rows(),
      cols: this.cols(),
      aggregator: jQuery.pivotUtilities.aggregatorTemplates.sum(intFormat)([
        'value',
      ]),
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
