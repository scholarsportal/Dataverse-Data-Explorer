import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Variable } from 'src/app/state/interface';

@Component({
  selector: 'app-variable-options',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './variable-options.component.html',
  styleUrl: './variable-options.component.css',
})
export class VariableOptionsComponent {
  @Input() variable: Variable | null = null;

  launchView() {
    console.log('view');
    console.log(this.variable);
  }
  launchEdit() {
    console.log('edit');
    console.log(this.variable);
  }
}
