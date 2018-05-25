import { Component, OnInit, ViewChild, Input,IterableDiffers,Inject, ChangeDetectorRef,ElementRef } from '@angular/core';
import {MatPaginator, MatSort, MatTableDataSource,MatSnackBar,MatDialog, MatDialogRef} from '@angular/material';

import {VarDialogComponent} from '../var-dialog/var-dialog.component';
import {VarStatDialogComponent} from '../var-stat-dialog/var-stat-dialog.component';
import { FormControl } from '@angular/forms';
import {SelectionModel} from '@angular/cdk/collections';

@Component({
  selector: 'app-var',
  templateUrl: './var.component.html',
  styleUrls: ['./var.component.css']
})
export class VarComponent implements OnInit {
  datasource:MatTableDataSource<any>;
  public searchFilter = new FormControl();
  private filterValues = {search: '', _show: true}
  _variables;
  id;
  mode="all";
  source: any;
  dragged_obj:any;
  dragged_over_obj:any;
  dragged_over_dir="before";
  dragged_group:any;
  //
  _variable_groups_vars=[];
  @Input() _variable_groups : any;
  @ViewChild('group_select') private group_select: ElementRef;
  @ViewChild('group_edit') private group_edit: ElementRef;
  //
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  getDisplayedColumns(){
    var displayedColumns =  [];//'order_arrows'
    if(this.mode=="all"){
      displayedColumns = ['drag','select','id','name','labl','wgt-var','view','action']
    }else{
      displayedColumns=['drag', 'control','id','name','labl','wgt-var','view','action']
    }

    return displayedColumns;
  }
  //
  selection = new SelectionModel<Element>(true, []);
  public dialogRef: MatDialogRef<VarDialogComponent>
  public dialogStatRef: MatDialogRef<VarStatDialogComponent>
  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.datasource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if(this.isAllSelected() ){
      this.selection.clear()
    }else{
      for(var i = 0; i<this.datasource.data.length;i++){
        if(this.datasource.data[i]._show==true){
          this.selection.select(this.datasource.data[i])
        }

      }
    }
    this.checkSelection()
  }
  constructor(
   public dialog: MatDialog,
   public ref: ChangeDetectorRef,
   public snackBar: MatSnackBar
  ) {

  }

  ngOnInit() {
    this.searchFilter.valueChanges
      .subscribe(value => {
        this.filterValues['search'] = value;
        this.datasource.filter = JSON.stringify(this.filterValues)
      })
    //
    this.group_select['hidden']=true
  }

  //Entry point - when data has been loaded
  onUpdateVars(data) {
    this._variables = data
    //make sure all the data is set to show
    for(var i = 0; i< this._variables.length;i++) {
      this._variables[i]._show=true;
      //also make sure it has a labl
      if(typeof(this._variables[i].labl) =="undefined"){
        this._variables[i].labl={"#text":""};
      }
    };
    //show if var is _in_group
    this.updateGroupsVars()


    this.datasource = new MatTableDataSource( this._variables);
    this.datasource.sort = this.sort;
    this.datasource.paginator = this.paginator;
    //sorting
    this.datasource.sortingDataAccessor = (data: any, property: string) => {
      switch (property) {
        case 'id': return  +data["@ID"].replace(/\D/g,'');
        case 'name': return data["@name"];
        case 'labl': return data.labl["#text"];
        case '_order': return data._order;
        default: return '';
      }
    }
    //filter
    this.datasource.filterPredicate = this.createFilter();
  }
  createFilter(): (data: any, filter: string) => boolean {
    let filterFunction = function(data, filter) : boolean {
      let searchTerms = JSON.parse(filter)
      try {
        return (data['@ID'].toString().toLowerCase().indexOf(searchTerms.search.toLowerCase()) != -1
          || data['@name'].toString().toLowerCase().indexOf(searchTerms.search.toLowerCase()) != -1
          || data['labl']["#text"].toString().toLowerCase().indexOf(searchTerms.search.toLowerCase()) != -1)
      }catch(e){
        return false
      }
    }
    return filterFunction
  }
  onEdit(_id){
    this.id=_id;
    //get the data
    this.openDialog([this.getObjByID(_id,this._variables)])
    //
  }
  onSubset(_ids?){
    if(_ids==null){
      this.mode="all"
    }else{
      this.mode="group"
    }

    var data=[];
    for(var i = 0; i< this._variables.length;i++){
      var obj=this._variables[i];
      if( this.mode=="group"){
        if(_ids.indexOf(obj["@ID"]) !== -1){
          obj._order = _ids.indexOf(obj["@ID"])
          obj._show=true
        }else{
          obj._order = 99999;
          obj._show=false
        }

      }else if (this.mode=="all"){
        obj._order=null;
        obj._show=true
      }
    }
    obj._active=false
    this.filterValues['_show'] = true;
    this.datasource.filter = JSON.stringify(this.filterValues)
    //

    //Showing all
    this.checkSelection(); // and enable group downdown if applicable
    if(this.mode=="group"){
      this.sortByOrder();
    }

  }
  //when a single row has been updated
  onUpdateVar(){
    this.ref.detectChanges();
  }
  //get the var
  getObjByID(_id,_data){
    for(var i =0;i<_data.length;i++) {
      var obj=_data[i]
      if(obj["@ID"]==_id){
        return obj;
      }
    }
  }
  //get the group
  getObjByIDNested(_id,_data){
    for(var i =0;i<_data.length;i++) {
      var obj=_data[i]
      if(obj.varGrp["@ID"]==_id){
        return obj;
      }

    }
  }
  getWeights(){
    var weights=[];
    for(var i = 0; i< this._variables.length;i++) {
      if(this._variables[i]["@wgt"]=="wgt"){
        weights.push(this._variables[i]['@ID']);
      }

    }
    return weights
  }
  openDialog(data): void {
    this.dialogRef = this.dialog.open(VarDialogComponent, {
      width: '550px',
      data: data,
      panelClass : "field_width"
    });
   var  weights=this.getWeights();
    this.dialogRef.componentInstance.weights=weights
    this.dialogRef.componentInstance._variable_groups=this._variable_groups
    const sub = this.dialogRef.componentInstance.parentUpdateVar.subscribe(() => {
      this.onUpdateVar();
    });
  }
  checkSelection(){
    //when are in all view mode
    if(this.mode=="all") {

      if (this.selection.selected.length > 0) {
        this.group_select['disabled'] = "false"
        this.group_select['hidden']=false
      } else {
        this.group_select['disabled']  = "true"
        this.group_select['hidden']=true;
      }
    }
    if (this.selection.selected.length > 1) {
      this.group_edit['disabled'] = "false"
    } else {
      this.group_edit['disabled']  = "true"
    }

  }
  addToGroup(_id) {
    //first get the group
    var obj = this.getObjByIDNested(_id, this._variable_groups);
    var vars = obj.varGrp["@var"].split(" ");
    for (var i = 0; i < this.selection.selected.length; i++) {
      var selected = this.selection.selected[i]
      if (vars.indexOf(selected['@ID']) == -1) {
        vars.push(selected['@ID'])
      }
    }
    //reset vars to new selection
    obj.varGrp["@var"] = vars.join(" ");

    //reset the dropdown
    this.group_select['value']=0
    //
    this.updateGroupsVars();
  }

  selectGroup(_id){
    this.group_select['value']=_id;

    this.selection.clear()
  }
  disableSelectGroup(){
    this.group_select['value']=0
  }
  updateGroupsVars(){
    this.getVariableGroupsVars();
    for(var i = 0; i< this._variables.length;i++) {
      if(this._variable_groups_vars.indexOf(this._variables[i]["@ID"])>-1){
        this._variables[i]._in_group=true;
      }else{
        this._variables[i]._in_group=false;
      }
    };
  }

  getVariableGroupsVars(){
    this._variable_groups_vars=[];
    //loop though all the variables in the varaible groups and create a complete list
    for (var i = 0; i < this._variable_groups.length; i++) {
      var obj=this._variable_groups[i];
      var vars = obj.varGrp["@var"].split(" ");
      for (var j = 0; j < vars.length; j++) {
        if(this._variable_groups_vars.indexOf(vars[j])==-1){
          this._variable_groups_vars.push(vars[j]);
        }
      }
    }
  }

  sortByOrder(){
    this.sort.sort({id: '', start: 'asc', disableClear: false});
    this.sort.sort({id: '_order', start: 'asc', disableClear: false});

  }
  dragstart($event) {
    this.source = $event.currentTarget;
    $event.dataTransfer.effectAllowed = 'move';
  }
  trackDragRow(_row){
    this.dragged_obj=_row
  }
  //
  dragenter($event,_row) {
    let target = $event.currentTarget;
    //let new_dragged_over_obj=false;
    if(_row == this.dragged_obj){
     return
    }
    this.dragged_over_obj=_row;//keep track of the dragged over obj to later update the list
    //
    if (this.isbefore(this.source, target)) {
       target.parentNode.insertBefore(this.source, target); // insert before
       this.dragged_over_dir = "before";
    } else {
      //note that "after" triggers once per new_dragged_over_obj and thus must be stored to ensure proper placement of dragged object
      target.parentNode.insertBefore(this.source, target.nextSibling); //insert after
      this.dragged_over_dir="after";
    }
  }
  isbefore(a, b) {
    if (a.parentNode == b.parentNode) {
      for (var cur = a; cur; cur = cur.previousSibling) {
        if (cur === b) {
          return true;
        }
      }
    }
    return false;
  }
  highlightRow(_row){

    _row._active=true;
  }
  dragend($event){
    //
    this.dragged_obj._active=false;//remove the highlight
    //
    let id=this.dragged_obj["@ID"]
    if(this.dragged_group){
      //add the dragged var to the dragged group
      var obj = this.getObjByIDNested(this.dragged_group, this._variable_groups);
      var vars = obj.varGrp["@var"].split(" ");
      vars.push(id);
      //
      obj.varGrp["@var"] = vars.join(" ");
      //if we are currently looking at the group which has been dragged to update it
      if(this.group_select['value']==this.dragged_group){
        this.updateGroupsVars();
        this.onSubset(vars)
      }
      delete this.dragged_group;
      return

    }

    //take the last dragged over item and place the dragged item either before or after
    var obj=this.updateGroupVars("drag",id)
    this.showMSG('Changed the position of '+id)

  }
  onAdd(_id){
    var obj=this.updateGroupVars("add",_id)
    this.showMSG('Added '+_id+" to " + obj.varGrp.labl)

  }
  onRemove(_id){
    var obj=this.updateGroupVars("remove",_id)
    this.showMSG('Removed '+_id+" from " + obj.varGrp.labl)
  }
  updateGroupVars(_type,_id){
    var obj = this.getObjByIDNested(this.group_select['value'], this._variable_groups);
    var vars = obj.varGrp["@var"].split(" ");
    //
    if(_type=="remove") {
      vars.splice(vars.indexOf(_id), 1);//remove from array
    }else if(_type=="add") {
      vars.push(_id);//add to end of array
    }else if(_type=="drag") {
      //check if this.dragged_over_obj is not part of the group

        //check to see if this var is part of the group -- otherwise add it.
        if(vars.indexOf(_id)>-1){
          vars.splice(vars.indexOf(_id),1);//remove from array
        }
        //find out the position of the dragged_over_obj
        var index=vars.indexOf(this.dragged_over_obj["@ID"]);

        if(this.dragged_over_dir=="before" &&  this.dragged_over_obj._show){
          //case 1. reorder variable in group
          vars.splice(index,0, _id);
        }


    }
    //
    obj.varGrp["@var"] = vars.join(" ");
    //reset the table
    this.updateGroupsVars();
    this.onSubset(vars)
    return obj;
  }
  onEditSelected(){
    var selected_objs=[]
    //show the popup but only allow certain fields be be updated
    for (var i = 0; i < this.selection.selected.length; i++) {
      var selected = this.selection.selected[i]
      selected_objs.push( selected)
    }
    this.openDialog(selected_objs)
  }
  draggedGroup(_id){
    this.dragged_group=_id;
  }
  onView(_id){
   var data= this.getObjByID(_id,this._variables)
    //open a dialog showing the variables
    this.dialogStatRef = this.dialog.open(VarStatDialogComponent, {
      width: '550px',
      data: data,
      panelClass : "field_width"
    });

  }
  showMSG(_msg){
    this.snackBar.open(_msg,'',
      {
        duration: 1000,
      });
  }
}

