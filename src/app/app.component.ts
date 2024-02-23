import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { fetchDataset } from './state/actions/dataset.actions';
import { selectDatasetLoading } from './state/selectors/dataset.selectors';
import { selectVariablesWithGroupsReference } from './state/selectors/var-groups.selectors';

@Component({
  selector: 'dct-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'Data Curation Tool';
  loaded$ = this.store.select(selectDatasetLoading);
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
      const siteURL = params['siteURL'] as string;
      const fileID = params['fileID'] as number;
      const apiKey = params['apiKey'] as string;

      if (siteURL && fileID) {
        this.store.dispatch(
          fetchDataset({ fileID: fileID, siteURL: siteURL, apiKey: apiKey }),
        );
      } else {
        this.noParams = true;
        this.store.dispatch(
          fetchDataset({
            fileID: 40226,
            siteURL: 'https://demo.borealisdata.ca',
            apiKey: '11681fde-8e25-47c2-bfd3-44fe583172eb',
          }),
        );
      }
    });
  }

  checkValid(index: string) {
    const control = this.datasetForm.get(index);
    return control ? control.valid : false;
  }
}
