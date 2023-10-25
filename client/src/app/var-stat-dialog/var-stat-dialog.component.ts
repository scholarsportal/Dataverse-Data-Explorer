import { Component, OnInit, Inject } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

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
      if (typeof this.data.catgry.length === 'undefined') {
        this.sortedCategories.push(this.data.catgry);
      } else {
        for (const i of this.data.catgry) {
          this.sortedCategories.push(i);
        }
      }
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
