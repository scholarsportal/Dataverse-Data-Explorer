import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import {
  DdeVariable,
  DdeVariableGroup,
  CrossTabObservationData,
  DdeTranslations,
  DdeLocale,
  DdeTheme,
  OperationStatus,
} from '@dde/models';
import { SidebarComponent } from './sidebar/sidebar';
import { VariableTableComponent } from './variable-table/variable-table';
import { VariableModalComponent } from './variable-modal/variable-modal';

@Component({
  selector: 'dde-variable-editor',
  standalone: true,
  imports: [SidebarComponent, VariableTableComponent, VariableModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dde-sidebar
      [groups]="variableGroups()"
      [hasEditPermission]="hasEditPermission()"
      class="sidebar"
    />
    <dde-variable-table
      [variables]="variables()"
      [hasEditPermission]="hasEditPermission()"
      class="table-area"
    />
    <dde-variable-modal />
  `,
  styles: `
    :host {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      grid-template-rows: repeat(12, 1fr);
      grid-column-gap: 0px;
      grid-row-gap: 0px;
      height: 100%;
      overflow: hidden;
    }
    .sidebar {
      grid-area: 1 / 1 / 13 / 3;
      overflow-y: auto;
      border-right: 1px solid var(--md-sys-color-outline-variant, #c8c5d0);
    }
    .table-area {
      grid-area: 1 / 3 / 13 / 8;
      overflow: auto;
    }
  `,
})
export class VariableEditorComponent {
  // Inputs
  variables = input<DdeVariable[]>([]);
  variableGroups = input<DdeVariableGroup[]>([]);
  observationData = input<CrossTabObservationData>({});
  weights = input<{ [id: string]: string }>({});
  hasEditPermission = input(false);
  operationStatus = input<OperationStatus>({
    save: 'idle',
    import: 'idle',
  });
  locale = input<DdeLocale>('en-CA');
  theme = input<DdeTheme>('light');
  translations = input<DdeTranslations>({});

  // Outputs
  variableSaved = output<{
    variableId: string;
    changes: Partial<DdeVariable>;
    groupIds: string[];
  }>();
  bulkVariablesSaved = output<{
    variableIds: string[];
    changes: Partial<DdeVariable>;
  }>();
  groupCreated = output<{ groupId: string; label: string }>();
  groupRenamed = output<{ groupId: string; newLabel: string }>();
  groupDeleted = output<{ groupId: string }>();
  variablesRemovedFromGroup = output<{
    groupId: string;
    variableIds: string[];
  }>();
  xmlImportRequested = output<{ xmlString: string; template: string }>();
  weightProcessRequested = output<{
    variableIds: string[];
    weightId: string;
  }>();
  bulkWeightAndGroupChanged = output<{
    variableIds: string[];
    groupIds: string[];
    weightId: string;
  }>();
}
