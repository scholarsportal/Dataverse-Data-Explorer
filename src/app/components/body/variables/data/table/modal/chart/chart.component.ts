import { ChangeDetectionStrategy, Component, effect, inject, input, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js/auto';
import { shuffleColours } from './chart.interface';
import { Store } from '@ngrx/store';
import { SummaryStatisticsComponent } from './summary-statistics/summary-statistics.component';
import { ChartData, SummaryStatistics, VariableForm } from 'src/app/new.state/ui/ui.interface';
import { VariableInformationComponent } from './variable-information/variable-information.component';
import { VariableTabUIAction } from 'src/app/new.state/ui/ui.actions';

@Component({
  selector: 'dct-chart',
  standalone: true,
  imports: [CommonModule, SummaryStatisticsComponent, VariableInformationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.css'
})
export class ChartComponent implements OnInit {
  store = inject(Store);
  // $groups = this.store.selectSignal(selectOpenVariableSelectedGroups);
  variableID = input.required<string>();
  weights = input.required<{ [variableID: string]: string }>();
  chart = input.required<{ x: number, y: string }[]>();
  chartTable = input.required<ChartData>();
  form = input.required<VariableForm>();
  groups = input.required<string[]>();
  sumStat = input.required<SummaryStatistics>();
  categoriesInvalid = input.required<string[]>();

  @Input() weight!: { [id: string]: string } | null;
  public chartJS: any;

  constructor() {
    effect(() => {
      this.redrawChart(this.chart());
    });
  }

  ngOnInit() {
    this.createChart();
  }

  toggleCheckbox(value: string) {
    if (this.categoriesInvalid().includes(value)) {
      const category = this.categoriesInvalid().filter(item => item !== value);
      this.store.dispatch(VariableTabUIAction.changeMissingCategories({
        variableID: this.variableID(),
        categories: category
      }));
    } else {
      this.store.dispatch(VariableTabUIAction.changeMissingCategories({
        variableID: this.variableID(),
        categories: [...this.categoriesInvalid(), value]
      }));
    }
  }

  private createChart() {
    this.chartJS = new Chart('variableChart', {
      type: 'bar',
      data: {
        datasets: [
          {
            data: this.chart(),
            backgroundColor: shuffleColours()
          }
        ]
      },
      options: {
        indexAxis: 'y',
        scales: {
          y: {
            ticks: {
              autoSkip: false
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });

    const light = 'black';
    const dark = 'white';
    const neutral = '#c8c5d0';
    const theme = localStorage.getItem('theme');

    if (theme === 'light') {
      this.chartJS.options.scales.x.grid.color = neutral;
      this.chartJS.options.scales.y.grid.color = neutral;
      this.chartJS.options.scales.x.ticks.color = light;
      this.chartJS.options.scales.y.ticks.color = light;
    } else {
      this.chartJS.options.scales.x.grid.color = dark;
      this.chartJS.options.scales.y.grid.color = dark;
      this.chartJS.options.scales.x.ticks.color = dark;
      this.chartJS.options.scales.y.ticks.color = dark;
      this.chartJS.options.plugins.legend.labels.color = dark;
    }
  }

  private redrawChart(chart: { x: number, y: string }[]) {
    // Update chart data and redraw
    if (this.chartJS) {
      this.chartJS.data.datasets[0].data = chart;
      this.chartJS.update();
    }
  }
}
