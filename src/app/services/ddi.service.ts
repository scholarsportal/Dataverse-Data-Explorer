declare var Buffer: any;
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { Observable, of } from 'rxjs';
import { merge, take } from 'lodash';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment.development';
import { JSONStructure, Variable } from '../state/interface';
@Injectable({
  providedIn: 'root',
})
export class DdiService {
  private searchURL = `${environment.domain}/download`;
  private parseOptions: { ignoreAttributes: false; attributeNamePrefix: '@_' } =
    {
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    };

  constructor(private http: HttpClient) {}

  parseXML(data: any) {
    const parser = new XMLParser(this.parseOptions);
    const parsed = parser.parse(data);
    return parsed;
  }

  fetchDatasetFromDataverse(
    fileID: number,
    siteURL: string,
  ): Observable<string> {
    return this.http.get(
      `${siteURL}/api/access/datafile/${fileID}/metadata/ddi`,
      { responseType: 'text' },
    );
  }

  uploadDatasetToDataverse(
    siteURL: string,
    fileID: number,
    xml: string,
    apiKey: string | undefined,
  ): Observable<any> {
    if (apiKey) {
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/xml',
          'X-Dataverse-key': apiKey,
        }),
      };
      return this.http.put(`${siteURL}/api/edit/${fileID}`, xml, httpOptions);
    } else {
      return of({ error: 'No Api Key' });
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
