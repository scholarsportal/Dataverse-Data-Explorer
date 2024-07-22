import { HttpClient, HttpHeaders } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { map, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { ApiResponse, ddiJSONStructure } from '../new.state/xml/xml.interface';
import { selectDatasetInfo } from '../new.state/xml/xml.selectors';

@Injectable({
  providedIn: 'root',
})
export class DdiService {
  store = inject(Store);
  http = inject(HttpClient);
  signedUploadLink = signal('');
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

  fetchDecodedURL(url: string) {
    return this.http.get(url, { responseType: 'json' }).pipe(
      map((data) => {
        return data as ApiResponse;
      }),
    );
  }

  fetchDatasetFromDataverse(
    fileID: number,
    siteURL: string,
    metadataID: number | undefined,
  ): Observable<ddiJSONStructure> {
    let metadataParam = '';
    if (metadataID) {
      metadataParam = '?fileMetadataId=' + metadataID;
    }
    return this.http
      .get(
        `${siteURL}/api/access/datafile/${fileID}/metadata/ddi${metadataParam}`,
        {
          responseType: 'text',
        },
      )
      .pipe(
        map((data) => {
          return this.XMLtoJSON(data);
        }),
      );
  }

  fetchSignedURL(url: string): Observable<any> {
    console.log(url);
    return this.http
      .get(url, {
        responseType: 'text',
      })
      .pipe(
        map((data) => {
          console.log(data);
          console.log(this.XMLtoJSON(data));
          return this.XMLtoJSON(data);
        }),
      );
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

  uploadWithSecurityDatasetToDataverse(
    jsonData: ddiJSONStructure,
    secureUploadURL: string,
  ): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/xml',
      }),
    };
    const xml = this.JSONtoXML(jsonData);
    return this.http.put(secureUploadURL, xml, httpOptions);
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
