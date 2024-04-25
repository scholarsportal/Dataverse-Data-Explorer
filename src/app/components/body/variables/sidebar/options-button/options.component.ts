import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { VariableTabUIAction } from '../../../../new.state/ui/ui.actions';
import { selectImportComponentState } from '../../../../new.state/ui/ui.selectors';

@Component({
  selector: 'dct-import-button',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './options.component.html',
  styleUrl: './options.component.css'
})
export class OptionsComponent {
  store = inject(Store);
  currentState = this.store.selectSignal(selectImportComponentState);
  isOpen = computed(() => {
    return this.currentState() === 'open';
  });

  handleButton() {
    if (this.isOpen()) {
      this.store.dispatch(VariableTabUIAction.closeVariableImportMenu());
    } else {
      this.store.dispatch(VariableTabUIAction.openVariableImportMenu());
    }
  }
}
