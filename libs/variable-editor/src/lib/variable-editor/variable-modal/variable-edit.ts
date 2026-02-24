import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DdeVariable, DdeVariableGroup } from '@dde/models';

@Component({
  selector: 'dde-variable-edit',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (variable(); as v) {
      <form class="edit-form" (ngSubmit)="onSave()">
        <label class="field">
          <span>Label</span>
          <input type="text" [(ngModel)]="formData.label" name="label" />
        </label>

        <label class="field">
          <span>Literal Question</span>
          <input
            type="text"
            [(ngModel)]="formData.literalQuestion"
            name="literalQuestion"
          />
        </label>

        <label class="field">
          <span>Interview Question</span>
          <input
            type="text"
            [(ngModel)]="formData.interviewQuestion"
            name="interviewQuestion"
          />
        </label>

        <label class="field">
          <span>Post Question</span>
          <input
            type="text"
            [(ngModel)]="formData.postQuestion"
            name="postQuestion"
          />
        </label>

        <label class="field">
          <span>Universe</span>
          <input type="text" [(ngModel)]="formData.universe" name="universe" />
        </label>

        <label class="field">
          <span>Notes</span>
          <textarea
            [(ngModel)]="formData.notes"
            name="notes"
            rows="4"
          ></textarea>
        </label>

        <label class="field checkbox-field">
          <input
            type="checkbox"
            [(ngModel)]="formData.isWeight"
            name="isWeight"
          />
          <span>Is Weight Variable</span>
        </label>

        <button type="submit" class="save-btn">Save</button>
      </form>
    }
  `,
  styles: `
    .edit-form {
      display: flex;
      flex-direction: column;
      gap: var(--md-sys-spacing-md, 16px);
    }
    .field {
      display: flex;
      flex-direction: column;
      gap: var(--md-sys-spacing-xs, 4px);
    }
    .field span {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--md-sys-color-outline, #787680);
    }
    .field input[type="text"],
    .field textarea {
      padding: var(--md-sys-spacing-sm, 8px);
      border: 1px solid var(--md-sys-color-outline-variant, #c8c5d0);
      border-radius: 4px;
    }
    .checkbox-field {
      flex-direction: row;
      align-items: center;
      gap: var(--md-sys-spacing-sm, 8px);
    }
    .save-btn {
      align-self: flex-start;
      padding: var(--md-sys-spacing-sm, 8px) var(--md-sys-spacing-lg, 24px);
      background: var(--md-sys-color-primary, #4338ca);
      color: var(--md-sys-color-on-primary, #ffffff);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }
  `,
})
export class VariableEditComponent {
  variable = input<DdeVariable | null>(null);
  groups = input<DdeVariableGroup[]>([]);

  saved = output<{
    changes: Partial<DdeVariable>;
    groupIds: string[];
  }>();

  formData = {
    label: '',
    literalQuestion: '',
    interviewQuestion: '',
    postQuestion: '',
    universe: '',
    notes: '',
    isWeight: false,
  };

  onSave() {
    this.saved.emit({
      changes: {
        label: this.formData.label,
        question: {
          literal: this.formData.literalQuestion,
          interviewer: this.formData.interviewQuestion,
          post: this.formData.postQuestion,
        },
        universe: this.formData.universe,
        notes: this.formData.notes,
        isWeight: this.formData.isWeight,
      },
      groupIds: [],
    });
  }
}