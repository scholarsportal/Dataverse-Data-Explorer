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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const jQuery: any; // Declare jQuery
// declare const $: any; // Declare jQuery

@Component({
  selector: 'dct-cross-table',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './cross-table.component.html',
  styleUrl: './cross-table.component.css',
})
export class CrossTableComponent {
  @ViewChild('output') outputElement?: ElementRef;
  data = input.required<{ [variableLabel: string]: string }[] | unknown[]>();
  rows = input.required<string[]>();
  cols = input.required<string[]>();
  hasData = input.required<boolean>();
  exportClicked = input.required<() => void>();
  selectedViewOption = input<string>('Count');
  element: ElementRef = inject(ElementRef);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public chartJS: any;

  tableClass = computed(() => {
    if (this.hasData()) {
      return '[&_table]:w-full  ';
    } else {
      return 'blur ';
    }
  });

  constructor() {
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
    while (targetElement.firstChild) {
      targetElement.removeChild(targetElement.firstChild);
    }
    // const renderers = jQuery.extend(
    //   jQuery.pivotUtilities.renderers,
    //   jQuery.pivotUtilities.d3_renderers,
    // );

    targetElement.pivotUI(
      this.data(),
      {
        rows: this.rows(),
        cols: this.cols(),
        aggregatorName: this.selectedViewOption(),
        showUI: false,
        rendererName: 'Horizontal Stacked Bar Chart',
      },
      true,
    );
  }

  downloadDivAsCSV() {
    const div = this.outputElement?.nativeElement;
    const table = div.querySelector('table');
    let csvContent = '';

    // Skip the first two rows by iterating from index 2
    for (let i = 2; i < table.rows.length; i++) {
      let row = table.rows[i];
      let rowData = [];
      if (i === 2) {
        rowData.push(''); // Add an empty cell at the beginning
      }
      for (let cell of row.cells) {
        rowData.push(cell.innerText.replace(/,/g, ''));
      }
      csvContent += rowData.join(',') + '\n';
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'table.csv');
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
