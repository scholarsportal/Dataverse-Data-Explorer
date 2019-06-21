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
  @Output() draggedGroup: EventEmitter<null> = new EventEmitter();
  @Output() disableSelectGroup: EventEmitter<null> = new EventEmitter();

  @ViewChild('titleInput') titleInput: ElementRef;

  draggedObj: any;
  dragged_over_obj: any;
  dragged_over_dir = 'before';

  ngOnInit() {}

  // Add a new group to the list and scroll to show it!
  addTab() {

    const numberOfGroups = this.variableGroups.length;
    if (numberOfGroups === 0 ||
      (this.variableGroups[numberOfGroups - 1].varGrp.labl !== 'undefined' &&
        this.variableGroups[numberOfGroups - 1].varGrp.labl.trim() !== '') ) {

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

      const var_group = {} as VarGroup;
      var_group.varGrp = {
        labl: '',
        '@var': '',
        '@ID': _id
      };

      var_group.varGrp['@var'] = '';
      this.variableGroups.push(var_group);

      const obj = this;
      obj.variableGroups[numberOfGroups].editable = true;

      setTimeout(() => {
        obj.titleInput.nativeElement.focus();
        obj.parentScrollNav.emit();
        obj.onGroupClick(var_group);
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

  dragstart($event) {
    this.source = $event.currentTarget;
    $event.dataTransfer.effectAllowed = 'move';
  }

  trackDragRow(_row) {
    this.draggedObj = _row;
  }

  dragenter($event, _row?) {
    const target = $event.currentTarget;
    if (!this.source) {
      // broadcast
      this.draggedGroup.emit($event.currentTarget.id);
      return;
    }
    if (_row === this.draggedObj) {
      return;
    }
    this.dragged_over_obj = _row; // keep track of the dragged over obj to later update the list
    // need to determine how
    if (this.isbefore(this.source, target)) {
      target.parentNode.insertBefore(this.source, target); // insert before
      this.dragged_over_dir = 'before';
    } else {
      target.parentNode.insertBefore(this.source, target.nextSibling); // insert after
      this.dragged_over_dir = 'after';
    }
  }

  isbefore(a, b) {
    if (a.parentNode === b.parentNode) {
      for (let cur = a; cur; cur = cur.previousSibling) {
        if (cur === b) {
          return true;
        }
      }
    }
    return false;
  }

  dragend($event) {
    // make sure we've dragged over something
    if (!this.dragged_over_obj) {
      return;
    }
    // update the master list
    // remove the object

    this.variableGroups.splice(
      this.variableGroups
        .map(function(e) {
          return e.varGrp['@ID'];
        })
        .indexOf(this.draggedObj.varGrp['@ID']),
      1
    );

    const index = this.variableGroups
      .map((e) => {
        return e.varGrp['@ID'];
      })
      .indexOf(this.dragged_over_obj.varGrp['@ID']);
    if (this.dragged_over_dir === 'before') {
      this.variableGroups.splice(index, 0, this.draggedObj);
    } else {
      this.variableGroups.splice(index + 1, 0, this.draggedObj);
    }
    delete this.draggedObj;
    delete this.source; // remove reference
  }
}
interface VarGroup {
  varGrp: {
    labl: string;
    '@var': string;
    '@ID': string;
  };
}
