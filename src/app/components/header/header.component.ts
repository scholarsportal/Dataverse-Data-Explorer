import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { take } from 'rxjs';
import {
  closeCrossTabulationTab,
  openCrossTabulationTab,
} from 'src/app/state/actions/cross-tabulation.actions';
import { datasetUploadRequest } from 'src/app/state/actions/dataset.actions';
import { selectIsCrossTabOpen } from 'src/app/state/selectors/cross-tabulation.selectors';
import {
  selectDatasetCitation,
  selectDatasetForUpload,
  selectDatasetHasAPIKey,
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
  hasApiKey$ = this.store.select(selectDatasetHasAPIKey);
  isCrossTabOpen$ = this.store.select(selectIsCrossTabOpen);
  sub$ = this.store.select(selectDatasetForUpload);

  constructor(private store: Store) {}

  openCrossTab() {
    this.store.dispatch(openCrossTabulationTab());
  }

  closeCrossTab() {
    this.store.dispatch(closeCrossTabulationTab());
  }

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
