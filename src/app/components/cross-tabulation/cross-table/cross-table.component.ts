import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

declare var jQuery: any; // Declare jQuery
declare var $: any; // Declare jQuery

@Component({
  selector: 'dct-cross-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cross-table.component.html',
  styleUrl: './cross-table.component.css'
})
export class CrossTableComponent implements AfterViewInit {
  @ViewChild('output') outputElement?: ElementRef;
  @Input() data: any[] | null = [];
  @Input() rows: string[] = [];
  @Input() cols: string[] = [];
  element: ElementRef;

  constructor(private el: ElementRef) {
    this.element = el;
  }

  ngAfterViewInit() {
    if (!this.element?.nativeElement?.children) {
      console.log('Cannot build element');
      return;
    }
    var container = this.element.nativeElement;
    var inst = jQuery(container);
    var targetElement = inst.find('#output');
    if (!targetElement) {
      console.log('No element found');
      return;
    }
    while (targetElement.firstChild) {
      targetElement.removeChild(targetElement.firstChild);
    }
    var derivers = $.pivotUtilities.derivers;

    targetElement.pivotUI(
      [
        {
          Province: 'Quebec',
          Party: 'NDP',
          Age: 22,
          Name: 'Liu, Laurin',
          Gender: 'Female'
        },
        {
          Province: 'Quebec',
          Party: 'Bloc Quebecois',
          Age: 43,
          Name: 'Mourani, Maria',
          Gender: 'Female'
        },
        {
          Province: 'Quebec',
          Party: 'NDP',
          Age: '',
          Name: 'Sellah, Djaouida',
          Gender: 'Female'
        },
        {
          Province: 'Quebec',
          Party: 'NDP',
          Age: 72,
          Name: 'St-Denis, Lise',
          Gender: 'Female'
        },
        {
          Province: 'British Columbia',
          Party: 'Liberal',
          Age: 71,
          Name: 'Fry, Hedy',
          Gender: 'Female'
        },
        {
          Province: 'Quebec',
          Party: 'NDP',
          Age: 70,
          Name: 'Turmel, Nycole',
          Gender: 'Female'
        },
        {
          Province: 'Ontario',
          Party: 'Liberal',
          Age: 68,
          Name: 'Sgro, Judy',
          Gender: 'Female'
        },
        {
          Province: 'Quebec',
          Party: 'NDP',
          Age: 67,
          Name: 'Raynault, Francine',
          Gender: 'Female'
        },
        {
          Province: 'Ontario',
          Party: 'Conservative',
          Age: 66,
          Name: 'Davidson, Patricia',
          Gender: 'Female'
        },
        {
          Province: 'Manitoba',
          Party: 'Conservative',
          Age: 65,
          Name: 'Smith, Joy',
          Gender: 'Female'
        },
        {
          Province: 'British Columbia',
          Party: 'Conservative',
          Age: 64,
          Name: 'Wong, Alice',
          Gender: 'Female'
        },
        {
          Province: 'New Brunswick',
          Party: 'Conservative',
          Age: 63,
          Name: 'O\'Neill Gordon, Tilly',
          Gender: 'Female'
        },
        {
          Province: 'Alberta',
          Party: 'Conservative',
          Age: 63,
          Name: 'Ablonczy, Diane',
          Gender: 'Female'
        },
        {
          Province: 'Alberta',
          Party: 'NDP',
          Age: 63,
          Name: 'Duncan, Linda Francis',
          Gender: 'Female'
        },
        {
          Province: 'Ontario',
          Party: 'Liberal',
          Age: 62,
          Name: 'Bennett, Carolyn',
          Gender: 'Female'
        },
        {
          Province: 'Ontario',
          Party: 'NDP',
          Age: 61,
          Name: 'Nash, Peggy',
          Gender: 'Female'
        },
        {
          Province: 'Ontario',
          Party: 'NDP',
          Age: 61,
          Name: 'Mathyssen, Irene',
          Gender: 'Female'
        },
        {
          Province: 'British Columbia',
          Party: 'NDP',
          Age: 60,
          Name: 'Sims, Jinny Jogindera',
          Gender: 'Female'
        },
        {
          Province: 'Newfoundland and Labrador',
          Party: 'Liberal',
          Age: 60,
          Name: 'Foote, Judy',
          Gender: 'Female'
        },
        {
          Province: 'British Columbia',
          Party: 'NDP',
          Age: 60,
          Name: 'Crowder, Jean',
          Gender: 'Female'
        },
        {
          Province: 'British Columbia',
          Party: 'NDP',
          Age: 59,
          Name: 'Davies, Libby',
          Gender: 'Female'
        },
        {
          Province: 'Saskatchewan',
          Party: 'Conservative',
          Age: 59,
          Name: 'Yelich, Lynne',
          Gender: 'Female'
        },
        {
          Province: 'Quebec',
          Party: 'NDP',
          Age: 58,
          Name: 'Day, Anne-Marie',
          Gender: 'Female'
        },
        {
          Province: 'British Columbia',
          Party: 'Green',
          Age: 58,
          Name: 'May, Elizabeth',
          Gender: 'Female'
        }
      ],
      {
        rows: ['Province'],
        cols: ['Party']
      }
    );
  }
}
