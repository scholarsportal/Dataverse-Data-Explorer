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
declare const jQuery: any;

@Component({
  selector: 'dct-cross-table',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="[&_table]:w-full">
      <div #output id="output"></div>
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
  element: ElementRef = inject(ElementRef);

  constructor(private liveAnnouncer: LiveAnnouncer) {
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

    this.liveAnnouncer.announce('Your table is ready below.');
  }
}
