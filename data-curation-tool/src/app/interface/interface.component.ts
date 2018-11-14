import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef
} from '@angular/core';
import { NgModule } from '@angular/core';
import { DdiService } from '../ddi.service';
import { xml2json } from '../../assets/js/xml2json';
import { json2xml } from '../../assets/js/json2xml';

import { MatButtonModule } from '@angular/material';
import { VarComponent } from '../var/var.component';
import * as FileSaver from 'file-saver';
import * as XMLWriter from 'xml-writer';

@Component({
  selector: 'app-interface',
  templateUrl: './interface.component.html',
  styleUrls: ['./interface.component.css']
})
@NgModule({
  imports: [MatButtonModule],
  exports: [MatButtonModule]
})
export class InterfaceComponent implements OnInit {
  @ViewChild(VarComponent) child;
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;

  data = null; // store the xml
  ddi_loaded = false; // show the loading
  title;
  _variable_groups = []; // store the variables in an array display
  _variables = []; // store the variables to be broadcast to child
  _id = null; // file id

  constructor(private ddiService: DdiService) {}

  ngOnInit() {
    let uri = null;
    uri = this.ddiService.getParameterByName('uri');
    this._id = this.ddiService.getParameterByName('dfId');
    console.log(this._id);

    const base_url = this.ddiService.getBaseUrl();

    if (!uri && this._id != null) {
      console.log('Interface setting id ' + this._id);
      uri = base_url + '/api/access/datafile/' + this._id + '/metadata/ddi';
      console.log(uri);

      // &key=8f18fd62-3c5b-48f9-87d7-3fd181e6b5ed';
    } else {
      if (!uri && !this._id) {
        // Just for testing purposes
        uri = base_url + '/assets/FOCN_SPSS_20150525_FORMATTED-ddi.xml';
        console.log(uri);
      }
    }
    this.getDDI(uri);
  }

  getDDI(_uri): void {
    const url = _uri;
    this.ddiService
      .getDDI(url)
      .subscribe(
        data => this.processDDI(data),
        error => console.log(error),
        () => this.completeDDI()
      );
  }

  scrollNav() {
    const elm = this.myScrollContainer['_elementRef'].nativeElement;
    elm.scrollTop = elm.scrollHeight;
  }
  processDDI(data) {
    const parser = new DOMParser();
    this.data = parser.parseFromString(data, 'text/xml');
  }

  completeDDI() {
    this.showVarsGroups();
    this.showVars();
    this.title = this.data
      .getElementsByTagName('stdyDscr')[0]
      .getElementsByTagName('titl')[0].textContent;
    this.showDDI();
  }

  showVarsGroups() {
    const elm = this.data.getElementsByTagName('varGrp');
    for (let i = 0; i < elm.length; i++) {
      const obj = JSON.parse(xml2json(elm[i], ''));
      this._variable_groups.push(obj);
    }
  }

