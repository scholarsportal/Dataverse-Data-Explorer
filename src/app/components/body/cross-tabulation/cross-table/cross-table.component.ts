import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const jQuery: any; // Declare jQuery
// declare const $: any; // Declare jQuery

@Component({
  selector: 'dct-cross-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cross-table.component.html',
  styleUrl: './cross-table.component.css',
})
export class CrossTableComponent {
  @ViewChild('output') outputElement?: ElementRef;
  data = input.required<{ [variableLabel: string]: string }[] | unknown[]>();
  rows = input.required<string[]>();
  cols = input.required<string[]>();
  hasData = input.required<boolean>();
  element: ElementRef = inject(ElementRef);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public chartJS: any;

  tableClass = computed(() => {
    if (this.hasData()) {
      return '';
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
        aggregatorName: 'Count',
        showUI: false,
        rendererName: 'Horizontal Stacked Bar Chart',
      },
      true,
    );
  }
}
