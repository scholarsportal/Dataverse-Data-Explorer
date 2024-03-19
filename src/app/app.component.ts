import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { State, Store } from '@ngrx/store';
import { fetchDataset } from './state/actions/dataset.actions';
import { selectDatasetLoading } from './state/selectors/dataset.selectors';
import { selectVariablesWithGroupsReference } from './state/selectors/var-groups.selectors';
import { selectIsOptionsMenuOpen } from './state/selectors/open-variable.selectors';
import { selectIsCrossTabOpen } from './state/selectors/cross-tabulation.selectors';

@Component({
  selector: 'dct-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'Data Curation Tool';
  loaded$ = this.store.select(selectDatasetLoading);
  isCrossTabOpen$ = this.store.select(selectIsCrossTabOpen);
  isOptionsMenuOpen$ = this.store.select(selectIsOptionsMenuOpen);
  variablesWithGroups$ = this.store.select(selectVariablesWithGroupsReference);
  noParams = false;
  datasetForm: FormGroup;

  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
  ) {
    this.datasetForm = this.formBuilder.group({
      siteURL: ['', [Validators.required, Validators.pattern('^https://.*')]],
      fileID: ['', Validators.required],
      APIKEY: [''], // Optional field
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const siteURL = params['siteUrl'] as string;
      const fileID = params['dfId'] as number;
      const apiKey = params['key'] as string;
      if (siteURL && fileID) {
        return this.store.dispatch(
          fetchDataset({ fileID: fileID, siteURL: siteURL, apiKey: apiKey }),
        );
      }
      // if (!siteURL && !fileID) {
      //   this.noParams = true;
      //   return this.store.dispatch(
      //     fetchDataset({
      //       fileID: 40226,
      //       siteURL: 'https://demo.borealisdata.ca',
      //       apiKey: '11681fde-8e25-47c2-bfd3-44fe583172eb',
      //     }),
      //   );
      //
      if (localStorage.getItem('theme')) {
        let theme = localStorage.getItem('theme') as string;
        document.body.setAttribute('data-theme',theme);
      } else {
        const darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)");
        if (darkThemeMq.matches) {
          localStorage.setItem('theme','dark');
          document.body.setAttribute('data-theme','dark');
        } else {
          document.body.setAttribute('data-theme','light');
        }
      } 
      
    });
  }

  checkValid(index: string) {
    const control = this.datasetForm.get(index);
    return control ? control.valid : false;
  }
}

