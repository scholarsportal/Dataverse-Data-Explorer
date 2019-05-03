import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-var-stat-dialog',
  templateUrl: './var-stat-dialog.component.html',
  styleUrls: ['./var-stat-dialog.component.css']
})
export class VarStatDialogComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  sortedCategories = [];

  ngOnInit() {
    if (typeof this.data.catgry !== 'undefined') {
      console.log(this.data.catgry);
      if (typeof this.data.catgry.length === 'undefined') {
        this.sortedCategories.push(this.data.catgry);
      } else {
        for (const i of this.data.catgry) {
          console.log(i);
          this.sortedCategories.push(i);
        }
      }
      console.log(this.sortedCategories);
      this.sortedCategories.sort((a, b) => {
        return a.catValu - b.catValu;
      });
    }
  }

  isUndefined(val) {
    return typeof val === 'undefined';
  }

  doesExist(val) {
    return typeof val !== 'undefined' && val > 1;
  }
}
