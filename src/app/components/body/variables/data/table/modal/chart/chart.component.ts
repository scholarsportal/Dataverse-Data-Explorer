import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  Input,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js/auto';
import { Store } from '@ngrx/store';
import { SummaryStatisticsComponent } from './summary-statistics/summary-statistics.component';
import {
  ChartData,
  SummaryStatistics,
  VariableForm,
} from 'src/app/new.state/ui/ui.interface';
import { VariableInformationComponent } from './variable-information/variable-information.component';
import { VariableTabUIAction } from 'src/app/new.state/ui/ui.actions';
import { shuffleColours } from './chart.interface';

@Component({
  selector: 'dct-chart',
  standalone: true,
  imports: [
    CommonModule,
    SummaryStatisticsComponent,
    VariableInformationComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.css',
})
export class ChartComponent implements OnInit {
  store = inject(Store);
  // $groups = this.store.selectSignal(selectOpenVariableSelectedGroups);
  variableID = input.required<string>();
  variableLabel = input.required<string>();
  hasCategories = input.required<boolean>();
  weights = input.required<{ [variableID: string]: string }>();
  chart = input.required<{ x: number; y: string }[]>();
  chartReference = input.required<string[]>();
  chartTable = input.required<ChartData>();
  form = input.required<VariableForm>();
  groups = input.required<string[]>();
  sumStat = input.required<SummaryStatistics>();
  categoriesInvalid = input.required<string[]>();

  @Input() weight!: { [id: string]: string } | null;
  // Reason: ChartJS works better with an any definition
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      const category = this.categoriesInvalid().filter(
        (item) => item !== value,
      );
      this.store.dispatch(
        VariableTabUIAction.changeMissingCategories({
          variableID: this.variableID(),
          categories: category,
        }),
      );
    } else {
      this.store.dispatch(
        VariableTabUIAction.changeMissingCategories({
          variableID: this.variableID(),
          categories: [...this.categoriesInvalid(), value],
        }),
      );
    }
  }

  private createChart() {
    this.chartJS = new Chart('variableChart', {
      type: 'bar',
      data: {
        labels: this.chart().map((item) => item.y), // Use the truncated category names
        datasets: [
          {
            data: this.chart().map((item) => item.x), // Use the count values
            backgroundColor: shuffleColours(),
          },
        ],
      },
      options: {
        indexAxis: 'y', // Horizontal bar chart
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (tooltipItem: any) => {
                // Display the full name on hover
                return `${this.chartReference()[tooltipItem.dataIndex]}: ${tooltipItem.raw}`;
              },
            },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
          },
          y: {
            ticks: {
              autoSkip: false,
            },
          },
        },
      },
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
      this.chartJS.options.plugins.legend.labels.color = light;
    } else {
      this.chartJS.options.scales.x.grid.color = dark;
      this.chartJS.options.scales.y.grid.color = dark;
      this.chartJS.options.scales.x.ticks.color = dark;
      this.chartJS.options.scales.y.ticks.color = dark;
      this.chartJS.options.plugins.legend.labels.color = dark;
    }
  }

  private redrawChart(chart: { x: number; y: string }[]) {
    // Update chart data and redraw
    if (this.chartJS) {
      this.chartJS.data.labels = chart.map((item) => item.y); // Update labels
      this.chartJS.data.datasets[0].data = chart.map((item) => item.x); // Update data
      this.chartJS.update();
      
      const light = 'black';
      const dark = 'white';
      const neutral = '#c8c5d0';
      const theme = localStorage.getItem('theme');
      
      if (theme === 'light') {
        this.chartJS.options.scales.x.grid.color = neutral;
        this.chartJS.options.scales.y.grid.color = neutral;
        this.chartJS.options.scales.x.ticks.color = light;
        this.chartJS.options.scales.y.ticks.color = light;
        this.chartJS.options.plugins.legend.labels.color = light;
        this.chartJS.update();
      } else {
        this.chartJS.options.scales.x.grid.color = dark;
        this.chartJS.options.scales.y.grid.color = dark;
        this.chartJS.options.scales.x.ticks.color = dark;
        this.chartJS.options.scales.y.ticks.color = dark;
        this.chartJS.options.plugins.legend.labels.color = dark;
        this.chartJS.update();
      }
    }
  }

  private getGridColor(): string {
    const theme = localStorage.getItem('theme');
    return theme === 'light' ? '#c8c5d0' : 'white';
  }

  private getTickColor(): string {
    const theme = localStorage.getItem('theme');
    return theme === 'light' ? 'black' : 'white';
  }
}
