import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { VariableGroup } from 'src/app/state/interface';
import { Store } from '@ngrx/store';
import { selectDatasetVariableGroups } from 'src/app/state/selectors/dataset.selectors';
import { Subscription } from 'rxjs';

@Component({
  selector: 'dct-multiselect-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './multiselect-dropdown.component.html',
  styleUrl: './multiselect-dropdown.component.css',
})
export class MultiselectDropdownComponent implements OnInit, OnDestroy {
  @ViewChild('dropdown') multiselectDropdownElement?: ElementRef;
  $allValuesInDropdown = input.required<{ [id: string | number]: string }>();
  $valuesSelectedFromInput = input.required<string[]>();

  $currentSelection = signal(this.$valuesSelectedFromInput());
  changeSelectedValues = output<string[]>();

  isDialogueOpen: boolean = false;
  element: any;
  allVariableGroups$: VariableGroup[] | undefined;
  sub!: Subscription;

  constructor(
    private store: Store,
    private el: ElementRef,
  ) {
    this.element = el.nativeElement;
  }

  ngOnInit(): void {
    this.element.addEventListener('click', (el: any) => {
      if (el.target.id === 'dropdown') {
        this.closeDialog();
      }
    });
    this.sub = this.store
      .select(selectDatasetVariableGroups)
      .subscribe((data) => (this.allVariableGroups$ = data));
  }
  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  @HostListener('document:keydown', ['$event']) onKeydownHandler(
    event: KeyboardEvent,
  ) {
    if (event.key === 'Escape') {
      this.closeDialog();
    }
  }
  @HostListener('document:click', ['$event']) onDocumentClick(event: Event) {
    if (
      this.isDialogueOpen &&
      event.target &&
      !this.dialogContainsTarget(event.target)
    ) {
      this.closeDialog();
    }
  }

  private dialogContainsTarget(target: EventTarget | null): boolean {
    return this.el?.nativeElement.contains(target as Node);
  }

  getVariableLabel(variableGroup: any): string {
    return variableGroup.labl;
  }

  getVariableID(variableGroup: any): string {
    return variableGroup['@_ID'];
  }

  checkSelected(variableGroup: string): boolean {
    return this.$currentSelection().includes(variableGroup);
  }

  changeSelected(variableGroup: any) {
    const indexOfVariableGroup =
      this.$currentSelection().indexOf(variableGroup);
    if (indexOfVariableGroup > -1) {
      this.$currentSelection.set(
        this.$currentSelection().splice(indexOfVariableGroup, 1),
      );
    } else {
      this.$currentSelection.set(
        this.$currentSelection().splice(indexOfVariableGroup, 0, variableGroup),
      );
    }
    this.changeSelectedValues.emit(this.$currentSelection());
  }

  toggleDialog() {
    this.isDialogueOpen ? this.closeDialog() : this.openDialog();
  }

  openDialog() {
    const modal = this.multiselectDropdownElement
      ?.nativeElement as HTMLDialogElement;
    modal?.show();
    this.isDialogueOpen = true;
  }

  closeDialog() {
    const modal = this.multiselectDropdownElement
      ?.nativeElement as HTMLDialogElement;
    modal?.close();
    this.isDialogueOpen = false;
  }
}
