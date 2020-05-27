import {
  Component,
  OnInit,
  ViewChild,
  Input,
  ChangeDetectorRef,
  ElementRef, HostListener
} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { VarDialogComponent } from '../var-dialog/var-dialog.component';
import { VarStatDialogComponent } from '../var-stat-dialog/var-stat-dialog.component';
import { FormControl } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import {DdiService} from '../ddi.service';

import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-var',
  templateUrl: './var.component.html',
  styleUrls: ['./var.component.css']
})
export class VarComponent implements OnInit {

  datasource: MatTableDataSource<any>;
  public searchFilter = new FormControl();
  selection = new SelectionModel<Element>(true, []);
  public dialogRef: MatDialogRef<VarDialogComponent>;
  public dialogStatRef: MatDialogRef<VarStatDialogComponent>;
  private filterValues = { search: '', _show: true };
  startSelection = null;
  endSelection = null;
  renderedData = null;

  startSelectionGroup = null;
  endSelectionGroup = null;

  _variables;
  id;
  mode = 'all';
  source: any;

  varChange = false;

  variableGroupsVars = [];
  @Input() variableGroups: any;
  @ViewChild('group_select', { static: true }) private group_select: ElementRef;
  @ViewChild('group_edit') private group_edit: ElementRef;

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  getDisplayedColumns() {
    let displayedColumns = []; // 'order_arrows'
    if (this.mode === 'all') {
      displayedColumns = [
        'select',
        'id',
        'name',
        'labl',
        'wgt-var',
        'view',
        'action'
      ];
    } else {
      displayedColumns = [
        'control',
        'id',
        'name',
        'labl',
        'wgt-var',
        'view',
        'action'
      ];
    }

    return displayedColumns;
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.datasource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      for (let i = 0; i < this.datasource.data.length; i++) {
        if (this.datasource.data[i]._show === true) {
          this.selection.select(this.datasource.data[i]);
        }
      }
    }
    this.checkSelection();
  }
  constructor(
    public dialog: MatDialog,
    public ref: ChangeDetectorRef,
    public snackBar: MatSnackBar,
    private ddiService: DdiService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.ddiService.currentSearchInput.subscribe(message => this.searchFilter.patchValue(''));
    this.searchFilter.valueChanges.subscribe(value => {
      this.filterValues['search'] = value;
      this.datasource.filter = JSON.stringify(this.filterValues);
    });

    this.group_select['hidden'] = true;
  }

  getPageSizeOptions(): number[] {
    if (typeof this.datasource !== 'undefined') {
      if (this.datasource.paginator.length > 100) {
        return [25, 50, 100, this.datasource.paginator.length];
      } else if (this.datasource.paginator.length > 50 && this.datasource.paginator.length < 100) {
        return [25, 50, this.datasource.paginator.length];
      } else if (this.datasource.paginator.length > 25 && this.datasource.paginator.length < 50) {
        return [25, this.datasource.paginator.length];
      } else if (this.datasource.paginator.length >= 0 && this.datasource.paginator.length < 25) {
        return [this.datasource.paginator.length];
      } else {
        return [25, 50, 100];
      }
    } else {
      return [25];
    }

  }

  // Entry point - when data has been loaded
  onUpdateVars(data) {
    this._variables = data;
    // make sure all the data is set to show
    for (let i = 0; i < this._variables.length; i++) {
      this._variables[i]._show = true;
      // also make sure it has a label
      if (typeof this._variables[i].labl === 'undefined') {
        this._variables[i].labl = { '#text': '',  '@level': 'variable' };
      }
    }
    // show if var is _in_group
    this.updateGroupsVars(true);
    this.datasource = new MatTableDataSource(this._variables);
    this.datasource.sort = this.sort;

    this.datasource.paginator = this.paginator;
    // sorting
    this.datasource.sortingDataAccessor = (datasort: any, property: string) => {
      switch (property) {
        case 'id':
          return +datasort['@ID'].replace(/\D/g, '');
        case 'name':
          return datasort['@name'];
        case 'labl':
          return datasort.labl['#text'];
        case '_order':
          return datasort._order;
        case 'wgt-var':
          if (datasort['@wgt'] === 'wgt') {
            return datasort['@wgt'];
          }
          return datasort['@wgt-var'];
        default:
          return '';
      }
    };
    // filter
    this.datasource.filterPredicate = this.createFilter();
    this.datasource.connect().subscribe(d => this.renderedData = d);
  }
  createFilter(): (data: any, filter: string) => boolean {
    const filterFunction = function(data, filter): boolean {
      const searchTerms = JSON.parse(filter);
      try {
        return (
          data['@ID']
            .toString()
            .toLowerCase()
            .indexOf(searchTerms.search.toLowerCase()) !== -1 ||
          data['@name']
            .toString()
            .toLowerCase()
            .indexOf(searchTerms.search.toLowerCase()) !== -1 ||
          data['labl']['#text']
            .toString()
            .toLowerCase()
            .indexOf(searchTerms.search.toLowerCase()) !== -1
        );
      } catch (e) {
        return false;
      }
    };
    return filterFunction;
  }
  onEdit(_id) {
    this.id = _id;
    // get the data
    this.openDialog([this.getObjByID(_id, this._variables)]);
  }
  onSubset(_ids, sort?) {
    if (_ids == null) {
      this.mode = 'all';
    } else {
      this.mode = 'group';
    }

    const data = [];
    let ungroupedCount = 0;
    let obj;
    for (let i = 0; i < this._variables.length; i++) {
      obj = this._variables[i];
      if (this.mode === 'group') {
        if (_ids.indexOf(obj['@ID']) !== -1) {
          obj._order = _ids.indexOf(obj['@ID']);
          obj._show = true;
          data.push(obj);
        } else {
          ungroupedCount += 1;
          obj._order = 99999 + ungroupedCount;
          obj._show = false;
        }
      } else if (this.mode === 'all') {
        obj._order = null;
        obj._show = true;
        data.push(obj);
      }
    }
    obj._active = false;
    this.filterValues['_show'] = true;
    this.datasource.filter = JSON.stringify(this.filterValues);

    // Showing all
    this.checkSelection(); // and enable group dropdown if applicable
    this.datasource.data = data;
    if (this.mode === 'group') {
      if (sort == null || sort) {
        this.sortByOrder();
        this.paginator.firstPage();
      }
    } else {
      if (sort == null || sort) {
        this.sort.sort({id: '', start: 'asc', disableClear: false});
        this.paginator.firstPage();
      }
    }

  }

  // when a single row has been updated
  onUpdateVar() {
    this.varChange = true;
    this.removeWeightedFreq();
    this.ref.detectChanges();
  }

  removeWeightedFreq() {
    const weights = this.getWeights();
    const weightsSet = new Set(weights);

    for (let i = 0; i < this._variables.length; i++) {
      if (typeof this._variables[i]['@wgt-var'] !== 'undefined') {
        if (this._variables[i]['@wgt-var'] !== '') {
          if (!weightsSet.has(this._variables[i]['@wgt-var'])) {
            this._variables[i]['@wgt-var'] = '';
            for (let k = 0; k < this._variables[i].catgry.length; k++) {
              this._variables[i].catgry[k].catStat.splice(1, 1);
            }
          }
        }
      }
    }
  }

  // get the var
  getObjByID(_id, _data) {
    for (const i of _data) {
      const obj = i;
      if (obj['@ID'] === _id) {
        return obj;
      }
    }
  }

  // get the group
  getObjByIDNested(_id, _data) {
    for (const i of _data) {
      const obj = i;
      if (obj.varGrp['@ID'] === _id) {
        return obj;
      }
    }
  }

  getWeightsNames() {
    const weightsNames = [];
    for (let i = 0; i < this._variables.length; i++) {
      if (this._variables[i]['@wgt'] === 'wgt') {
        weightsNames.push(this._variables[i]);
      }
    }
    return weightsNames;
  }

  getWeights() {
    const weights = [];
    for (let i = 0; i < this._variables.length; i++) {
      if (this._variables[i]['@wgt'] === 'wgt') {
        weights.push(this._variables[i]['@ID']);
      }
    }
    return weights;
  }

  openDialog(data): void {
    this.dialogRef = this.dialog.open(VarDialogComponent, {
      width: '35em',
      data: data,
      panelClass: 'field_width'
    });
    const weightsNames = this.getWeightsNames();
    this.dialogRef.componentInstance.weights = weightsNames;
    this.dialogRef.componentInstance.variableGroups = this.variableGroups;
    const sub = this.dialogRef.componentInstance.parentUpdateVar.subscribe(
      () => {
        this.onUpdateVar();
        for (let i = 0; i < this.variableGroups.length; i++) {
          if (this.variableGroups[i].active) {
            const vars = this.variableGroups[i].varGrp['@var'].split(' ');
            this.onSubset(vars);
            break;
          }
        }
      }
    );
  }

  multipleToggle(row, i, event) {
    let selectFlag = false;
    if (this.selection.isSelected(row) ) {
      selectFlag = true;
      this.selection.deselect(row);
    } else {
      selectFlag = false;
      this.selection.select(row) ;
    }
    if (this.startSelection == null) {
      this.startSelection =  i;
    } else {
      this.endSelection = i;
      let currentIndex = 0;
      this.renderedData.forEach(r => {
        if (this.startSelection <= this.endSelection) {
          if (currentIndex >= this.startSelection && currentIndex <= this.endSelection) {
            if (selectFlag) {
              this.selection.deselect(r);
            } else {
              this.selection.select(r);
            }
          }
          currentIndex++;
        } else {
          if (currentIndex >= this.endSelection && currentIndex <= this.startSelection) {
            if (selectFlag) {
              this.selection.deselect(r);
            } else {
              this.selection.select(r);
            }
          }
          currentIndex++;
        }
      });

      this.startSelection = null;
      this.endSelection = null;
    }

    this.checkSelection();
  }

  singleToggle(i, event) {
    this.startSelection = i;
    this.endSelection = null;
    event.stopPropagation();
  }
  checkSelection() {
    // when are in all view mode
    if (this.mode === 'all') {
      if (this.selection.selected.length > 0) {
        this.group_select['disabled'] = 'false';
        this.group_select['hidden'] = false;
      } else {
        this.group_select['disabled'] = 'true';
        this.group_select['hidden'] = true;
      }
    }
    if (this.selection.selected.length > 1) {
      this.group_edit['disabled'] = 'false';
    } else {
      this.group_edit['disabled'] = 'true';
    }
  }
  addToGroup(_id) {
    // first get the group
    const obj = this.getObjByIDNested(_id, this.variableGroups);
    const vars = obj.varGrp['@var'].split(' ');
    for (const i of this.selection.selected) {
      const selected = i;
      if (vars.indexOf(selected['@ID']) === -1) {
        vars.push(selected['@ID']);
      }
    }
    // reset vars to new selection
    obj.varGrp['@var'] = vars.join(' ');

    // reset the dropdown
    this.group_select['value'] = 0;
    //
    this.updateGroupsVars();
    this.showMSG(this.translate.instant('GROUPS.ADDEDTO') + obj.varGrp.labl);
    this.selection.clear();
  }

  selectGroup(_id) {
    this.group_select['value'] = _id;

    this.selection.clear();
  }
  disableSelectGroup() {
    this.group_select['value'] = 0;
  }
  updateGroupsVars(load?) {
    this.getVariableGroupsVars();
    for (let i = 0; i < this._variables.length; i++) {
      if (this.variableGroupsVars.indexOf(this._variables[i]['@ID']) > -1) {
        this._variables[i]._in_group = true;
      } else {
        this._variables[i]._in_group = false;
      }
    }
    if (load == null || !load) {
      this.varChange = true;
    }
  }

  getVariableGroupsVars() {
    this.variableGroupsVars = [];
    // loop though all the variables in the varaible groups and create a complete list
    for (let i = 0; i < this.variableGroups.length; i++) {
      const obj = this.variableGroups[i];
      const vars = obj.varGrp['@var'].split(' ');
      for (let j = 0; j < vars.length; j++) {
        if (this.variableGroupsVars.indexOf(vars[j]) === -1) {
          this.variableGroupsVars.push(vars[j]);
        }
      }
    }
  }

  sortByOrder() {
    this.sort.sort({ id: '', start: 'asc', disableClear: false });
    this.sort.sort({ id: '_order', start: 'asc', disableClear: false });
  }

  highlightRow(_row) {
    _row._active = true;
  }

  onAdd(_id) {
    const obj = this.updateGroupVars('add', _id);
    this.showMSG(this.translate.instant('GROUPS.ADDEDID', { _id }) + obj.varGrp.labl);
  }

  onRemoveAll() {
    const obj = this.getObjByIDNested(
        this.group_select['value'],
        this.variableGroups
    );

    const vars = obj.varGrp['@var'].split(' ');
    vars.splice(0, vars.length); // empty array (remove all elements from group
    obj.varGrp['@var'] = vars.join(' ');
    this.updateGroupsVars();
    this.onSubset(vars);
  }

  multipleToggleRemove(row, i, event) {
    if (this.startSelectionGroup == null) {
      this.startSelectionGroup =  i;
    } else {
      this.endSelectionGroup =  i;
      console.log(this.datasource.data);
      let currentIndex = 0;
      this.renderedData.forEach(r => {
        if (this.startSelectionGroup <= this.endSelectionGroup) {
          if (currentIndex >= this.startSelectionGroup && currentIndex <= this.endSelectionGroup) {
            const obj = this.updateGroupVars('remove', r['@ID'], false);
            this.showMSG(this.translate.instant('GROUPS.REMOVE'));
          }
          currentIndex++;
        } else {
          if (currentIndex >= this.endSelectionGroup && currentIndex <= this.startSelectionGroup) {
            const obj = this.updateGroupVars('remove', r['@ID'], false);
            this.showMSG(this.translate.instant('GROUPS.REMOVE'));
          }
          currentIndex++;
        }
      });

      this.startSelectionGroup = null;
      this.endSelectionGroup = null;
    }
    event.stopPropagation();
  }
  onRemove(_id) {
    const obj = this.updateGroupVars('remove', _id, false);
    this.showMSG(this.translate.instant('GROUPS.REMOVEDID', {_id}) + obj.varGrp.labl);
  }
  updateGroupVars(_type, _id, sort?) {
    const obj = this.getObjByIDNested(
      this.group_select['value'],
      this.variableGroups
    );
    const vars = obj.varGrp['@var'].split(' ');
    //
    if (_type === 'remove') {
      vars.splice(vars.indexOf(_id), 1); // remove from array
    } else if (_type === 'add') {
      vars.push(_id); // add to end of array
    }
    //
    obj.varGrp['@var'] = vars.join(' ');
    // reset the table
    this.updateGroupsVars();
    this.onSubset(vars, sort);
    return obj;
  }
  onEditSelected() {
    const selectedObjs = [];
    // show the popup but only allow certain fields be be updated
    for (const i of this.selection.selected) {
      const selected = i;
      selectedObjs.push(selected);
    }
    this.openDialog(selectedObjs);
  }

  onView(_id) {
    const data = this.getObjByID(_id, this._variables);
    // open a dialog showing the variables
    this.dialogStatRef = this.dialog.open(VarStatDialogComponent, {
      width: '35em',
      data: data,
      panelClass: 'field_width'
    });
  }

  showMSG(_msg) {
    this.snackBar.open(_msg, '', {
      duration: 1000
    });
  }
  @HostListener('matSortChange', ['$event'])
  sortChange(sort) {
    console.log("sortChange");
    console.log(sort);
    let vars = [];

    for (let i = 0; i < this._variables.length; i++) {
      if (this._variables[i]['_show']) {
        vars.push(this._variables[i]);
      }
    }
    this.datasource.data = vars;
    this.datasource.data.sort();
    this.datasource.connect().subscribe(d => this.renderedData = d);

  }
}
