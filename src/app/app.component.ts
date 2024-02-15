import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { checkOpenGroup, getDataFetchStatus } from 'src/state/selectors';
import { fetchDataset } from './state/actions/dataset.actions';
import { selectDatasetLoading } from './state/selectors/dataset.selectors';

@Component({
  selector: 'dct-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'Data Curation Tool';
  openGroup$ = this.store.select(checkOpenGroup);
  loaded$ = this.store.select(selectDatasetLoading);
  noParams = false;
  datasetForm: FormGroup;

  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder
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

      if (siteURL && fileID) {
        this.store.dispatch(fetchDataset({ fileID: fileID, siteURL: siteURL }));
      } else {
        this.noParams = true;
        this.store.dispatch(
          fetchDataset({ fileID: 40226, siteURL: 'https://demo.borealisdata.ca' })
        );
      }
    });
  }

  checkValid(index: string) {
    const control = this.datasetForm.get(index);
    return control ? control.valid : false;
  }

  manualDatasetFetch() {
    if (this.datasetForm.valid) {
      const { fileID, siteURL, APIKEY } = this.datasetForm.value;
      this.store.dispatch(fetchDataset({ fileID, siteURL }));
    } else {
      // Handle form validation or error notification
      console.log('Invalid form data');
    }
  }
}
