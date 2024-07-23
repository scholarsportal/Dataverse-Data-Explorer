import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { AsyncPipe, CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import {
  selectDatasetDownloadedSuccessfully,
  selectDatasetDownloadPending,
} from './new.state/dataset/dataset.selectors';
import { DataverseFetchActions } from './new.state/xml/xml.actions';
import { BodyComponent } from './components/body/body.component';

@Component({
  selector: 'dct-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [HeaderComponent, AsyncPipe, CommonModule, BodyComponent],
})
export class AppComponent implements OnInit {
  private store = inject(Store);
  loading = this.store.selectSignal(selectDatasetDownloadPending);
  loaded = this.store.selectSignal(selectDatasetDownloadedSuccessfully);
  private route = inject(ActivatedRoute);

  ngOnInit() {
    this.route.queryParams.subscribe((params: any) => {
      const callback = (params['callback'] as string) || null;
      const siteURL = params['siteUrl'] as string;
      const fileID =
        (params['fileId'] as number) ||
        (params['fileID'] as number) ||
        (params['dfId'] as number);
      const apiKey = params['key'] as string;
      // If a dataset is in French then we automatically set the language to French
      const language = params['dvLocale'] as string;
      // The identifier to specify the version of the dataset to load
      const metadataID = params['metadataID'] as number;
      if (callback) {
        return this.store.dispatch(
          DataverseFetchActions.decodeURLAndFetch({ url: callback }),
        );
      } else if (siteURL && fileID) {
        return this.store.dispatch(
          DataverseFetchActions.startDDIFetch({
            fileID,
            siteURL,
            apiKey,
            language,
            metadataID,
          }),
        );
      }
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
    });
  }
}
