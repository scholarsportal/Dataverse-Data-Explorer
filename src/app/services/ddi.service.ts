import { HttpClient, HttpHeaders } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { map, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { ddiJSONStructure } from '../new.state/xml/xml.interface';
import { selectDatasetInfo } from '../new.state/xml/xml.selectors';

@Injectable({
  providedIn: 'root',
})
export class DdiService {
  store = inject(Store);
  http = inject(HttpClient);
  datasetInfo = this.store.selectSignal(selectDatasetInfo);
  fileID = computed(() => {
    if (this.datasetInfo()?.fileID) {
      return this.datasetInfo()?.fileID || '';
    } else {
      return '';
    }
  });
  siteURL = computed(() => {
    if (this.datasetInfo()?.siteURL) {
      return this.datasetInfo()?.siteURL || '';
    } else {
      return '';
    }
  });

  private parseOptions: { ignoreAttributes: false; attributeNamePrefix: '@_' } =
    {
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    };

  fetchDatasetFromDataverse(
    fileID: number,
    siteURL: string,
  ): Observable<ddiJSONStructure> {
    return this.http
      .get(`${siteURL}/api/access/datafile/${fileID}/metadata/ddi`, {
        responseType: 'text',
      })
      .pipe(map((data) => this.XMLtoJSON(data)));
  }

  uploadDatasetToDataverse(
    siteURL: string,
    fileID: number,
    jsonData: ddiJSONStructure,
    apiKey: string,
  ): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/xml',
        'X-Dataverse-key': apiKey,
      }),
    };
    const xml = this.JSONtoXML(jsonData);
    return this.http.put(`${siteURL}/api/edit/${fileID}`, xml, httpOptions);
  }

  fetchCrossTabulationFromVariables(variable: string) {
    if (this.siteURL() !== '' && this.fileID() !== '') {
      return this.http
        .get(
          `${this.siteURL()}/api/access/datafile/${this.fileID()}/?format=subset&variables=${variable}`,
          { responseType: 'text' },
        )
        .pipe(map((data) => this.splitLines(data).slice(1)));
    } else {
      throw Error('No Site URL, File ID');
    }
  }

  XMLtoJSON(xml: string): ddiJSONStructure {
    const parser = new XMLParser(this.parseOptions);
    return parser.parse(xml);
  }

  JSONtoXML(json: ddiJSONStructure): string {
    const parser = new XMLBuilder(this.parseOptions);
    return parser.build(json);
  }

  // From: https://stackoverflow.com/a/52947649
  splitLines(t: string): string[] {
    return t.split(/\r\n|\r|\n/);
  }
}
