import { Component, OnInit,Output, EventEmitter, ViewChild,ElementRef } from '@angular/core';
import { NgModule } from '@angular/core';
import {DdiService} from "../ddi.service";
import { xml2json } from '../../assets/js/xml2json';
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

  data = null;//store the xml
  ddi_loaded = false;//show the loading
  title;
  _variable_groups = [];//store the variables in an array display
  _variables = [];//store the variables to be broadcast to child


  constructor(private ddiService: DdiService,
  ) {

  }
  private getParameterByName(name) {
    let url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
    if (!results) { return null; }
    if (!results[2]) { return ''; }
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }


  ngOnInit() {
    var uri=this.getParameterByName('uri');
    if(!uri){
        uri="http://localhost:4200/assets/lfs-71M0001-E-2018-january.xml"
    }
    //load the ddi from the server
    this.getDDI(uri)
  }

  getDDI(_uri): void {
    var url = _uri;
    //this.ddiService.getDDI(url);
    this.ddiService.getDDI(url).subscribe(
      data => this.processDDI(data),
      error => console.log(error),
      () => this.completeDDI()
    );
  }
  scrollNav(){
    var elm = this.myScrollContainer["_elementRef"].nativeElement
    elm.scrollTop = elm.scrollHeight;
  }

  processDDI(data) {
    var parser = new DOMParser();
    this.data = parser.parseFromString(data, "text/xml");

  }

  //

  //
  completeDDI() {
    this.showVarsGroups()
    this.showVars()
    this.title = this.data.getElementsByTagName("stdyDscr")[0].getElementsByTagName("titl")[0].textContent
    this.showDDI()
  }

  showVarsGroups() {
    var elm = this.data.getElementsByTagName("varGrp");
    for (var i = 0; i < elm.length; i++) {
      var obj = JSON.parse(xml2json(elm[i], ""));
      this._variable_groups.push(obj);
    }
  }

  showVars() {
    var variables=[];
    var elm = this.data.getElementsByTagName("var");
    for (var i = 0; i < elm.length; i++) {
      var obj = JSON.parse(xml2json(elm[i], ""));
      variables.push(obj);
    }
    //flatten the table structure so it can be sorted/filtered appropriately
    var flat_array=[]
    for(var i =0;i<variables.length;i++){
      var obj=variables[i]
      //make equivlant variable to allow sorting
     for(var j in obj.var){
        if(j.indexOf("@")==0){
          obj.var[j.substring(1).toLowerCase()]=obj.var[j]
        }
      } /**/

      flat_array.push(obj.var)
    }
    //
    this._variables=flat_array
    this.child.onUpdateVars(this._variables);
  }
  //pass the selected ids to the var table for display
  broadcastSubSetRows(ids){
    this.child.onSubset(ids);

  }
  broadcastSelect(_id){
    //set the var table header to show the selection
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
    console.log("GET ALL the JSON and convert it to XML")
    //find the "dataDscr" element and
    // add the var groups
    //add the vars

  }
//
}
