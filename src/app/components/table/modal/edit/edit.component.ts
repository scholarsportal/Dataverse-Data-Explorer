import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultiselectDropdownComponent } from '../../multiselect-dropdown/multiselect-dropdown.component';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { VariableForm, VariableGroup } from 'src/app/state/interface';
import { Store } from '@ngrx/store';
import { saveVariable } from 'src/app/state/actions/dataset.actions';

@Component({
  selector: 'dct-edit',
  standalone: true,
  imports: [
    CommonModule,
    MultiselectDropdownComponent,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.css',
})
export class EditComponent implements OnInit, OnChanges {
  sub$?: Subscription;
  @Input() variableData!: any;
  @Input() weights!: { [id: string]: string } | null;
  @Input() groups!: VariableGroup[] | null;

  variableForm = new FormGroup({
    id: new FormControl(''),
    label: new FormControl(''),
    literalQuestion: new FormControl(''),
    interviewQuestion: new FormControl(''),
    postQuestion: new FormControl(''),
    universe: new FormControl(''),
    notes: new FormControl(''),
    isWeight: new FormControl(false),
    weight: new FormControl(''),
  });

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.variableForm.patchValue(this.variableData);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes) {
      this.variableForm.patchValue(this.variableData);
    }
  }

  getID(variable: any) {
    console.log(variable);
  }

  onGroupChange(groups: VariableGroup[]) {
    // console.log(groups);
    this.groups = groups;
  }

  handleSave() {
    if (this.variableForm.value?.id && this.groups) {
      const newGroups: string[] = [];
      const variable: VariableForm = {
        id: this.variableForm.value.id,
        label: this.variableForm.value.label ?? '',
        literalQuestion: this.variableForm.value.literalQuestion ?? '',
        interviewQuestion: this.variableForm.value.interviewQuestion ?? '',
        postQuestion: this.variableForm.value.postQuestion ?? '',
        notes: this.variableForm.value.notes ?? '',
        universe: this.variableForm.value.universe ?? '',
        isWeight: this.variableForm.value.isWeight ?? false,
        weight: this.variableForm.value.weight ?? null,
      };
      this.groups.map((value) => {
        newGroups.push(value['@_ID']);
      });
      this.store.dispatch(
        saveVariable({
          variableID: this.variableForm.value.id,
          variable,
          groups: newGroups,
        })
      );
    }
  }
}
