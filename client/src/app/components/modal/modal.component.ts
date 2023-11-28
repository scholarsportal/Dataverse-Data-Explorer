import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectCheckOpenModal, selectCheckOpenModalID, selectCheckOpenModalLabel, selectCheckOpenModalMode, selectCheckOpenModalName, selectCheckOpenModalState, selectCheckOpenModalVariable } from 'src/state/selectors';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
})
export class ModalComponent {
  @ViewChild('modal') modalElementRef?: ElementRef;
  @Input() modalID: string | null = null;
  @Input() customOpenFunction: Function | undefined;
  @Input() customCloseFunction: Function | undefined;

  open$ = this.store.select(selectCheckOpenModal)
  mode$ = this.store.select(selectCheckOpenModalMode)
  state$ = this.store.select(selectCheckOpenModalState)
  label$ = this.store.select(selectCheckOpenModalLabel)
  name$ = this.store.select(selectCheckOpenModalName)
  id$ = this.store.select(selectCheckOpenModalID)
  variable$ = this.store.select(selectCheckOpenModalVariable)

  constructor(private store: Store) {
    store.select(selectCheckOpenModal).subscribe((data: any) => {
      console.log(data)
    })
  }

  getID(variable: any){
    if(variable && variable['@_ID']) {
      return variable['@_ID']
    }
    return ''
  }

  getLabel(variable: any){
    if(variable?.labl['#text']) {
      return variable.labl['#text']
    }
    return ''
  }

  getName(variable: any){
    if(variable && variable['@_name']) {
      return variable['@_name']
    }
    return ''
  }

  openModal(): void {
    if (this.customOpenFunction) {
      this.customOpenFunction();
    }
    const modal = this.modalElementRef?.nativeElement as HTMLDialogElement;
    modal?.showModal();
  }

  closeModal(): void {
    if (this.customCloseFunction) {
      this.customCloseFunction();
    }
    const modal = this.modalElementRef?.nativeElement as HTMLDialogElement;
    modal?.close();
  }
}
