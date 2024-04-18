import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { map, Observable } from 'rxjs';
import { ddiJSONStructure, JSONStructure } from '../old.state/interface';
import { Store } from '@ngrx/store';

@Injectable({
  providedIn: 'root'
})
export class DdiService {
  store = inject(Store);
  http = inject(HttpClient);

  private parseOptions: { ignoreAttributes: false; attributeNamePrefix: '@_' } =
    {
      ignoreAttributes: false,
      attributeNamePrefix: '@_'
    };

  fetchDatasetFromDataverse(
    fileID: number,
    siteURL: string
  ): Observable<ddiJSONStructure> {
    return this.http.get(
      `${siteURL}/api/access/datafile/${fileID}/metadata/ddi`,
      { responseType: 'text' }
    ).pipe(
      map((data) => this.XMLtoJSON(data))
    );
  }

  uploadDatasetToDataverse(
    siteURL: string,
    fileID: number,
    jsonData: ddiJSONStructure,
    apiKey: string
  ): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/xml',
        'X-Dataverse-key': apiKey
      })
    };
    const xml = this.JSONtoXML(jsonData);
    return this.http.put(`${siteURL}/api/edit/${fileID}`, xml, httpOptions);
  }

  fetchCrossTabulationFromVariables(
    variable: string,
    siteURL: string,
    fileID: number
  ) {

    if (siteURL && fileID) {
      return this.http.get(
        `${siteURL}/api/access/datafile/${fileID}/?format=subset&variables=${variable}`,
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
