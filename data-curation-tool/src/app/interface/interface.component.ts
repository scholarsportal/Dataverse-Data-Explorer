import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { NgModule } from '@angular/core';
import {DdiService} from '../ddi.service';
import { xml2json } from '../../assets/js/xml2json';
import { json2xml } from '../../assets/js/json2xml';

import { MatButtonModule, } from '@angular/material';
import { VarComponent } from '../var/var.component';


@Component({
  selector: 'app-interface',
  templateUrl: './interface.component.html',
  styleUrls: ['./interface.component.css']
})
@NgModule({
  imports: [MatButtonModule],
  exports: [MatButtonModule],
})
export class InterfaceComponent implements OnInit {
  @ViewChild(VarComponent ) child;
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;

  data = null; // store the xml
  ddi_loaded = false; // show the loading
  title;
  _variable_groups = []; // store the variables in an array display
  _variables = []; // store the variables to be broadcast to child
  _id = null; // file id

  constructor(private ddiService: DdiService,
  ) {

  }

  ngOnInit() {
      let uri = null;
      uri = this.ddiService.getParameterByName('uri');
      this._id = this.ddiService.getParameterByName('dfId');
      console.log(this._id);

      const base_url = this.ddiService.getBaseUrl();

      if (!uri && this._id != null) {
          console.log('Interface setting id ' + this._id);
          uri = base_url + '/api/access/datafile/' + this._id + '/metadata/ddi';
          console.log(uri);

              // &key=8f18fd62-3c5b-48f9-87d7-3fd181e6b5ed';
      } else {
          if (!uri && !this._id) {
              // Just for testing purposes
              uri = base_url + '/assets/FOCN_SPSS_20150525_FORMATTED-ddi.xml';
              console.log(uri);
          }
      }
     this.getDDI(uri);

  }

  getDDI(_uri): void {

    const url = _uri;
    this.ddiService.getDDI(url).subscribe(
      data => this.processDDI(data),
      error => console.log(error),
      () => this.completeDDI()
    );
  }

  scrollNav(){
    const elm = this.myScrollContainer['_elementRef'].nativeElement
    elm.scrollTop = elm.scrollHeight;
  }
  processDDI(data) {

    const parser = new DOMParser();
    this.data = parser.parseFromString(data, 'text/xml');

  }

  completeDDI() {
    this.showVarsGroups()
    this.showVars()
    this.title = this.data.getElementsByTagName('stdyDscr')[0].getElementsByTagName('titl')[0].textContent
    this.showDDI();

  }

  showVarsGroups() {
    const elm = this.data.getElementsByTagName('varGrp');
    for (let i = 0; i < elm.length; i++) {
      const obj = JSON.parse(xml2json(elm[i], ''));
      this._variable_groups.push(obj);
    }
  }

  showVars() {
    const variables = [];
    const elm = this.data.getElementsByTagName('var');
    for (const elm_in of elm) {
      variables.push(JSON.parse(xml2json(elm_in, '')));
    }
    // flatten the table structure so it can be sorted/filtered appropriately
    const flat_array = []
    for (let i = 0; i < variables.length; i++) {
      const obj = variables[i]
      // make equivlant variable to allow sorting
     for (const j in obj.var) {
        if (j.indexOf('@') === 0) {
          obj.var[j.substring(1).toLowerCase()] = obj.var[j];
        }
     } /**/

        if (typeof (obj.var.catgry) !== 'undefined' ) {
            if (typeof (obj.var.catgry.length !== 'undefined')) {
                for (let k = 0; k < obj.var.catgry.length; k++) {
                    if (typeof (obj.var.catgry[k].catStat !== 'undefined' )) {
                        if (typeof (obj.var.catgry[k].catStat.length === 'undefined')) {
                            obj.var.catgry[k].catStat = [obj.var.catgry[k].catStat];
                        }
                    }
                }
            }
        }

      flat_array.push(obj.var);

    }
    //
    this._variables = flat_array
    this.child.onUpdateVars(this._variables);
    console.log(this._variables.length);
  }
  // pass the selected ids to the var table for display
  broadcastSubSetRows(ids) {
    this.child.onSubset(ids);

  }
  broadcastSelect(_id){
    // set the var table header to show the selection
    this.child.selectGroup(_id);
  }
  broadcastDraggedGroup(_id){
    this.child.draggedGroup(_id);
  }
  broadcastDeselectGroup(){
    this.child.disableSelectGroup();
  }
  showDDI() {
    this.ddi_loaded = true;
  }
  onSave(){
    console.log('GET ALL the JSON and convert it to XML');

    console.log(this.data);
    var dataDscr = this.data.getElementsByTagName("dataDscr")[0];
    console.log(dataDscr);
    for (var i=0;i<this._variables.length;i++)
    {
        console.log("----------")
        var variable = dataDscr.getElementsByTagName("var")[i];
        variable.getElementsByTagName("labl")[0].childNodes[0].nodeValue = this._variables[i]['labl']['#text'];
        if (typeof(variable.getElementsByTagName("qstn")[0]) == "undefined" && typeof(this._variables[i].qstn != "undefined")) {
            var qstn = variable.createElement("qstn");
            if (typeof(this._variables[i].qstn['qstnLit']) != 'undefined') {
                console.log(this._variables[i].qstn['qstnLit']);
               // qstn.createElement("qstnLit");
            }


        }


    }


    //  var elm = this.data.getElementsByTagName("var");
    //  for (var i = 0; i < elm.length; i++) {
    //      elm[i].parentNode.removeChild(elm[i]);
    //  }
   //  var obj = this.data.getElementsByTagName("stdyDscr");
    //  console.log(obj);
    // find the "dataDscr" element and
    // add the var groups
    // add the vars

  }
//
}
