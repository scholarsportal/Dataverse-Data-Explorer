import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { fetchDataset } from 'src/state/actions';
import { checkOpenGroup, selectDatasetVars } from 'src/state/selectors';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Data Curation Tool';
  openGroup$ = this.store.select(checkOpenGroup)
  vars$: any = this.store.select(selectDatasetVars);

  constructor(private store: Store) {
  }

  ngOnInit() {
    this.store.dispatch(fetchDataset({ fileID: '661483', siteURL: 'https://borealisdata.ca' }))
  }
}
