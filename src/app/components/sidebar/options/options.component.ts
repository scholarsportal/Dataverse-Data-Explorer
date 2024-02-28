import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { selectIsOptionsMenuOpen } from 'src/app/state/selectors/open-variable.selectors';
import {
  closeOptionsMenu,
  openOptionsMenu,
} from 'src/app/state/actions/ui.actions';
import { Subscription } from 'rxjs';

@Component({
  selector: 'dct-options',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './options.component.html',
  styleUrl: './options.component.css',
})
export class OptionsComponent implements OnDestroy {
  sub!: Subscription;
  isOpen: boolean = false;

  constructor(private store: Store) {
    this.sub = this.store
      .select(selectIsOptionsMenuOpen)
      .pipe()
      .subscribe((data) => (this.isOpen = data));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  handleButton() {
    if (this.isOpen) {
      this.store.dispatch(closeOptionsMenu());
    } else {
      this.store.dispatch(openOptionsMenu());
    }
  }
}
