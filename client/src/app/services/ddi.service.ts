import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment.development';
@Injectable({
  providedIn: 'root',
})
export class DdiService {
  private searchURL = `${environment.domain}/`;

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
}
