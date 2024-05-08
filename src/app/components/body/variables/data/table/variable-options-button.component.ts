import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { ModalComponent } from './modal/modal.component';

@Component({
  selector: 'dct-variable-options-button',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  template: `
    @if (!variableInCrossTab()) {
      <button class="rounded bg-primary text-primary-content px-2 py-1.5 mx-2 my-auto flex flex-row">
        <span class="hidden xl:flex">Add to Cross Tabulation</span>
        <span class="flex xl:hidden">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
             class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        </span>
      </button>
    } @else {
      <button class="rounded bg-error text-light-on-primary px-2 py-1.5 mx-2 my-auto">
        <span class="hidden lg:flex">Remove Cross Tabulation</span>
      </button>
    }
    <button (click)="launchView()" class="mt-2 mx-2">
      <svg
        class="w-5 h-5"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
    <button (click)="launchEdit()" class="mt-2 mx-2">
      <svg
        class="w-5 h-5"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
  `
})
export class VariableOptionsButtonComponent {
  store = inject(Store);
  variableID = input.required<string>();
  variableInCrossTab = input.required<boolean>();
  emitLaunchModal = output<{ mode: 'view' | 'edit', variableID: string }>();
  emitAddToCrossTab = output<string>();
  emitRemoveFromCrossTab = output<string>();

  launchView() {
    this.emitLaunchModal.emit({ mode: 'view', variableID: this.variableID() });
  }

  launchEdit() {
    this.emitLaunchModal.emit({ mode: 'edit', variableID: this.variableID() });
  }

  addToCrossTab() {
    this.emitAddToCrossTab.emit(this.variableID());
  }

  removeToCrossTab() {
    this.emitRemoveFromCrossTab.emit(this.variableID());
  }
}
