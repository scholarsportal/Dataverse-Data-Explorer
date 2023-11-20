import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { fetchDataset } from 'src/state/actions';
import { checkOpenGroup, getDataFetchStatus } from 'src/state/selectors';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'Data Curation Tool';
  openGroup$ = this.store.select(checkOpenGroup);
  loaded$ = this.store.select(getDataFetchStatus);

  constructor(private store: Store) {}

  ngOnInit() {
    this.store.dispatch(
      fetchDataset({ fileID: '663968', siteURL: 'https://borealisdata.ca' })
    );
  }
}
