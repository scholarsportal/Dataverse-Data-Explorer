import { Component, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { getDataFetchStatus, selectDatasetVars, checkEditing, getVariable } from 'src/state/selectors';
import { ModalComponent } from '../modal/modal.component';
import { variableViewChart, variableViewDetail } from 'src/state/actions';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent {
  @ViewChild(ModalComponent) modalComponent?: ModalComponent;

  columns = [{ name: 'ID' }, { name: 'Name' }, { name: 'Label' }, { name: 'Weight' }, { name: 'View' }, { name: 'Edit' },]
  selectedVariables = []
  heading = "";
  vars$ = this.store.select(selectDatasetVars);
  loaded$ = this.store.select(getDataFetchStatus)
  isEditing$ = this.store.select(checkEditing)
  currentVar$ = this.store.select(getVariable);

  constructor(private store: Store) {}

  getHeading() {
    this.currentVar$.subscribe((data) => {
      if (data) {
      console.log(data['@_ID'])
        const id = data['@_name'] || "UND"
        const label = data['labl']['#text'] || "No label"
        return `${id}: ${label}`
      }
      return ""
    })
  }

  setHeading(value: any){
    const name = value['@_name'] || ""
    const label = value['labl']['#text'] || "No Label"
    this.heading = `${name}: ${label}`
  }

  viewChart(value: any) {
    this.store.dispatch(variableViewChart({ variable: value }))
    this.setHeading(value)
    this.modalComponent?.openModal();
  }

  editVar(value: any) {
    this.store.dispatch(variableViewDetail({ variable: value }))
    this.setHeading(value)
    this.modalComponent?.openModal();
  }

  close() {
    this.modalComponent?.closeModal()
  }

}
