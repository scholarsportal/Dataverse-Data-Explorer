import {
  ChangeDetectionStrategy,
  Component,
  effect,
  OnInit,
  signal,
} from '@angular/core';
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
import { AsyncPipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VarCrosstabToggleComponent } from './var-crosstab-toggle/var-crosstab-toggle.component';

@Component({
  selector: 'dct-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [VarCrosstabToggleComponent, FormsModule, NgClass, AsyncPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit {
  title$ = this.store.select(selectDatasetTitle);
  citation$ = this.store.select(selectDatasetCitation);
  uploadSuccess$ = this.store.select(selectDatasetUploadSuccess);
  uploadFail$ = this.store.select(selectDatasetUploadFailed);
  hasApiKey$ = this.store.select(selectDatasetHasAPIKey);
  protected isCrossTabOpen$ = this.store.selectSignal(selectIsCrossTabOpen);
  sub$ = this.store.select(selectDatasetForUpload);
  checked: boolean = true;
  showToggle: boolean = false;

  constructor(private store: Store) {}

  ngOnInit(): void {
    if (localStorage.getItem('theme') === 'dark') {
      this.checked = false;
    }
    this.showToggle = true;
  }

  hangleToggle(open: boolean) {
    if (open) {
      this.openCrossTab();
    } else {
      this.closeCrossTab();
    }
  }

  openCrossTab() {
    this.store.dispatch(openCrossTabulationTab());
  }

  closeCrossTab() {
    this.store.dispatch(closeCrossTabulationTab());
  }

  toggleTheme() {
    const theme = localStorage.getItem('theme');
    if (theme === 'light') {
      this.checked = false;
      localStorage.setItem('theme', 'dark');
      document.body.setAttribute('data-theme', 'dark');
    } else {
      this.checked = true;
      localStorage.setItem('theme', 'light');
      document.body.setAttribute('data-theme', 'light');
    }
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
