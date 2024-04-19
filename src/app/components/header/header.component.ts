import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { closeCrossTabulationTab, openCrossTabulationTab } from 'src/app/state/actions/cross-tabulation.actions';
import { selectIsCrossTabOpen } from 'src/app/state/selectors/cross-tabulation.selectors';
import {
  selectDatasetHasAPIKey,
  selectDatasetUploadFailed,
  selectDatasetUploadSuccess
} from 'src/app/old.state/selectors/dataset.selectors';
import { AsyncPipe, NgClass, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VarCrosstabToggleComponent } from './var-crosstab-toggle/var-crosstab-toggle.component';
import { selectDatasetCitation, selectDatasetTitle, selectDatasetUploadInfo } from '../../new.state/xml/xml.selectors';
import { DataverseFetchActions } from '../../new.state/xml/xml.actions';

@Component({
  selector: 'dct-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [VarCrosstabToggleComponent, FormsModule, NgClass, AsyncPipe, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit {
  store = inject(Store);

  citation = this.store.selectSignal(selectDatasetCitation);
  title = this.store.selectSignal(selectDatasetTitle);
  uploadSuccess$ = this.store.select(selectDatasetUploadSuccess);
  uploadFail$ = this.store.select(selectDatasetUploadFailed);
  private hasApiKey$ = this.store.select(selectDatasetHasAPIKey);
  private isCrossTabOpen$ = this.store.selectSignal(selectIsCrossTabOpen);
  checked: boolean = true;
  showToggle: boolean = false;

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
    const datasetInfo = this.store.selectSignal(selectDatasetUploadInfo);
    const ddiData = datasetInfo()?.dataset;
    const siteURL = datasetInfo()?.info?.siteURL;
    const fileID = datasetInfo()?.info?.fileID;
    const apiKey = datasetInfo()?.info?.apiKey;
    if (siteURL && fileID && apiKey && ddiData) {
      this.store.dispatch(DataverseFetchActions.startDatasetUpload({ ddiData, siteURL, fileID, apiKey }));
    }
  }
}
