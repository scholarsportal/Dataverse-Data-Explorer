import { Component, OnInit } from '@angular/core';
import { DdiService } from './service/ddi.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  private data;
  constructor(private ddi: DdiService) {}

  ngOnInit(): void {
    this.ddi.get('127759', 'https://borealisdata.ca').subscribe((data: any) => {
      if (data) console.log(data);
    });
  }
}
