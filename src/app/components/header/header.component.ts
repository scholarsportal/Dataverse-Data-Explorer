import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { BodyToggleComponent } from './body-toggle/body-toggle.component';
import { AsyncPipe, NgClass, NgOptimizedImage } from '@angular/common';
import { Store } from '@ngrx/store';
import { FormsModule } from '@angular/forms';
import {
  selectDatasetCitation,
  selectDatasetHasApiKey,
  selectDatasetInfo,
  selectDatasetState,
  selectDatasetTitle,
} from '../../new.state/xml/xml.selectors';
import { DataverseFetchActions } from '../../new.state/xml/xml.actions';
import {
  selectDatasetImportPending,
  selectDatasetUploadedSuccessfully,
  selectDatasetUploadError,
} from '../../new.state/dataset/dataset.selectors';
import { selectBodyToggleState } from '../../new.state/ui/ui.selectors';
import {
  CrossTabulationUIActions,
  VariableTabUIAction,
} from '../../new.state/ui/ui.actions';
import { SplitButtonModule } from 'primeng/splitbutton';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DdiService } from '../../services/ddi.service';

@Component({
  selector: 'dct-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [
    BodyToggleComponent,
    FormsModule,
    NgClass,
    AsyncPipe,
    NgOptimizedImage,
    SplitButtonModule,
    MenuModule,
    ButtonModule,
  ],
  //changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit {
  store = inject(Store);
  ddi = inject(DdiService);

  currentThemeLight: boolean = true;
  showToggle: boolean = false;

  pending: boolean = false;
  saved: boolean = false;
  fail: boolean = false;

  citation = this.store.selectSignal(selectDatasetCitation);
  title = this.store.selectSignal(selectDatasetTitle);
  bodyToggleState = this.store.selectSignal(selectBodyToggleState);

  uploadSuccess = this.store.selectSignal(selectDatasetUploadedSuccessfully);
  uploadFail = this.store.selectSignal(selectDatasetUploadError);
  uploadPending = this.store.selectSignal(selectDatasetImportPending);
  datasetState = this.store.selectSignal(selectDatasetState);
  hasApiKey = this.store.selectSignal(selectDatasetHasApiKey);
  datasetInfo = this.store.selectSignal(selectDatasetInfo);
  siteURL = computed(() => {
    return this.datasetInfo()?.siteURL || '';
  });
  fileID = computed(() => {
    return this.datasetInfo()?.fileID || '';
  });

  downloadOptions = signal<MenuItem[]>([
    {
      label: 'Download original file (.sav file)',
      url: `${this.siteURL()}/api/access/datafile/${this.fileID()}?format=original`,
    },
    {
      label: 'Download tab-delimited',
      url: `${this.siteURL()}/api/access/datafile/${this.fileID()}`,
    },
    {
      label: 'Download RData format file',
      url: `${this.siteURL()}/api/access/datafile/${this.fileID()}?format=RData`,
    },
    {
      label: 'Download original DDI (.xml file)',
      url: `${this.siteURL()}/api/meta/datafile/${this.fileID()}`,
    },
    {
      label: 'Download this version (.xml file)',
      command: () => this.handleDownload(),
    },
  ]);

  ngOnInit(): void {
    if (localStorage.getItem('theme') === 'dark') {
      this.currentThemeLight = false;
    }
    this.showToggle = true;
  }

  handleToggle($event: 'cross-tab' | 'variables') {
    if ($event === 'cross-tab') {
      return this.store.dispatch(
        CrossTabulationUIActions.navigateToCrossTabulationTab(),
      );
    }
    if ($event === 'variables') {
      return this.store.dispatch(VariableTabUIAction.navigateToVariableTab());
    }
  }

  handleDownload() {
    const state = this.datasetState().dataset;
    if (state) {
      const title =
        this.datasetState().header?.title || 'New Data Explorer File';
      const content = this.ddi.JSONtoXML(state);

      const file = new Blob([content], { type: 'text/xml' });
      const url = window.URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}.xml`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
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
    this.pending = true;
    this.saved = false;
    this.fail = false;
    const datasetInfo = this.store.selectSignal(selectDatasetState);
    const ddiData = datasetInfo()?.dataset;
    const siteURL = datasetInfo()?.info?.siteURL;
    const fileID = datasetInfo()?.info?.fileID;
    const apiKey = datasetInfo()?.info?.apiKey;
    const secureUploadURL = datasetInfo()?.info?.secureUploadUrl || '';
    if (ddiData && !!secureUploadURL) {
      this.store.dispatch(
        DataverseFetchActions.startSecureDatasetUpload({
          ddiData,
          secureUploadURL,
        }),
      );
    } else if (siteURL && fileID && apiKey && ddiData) {
      this.store.dispatch(
        DataverseFetchActions.startDatasetUpload({
          ddiData,
          siteURL,
          fileID,
          apiKey,
        }),
      );
    }
    const stateStatus = this.store.subscribe((state) => {
      const status = state.dataset.operationStatus.upload;
      if (status === 'success') {
        stateStatus.unsubscribe();
        setTimeout(() => {
          this.closeLoadingToast();
          this.saved = true;
          setTimeout(() => {
            this.closeLoadedToast();
          }, 3500);
        }, 1000);
      } else if (status === 'error') {
        stateStatus.unsubscribe();
        this.closeLoadingToast();
        this.fail = true;
      }
    });
  }

  closeLoadingToast() {
    this.pending = false;
  }

  closeLoadedToast() {
    this.saved = false;
  }

  closeErrToast() {
    this.fail = false;
  }
}
