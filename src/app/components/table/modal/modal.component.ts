import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartComponent } from './chart/chart.component';
import { EditComponent } from './edit/edit.component';

@Component({
  selector: 'dct-modal',
  standalone: true,
  imports: [CommonModule, ChartComponent, EditComponent],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css',
})
export class ModalComponent {}