  showVars() {
    const variables = [];
    const elm = this.data.getElementsByTagName('var');
    for (const elm_in of elm) {
      variables.push(JSON.parse(xml2json(elm_in, '')));
    }
    // flatten the table structure so it can be sorted/filtered appropriately
    const flat_array = [];
    for (let i = 0; i < variables.length; i++) {
      const obj = variables[i];
      // make equivlant variable to allow sorting
      for (const j in obj.var) {
        if (j.indexOf('@') === 0) {
          obj.var[j.substring(1).toLowerCase()] = obj.var[j];
        }
      }

      if (typeof obj.var.catgry !== 'undefined') {
        if (typeof obj.var.catgry.length === 'undefined') {
          // If there is only one category
          obj.var.catgry = [obj.var.catgry];
        }
        for (let k = 0; k < obj.var.catgry.length; k++) {
          if (typeof obj.var.catgry[k].catStat !== 'undefined') {
            if (typeof obj.var.catgry[k].catStat.length === 'undefined') {
              obj.var.catgry[k].catStat = [obj.var.catgry[k].catStat];
            }
          }
        }
      }

      flat_array.push(obj.var);
    }
    //
    this._variables = flat_array;
    this.child.onUpdateVars(this._variables);
    console.log(this._variables.length);
  }
  // pass the selected ids to the var table for display
  broadcastSubSetRows(ids) {
    this.child.onSubset(ids);
  }
  broadcastSelect(_id) {
    // set the var table header to show the selection
    this.child.selectGroup(_id);
  }
  broadcastDraggedGroup(_id) {
    this.child.draggedGroup(_id);
  }
  broadcastDeselectGroup() {
    this.child.disableSelectGroup();
  }
  showDDI() {
    this.ddi_loaded = true;
  }
  onSave() {
    console.log('GET ALL the JSON and convert it to XML');
    const doc = new XMLWriter();
    doc.startDocument();
    doc.startElement('dataDscr');
    console.log(this._variable_groups);
    // add groups
    for (let i = 0; i < this._variable_groups.length; i++) {
      console.log(this._variable_groups[i]);
      doc.startElement('varGrp');
      doc.writeAttribute('ID', this._variable_groups[i].varGrp['@ID']);
      doc.writeAttribute('var', this._variable_groups[i].varGrp['@var']);
      doc.startElement('labl');
      doc.text(this._variable_groups[i].varGrp.labl);
      doc.endElement()
      doc.endElement();
    }
    // add variables
    for (let i = 0; i < this._variables.length; i++) {
      console.log(this._variables[i]);
      // start variable (var)
      doc.startElement('var');
      doc.writeAttribute('ID', this._variables[i]['@ID']);
      doc.writeAttribute('name', this._variables[i]['@name']);
      if (typeof this._variables[i]['@intrvl'] !== 'undefined') {
        doc.writeAttribute('intrvl', this._variables[i]['@intrvl']);
      }
      if (typeof this._variables[i]['@wgt'] !== 'undefined' && this._variables[i]['@wgt'] !== '') {
        doc.writeAttribute('wgt', this._variables[i]['@wgt']);
      }
      if (typeof this._variables[i]['@wgt-var'] !== 'undefined' && this._variables[i]['@wgt-var'] !== '') {
        doc.writeAttribute('wgt-var', this._variables[i]['@wgt-var']);
      }
      // start location
      if (typeof this._variables[i].location !== 'undefined') {
        doc.startElement('location').writeAttribute('fileid', this._variables[i].location['@fileid']);
        doc.endElement();
      }
      // end location
      // start labl
      if (typeof this._variables[i].labl !== 'undefined') {
        doc.startElement('labl');
        doc.writeAttribute('level', this._variables[i].labl['@level']);
        doc.text(this._variables[i].labl['#text']);
        doc.endElement();
      }
      // end labl
      // start sumStat
      if (typeof this._variables[i].sumStat !== 'undefined') {
        if (typeof this._variables[i].sumStat.length !== 'undefined') {
          for (let j = 0; j < this._variables[i].sumStat.length; j++) {
            doc.startElement('sumStat');
            doc.writeAttribute('type', this._variables[i].sumStat[j]['@type']);
            doc.text(this._variables[i].sumStat[j]['#text']);
            doc.endElement();
          }
        }
      }
      // end sumStat
      // start catgry
      if (typeof this._variables[i].catgry !== 'undefined') {
        if (typeof this._variables[i].catgry.length !== 'undefined') {
          for (let j = 0; j < this._variables[i].catgry.length; j++) {
            doc.startElement('catgry');
            if (typeof this._variables[i].catgry[j].catValu !== 'undefined') {
              doc.startElement('catgry').text(this._variables[i].catgry[j].catValu);
              doc.endElement();
            }
            if (typeof this._variables[i].catgry[j].labl !== 'undefined') {
              doc.startElement('labl');
              doc.writeAttribute('level', this._variables[i].catgry[j].labl['@level']);
              doc.text(this._variables[i].catgry[j].labl['#text']);
              doc.endElement();
            }
            if (typeof this._variables[i].catgry[j].catStat !== 'undefined') {
              // frequency
              if (typeof this._variables[i].catgry[j].catStat.length !== 'undefined') {
                doc.startElement('catStat');
                doc.writeAttribute('type', this._variables[i].catgry[j].catStat[0]['@type']);
                doc.text(this._variables[i].catgry[j].catStat[0]['#text']);
                doc.endElement();
                // weighted frequency
                if (this._variables[i].catgry[j].catStat.length > 1) {
                  doc.startElement('catStat');
                  doc.writeAttribute('wgtd', this._variables[i].catgry[j].catStat[1]['@wgtd']);
                  doc.writeAttribute('type', this._variables[i].catgry[j].catStat[1]['@type']);
                  doc.text(this._variables[i].catgry[j].catStat[1]['#text']);
                  doc.endElement();
                }
              }
            }
            doc.endElement();
          }
        }
      }
      // end catgry
      // start qstn
      if (typeof this._variables[i].qstn !== 'undefined') {
        doc.startElement('qstn');
        if (typeof this._variables[i].qstn.qstnLit !== 'undefined') {
          doc.startElement('qstnLit').text(this._variables[i].qstn.qstnLit);
          doc.endElement();
        }
        if (typeof this._variables[i].qstn.ivuInstr !== 'undefined') {
          doc.startElement('ivuInstr').text(this._variables[i].qstn.ivuInstr);
          doc.endElement();
        }
        doc.endElement();
      }
      // end qstn
      // start varFormat
      if (typeof this._variables[i].varFormat !== 'undefined') {
        doc.startElement('varFormat');
        doc.writeAttribute('type', this._variables[i].varFormat['@type']);
        doc.endElement();
      }
      // end varFormat
      // start notes
      if (typeof this._variables[i].notes !== 'undefined') {
        doc.startElement('notes');
        // start notes cdata
        if (typeof this._variables[i].notes['#cdata'] !== 'undefined') {
          doc.startCData();
          doc.writeCData(this._variables[i].notes['#cdata']);
          doc.endCData();
        }
        // end notes cdata
        doc.writeAttribute('subject', this._variables[i].notes['@subject']);
        doc.writeAttribute('level', this._variables[i].notes['@level']);
        doc.writeAttribute('type', this._variables[i].notes['@type']);
        doc.text(this._variables[i].notes['#text']);
        doc.endElement();
      }
      // end notes
      // start universe
      if (typeof this._variables[i].universe !== 'undefined') {
        doc.startElement('universe');
        doc.text(this._variables[i].universe['#text']);
        doc.endElement();
      }
      // end universe
      // end variable (var)
      doc.endElement();
    }
    doc.endDocument();
    console.log(doc);
    //var t = "Hello!";
    let text = new Blob([doc.toString()], { type: 'text/xml;charset=utf-8' });
    //FileSaver.saveAs(text, 'my.xml');
  }

}
