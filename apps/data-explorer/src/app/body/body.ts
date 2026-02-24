import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { VariableEditorComponent } from '@dde/variable-editor';

@Component({
  selector: 'dde-body',
  imports: [VariableEditorComponent],
  template: `
    @if (currentBody() === 'variables') {
      <dde-variable-editor
        [variables]="[]"
        [variableGroups]="[]"
        [hasEditPermission]="true"
      />
    } @else {
      <!-- <dde-crosstab-editor /> -->
    }
  `,
  styleUrl: './body.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Body {
  currentBody = input.required<'variables' | 'crosstab'>();
  switchBody = output<void>();

  onToggleBody() {
    this.switchBody.emit();
  }
}
