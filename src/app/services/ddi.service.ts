import { HttpClient, HttpHeaders } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { map, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import {
  ApiResponse,
  ddiJSONStructure,
  ParsedCrossTabData,
} from '../new.state/xml/xml.interface';
import { selectDatasetInfo } from '../new.state/xml/xml.selectors';
import { withNormalizedGroups } from '../new.state/xml/xml.util';

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

  // parseTagValue MUST remain false. Dataverse's /api/edit endpoint matches
  // <catValu> against its database by exact string equality, so zero-padded
  // codes ("01") and decimal codes ("1.0") must round-trip byte-for-byte.
  private parseOptions = {
    ignoreAttributes: false as const,
    attributeNamePrefix: '@_',
    parseTagValue: false,
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

  // Every save and export goes through here. Group edits anywhere in the app
  // can leave an empty var list, which Dataverse rejects with a 500.
  JSONtoXML(json: ddiJSONStructure): string {
    const parser = new XMLBuilder(this.parseOptions);
    return parser.build(withNormalizedGroups(json));
  }

  // Dataverse tab subsets quote character values ("01") and may use CRLF
  // line endings. Strip both so values match DDI catValu codes exactly.
  private cleanTabField(raw: string): string {
    let value = raw.trim();
    if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1).replace(/\\"/g, '"');
    }
    return value;
  }

  // From: https://stackoverflow.com/a/52947649
  splitLines(variable: string[], input: string): ParsedCrossTabData {
    // Split the input into lines
    const lines = input.trim().split(/\r?\n/);

    // Extract headers from the first line (not used, but useful for clarity)
    const headers = lines[0].split('\t').map((header) => this.cleanTabField(header));

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
        parsedData[variable[index]].push(this.cleanTabField(value));
      });
    });

    return parsedData;
  }
}
