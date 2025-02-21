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
  selectDatasetDoi,
  selectUserHasUploadAccess,
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
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Languages } from '../../../assets/i18n/localizations';
import { Title } from '@angular/platform-browser';
import { MatomoTracker } from 'ngx-matomo-client';

@Component({
  selector: 'dct-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [
    TranslateModule,
    BodyToggleComponent,
    FormsModule,
    NgClass,
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
  translate = inject(TranslateService);
  languages = Languages;
  language = localStorage.getItem('language');

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
  pagetitle = inject(Title);
  doi = this.store.selectSignal(selectDatasetDoi);
  bodyToggleState = this.store.selectSignal(selectBodyToggleState);
  selectedVariables = this.store.selectSignal(selectVariableSelectionContext);
  selectedGroupID = this.store.selectSignal(selectCurrentGroupID);
  selection = computed(() => {
    // putting this here to trigger github change
    if (this.selectedGroupID() === 'ALL') {
      return this.selectedVariables()['ALL']?.length > 0;
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

  count = computed(() => {
    return (this.selectedVariables()[this.selectedGroupID()] || []).length;
  });

  uploadSuccess = this.store.selectSignal(selectDatasetUploadedSuccessfully);
  uploadFail = this.store.selectSignal(selectDatasetUploadError);
  uploadPending = this.store.selectSignal(selectDatasetImportPending);

  datasetState = this.store.selectSignal(selectDatasetState);
  hasApiKey = this.store.selectSignal(selectUserHasUploadAccess);
  datasetInfo = this.store.selectSignal(selectDatasetInfo);

  siteURL = computed(() => {
    return this.datasetInfo()?.siteURL || '';
  });
  fileID = computed(() => {
    return this.datasetInfo()?.fileID || '';
  });

  downloadOptions = signal<MenuItem[]>([
    {
      label: 'DOWNLOAD_ORIG',
      url: `${this.siteURL()}/api/access/datafile/${this.fileID()}?format=original`,
    },
    {
      label: 'DOWNLOAD_TAB',
      url: `${this.siteURL()}/api/access/datafile/${this.fileID()}`,
    },
    {
      label: 'DOWNLOAD_RDATA',
      url: `${this.siteURL()}/api/access/datafile/${this.fileID()}?format=RData`,
    },
    {
      label: 'DOWNLOAD_PDF',
      url: `${this.siteURL()}/api/datasets/export?exporter=pdf&persistentId=doi:${this.doi()}`,
    },
    {
      label: 'DOWNLOAD_HTML',
      url: `${this.siteURL()}/api/datasets/export?exporter=html&persistentId=doi:${this.doi()}`,
    },
    {
      label: 'DOWNLOAD_META',
      url: `${this.siteURL()}/api/meta/datafile/${this.fileID()}`,
    },
    {
      label: 'DOWNLOAD_XML',
      command: () => this.handleDownload(),
    },
  ]);

  downloadWithSubsetOption = computed(() => [
    {
      label: 'DOWNLOAD_SUBSET',
      url: `${this.siteURL()}/api/access/datafile/${this.fileID()}/?format=subset&variables=${this.currentSelectionAsString()}`,
    },
    ...this.downloadOptions(),
  ]);

  computedDownloadOptions = computed(() => {
    return this.selection()
      ? this.downloadWithSubsetOption()
      : this.downloadOptions();
  });

  tracker = inject(MatomoTracker);

  constructor() {
    effect(() => {
      this.pending = this.uploadPending();
      this.saved = this.uploadSuccess();
      this.fail = this.uploadFail();
    });
  }

  ngOnInit(): void {
    if (localStorage.getItem('theme') === 'dark') {
      this.currentThemeLight = false;
    }
    this.showToggle = true;
    this.pagetitle.setTitle(this.title() || 'Data Explorer');
    this.tracker.setDocumentTitle(this.title() || 'Data Explorer');
    this.tracker.trackPageView();

  }

  handleToggle($event: 'cross-tab' | 'variables') {
    if ($event === 'cross-tab') {
      this.tracker.trackEvent('Tabs','Cross Tabulation');
      return this.store.dispatch(
        CrossTabulationUIActions.navigateToCrossTabulationTab(),
      );
    }
    if ($event === 'variables') {
      this.tracker.trackEvent('Tabs','Variables');
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

  changeLanguage(event: any) {
    this.translate.use(event.target.value);
    localStorage.setItem('language', event.target.value);
  }

  handleUpload() {
    this.pending = true;
    this.saved = false;
    this.fail = false;
    const datasetInfo = this.store.selectSignal(selectDatasetState);
    const ddiData = datasetInfo()?.dataset;
    // const siteURL = datasetInfo()?.info?.siteURL;
    // const fileID = datasetInfo()?.info?.fileID;
    const secureUploadURL = datasetInfo()?.info?.secureUploadUrl || '';
    if (ddiData && !!secureUploadURL) {
      this.store.dispatch(
        DataverseFetchActions.startSecureDatasetUpload({
          ddiData,
          secureUploadURL,
        }),
      );
    }
    // else if (siteURL && fileID && apiKey && ddiData) {
    //   this.store.dispatch(
    //     DataverseFetchActions.datasetUploadStart({
    //       ddiData,
    //       siteURL,
    //       fileID,
    //       apiKey,
    //     }),
    //   );
    // }
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
