import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Variable, VariableGroup, VariablesSimplified } from 'src/app/new.state/xml/xml.interface';
import { KeyValuePipe } from '@angular/common';
import { MobileViewComponent } from './mobile-view/mobile-view.component';
import { TableNavComponent } from './table-nav/table-nav.component';
import { TableMenuComponent } from './table-menu/table-menu.component';
import { TableComponent } from './table/table.component';

@Component({
  selector: 'dct-data',
  standalone: true,
  imports: [
    KeyValuePipe,
    MobileViewComponent,
    TableComponent,
    TableNavComponent,
    TableMenuComponent
  ],
  templateUrl: './data.component.html',
  styleUrl: './data.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataComponent {
  groups = input.required<{ [variableID: string]: VariableGroup }>();
  variables = input.required<{ [variableID: string]: Variable }>();
  openVariable = input.required<string>();
  selectedVariables = input.required<string[]>();
  categoriesInvalid = input.required<string[]>();
  variablesInCrossTabSelection = input.required<
    {
      variableID: string;
      orientation: '' | 'rows' | 'cols';
    }[]
  >();
  crossTabValuesFetched = input.required<{ [variableID: string]: string[] }>();
  weights = input.required<{ [weightID: string]: string }>();
  variablesSimplified = computed(() => {
    const simplified: VariablesSimplified[] = [];
    Object.values(this.variables()).forEach((value) => {
      if (value?.['@_ID']) {
        const newObj = {
          variableID: value['@_ID'],
          name: value['@_name'],
          label: value.labl['#text'] || '',
          weight: value['@_wgt-var'] || '',
          isWeight: !!value['@_wgt'],
          selected: this.selectedVariables().includes(value['@_ID'])
        };
        simplified.push(newObj);
      }
    });
    return simplified;
  });

  // This used to notify the search box that the user has changed the displayed
  // variables listed so the search box resets
  groupChanged = input.required<string>();
}
