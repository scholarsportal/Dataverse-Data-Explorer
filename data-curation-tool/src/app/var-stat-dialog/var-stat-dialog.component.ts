import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-var-stat-dialog',
  templateUrl: './var-stat-dialog.component.html',
  styleUrls: ['./var-stat-dialog.component.css']
})
export class VarStatDialogComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  sorted_categories = [];

  ngOnInit() {
    if (typeof this.data.catgry !== 'undefined') {
      console.log(this.data.catgry);
      if (typeof this.data.catgry.length === 'undefined') {
        this.sorted_categories.push(this.data.catgry);
      } else {
        for (let i = 0; i < this.data.catgry.length; i++) {
          console.log(this.data.catgry[i]);
          this.sorted_categories.push(this.data.catgry[i]);
        }
      }
      console.log(this.sorted_categories);
      this.sorted_categories.sort(function(a, b) {
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
