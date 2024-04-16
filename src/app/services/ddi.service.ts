import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { Observable, of } from 'rxjs';
import { JSONStructure } from '../state/interface';
import { Store } from '@ngrx/store';
import { selectFileID, selectSiteURL } from '../state/selectors/dataset.selectors';

@Injectable({
  providedIn: 'root'
})
export class DdiService {
  store = inject(Store);
  http = inject(HttpClient);

  siteURL = this.store.selectSignal(selectSiteURL);
  fileID = this.store.selectSignal(selectFileID);

  private parseOptions: { ignoreAttributes: false; attributeNamePrefix: '@_' } =
    {
      ignoreAttributes: false,
      attributeNamePrefix: '@_'
    };

  fetchDatasetFromDataverse(
    fileID: number,
    siteURL: string
  ): Observable<string> {
    return this.http.get(
      `${siteURL}/api/access/datafile/${fileID}/metadata/ddi`,
      { responseType: 'text' }
    );
  }

  uploadDatasetToDataverse(
    siteURL: string,
    fileID: number,
    xml: string,
    apiKey: string | undefined
  ): Observable<any> {
    if (apiKey) {
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/xml',
          'X-Dataverse-key': apiKey
        })
      };
      return this.http.put(`${siteURL}/api/edit/${fileID}`, xml, httpOptions);
    } else {
      return of({ error: 'No Api Key' });
    }
  }

  fetchCrossTabulationFromVariables(
    variable: string
  ) {

    if (this.siteURL() && this.fileID()) {
      return this.http.get(
        `${this.siteURL()}/api/access/datafile/${this.fileID()}/?format=subset&variables=${variable}`,
        { responseType: 'text' }
      );
    } else {
      throw Error('No Site URL, File ID');
    }
  }

  XMLtoJSON(xml: string): JSONStructure {
    const parser = new XMLParser(this.parseOptions);
    const parsed = parser.parse(xml);
    return parsed;
  }

  JSONtoXML(json: JSONStructure): string {
    const parser = new XMLBuilder(this.parseOptions);
    const xml = parser.build(json);
    return xml;
  }
}
