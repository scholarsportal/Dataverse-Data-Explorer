import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
declare var $: any; // Declare jQuery

@Component({
  selector: 'dct-cross-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cross-table.component.html',
  styleUrl: './cross-table.component.css',
})
export class CrossTableComponent implements AfterViewInit {
  @ViewChild('output') outputElement?: ElementRef;
  @Input() data: any[] = [];
  @Input() rows: string[] = [];
  @Input() cols: string[] = [];

  ngAfterViewInit() {
    var sum = $(this.outputElement?.nativeElement).pivotUtilities
      .aggregatorTemplates.sum;
    var numberFormat = $(this.outputElement?.nativeElement).pivotUtilities
      .numberFormat;
    var floatFormat = numberFormat({ digitsAfterDecimal: 0 });
    var sumAggregator = sum(floatFormat)(['value']);

    $(this.outputElement?.nativeElement).pivotUI(this.data, {
      rows: this.rows,
      cols: this.cols,
      vals: ['value'],
      aggregator: sumAggregator,
      showUI: false,
    });
  }
}
