import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { take } from 'rxjs';
import { datasetUploadRequest } from 'src/app/state/actions/dataset.actions';
import {
  selectDatasetCitation,
  selectDatasetForUpload,
  selectDatasetTitle,
  selectDatasetUploadFailed,
  selectDatasetUploadSuccess,
} from 'src/app/state/selectors/dataset.selectors';

@Component({
  selector: 'dct-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  title$ = this.store.select(selectDatasetTitle);
  citation$ = this.store.select(selectDatasetCitation);
  uploadSuccess$ = this.store.select(selectDatasetUploadSuccess);
  uploadFail$ = this.store.select(selectDatasetUploadFailed);
  sub$ = this.store.select(selectDatasetForUpload);

  constructor(private store: Store) {}

  handleUpload() {
    this.sub$
      .pipe(take(1))
      .subscribe(({ dataset, fileID, siteURL, apiKey }) => {
        if (dataset && fileID && siteURL) {
          this.store.dispatch(
            datasetUploadRequest({ dataset, siteURL, fileID, apiKey }),
          );
        }
      });
  }
}
