import {Component, OnInit, Inject, Output, EventEmitter, ElementRef, ViewChild} from '@angular/core';
import {MatDialogRef,MAT_DIALOG_DATA} from '@angular/material';
import { FormGroup, FormBuilder,Validators  } from '@angular/forms';

@Component({
  selector: 'app-var-dialog',
  templateUrl: './var-dialog.component.html',
  styleUrls: ['./var-dialog.component.css']
})
export class VarDialogComponent implements OnInit{
  @Output() parentUpdateVar: EventEmitter<any> = new EventEmitter<any>();
 form: FormGroup;
  public weights: any;
  public _variable_groups:any
  edit_objs:any=[];

  /////////
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              private formBuilder: FormBuilder,
              public dialogRef: MatDialogRef<VarDialogComponent>,

  ) { }


  ngOnInit() {

    //Note: data is passed as any array to allow for multi editing
    if (this.data.length>1) {
      var selected_ids=[];
      for (var i = 0; i < this.data.length; i++) {
        selected_ids.push( this.data[i]['@ID'])
      }
      var obj = {
        '@ID': selected_ids.join(","),
        '_group_edit': true
      }
      this.edit_objs=this.data
      this.data=obj;
    }else{
      this.data=this.data[0]
    }
    //add the groups - create an id with all of them
    var groups=[]
    for (var i = 0; i < this._variable_groups.length; i++) {
      var group_vars=this._variable_groups[i].varGrp["@var"].split(" ")
      if(group_vars.indexOf(this.data['@ID'])>-1){
        groups.push(this._variable_groups[i].varGrp["@ID"])
      }

    }
    this.data["_groups"]=[groups];//groups;
    this.addOmittedProperties(this.data)
   this.form = this.formBuilder.group({
      id: [ {value:this.data ? this.data['@ID' ] : '', disabled: true}  , Validators.required],
     name: [{value:this.data ? this.data['@name'] : '', disabled : true}, Validators.required ],
     labl: [this.data ? this.data['labl']["#text"] : '', Validators.required ],

     qstnLit: this.data ? this.data.qstn['qstnLit' ] : '',
     universe: this.data ? this.data.universe['#text'] : '',
     ivuInstr: this.data ? this.data.qstn['ivuInstr' ] : '',
     notes: this.data ? this.data.notes['#cdata'] : '',
     wgt: this.data ? this.data['@wgt' ] : '',
     wgt_var: this.data ? this.data['@wgt-var' ] : '',
     _groups: this.data ? this.data['_groups' ] : []
    })
  }
  isSelected(_id){
    console.log(_id)
    return true
  }
  addOmittedProperties(_obj) {
    if (typeof(_obj.qstn) == "undefined") {
      _obj.qstn = {}
    }
    if (typeof(_obj.labl) == "undefined") {
      _obj.labl = {'#text': ""}
    }
    if (typeof(_obj.universe) == "undefined") {
      _obj.universe = {
        '#text': "",
        '@clusion': ""
      }
    }
    if (typeof(_obj.notes) == "undefined") {
      _obj.notes = {
        '#cdata': "",
      }
    }
    return _obj
  }
  updateObjValues(_obj,form){

    //update label
    this.updateObjValue(_obj, 'labl.#text',form.controls.labl)
    //Literal Question - data.qstn.qstnLit
    this.updateObjValue(_obj,'qstn.qstnLit',form.controls.qstnLit)
    //Interviewer Instructions" value="{{data.qstn.ivuInstr
    this.updateObjValue(_obj,'qstn.ivuInstr',form.controls.ivuInstr)
    //Universe" value="{{data.universe
    this.updateObjValue(_obj,'universe.#text',form.controls.universe)
    //update notes if available data.notes
    //TODO surround notes with <![CDATA[ before saving back to xml
    this.updateObjValue(_obj,'notes.#cdata',form.controls.notes)
   //
    this.updateObjValue(_obj,'@wgt-var',form.controls.wgt_var)
   //
    if(form.controls.wgt.value==true){
      _obj['@wgt']="wgt"
    }
    //add variable to group
    if(form.controls._groups.dirty==true) {
      for (var i = 0; i < form.controls._groups.value.length; i++) {
       var group= this.getVariableGroup(form.controls._groups.value[i])
        //check to see if the selected group already has the selected variable
        var vars= group["@var"].split(" ")
        if(vars.indexOf(_obj["@ID"])==-1){
          vars.push(_obj["@ID"])
          //set the vars variable back to the group
          group["@var"]= vars.join(" ")
        }
      }
    }
    return _obj;
  }

  getVariableGroup(_id) {
    //loop though all the variables in the varaible groups and create a complete list
    for (var i = 0; i < this._variable_groups.length; i++) {
      if (this._variable_groups[i].varGrp["@ID"] == _id) {
        return this._variable_groups[i].varGrp;
      }
    }
  }
  updateObjValue(_obj,_var,_control) {
    if(_control.dirty==true){
      var stack = _var.split('.');
      while(stack.length>1){
        _obj = _obj[stack.shift()];
      }
      _obj[stack.shift()] = _control.value;

    }
  }

  submit(form) {
   if( this.edit_objs.length>0){
     //take all the objects from the
     for(var i =0; i<this.edit_objs.length;i++){
       this.data=this.edit_objs[i]
      this.addOmittedProperties(this.data)
      this.updateObjValues(this.data,form)
       this.parentUpdateVar.emit( this.data);
     }

   }else {
     this.updateObjValues(this.data,form)
     this.parentUpdateVar.emit(this.data);
   }

    this.dialogRef.close(`${form}`);

  }

}
