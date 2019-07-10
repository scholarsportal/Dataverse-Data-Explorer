import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DdiService } from '../ddi.service';

@Component({
  selector: 'app-var-dialog',
  templateUrl: './var-dialog.component.html',
  styleUrls: ['./var-dialog.component.css']
})
export class VarDialogComponent implements OnInit {
  @Output() parentUpdateVar: EventEmitter<any> = new EventEmitter<any>();
  form: FormGroup;
  public weights: any;
  public variableGroups: any;
  editObjs: any = [];
  weightsAndVariable: any;

  private originalVarWeight: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<VarDialogComponent>,
    private ddiService: DdiService
  ) {}

  ngOnInit() {
    // Note: data is passed as any array to allow for multi editing

    if (this.data.length > 1) {
      const selectedIds = [];
      for (let j = 0; j < this.data.length; j++) {
        selectedIds.push(this.data[j]['@ID']);
      }
      const obj = {
        '@ID': selectedIds.join(','),
        _group_edit: true
      };
      this.editObjs = this.data;
      this.data = obj;
    } else {
      this.data = this.data[0];
    }

    // add the groups - create an id with all of them
    const groups = [];
    for (let i = 0; i < this.variableGroups.length; i++) {
      const group_vars = this.variableGroups[i].varGrp['@var'].split(' ');
      if (group_vars.indexOf(this.data['@ID']) > -1) {
        groups.push(this.variableGroups[i].varGrp['@ID']);
      }
    }
    this.data['_groups'] = [groups]; // groups;
    this.addOmittedProperties(this.data);

    this.form = this.formBuilder.group({
      id: [
        { value: this.data ? this.data['@ID'] : '', disabled: true },
        Validators.required
      ],
      name: [
        { value: this.data ? this.data['@name'] : '', disabled: true },
        Validators.required
      ],
      labl: [this.data ? this.data['labl']['#text'] : '', Validators.required],

      qstnLit: this.data ? this.data.qstn['qstnLit'] : '',
      universe: this.data ? this.data.universe['#text'] : '',
      ivuInstr: this.data ? this.data.qstn['ivuInstr'] : '',
      postQTxt: this.data ? this.data.qstn['postQTxt'] : '',
      notes: this.data ? this.data.notes['#cdata'] : '',
      wgt: this.data ? this.data['@wgt'] : '',
      wgt_var: this.data ? this.data['@wgt-var'] : '',
      _groups: this.data ? this.data['_groups'] : []
    });

    this.originalVarWeight = this.data['@wgt-var'];
  }

  isSelected(_id) {
    return true;
  }

  addOmittedProperties(_obj) {
    if (typeof _obj.qstn === 'undefined') {
      _obj.qstn = {};
    }

    if (typeof _obj.labl === 'undefined') {
      _obj.labl = { '#text': '' };
    }

    if (typeof _obj.universe === 'undefined') {
      _obj.universe = {
        '#text': '',
        '@clusion': ''
      };
    }

    if (typeof _obj.notes === 'undefined') {
      _obj.notes = {
        '#cdata': ''
      };
    }
    return _obj;
  }
  updateObjValues(_obj, form) {
    // update label
    this.updateObjValue(_obj, 'labl.#text', form.controls.labl);
    // Literal Question - data.qstn.qstnLit
    this.updateObjValue(_obj, 'qstn.qstnLit', form.controls.qstnLit);
    // Interviewer Instructions - data.qstn.ivuInstr
    this.updateObjValue(_obj, 'qstn.ivuInstr', form.controls.ivuInstr);
    // Post Question - data.qstn.postQTxt
    this.updateObjValue(_obj, 'qstn.postQTxt', form.controls.postQTxt);
    // Universe - data.universe
    this.updateObjValue(_obj, 'universe.#text', form.controls.universe);
    // update notes if available data.notes
    // TODO surround notes with <![CDATA[ before saving back to xml
    this.updateObjValue(_obj, 'notes.#cdata', form.controls.notes);
    //
    this.updateObjValue(_obj, '@wgt-var', form.controls.wgt_var);
    //
    console.log(form.controls.wgt.value);
    if (form.controls.wgt.value === true || form.controls.wgt.value === 'wgt') {
      _obj['@wgt'] = 'wgt';
    } else {
      _obj['@wgt'] = '';
      // this.removeWeightedFrequencies(_obj);
    }
    // add variable to group
    if (form.controls._groups.dirty === true) {
      for (let i = 0; i < form.controls._groups.value.length; i++) {
        const group = this.getVariableGroup(form.controls._groups.value[i]);
        // check to see if the selected group already has the selected variable
        const vars = group['@var'].split(' ');
        if (vars.indexOf(_obj['@ID']) === -1) {
          vars.push(_obj['@ID']);
          // set the vars variable back to the group
          group['@var'] = vars.join(' ');
        }
      }
    }
    return _obj;
  }

  getVariableGroup(_id) {
    // loop though all the variables in the varaible groups and create a complete list
    for (let i = 0; i < this.variableGroups.length; i++) {
      if (this.variableGroups[i].varGrp['@ID'] === _id) {
        return this.variableGroups[i].varGrp;
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

    if (this.editObjs.length > 0) {
      // take all the objects from the
      for (const i of this.editObjs) {
        this.data = i;
        this.addOmittedProperties(this.data);
        this.updateObjValues(this.data, form);
        this.parentUpdateVar.emit(this.data);
      }
    } else {
      this.updateObjValues(this.data, form);
      this.parentUpdateVar.emit(this.data);
    }

    if (typeof this.data['@wgt-var'] !== 'undefined') {
      this.calculateWeightedFrequencies();
    } else {
      // Removing weighted frequency
      if (typeof this.data.catgry !== 'undefined') {
        for (let k = 0; k < this.data.catgry.length; k++) {
          if (
            typeof this.data.catgry[k].catStat !== 'undefined' &&
            this.data.catgry[k].catStat.length > 1
          ) {
            this.data.catgry[k].catStat.splice(1, 1);
          }
        }
      }
    }

    this.dialogRef.close(`${form}`);
  }
  cancel() {
    this.dialogRef.close();
    this.data['@wgt-var'] = this.originalVarWeight;
  }

  calculateWeightedFrequencies() {

    const weightVariable = this.data['@wgt-var'];
    const variable = this.data['@ID'];

    if (typeof weightVariable !== 'undefined') {

      const id = this.ddiService.getParameterByName('dfId');

      const baseUrl = this.ddiService.getBaseUrl();
      const key = this.ddiService.getParameterByName('key');
      let siteUrl = null;
      siteUrl = this.ddiService.getParameterByName('siteUrl');
      let detailUrl = null;
      console.log(siteUrl);

      if (!siteUrl) {
        detailUrl =
          baseUrl +
          '/api/access/datafile/' +
          id +
          '?format=subset&variables=' +
          variable +
          ',' +
          weightVariable +
          '&key=' +
          key;
      } else {
        detailUrl =
          siteUrl +
          '/api/access/datafile/' +
          id +
          '?format=subset&variables=' +
          variable +
          ',' +
          weightVariable +
          '&key=' +
          key;
      }


      this.ddiService
        .getDDI(detailUrl)
        .subscribe(
          data => this.processVariable(data),
          error => console.log(error),
          () => this.completeVariable()
        );
      //  http://localhost:8080/api/access/datafile/41?variables=v885
    }
  }

  processVariable(data) {
    this.weightsAndVariable = data.split('\n');
  }

  completeVariable() {
    const map_wf = new Map();
    for (let i = 1; i < this.weightsAndVariable.length; i++) {
      const vr = this.weightsAndVariable[i].split('\t');

      if (map_wf.has(vr[0])) {
        let wt = map_wf.get(vr[0]);
        wt = parseFloat(wt) + parseFloat(vr[1]);
        map_wf.set(vr[0], wt);
      } else {
        map_wf.set(vr[0], vr[1]);
      }
    }

    for (let i = 0; i < this.data.catgry.length; i++) {
      if (!map_wf.has(this.data.catgry[i].catValu)) {
        map_wf.set(this.data.catgry[i].catValu, 0);
      }

      if (typeof this.data.catgry[i].catStat !== 'undefined') {
        if (typeof this.data.catgry[i].catStat.length !== 'undefined') {
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
