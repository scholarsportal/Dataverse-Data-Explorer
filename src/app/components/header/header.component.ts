import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { BodyToggleComponent } from './body-toggle/body-toggle.component';
import { AsyncPipe, NgClass, NgOptimizedImage } from '@angular/common';
import { Store } from '@ngrx/store';
import { FormsModule } from '@angular/forms';
import {
  selectDatasetCitation,
  selectDatasetHasApiKey,
  selectDatasetState,
  selectDatasetTitle
} from '../../new.state/xml/xml.selectors';
import { DataverseFetchActions } from '../../new.state/xml/xml.actions';
import { selectDatasetUploadedSuccessfully, selectDatasetUploadError } from '../../new.state/dataset/dataset.selectors';
import { selectBodyToggleState } from '../../new.state/ui/ui.selectors';
import { CrossTabulationUIActions, VariableTabUIAction } from '../../new.state/ui/ui.actions';

@Component({
  selector: 'dct-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [BodyToggleComponent, FormsModule, NgClass, AsyncPipe, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit {
  store = inject(Store);

  currentThemeLight: boolean = true;
  showToggle: boolean = false;

  citation = this.store.selectSignal(selectDatasetCitation);
  title = this.store.selectSignal(selectDatasetTitle);
  bodyToggleState = this.store.selectSignal(selectBodyToggleState);

  uploadSuccess$ = this.store.select(selectDatasetUploadedSuccessfully);
  uploadFail$ = this.store.select(selectDatasetUploadError);
  hasApiKey$ = this.store.select(selectDatasetHasApiKey);

  ngOnInit(): void {
    if (localStorage.getItem('theme') === 'dark') {
      this.currentThemeLight = false;
    }
    this.showToggle = true;
  }

  handleToggle($event: 'cross-tab' | 'variables') {
    if ($event === 'cross-tab') {
      return this.store.dispatch(CrossTabulationUIActions.navigateToCrossTabulationTab());
    }
    if ($event === 'variables') {
      return this.store.dispatch(VariableTabUIAction.navigateToVariableTab());
    }
  }

  openCrossTab() {
    this.store.dispatch(CrossTabulationUIActions.navigateToCrossTabulationTab());
  }

  closeCrossTab() {
    this.store.dispatch(VariableTabUIAction.navigateToVariableTab());
  }

  toggleTheme() {
    const theme = localStorage.getItem('theme');
    if (theme === 'light') {
      this.currentThemeLight = false;
      localStorage.setItem('theme', 'dark');
      document.body.setAttribute('data-theme', 'dark');
    } else {
      this.currentThemeLight = true;
      localStorage.setItem('theme', 'light');
      document.body.setAttribute('data-theme', 'light');
    }
  }

  handleUpload() {
    const datasetInfo = this.store.selectSignal(selectDatasetState);
    const ddiData = datasetInfo()?.dataset;
    const siteURL = datasetInfo()?.info?.siteURL;
    const fileID = datasetInfo()?.info?.fileID;
    const apiKey = datasetInfo()?.info?.apiKey;
    if (siteURL && fileID && apiKey && ddiData) {
      this.store.dispatch(DataverseFetchActions.startDatasetUpload({ ddiData, siteURL, fileID, apiKey }));
    }
  }
}
