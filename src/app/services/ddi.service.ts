import { HttpClient, HttpHeaders } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { map, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import {
  ApiResponse,
  ddiJSONStructure,
  ParsedCrossTabData,
} from '../new.state/xml/xml.interface';
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
    return this.http
      .get(url, {
        responseType: 'text',
      })
      .pipe(
        map((data) => {
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

  fetchCrossTabulationFromVariables(variables: string[], url: string) {
    return this.http
      .get(url, { responseType: 'text' })
      .pipe(map((data) => this.splitLines(variables, data)));
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
  splitLines(variable: string[], input: string): ParsedCrossTabData {
    // Split the input into lines
    const lines = input.trim().split('\n');

    // Extract headers from the first line (not used, but useful for clarity)
    const headers = lines[0].split('\t');

    // Ensure the number of keys matches the number of columns
    if (variable.length !== headers.length) {
      throw new Error(
        'The number of keys does not match the number of columns.',
      );
    }

    // Initialize the result object with empty arrays for each key
    const parsedData: ParsedCrossTabData = variable.reduce((acc, key) => {
      acc[key] = [];
      return acc;
    }, {} as ParsedCrossTabData);

    // Process each subsequent line
    lines.slice(1).forEach((line) => {
      const values = line.split('\t');
      values.forEach((value, index) => {
        parsedData[variable[index]].push(value);
      });
    });

    return parsedData;
  }
}
