import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnChanges {
  @Input() dataDescription: any

  ngOnChanges(changes: SimpleChanges): void {
    console.log(this.dataDescription)
  }


}
