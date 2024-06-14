import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { BodyToggleComponent } from './body-toggle/body-toggle.component';
import { AsyncPipe, NgClass, NgOptimizedImage } from '@angular/common';
import { Store } from '@ngrx/store';
import { FormsModule } from '@angular/forms';
import {
  selectDatasetCitation,
  selectDatasetHasApiKey,
  selectDatasetInfo,
  selectDatasetState,
  selectDatasetTitle
} from '../../new.state/xml/xml.selectors';
import { DataverseFetchActions } from '../../new.state/xml/xml.actions';
import { selectDatasetUploadedSuccessfully, selectDatasetUploadError } from '../../new.state/dataset/dataset.selectors';
import { selectBodyToggleState } from '../../new.state/ui/ui.selectors';
import { CrossTabulationUIActions, VariableTabUIAction } from '../../new.state/ui/ui.actions';
import { SplitButtonModule } from 'primeng/splitbutton';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'dct-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [BodyToggleComponent, FormsModule, NgClass, AsyncPipe, NgOptimizedImage, SplitButtonModule, MenuModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit {
  store = inject(Store);

  currentThemeLight: boolean = true;
  showToggle: boolean = false;

  citation = this.store.selectSignal(selectDatasetCitation);
  title = this.store.selectSignal(selectDatasetTitle);
  bodyToggleState = this.store.selectSignal(selectBodyToggleState);

  uploadSuccess = this.store.selectSignal(selectDatasetUploadedSuccessfully);
  uploadFail = this.store.selectSignal(selectDatasetUploadError);
  hasApiKey = this.store.selectSignal(selectDatasetHasApiKey);
  datasetInfo = this.store.selectSignal(selectDatasetInfo);
  siteURL = computed(() => {
    return this.datasetInfo()?.siteURL || '';
  });
  fileID = computed(() => {
    return this.datasetInfo()?.fileID || '';
  });

  styleClass = signal('hover:bg-base-300 focus:bg-base-300 py-4 px-5');
  downloadOptions = signal<MenuItem[]>([
    {
      label: 'Download original file',
      url: `${this.siteURL()}/api/access/datafile/${this.fileID()}?format=original`,
      styleClass: this.styleClass()
    },
    {
      label: 'Download tab-delimited',
      url: `${this.siteURL()}/api/access/datafile/${this.fileID()}`,
      styleClass: this.styleClass()
    },
    {
      label: 'Download RData format file',
      url: `${this.siteURL()}/api/access/datafile/${this.fileID()}?format=RData`,
      styleClass: this.styleClass()
    },
    {
      label: 'Download original DDI',
      url: `${this.siteURL()}/api/meta/datafile/${this.fileID()}`,
      styleClass: this.styleClass()
    }
  ]);

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
