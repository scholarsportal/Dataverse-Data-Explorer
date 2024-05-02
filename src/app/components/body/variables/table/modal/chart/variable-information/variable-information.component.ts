import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { KeyValuePipe } from '@angular/common';
import { VariableForm } from 'src/app/new.state/ui/ui.interface';

@Component({
  selector: 'dct-variable-information',
  standalone: true,
  imports: [
    KeyValuePipe
  ],
  templateUrl: './variable-information.component.html',
  styleUrl: './variable-information.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VariableInformationComponent {
  form = input.required<VariableForm>();

}
