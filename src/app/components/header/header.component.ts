import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { take } from 'rxjs';
import {
  selectDatasetCitation,
  selectDatasetTitle,
} from 'src/app/state/selectors/dataset.selectors';

@Component({
  selector: 'dct-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  title$ = this.store.select(selectDatasetTitle);
  citation$ = this.store.select(selectDatasetCitation);
  data: any;

  constructor(private store: Store) {}

  handleUpload() {
    // this.store.select(selectDataset).pipe(take(1)).subscribe((dataset: any) => {
    //   this.store.dispatch(datasetUploadRequest(dataset))
    // })
  }
}
