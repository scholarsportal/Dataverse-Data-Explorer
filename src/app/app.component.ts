import { Component } from '@angular/core';
import {DdiService} from './ddi.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor() {}
  title = 'data-curation-tool';
}
