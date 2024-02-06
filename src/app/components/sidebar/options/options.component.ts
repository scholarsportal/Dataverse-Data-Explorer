import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { selectIsOptionsMenuOpen } from 'src/app/state/selectors/ui.selectors';
import { Subscription } from 'rxjs';
import {
  closeOptionsMenu,
  openOptionsMenu,
} from 'src/app/state/actions/ui.actions';

@Component({
  selector: 'dct-options',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './options.component.html',
  styleUrl: './options.component.css',
})
export class OptionsComponent implements OnDestroy {
  // component variables
  sub$!: Subscription;
  isOptionsMenuOpen: boolean = false;

  // options menu modal reference
  @ViewChild('options') optionsMenu?: ElementRef;

  constructor(private store: Store, private el: ElementRef) {
    this.sub$ = store
      .select(selectIsOptionsMenuOpen)
      .subscribe((value) => (this.isOptionsMenuOpen = value));
  }

  ngOnDestroy(): void {
    this.sub$.unsubscribe();
  }

  handleButton() {
    if (this.isOptionsMenuOpen) {
      this.closeOptions();
      this.store.dispatch(closeOptionsMenu());
    } else {
      this.openOptions();
      this.store.dispatch(openOptionsMenu());
    }
  }

  openOptions(): void {
    const options = this.optionsMenu?.nativeElement as HTMLDialogElement;
    options?.showModal();
  }

  closeOptions(): void {
    const options = this.optionsMenu?.nativeElement as HTMLDialogElement;
    options?.close();
  }
}
