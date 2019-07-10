import {Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef} from '@angular/core';

@Component({
  selector: 'app-var-group',
  templateUrl: './var-group.component.html',
  styleUrls: ['./var-group.component.css']
})

export class VarGroupComponent implements OnInit {
  constructor() {}

  allActive = true;

  source: any;
  @Input() variableGroups: any;
  @Output() subSetRows: EventEmitter<null> = new EventEmitter();
  @Output() parentScrollNav: EventEmitter<null> = new EventEmitter();
  @Output() selectGroup: EventEmitter<null> = new EventEmitter();
  @Output() disableSelectGroup: EventEmitter<null> = new EventEmitter();

  @ViewChild('titleInput') titleInput: ElementRef;

  ngOnInit() {}

  // Add a new group to the list and scroll to show it
  addTab() {

    const numberOfGroups = this.variableGroups.length;
    if (numberOfGroups === 0 || (this.variableGroups[numberOfGroups - 1].varGrp.labl !== 'undefined' && this.variableGroups[numberOfGroups - 1].varGrp.labl.trim() !== '') ) {

      // get the next id
      const ids = [];

      for (const i of this.variableGroups) {
        ids.push(Number(i.varGrp['@ID'].substring(2)));
      }

      ids.sort();

      let _id = 'VG';
      if (ids.length > 0) {
        _id += String(ids[ids.length - 1] + 1);
      } else {
        _id += '1';
      }

      const varGroup = {} as VarGroup;
      varGroup.varGrp = {
        labl: '',
        '@var': '',
        '@ID': _id
      };

      varGroup.varGrp['@var'] = '';
      this.variableGroups.push(varGroup);

      const obj = this;
      obj.variableGroups[numberOfGroups].editable = true;

      setTimeout(() => {
        obj.titleInput.nativeElement.focus();
        obj.parentScrollNav.emit();
        obj.onGroupClick(varGroup);
      }, 100);
    }

  }

  onGroupClick(_obj) {
    const obj = _obj;
    const vars = obj.varGrp['@var'].split(' ');
    this.subSetRows.emit(vars);
    this.showActive(obj.varGrp['@ID']);
    this.selectGroup.emit(obj.varGrp['@ID']);
  }

  onGroupDblClick(_obj) {
    this.renameGroup(_obj);
  }

  renameGroup(_obj) {
    _obj.editable = true;
  }

  renameGroupComplete(_obj, _val) {
    if (_val !== null && _val.trim() !== '') {
      _obj.varGrp.labl = _val.trim();
      _obj.editable = false;
    }
  }

  renameGroupCancel(_obj) {
    if (_obj.varGrp.labl !== null && _obj.varGrp.labl.trim() !== '') {
      _obj.editable = false;
    }
  }

  groupDelete(_obj) {
    for (let i = 0; i < this.variableGroups.length; i++) {
      if (this.variableGroups[i].varGrp['@ID'] === _obj.varGrp['@ID']) {
        this.variableGroups.splice(i, 1);
      }
    }
    this.showAll();
  }

  showActive(_id?) {
    this.allActive = false;
    // show it's active
    for (const i of this.variableGroups) {
      if (i.varGrp['@ID'] === _id) {
        i.active = true;
      } else {
        i.active = false;
      }
    }
  }

  showAll() {
    this.showActive();
    this.allActive = true;
    this.subSetRows.emit();
    this.disableSelectGroup.emit();
  }
}

interface VarGroup {
  varGrp: {
    labl: string;
    '@var': string;
    '@ID': string;
  };
}
