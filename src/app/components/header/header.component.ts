import {
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
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
  selectDatasetWeightFetchStatus,
} from '../../new.state/dataset/dataset.selectors';
import {
  selectBodyToggleState,
  selectCurrentGroupID,
  selectVariableSelectionContext,
} from '../../new.state/ui/ui.selectors';
import {
  CrossTabulationUIActions,
  VariableTabUIAction,
} from '../../new.state/ui/ui.actions';
import { SplitButtonModule } from 'primeng/splitbutton';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DdiService } from '../../services/ddi.service';
import { MessagesModule } from 'primeng/messages';

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
    MessagesModule,
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

  weightIdle: boolean = true;
  weightPending: boolean = false;
  weightSuccess: boolean = false;
  weightFail: boolean = false;

  citation = this.store.selectSignal(selectDatasetCitation);
  title = this.store.selectSignal(selectDatasetTitle);
  bodyToggleState = this.store.selectSignal(selectBodyToggleState);
  selectedVariables = this.store.selectSignal(selectVariableSelectionContext);
  selectedGroupID = this.store.selectSignal(selectCurrentGroupID);
  selection = computed(() => {
    if (this.selectedGroupID() === 'ALL') {
      console.log(this.selectedVariables()['ALL'].length);
      return this.selectedVariables()['ALL'].length > 0;
    }
    return this.selectedVariables()[this.selectedGroupID()]
      ? this.selectedVariables()[this.selectedGroupID()].length > 0
      : false;
  });
  currentSelectionAsString = computed(() => {
    if (this.selectedGroupID() === 'ALL') {
      return this.selectedVariables()['ALL'].join(',') || '';
    }
    return this.selectedVariables()[this.selectedGroupID()]
      ? this.selectedVariables()[this.selectedGroupID()].join(',')
      : '';
  });

  weightFetchStatus = this.store.selectSignal(selectDatasetWeightFetchStatus);
  weightFetchIdle = computed(
    () => this.weightFetchStatus() === ('idle' as const),
  );
  weightFetchSuccess = computed(
    () => this.weightFetchStatus() === ('success' as const),
  );
  weightFetchPending = computed(
    () => this.weightFetchStatus() === ('pending' as const),
  );
  weightFetchFail = computed(
    () => this.weightFetchStatus() === ('error' as const),
  );

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
  downloadWithSubsetOption = computed(() => [
    {
      label: 'Download original file (.sav file)',
      url: `${this.siteURL()}/api/access/datafile/${this.fileID()}?format=original`,
    },
    {
      label: 'Download tab-delimited',
      url: `${this.siteURL()}/api/access/datafile/${this.fileID()}`,
    },
    {
      label: 'Download selected variables as subset',
      url: `${this.siteURL()}/api/access/datafile/${this.fileID()}/?format=subset&variables=${this.currentSelectionAsString()}`,
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
  computedDownloadOptions = computed(() => {
    return this.selection()
      ? this.downloadWithSubsetOption()
      : this.downloadOptions();
  });

  constructor() {
    effect(() => {
      this.pending = this.uploadPending();
      this.saved = this.uploadSuccess();
      this.fail = this.uploadFail();

      this.weightIdle = this.weightFetchIdle();
      this.weightPending = this.weightFetchPending();
      this.weightSuccess = this.weightFetchSuccess();
      this.weightFail = this.weightFetchFail();
    });
  }

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

  handleSubsetDownload() {}

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
        DataverseFetchActions.datasetUploadStart({
          ddiData,
          siteURL,
          fileID,
          apiKey,
        }),
      );
    }
  }

  closeWeightToast() {
    this.weightIdle = true;
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
