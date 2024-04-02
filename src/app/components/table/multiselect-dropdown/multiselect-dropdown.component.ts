import { Component, computed, ElementRef, input, output, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'dct-multiselect-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './multiselect-dropdown.component.html',
  styleUrl: './multiselect-dropdown.component.css'
})
export class MultiselectDropdownComponent {
  // @ViewChild('dropdown') multiselectDropdownElement?: ElementRef;
  multiselectDropdownElement = viewChild<ElementRef>('dropdown');

  emptyPlaceholderText = input('No items selected');
  itemList = input.required<{ [id: string]: string }>({});
  selectedItems = input.required<string[]>();
  changeSelectedItems = output<string[]>();

  isDialogueOpen = signal(false);

  // constructor() {
  //   effect(() => {
  //     console.log(this.selectedItems());
  //   });
  // }
  //
  selectedItemsMatched = computed(() => {
    const selected: { [id: string]: string } = {};
    this.selectedItems().map((item) => {
      selected[item] = this.itemList()[item];
    });
    return selected;
  });

  checkSelected(variableGroup: string): boolean {
    return this.selectedItems().includes(variableGroup);
  }

  changeSelected(itemKey: string) {
    if (this.checkSelected(itemKey)) {
      const newSelectedItems = this.removeItemFromArray(itemKey, this.selectedItems());
      this.changeSelectedItems.emit(newSelectedItems);
    } else {
      const newSelectedItems = [...this.selectedItems(), itemKey];
      this.changeSelectedItems.emit(newSelectedItems);
    }
  }

  removeItemFromArray(itemKey: string, itemArray: string[]) {
    return itemArray.filter(item => item !== itemKey);
  }

  toggleDialog() {
    this.isDialogueOpen() ? this.closeDialog() : this.openDialog();
  }

  openDialog() {
    this.isDialogueOpen.set(true);
    const modal = this.multiselectDropdownElement
    ()?.nativeElement as HTMLDialogElement;
    modal?.show();
  }

  closeDialog() {
    this.isDialogueOpen.set(false);
    const modal = this.multiselectDropdownElement
    ()?.nativeElement as HTMLDialogElement;
    console.log('Should be closed');
    modal?.close();
  }
}
