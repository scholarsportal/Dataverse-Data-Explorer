import { Component, OnInit,Inject } from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'app-var-stat-dialog',
  templateUrl: './var-stat-dialog.component.html',
  styleUrls: ['./var-stat-dialog.component.css']
})
export class VarStatDialogComponent implements OnInit {

  constructor( @Inject(MAT_DIALOG_DATA) public data: any) { }

  sorted_catagories=[];
  ngOnInit() {
   for(var i = 0; i<this.data.catgry.length;i++){
      this.sorted_catagories.push(this.data.catgry[i])
    }
    this.sorted_catagories.sort(function(a, b){
      return a.catValu - b.catValu}
    );
  }


}
