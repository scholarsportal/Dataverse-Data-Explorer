import { Component, OnInit } from '@angular/core';
import { DdiService } from './services/ddi.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'Data Curation Tool';
  data = undefined;
  studyDescription = undefined;
  dataDescription = undefined;

  constructor(private ddi: DdiService){}
  ngOnInit(): void {
    this.ddi.get('127759', 'https://borealisdata.ca').subscribe((data: any) => {
      if (data) {
        console.log(data);
        this.data = data;
        this.studyDescription = data.stdyDscr
        this.dataDescription = data.dataDscr
      }
    });
    }
}
