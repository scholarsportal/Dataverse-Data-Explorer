import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { KeyValuePipe } from '@angular/common';
import { VariableForm } from 'src/app/new.state/ui/ui.interface';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'dct-variable-information',
  standalone: true,
  imports: [
    KeyValuePipe,
    TranslateModule
  ],
  templateUrl: './variable-information.component.html',
  styleUrl: './variable-information.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VariableInformationComponent {
  form = input.required<VariableForm>();
}
