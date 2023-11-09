import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class DdiService {
  private searchInput = new BehaviorSubject('');
  currentSearchInput = this.searchInput.asObservable();

  constructor(private http: HttpClient) {}
  getDDI(url: string) {
    console.log(url);
    return this.http.get(url, { responseType: 'text' });
  }

  putDDI(url: string, body: string, key: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/xml',
        'X-Dataverse-key': key
      })
    };
    return this.http.put(url, body, httpOptions);
    // return this.http.post(url,body, httpOptions);
  }

  getParameterByName(name) {
    const url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    const results = regex.exec(url);
    if (!results) {
      return null;
    }
    if (!results[2]) {
      return '';
    }
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }
  getBaseUrl() {
    const protocol = window.location.protocol;
    const host = window.location.hostname;
    const port = window.location.port;
    /*  if (port === '4200') {
      port = '8080';
    }*/
    let baseUrl = protocol + '//' + host;
    if (port != null || typeof port !== 'undefined') {
      baseUrl = baseUrl + ':' + port;
    }
    return baseUrl;
  }

  clearSearch() {
    this.searchInput.next('');
  }
}
