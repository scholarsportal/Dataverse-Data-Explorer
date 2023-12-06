import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { openVariableChangeMode, openVariableSwitchToNext, openVariableSwitchToPrev } from 'src/state/actions/modal.actions';
import { selectCheckModalOpen, selectCheckModalID, selectCheckModalLabel, selectCheckModalMode, selectCheckModalName, selectCheckModalState, selectCheckModalVariable } from 'src/state/selectors/modal.selectors';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
})
export class ModalComponent {
  @ViewChild('modal') modalElementRef?: ElementRef;
  @Input() modalID: string | null = null;

  open$ = this.store.select(selectCheckModalOpen)
  mode$ = this.store.select(selectCheckModalMode)
  state$ = this.store.select(selectCheckModalState)
  label$ = this.store.select(selectCheckModalLabel)
  name$ = this.store.select(selectCheckModalName)
  id$ = this.store.select(selectCheckModalID)
  variable$ = this.store.select(selectCheckModalVariable)

  mode: any;
  changes: boolean = false;

  constructor(private store: Store) {
    store.select(selectCheckModalMode).subscribe((data: any) => {
      this.mode = data;
    })
  }

  getID(variable: any) {
    if (variable && variable['@_ID']) {
      return variable['@_ID']
    }
    return ''
  }

  getLabel(variable: any) {
    if (variable?.labl['#text']) {
      return variable.labl['#text']
    }
    return ''
  }

  getName(variable: any) {
    if (variable && variable['@_name']) {
      return variable['@_name']
    }
    return ''
  }

  changeMode() {
    if(this.mode && this.mode === 'View') {
        return this.store.dispatch(openVariableChangeMode({ mode: 'Edit' }))
    }
    if(this.mode && this.mode === 'Edit') {
      // TODO: Check for changes in form
      return this.store.dispatch(openVariableChangeMode({ mode: 'View' }))
    }
  }

  previousVar() {
    return this.store.dispatch(openVariableSwitchToPrev())
  }

  nextVar() {
    return this.store.dispatch(openVariableSwitchToNext())
  }

  openModal(): void {
    const modal = this.modalElementRef?.nativeElement as HTMLDialogElement;
    modal?.showModal();
  }

  closeModal(): void {
    // TODO: check if changes to form have been made so user doesn;t delete changes by accident
    // this.store.select(selectCheckModalState).subscribe((data) => {
    //   console.log(data)
    //   if(data === 'changes') { this.changes = true; }
    //   if(data === 'saved') {
    //     this.changes = false;
    //     const modal = this.modalElementRef?.nativeElement as HTMLDialogElement;
    //     modal?.close();
    //   }
    // })
    const modal = this.modalElementRef?.nativeElement as HTMLDialogElement;
    modal?.close();
  }
}
