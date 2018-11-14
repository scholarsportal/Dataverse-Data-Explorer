import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-var-group',
  templateUrl: './var-group.component.html',
  styleUrls: ['./var-group.component.css']
})
export class VarGroupComponent implements OnInit {
  constructor() {}

  all_active = true;
  //selectedTab=0;
  source: any;
  @Input() _variable_groups: any;
  @Output() subSetRows: EventEmitter<null> = new EventEmitter();
  @Output() parentScrollNav: EventEmitter<null> = new EventEmitter();
  @Output() selectGroup: EventEmitter<null> = new EventEmitter();
  @Output() draggedGroup: EventEmitter<null> = new EventEmitter();
  @Output() disableSelectGroup: EventEmitter<null> = new EventEmitter();
  dragged_obj: any;
  dragged_over_obj: any;
  dragged_over_dir = 'before';
  ngOnInit() {}
  // Add a new group to the list and scroll to show it!
  addTab() {
    // get the next id
    var ids = [];
    for (var i = 0; i < this._variable_groups.length; i++) {
      ids.push(Number(this._variable_groups[i].varGrp['@ID'].substring(2)));
    }
    ids.sort();
    //
    var _id = 'VG';
    if (ids.length > 0) {
      _id += String(ids[ids.length - 1] + 1);
    } else {
      _id += '1';
    }

    var var_group = {} as VarGroup;
    var_group.varGrp = {
      labl: 'New Group ' + _id,
      '@var': '',
      '@ID': _id
    };

    var_group.varGrp['@var'] = '';
    //
    this._variable_groups.push(var_group);

    //
    // this.selectedTab = this._variable_groups.length-1;
    //
    var obj = this;

    setTimeout(function() {
      obj.parentScrollNav.emit();
      obj.onGroupClick(var_group);
    }, 100);
  }

  onGroupClick(_obj) {
    var obj = _obj;
    var vars = obj.varGrp['@var'].split(' ');
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
    _obj.varGrp.labl = _val;
    _obj.editable = false;
  }
  renameGroupCancel(_obj) {
    _obj.editable = false;
  }
  groupDelete(_obj) {
    for (var i = 0; i < this._variable_groups.length; i++) {
      if (this._variable_groups[i].varGrp['@ID'] == _obj.varGrp['@ID']) {
        this._variable_groups.splice(i, 1);
      }
    }
  }
  showActive(_id?) {
    this.all_active = false;
    //show its active
    for (var i = 0; i < this._variable_groups.length; i++) {
      if (this._variable_groups[i].varGrp['@ID'] == _id) {
        this._variable_groups[i].active = true;
      } else {
        this._variable_groups[i].active = false;
      }
    }
  }
  showAll() {
    this.showActive();
    this.all_active = true;
    this.subSetRows.emit();
    this.disableSelectGroup.emit();
  }
  //
  dragstart($event) {
    this.source = $event.currentTarget;
    $event.dataTransfer.effectAllowed = 'move';
  }
  trackDragRow(_row) {
    this.dragged_obj = _row;
  }
  //
  dragenter($event, _row?) {
    let target = $event.currentTarget;
    if (!this.source) {
      //broadcast
      this.draggedGroup.emit($event.currentTarget.id);
      return;
    }
    if (_row == this.dragged_obj) {
      return;
    }
    this.dragged_over_obj = _row; //keep track of the dragged over obj to later update the list
    //need to determine how
    if (this.isbefore(this.source, target)) {
      target.parentNode.insertBefore(this.source, target); // insert before
      this.dragged_over_dir = 'before';
    } else {
      target.parentNode.insertBefore(this.source, target.nextSibling); //insert after
      this.dragged_over_dir = 'after';
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
  dragend($event) {
    //make sure we've dragged over something
    if (!this.dragged_over_obj) {
      return;
    }
    //update the master list
    //remove the object

    this._variable_groups.splice(
      this._variable_groups
        .map(function(e) {
          return e.varGrp['@ID'];
        })
        .indexOf(this.dragged_obj.varGrp['@ID']),
      1
    );
    //
    var index = this._variable_groups
      .map(function(e) {
        return e.varGrp['@ID'];
      })
      .indexOf(this.dragged_over_obj.varGrp['@ID']);
    if (this.dragged_over_dir == 'before') {
      this._variable_groups.splice(index, 0, this.dragged_obj);
    } else {
      this._variable_groups.splice(index + 1, 0, this.dragged_obj);
    }
    delete this.dragged_obj;
    delete this.source; //remove reference
  }
}
interface VarGroup {
  varGrp: {
    labl: string;
    '@var': string;
    '@ID': string;
  };
}
