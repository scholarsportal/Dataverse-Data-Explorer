import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
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

  ngAfterViewInit() {
    var sum = $.pivotUtilities.aggregatorTemplates.sum;
    var numberFormat = $.pivotUtilities.numberFormat;
    var intFormat = numberFormat({ digitsAfterDecimal: 0 });
    console.log();
    $(this.outputElement?.nativeElement).pivot(
      [
        {
          "Don't know": {
            'TBC_20R - When stopped smoking cigarettes': 0,
            'TBC_10AR - When stopped smoking cigarettes': 0,
          },
          Daily: {
            'TBC_20R - When stopped smoking cigarettes': 0,
            'TBC_10AR - When stopped smoking cigarettes': 820,
          },
          'Less than daily, but at least once in the past month': {
            'TBC_20R - When stopped smoking cigarettes': 0,
            'TBC_10AR - When stopped smoking cigarettes': 378,
          },
          'Not stated': {
            'TBC_20R - When stopped smoking cigarettes': 0,
            'TBC_10AR - When stopped smoking cigarettes': 0,
          },
          'Not at all': {
            'TBC_20R - When stopped smoking cigarettes': 0,
            'TBC_10AR - When stopped smoking cigarettes': 3665,
          },
          Refusal: {
            'TBC_20R - When stopped smoking cigarettes': 0,
            'TBC_10AR - When stopped smoking cigarettes': 0,
          },
          'Valid skip': {
            'TBC_20R - When stopped smoking cigarettes': 0,
            'TBC_10AR - When stopped smoking cigarettes': 7270,
          },
          '1 to 2 years ago': {
            'TBC_20R - When stopped smoking cigarettes': 148,
            'TBC_10AR - When stopped smoking cigarettes': 0,
          },
          'More than 2 years ago': {
            'TBC_20R - When stopped smoking cigarettes': 2007,
            'TBC_10AR - When stopped smoking cigarettes': 0,
          },
          'Less than 1 year ago': {
            'TBC_20R - When stopped smoking cigarettes': 113,
            'TBC_10AR - When stopped smoking cigarettes': 0,
          },
        },
      ],
      {
        rows: ['TBC_10AR - When stopped smoking cigarettes'],
        cols: ['TBC_20R - When stopped smoking cigarettes'],
        aggregator: sum(intFormat)(['value']),
      }
    );
  }
}
