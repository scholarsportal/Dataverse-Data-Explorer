import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable()
export class DdiService {
  constructor(private http:HttpClient) { }
  getDDI(url:string) {
    return this.http.get(url,{responseType: 'text'});
  }

}
