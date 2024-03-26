import { Component, inject } from '@angular/core';
import { selectIsCrossTabOpen } from 'src/app/state/selectors/cross-tabulation.selectors';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';

@Component({
  selector: 'dct-var-crosstab-toggle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './var-crosstab-toggle.component.html',
  styleUrl: './var-crosstab-toggle.component.css',
})
export class VarCrosstabToggleComponent {
  // Good opportunity to use model()
  store = inject(Store);
  isCrossTabOpen$ = this.store.select(selectIsCrossTabOpen);

  closeCrossTab() {}

  openCrossTab() {}
}
