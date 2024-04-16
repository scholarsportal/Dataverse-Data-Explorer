import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { fetchDataset } from './state/actions/dataset.actions';
import { selectDatasetLoading } from './state/selectors/dataset.selectors';
import { selectVariablesWithGroupsReference } from './state/selectors/var-groups.selectors';
import { selectIsOptionsMenuOpen } from './state/selectors/open-variable.selectors';
import { selectIsCrossTabOpen } from './state/selectors/cross-tabulation.selectors';
import { AsyncPipe, CommonModule } from '@angular/common';
import { TableComponent } from './components/table/table.component';
import { ImportComponent } from './components/import/import.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { CrossTabulationComponent } from './components/cross-tabulation/cross-tabulation.component';
import { HeaderComponent } from './components/header/header.component';

@Component({
  selector: 'dct-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [
    HeaderComponent,
    CrossTabulationComponent,
    SidebarComponent,
    ImportComponent,
    TableComponent,
    AsyncPipe,
    CommonModule
  ]
})
export class AppComponent implements OnInit {
  private store = inject(Store);
  private route = inject(ActivatedRoute);

  loaded$ = this.store.select(selectDatasetLoading);
  isCrossTabOpen$ = this.store.select(selectIsCrossTabOpen);
  isOptionsMenuOpen$ = this.store.select(selectIsOptionsMenuOpen);
  variablesWithGroups$ = this.store.select(selectVariablesWithGroupsReference);

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const siteURL = params['siteUrl'] as string;
      const fileID = params['dfId'] as number;
      const apiKey = params['key'] as string;
      if (siteURL && fileID) {
        return this.store.dispatch(
          fetchDataset({ fileID: fileID, siteURL: siteURL, apiKey: apiKey })
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
