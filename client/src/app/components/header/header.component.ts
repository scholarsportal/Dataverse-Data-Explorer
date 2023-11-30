import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectDatasetCitation, selectDatasetTitle } from 'src/state/selectors';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  title$ = this.store.select(selectDatasetTitle);
  citation$ = this.store.select(selectDatasetCitation);
  data: any;

  constructor(private store: Store) {}
}
