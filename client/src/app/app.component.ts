import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { fetchDataset } from 'src/state/actions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Data Curation Tool';

  constructor(private store: Store) {
  }

  ngOnInit(){
    this.store.dispatch(fetchDataset({fileID: '127759', siteURL: 'https://borealisdata.ca'}))
  }
}
