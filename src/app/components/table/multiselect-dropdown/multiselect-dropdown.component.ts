import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { VariableGroup } from 'src/app/state/interface';
import { Store } from '@ngrx/store';
import { selectDatasetVariableGroups } from 'src/app/state/selectors/dataset.selectors';

@Component({
  selector: 'app-multiselect-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './multiselect-dropdown.component.html',
  styleUrl: './multiselect-dropdown.component.css',
})
export class MultiselectDropdownComponent implements OnInit {
  @ViewChild('dropdown') multiselectDropdownElement?: ElementRef;
  @Input() selectedVariableGroups: VariableGroup[] = [];
  @Input() position: 'top' | 'bottom' = 'top';

  isDialogueOpen: boolean = false;
  element: any;
  allVariableGroups$: VariableGroup[] | undefined;

  constructor(private store: Store, private el: ElementRef) {
    this.store
      .select(selectDatasetVariableGroups)
      .subscribe((data) => (this.allVariableGroups$ = data));
    this.element = el.nativeElement;
  }

  @HostListener('document:keydown', ['$event']) onKeydownHandler(
    event: KeyboardEvent
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

  ngOnInit(): void {
    this.element.addEventListener('click', (el: any) => {
      if (el.target.id === 'dropdown') {
        this.closeDialog();
      }
    });
  }

  getVariableLabel(variableGroup: any): string {
    return variableGroup.labl;
  }

  getVariableID(variableGroup: any): string {
    console.log(variableGroup);
    return variableGroup['@_ID'];
  }

  checkSelected(variableGroup: any): boolean {
    return this.selectedVariableGroups.includes(variableGroup);
  }

  changeSelected(variableGroup: any) {
    console.log(variableGroup);
    const indexOfVariableGroup =
      this.selectedVariableGroups.indexOf(variableGroup);
    if (indexOfVariableGroup > -1) {
      this.selectedVariableGroups.splice(indexOfVariableGroup, 1);
    } else {
      this.selectedVariableGroups.splice(
        indexOfVariableGroup,
        0,
        variableGroup
      );
    }
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
