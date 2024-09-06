import { Component, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { ModalComponent } from './modal/modal.component';
import { CrossTabulationUIActions } from 'src/app/new.state/ui/ui.actions';

@Component({
  selector: 'dct-variable-options-button',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  template: `
    <div class="tooltip tooltip-left tooltip-primary" data-tip="View variable">
      <button (click)="launchView()" class="p-2 btn-action opacity-0 group-hover:opacity-100 group-focus:opacity-100 group-focus-within:opacity-100">
        <svg
          class="w-6 h-6 md:w-5 md:h-5"
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
    </div>
    @if (hasApiKey()) {
      <div
        class="hidden md:block tooltip tooltip-left tooltip-primary mr-1"
        data-tip="Edit variable"
      >
        <button (click)="launchEdit()" class="p-2 btn-action opacity-0 group-hover:opacity-100 group-focus:opacity-100 group-focus-within:opacity-100">
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
      </div>
    }

    @if (!variablesComputed().includes(variableID())) {
      @if (isFetching()) {
        <div
          class="tooltip tooltip-primary tooltip-left mx-2"
          data-tip="Loading data. Please wait."
        >
          <span class="loading loading-spinner loading-sm mt-2"></span>
        </div>
      } @else {
        <div
          class="tooltip tooltip-left tooltip-primary"
          data-tip="Add to cross tabulation"
        >
          <button (click)="addToCrossTab()" class="p-2 btn-action opacity-0 group-hover:opacity-100 group-focus:opacity-100 group-focus-within:opacity-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-6 md:size-5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0 1 12 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 0c0-.621.504-1.125 1.125-1.125m0 0h7.5"
              />
            </svg>
          </button>
        </div>
      }
    } @else {
      <div
        class="tooltip tooltip-primary tooltip-left"
        data-tip="Remove From Cross Tabulation"
      >
        <button (click)="removeFromCrossTab()" class="visible p-2 btn-action">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="size-6 md:size-5"
          >
            <path
              fill-rule="evenodd"
              d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    }
  `,
})
export class VariableOptionsButtonComponent {
  store = inject(Store);
  hasApiKey = input.required<boolean>();
  variableID = input.required<string>();
  crossTabValuesFetched = input.required<{ [variableID: string]: string[] }>();
  isFetching = input.required<boolean>();
  variablesInCrossTab =
    input.required<
      { variableID: string; orientation: 'rows' | 'cols' | '' }[]
    >();
  emitLaunchModal = output<{ mode: 'view' | 'edit'; variableID: string }>();
  variablesComputed = computed(() => {
    const variables: string[] = [];
    this.variablesInCrossTab().map((value) => {
      variables.push(value.variableID);
    });
    return variables;
  });

  launchView() {
    this.emitLaunchModal.emit({ mode: 'view', variableID: this.variableID() });
  }

  launchEdit() {
    this.emitLaunchModal.emit({ mode: 'edit', variableID: this.variableID() });
  }

  addToCrossTab() {
    if (this.crossTabValuesFetched()[this.variableID()]) {
      this.store.dispatch(
        CrossTabulationUIActions.addToSelection({
          variableID: this.variableID(),
          orientation: '',
        }),
      );
    } else {
      this.store.dispatch(
        CrossTabulationUIActions.fetchCrossTabAndAddToSelection({
          variableID: this.variableID(),
        }),
      );
    }
  }

  removeFromCrossTab() {
    this.store.dispatch(
      CrossTabulationUIActions.removeVariableUsingVariableID({
        variableID: this.variableID(),
      }),
    );
  }
}
