import { Component, computed, ElementRef, HostListener, inject, input, output, signal, viewChild } from '@angular/core';
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
  el = inject(ElementRef);

  emptyPlaceholderText = input('No items selected');
  emptySetPlaceholderText = input('No values in set');
  itemList = input.required<{ [id: string]: string }>();
  selectedItems = input<string[]>([]);
  position = input<'top' | 'bottom'>('top');
  changeSelectedItems = output<string[]>();
  computedPosition = computed(() => {
    if (this.position() === 'top') {
      return 'bottom-10';
    } else {
      return 'top-9';
    }
  });
  isDialogueOpen = signal(false);
  selectedItemsMatched = computed(() => {
    const selected: { [id: string]: string } = {};
    this.selectedItems().map((item) => {
      selected[item] = this.itemList()[item];
    });
    return selected;
  });

  @HostListener('document:keydown', ['$event']) onKeydownHandler(
    event: KeyboardEvent
  ) {
    if (event.key === 'Escape') {
      this.closeDialog();
    }
  }

  @HostListener('document:click', ['$event']) onDocumentClick(event: Event) {
    if (
      this.isDialogueOpen() &&
      event.target &&
      !this.dialogContainsTarget(event.target)
    ) {
      this.closeDialog();
    }
  }

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
    modal?.close();
  }

  private dialogContainsTarget(target: EventTarget | null): boolean {
    return this.el?.nativeElement.contains(target as Node);
  }
}
