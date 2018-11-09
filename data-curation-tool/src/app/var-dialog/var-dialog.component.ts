import {Component, OnInit, Inject, Output, Input, EventEmitter, ElementRef, ViewChild} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { FormGroup, FormBuilder, Validators  } from '@angular/forms';
import {DdiService} from '../ddi.service';

@Component({
  selector: 'app-var-dialog',
  templateUrl: './var-dialog.component.html',
  styleUrls: ['./var-dialog.component.css']
})
export class VarDialogComponent implements OnInit {
  @Output() parentUpdateVar: EventEmitter<any> = new EventEmitter<any>();
 form: FormGroup;
  public weights: any;
  public _variable_groups: any
  edit_objs: any = [];

  weights_and_variable: any;





  /////////
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              private formBuilder: FormBuilder,
              public dialogRef: MatDialogRef<VarDialogComponent>,
              private ddiService: DdiService

  ) {  }

  ngOnInit() {

    // Note: data is passed as any array to allow for multi editing
      console.log("OnInit");
      console.log(this.data);

    if (this.data.length > 1) {
      const selected_ids = [];
      for (let j = 0; j < this.data.length; j++) {
        selected_ids.push( this.data[j]['@ID']);
      }
      const obj = {
        '@ID': selected_ids.join(","),
        '_group_edit': true
      }
      this.edit_objs = this.data
      this.data = obj;
    } else {
      this.data = this.data[0];
    }
    // add the groups - create an id with all of them
    const groups = []
    for (let i = 0; i < this._variable_groups.length; i++) {
      const group_vars = this._variable_groups[i].varGrp['@var'].split(' ')
      if ( group_vars.indexOf(this.data['@ID'] ) > -1) {
        groups.push(this._variable_groups[i].varGrp['@ID']);
      }

    }
    this.data['_groups'] = [groups]; // groups;
    this.addOmittedProperties(this.data)
   this.form = this.formBuilder.group({
      id: [ {value: this.data ? this.data['@ID' ] : '', disabled: true}  , Validators.required],
     name: [{value: this.data ? this.data['@name'] : '', disabled : true}, Validators.required ],
     labl: [this.data ? this.data['labl']['#text'] : '', Validators.required ],

     qstnLit: this.data ? this.data.qstn['qstnLit' ] : '',
     universe: this.data ? this.data.universe['#text'] : '',
     ivuInstr: this.data ? this.data.qstn['ivuInstr' ] : '',
     notes: this.data ? this.data.notes['#cdata'] : '',
     wgt: this.data ? this.data['@wgt' ] : '',
     wgt_var: this.data ? this.data['@wgt-var' ] : '',
     _groups: this.data ? this.data['_groups' ] : []
    });
  }
  isSelected(_id){
    console.log(_id)
    return true;
  }
  addOmittedProperties(_obj) {
    if (typeof(_obj.qstn) === 'undefined') {
      _obj.qstn = {};
    }
    if (typeof(_obj.labl) === 'undefined') {
      _obj.labl = {'#text': ''};
    }
    if (typeof(_obj.universe) === 'undefined') {
      _obj.universe = {
        '#text': '',
        '@clusion': ''
      };
    }
    if (typeof(_obj.notes) === 'undefined') {
      _obj.notes = {
        '#cdata': '',
      };
    }
    return _obj;
  }
  updateObjValues(_obj, form){

    // update label
    this.updateObjValue(_obj,  'labl.#text', form.controls.labl)
    // Literal Question - data.qstn.qstnLit
    this.updateObjValue(_obj, 'qstn.qstnLit', form.controls.qstnLit)
    // Interviewer Instructions" value="{{data.qstn.ivuInstr
    this.updateObjValue(_obj, 'qstn.ivuInstr', form.controls.ivuInstr)
    // Universe" value="{{data.universe
    this.updateObjValue(_obj, 'universe.#text', form.controls.universe)
    // update notes if available data.notes
    // TODO surround notes with <![CDATA[ before saving back to xml
    this.updateObjValue(_obj, 'notes.#cdata', form.controls.notes)
   //
    this.updateObjValue(_obj, '@wgt-var', form.controls.wgt_var)
   //
    if (form.controls.wgt.value === true){
      _obj['@wgt'] = 'wgt';
    } else {
        _obj['@wgt'] = '';
        // this.removeWeightedFrequencies(_obj);
    }
    // add variable to group
    if (form.controls._groups.dirty === true) {
      for (let i = 0; i < form.controls._groups.value.length; i++) {
       const group = this.getVariableGroup(form.controls._groups.value[i])
        // check to see if the selected group already has the selected variable
        const vars = group['@var'].split(' ')
        if (vars.indexOf(_obj['@ID']) === -1) {
          vars.push(_obj['@ID'])
          // set the vars variable back to the group
          group['@var'] = vars.join(' ');
        }
      }
    }
    return _obj;
  }



  getVariableGroup(_id) {
    // loop though all the variables in the varaible groups and create a complete list
    for (let i = 0; i < this._variable_groups.length; i++) {
      if (this._variable_groups[i].varGrp['@ID'] === _id) {
        return this._variable_groups[i].varGrp;
      }
    }
  }
  updateObjValue(_obj, _var, _control) {
    if (_control.dirty === true) {
      const stack = _var.split('.');
      while (stack.length > 1) {
        _obj = _obj[stack.shift()];
      }
      _obj[stack.shift()] = _control.value;

    }

  }



  submit(form) {
      if (this.edit_objs.length > 0) {

          // take all the objects from the
          for (let i = 0; i < this.edit_objs.length; i++) {
              this.data = this.edit_objs[i]
              this.addOmittedProperties(this.data)
              this.updateObjValues(this.data, form)
              this.parentUpdateVar.emit(this.data);
          }

      } else {
          this.updateObjValues(this.data, form);
          this.parentUpdateVar.emit(this.data);
      }
      if (this.data['@wgt-var'] !== 'undefined') {
          this.calculateWeightedFrequencies();
      }

    this.dialogRef.close(`${form}`);

  }
  calculateWeightedFrequencies() {
      console.log ('Start calculate freq');

      console.log(this.data);

    const weight_variable = this.data['@wgt-var' ];
    const variable = this.data['@ID'];
    console.log(weight_variable);
    if (typeof(weight_variable) !== 'undefined') {
        console.log('variable defined');

        const id = this.ddiService.getParameterByName('dfId');

        const base_url = this.ddiService.getBaseUrl();
        const key = this.ddiService.getParameterByName('key');

        const detail_url = base_url + '/api/access/datafile/' + id + '?format=subset&variables=' + variable + ',' + weight_variable + '&key=' + key;

        console.log(detail_url);
        this.ddiService.getDDI(detail_url).subscribe(
            data => this.processVariable(data),
            error => console.log(error),
            () => this.completeVariable());
      //  http://localhost:8080/api/access/datafile/41?variables=v885
    }
    console.log('End calculate freq');


  }


  processVariable(data) {
      this.weights_and_variable = data.split('\n');
    }

    completeVariable() {
      const map_wf = new Map();
      for (let i = 1; i < this.weights_and_variable.length; i++) {
          const vr = this.weights_and_variable[i].split('\t');

          if (map_wf.has(vr[0])) {
              let wt = map_wf.get(vr[0]);
              wt = parseFloat(wt) + parseFloat(vr[1]);
              map_wf.set(vr[0], wt);
          } else {
              map_wf.set(vr[0], vr[1]);
          }
      }
      // map_wf.forEach((v, k) => {console.log(v + ' ' + k + ';'); });
      console.log('Complete');
      for (let i = 0; i < this.data.catgry.length; i++) {
          if (map_wf.has(this.data.catgry[i].catValu)) {
              console.log(this.data.catgry[i].catValu);
              if (typeof (this.data.catgry[i].catStat) !== 'undefined' ) {
                  if ( typeof( this.data.catgry[i].catStat.length) !== 'undefined') {
                      if (this.data.catgry[i].catStat.length > 1) {
                          this.data.catgry[i].catStat[1] = {
                              '@wgtd': 'wgtd',
                              '@type': 'freq',
                              '#text': map_wf.get(this.data.catgry[i].catValu)
                          };
                      } else {
                          this.data.catgry[i].catStat.push({
                              '@wgtd': 'wgtd',
                              '@type': 'freq',
                              '#text': map_wf.get(this.data.catgry[i].catValu)
                          });

                      }

                  }
              }

          }
      }




    }

}
