import { Component, Input, OnInit } from '@angular/core';
import { Citation } from './header.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Input() studyDescription: { citation: Citation };

  ngOnInit(): void {
    console.log(this.studyDescription);
  }
}
