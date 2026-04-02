import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Header } from './components/header/header';
import { VariableEditor } from '@dde/variable-editor';
import { Sidebar } from './components/sidebar/sidebar';

@Component({
  imports: [RouterModule, Header, VariableEditor, Sidebar],
  selector: 'dde-root',
  template: `<router-outlet></router-outlet>
    <dde-header title="test" description="test" currentContent="variables" class="dde-header" />
    <div class="dde-main-content">
      <dde-sidebar />
      <dde-variable-editor />
    </div> `,
  styleUrl: './app.css',
})
export class App {}
