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
      const row = table.rows[i];
      const rowData = [];
      for (const cell of row.cells) {
        rowData.push(cell.innerText.replace(/,/g, ''));
      }
      csvContent += rowData.join(',') + '\n';
    }
    const finalCsv = this.modifyCsv(
      csvContent,
      this.rows().length,
      this.cols().length,
    );

    const blob = new Blob([finalCsv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'table.csv');
    a.click();
    window.URL.revokeObjectURL(url);
  }

  modifyCsv(csvText: string, rows: number, cols: number): string {
    // Split the CSV into rows
    const lines = csvText.split('\n');

    // Loop through each row starting from rows + 1
    for (let i = cols + 1; i < lines.length; i++) {
      // Split the row into columns
      const columns = lines[i].split('\t');

      // Insert an empty cell at the y + 1 position (cols + 1)
      columns.splice(rows, 0, ' ');

      // Join the columns back together and update the row
      lines[i] = columns.join('\t');
    }

    // Join the rows back together and return the modified CSV text
    return lines.join('\n');
  }
}
