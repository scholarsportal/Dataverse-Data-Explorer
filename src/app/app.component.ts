import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { AsyncPipe, CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import {
  selectDatasetDownloadedSuccessfully,
  selectDatasetDownloadPending
} from './new.state/dataset/dataset.selectors';
import { DataverseFetchActions } from './new.state/xml/xml.actions';
import { BodyComponent } from './components/body/body.component';

@Component({
  selector: 'dct-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [
    HeaderComponent,
    AsyncPipe,
    CommonModule,
    BodyComponent
  ]
})
export class AppComponent implements OnInit {
  private store = inject(Store);
  loading = this.store.selectSignal(selectDatasetDownloadPending);
  loaded = this.store.selectSignal(selectDatasetDownloadedSuccessfully);
  private route = inject(ActivatedRoute);

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const siteURL = params['siteUrl'] as string;
      const fileID = params['dfId'] as number;
      const apiKey = params['key'] as string;
      if (siteURL && fileID) {
        return this.store.dispatch(
          DataverseFetchActions.startDDIFetch({ fileID: fileID, siteURL: siteURL, apiKey: apiKey })
        );
      }
      if (localStorage.getItem('theme')) {
        let theme = localStorage.getItem('theme') as string;
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
