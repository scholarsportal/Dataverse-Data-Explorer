import { Component, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent {
  @ViewChild("modal") modalElementRef?: ElementRef;
  @Input() modalID: string | null = null;
  @Input() customOpenFunction: Function | undefined;
  @Input() customCloseFunction: Function | undefined;

  open() {
    if (this.customOpenFunction) {
      this.customOpenFunction();
    }
    const modal = this.modalElementRef?.nativeElement as HTMLDialogElement;
    modal?.show();
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
