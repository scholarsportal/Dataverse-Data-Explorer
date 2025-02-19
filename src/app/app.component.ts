import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import {
  selectDatasetDownloadedSuccessfully,
  selectDatasetDownloadPending,
} from './new.state/dataset/dataset.selectors';
import { DataverseFetchActions } from './new.state/xml/xml.actions';
import { BodyComponent } from './components/body/body.component';
import { selectDatasetError } from './new.state/xml/xml.selectors';
import { selectDatasetProgress } from './new.state/ui/ui.selectors';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Languages } from './../assets/i18n/localizations';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'dct-root',
  template: `
    <div class="md:grid main">
      @if (loaded()) {
        <dct-header class="header border-b"></dct-header>
        <dct-body class="body" />
      } @else if (loading()) {
        <div class="h-screen w-screen flex flex-col items-center my-auto">
          <h1 class="my-auto w-full font-bold dark:text-light-on-primary">
            <label
              class="flex flex-col items-center justify-center text-center"
            >
              <span class="animate-pulse text-5xl">
                {{ 'APP.LOADING' | translate }}
              </span>
              <progress
                max="100"
                [value]="progress()"
                class="w-1/2 rounded-xl mx-auto my-5"
                id="dataset-progress"
                aria-label="Loading dataset..."
              ></progress>
            </label>
          </h1>
        </div>
      } @else if (error()) {
        <div
          class="beautiful h-screen w-screen flex flex-col justify-around items-center"
        >
          <h1 class="text-6xl text-white font-sans font-bold">
            An Error Occurred
          </h1>
          <p class="font-bold w-2/3 text-4xl text-white">
            @if (error().type === 'fetch') {
              Error fetching dataset: {{ error().message }}
            } @else {
              An unexpected error occurred. Please try again later.
            }
          </p>
          <p class="font-thin my-10 w-2/3 text-2xl text-white">
            Please go back to your Dataverse instance and try again. If the
            problem persists, contact your system administrator.
          </p>
        </div>
      } @else {
        <div
          class="beautiful h-screen w-screen flex flex-col justify-around items-center"
        >
          <h1 class="text-6xl text-white font-sans font-bold">
            Welcome Data Curators
          </h1>
          <p class="font-bold w-2/3 text-4xl text-white">
            If you are seeing this page, your link has expired. Please go back
            to your Dataverse instance for a new link to your dataset.
          </p>
          <p class="font-thin my-10 w-2/3 text-2xl text-white">
            The Data Explorer allows data owners and curators to view summary
            statistics for variables and to create and edit variable-level
            metadata for any tabular file in a dataset.
          </p>
        </div>
      }
    </div>
  `,
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [HeaderComponent, CommonModule, BodyComponent, TranslateModule],
})
export class AppComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  loading = this.store.selectSignal(selectDatasetDownloadPending);
  loaded = this.store.selectSignal(selectDatasetDownloadedSuccessfully);
  error = this.store.selectSignal(selectDatasetError);
  progress = this.store.selectSignal(selectDatasetProgress);
  private route = inject(ActivatedRoute);
  private translate = inject(TranslateService);
  private destroy$ = new Subject<void>();

  constructor() {
    const lang = Languages.find((x) => x.id == navigator.language);
    if (lang) {
      this.setLang(lang.id);
    } else {
      this.setLang('en-CA');
    }
  }

  ngOnInit() {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        const callback = (params['callback'] as string) || null;
        const siteURL = params['siteUrl'] as string;
        const fileID =
          (params['fileId'] as number) ||
          (params['fileID'] as number) ||
          (params['dfId'] as number);
        // If a dataset is in French then we automatically set the language to French
        const language = params['locale'] as string;
        const dvLocale = Languages.find((x) => x.dv == language);
        if (dvLocale) {
          localStorage.setItem('language', dvLocale.id);
          setTimeout(() => {
            this.setLang(dvLocale.id);
          }, 500);
        } else {
          const lang = Languages.find((x) => x.id == navigator.language);
          if (lang) {
            this.setLang(lang.id);
          } else {
            this.setLang('en-CA');
          }
        }
        // The identifier to specify the version of the dataset to load
        const metadataID = params['metadataID'] as number;
        if (callback) {
          return this.store.dispatch(
            DataverseFetchActions.decodeURLAndFetch({ url: callback }),
          );
        } else if (siteURL && fileID) {
          return this.store.dispatch(
            DataverseFetchActions.fetchDDIStart({
              fileID,
              siteURL,
              language,
              metadataID,
            }),
          );
        }
        this.setTheme();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setTheme() {
    if (localStorage.getItem('theme')) {
      const theme = localStorage.getItem('theme') as string;
      document.body.setAttribute('data-theme', theme);
    } else {
      const darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)');
      if (darkThemeMq.matches) {
        localStorage.setItem('theme', 'dark');
        document.body.setAttribute('data-theme', 'dark');
      } else {
        document.body.setAttribute('data-theme', 'light');
      }
    }
  }

  private setLang(lang: string) {
    const local = localStorage.getItem('language');
    if (local) {
      this.translate.setDefaultLang(local);
      this.translate.use(local);
    } else {
      localStorage.setItem('language', lang);
      this.translate.setDefaultLang(lang);
      this.translate.use(lang);
    }
  }
}
