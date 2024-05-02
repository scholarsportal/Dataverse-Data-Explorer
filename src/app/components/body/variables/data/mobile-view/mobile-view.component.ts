import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Variable } from 'src/app/new.state/xml/xml.interface';
import { KeyValuePipe } from '@angular/common';

@Component({
  selector: 'dct-mobile-view',
  standalone: true,
  imports: [
    KeyValuePipe
  ],
  templateUrl: './mobile-view.component.html',
  styleUrl: './mobile-view.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MobileViewComponent {
  variables = input.required<{ [variableID: string]: Variable }>();
}
