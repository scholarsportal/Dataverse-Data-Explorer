import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DdeVariable, CrossTabObservationData } from '@dde/models';

@Component({
  selector: 'dde-variable-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (variable(); as v) {
      <section class="view-content">
        <h3>{{ v.label }}</h3>

        <div class="chart-placeholder">
          <!-- Chart.js canvas will go here -->
          <p>Chart placeholder</p>
        </div>

        @if (v.categories.length > 0) {
          <table class="categories-table">
            <thead>
              <tr>
                <th>Value</th>
                <th>Category</th>
                <th>Count</th>
                <th>Weighted</th>
              </tr>
            </thead>
            <tbody>
              @for (cat of v.categories; track cat.value) {
                <tr>
                  <td>{{ cat.value }}</td>
                  <td>{{ cat.label }}</td>
                  <td>{{ cat.frequency }}</td>
                  <td>{{ cat.weightedFrequency }}</td>
                </tr>
              }
            </tbody>
          </table>
        }

        <dl class="stats">
          <div class="stat-row">
            <dt>Universe</dt>
            <dd>{{ v.universe || '—' }}</dd>
          </div>
          <div class="stat-row">
            <dt>Notes</dt>
            <dd>{{ v.notes || '—' }}</dd>
          </div>
          <div class="stat-row">
            <dt>Question</dt>
            <dd>{{ v.question.literal || '—' }}</dd>
          </div>
        </dl>
      </section>
    }
  `,
  styles: `
    .view-content {
      display: flex;
      flex-direction: column;
      gap: var(--md-sys-spacing-md, 16px);
    }
    h3 {
      margin: 0;
    }
    .chart-placeholder {
      border: 1px dashed var(--md-sys-color-outline-variant, #c8c5d0);
      border-radius: 8px;
      padding: var(--md-sys-spacing-xl, 32px);
      text-align: center;
      color: var(--md-sys-color-outline, #787680);
    }
    .categories-table {
      width: 100%;
      border-collapse: collapse;
    }
    .categories-table th,
    .categories-table td {
      padding: var(--md-sys-spacing-sm, 8px);
      border-bottom: 1px solid var(--md-sys-color-outline-variant, #c8c5d0);
      text-align: left;
    }
    .categories-table th {
      font-size: 0.875rem;
      color: var(--md-sys-color-outline, #787680);
      font-weight: 500;
    }
    .stats {
      margin: 0;
    }
    .stat-row {
      display: flex;
      gap: var(--md-sys-spacing-md, 16px);
      padding: var(--md-sys-spacing-sm, 8px) 0;
      border-bottom: 1px solid var(--md-sys-color-outline-variant, #c8c5d0);
    }
    dt {
      font-weight: 500;
      min-width: 120px;
      color: var(--md-sys-color-outline, #787680);
    }
  `,
})
export class VariableViewComponent {
  variable = input<DdeVariable | null>(null);
  observationData = input<CrossTabObservationData>({});
}