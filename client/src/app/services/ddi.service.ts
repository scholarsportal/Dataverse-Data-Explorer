import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { Observable } from 'rxjs';
import { merge } from 'lodash'
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment.development';
@Injectable({
  providedIn: 'root',
})
export class DdiService {
  private searchURL = `${environment.domain}/download`;

  constructor(private http: HttpClient) {}

  get(fileID: string, siteURL: string): Observable<any> {

    const parameters = {
      siteURL: siteURL,
      fileID: fileID,
    };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const options = {
      headers: headers,
      params: parameters,
      withCredentials: true,
    };

    return this.http.get<any>(this.searchURL, options).pipe(
      map((data) => {
        if (data) {
          return data;
        }
      })
    );
  }

  download(data: any){
    console.log(data)
  }

  createXML(groups: any, variables: any, fileid: string, siteURL: string = 'https://borealisdata.ca'){
    // Fetch data from URL (it is an XML)
    const fetchurl = `https://borealisdata.ca/api/access/datafile/${fileid}/metadata/ddi`;

    // Make an HTTP request to the fetch URL and parse the XML response
    return this.http.get(fetchurl, { responseType: 'text' }).pipe(
      map((data: string) => {
        const parser = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: '@_'
        });

        const parsed = parser.parse(data)
        const dataDscr = parsed.codeBook.dataDscr
        dataDscr.var.forEach((data: any) => {
          data = merge(data, variables[data['@_ID']])
        })
        Object.keys(groups).forEach((data: string) => {
          // TODO: Merge old and new groups
        })
        console.log(parsed.codeBook.dataDscr)
        return parsed;
      }),
      map((resultingXML: any) => {
        // Process the resulting JSON
        // Modify variables based on the parsed XML data
        // Modify groups based on the parsed XML data
        const builder = new XMLBuilder(
          { arrayNodeName: 'codebook', ignoreAttributes: false }
        );

        // Convert the resulting JSON back into XML data
        return builder.build(resultingXML)
      })
    );
  }
}
