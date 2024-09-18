import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  OnInit,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'dct-cross-chart',
  standalone: true,
  imports: [NgClass],
  template: `
    <h3 class="sr-only">Chart</h3>
    <div [ngClass]="{ blur: !hasData() }" class="flex h-full w2/3 mt-4">
      <canvas id="crossTabChart"> {{ chartJS }}</canvas>
    </div>
  `,
  styleUrl: './cross-chart.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrossChartComponent implements OnInit {
  rows = input.required<string[]>();
  cols = input.required<string[]>();
  data = input.required<{
    labels: string[];
    datasets: {
      label: string;
      data: number[];
    }[];
  }>();
  hasData = computed(() => {
    return !!this.data().datasets.length;
  });
  public chartJS: any;

  constructor() {
    effect(() => {
      if (this.hasData()) {
        this.redrawChart(this.data());
      }
    });
  }

  rowsAsString = (separator: string) =>
    computed(() => {
      return this.rows().join(separator);
    });

  colsAsString = (separator: string) =>
    computed(() => {
      return this.cols().join(separator);
    });

  ngOnInit() {
    this.createChart();
  }

  private createChart() {
    this.chartJS = new Chart('crossTabChart', {
      type: 'bar',
      data: {
        datasets: this.data().datasets,
        labels: this.data().labels,
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: `${this.colsAsString(', ')()}`,
          },
        },
        responsive: true,
        indexAxis: 'y',
        scales: {
          x: {
            stacked: true,
          },
          y: {
            title: {
              text: this.rowsAsString(' - ')(),
              display: true,
            },
            stacked: true,
          },
        },
      },
    });
    const light = 'black',
      dark = 'white',
      neutral = '#c8c5d0',
      theme = localStorage.getItem('theme');

    if (theme === 'light') {
      this.chartJS.options.scales.x.grid.color = neutral;
      this.chartJS.options.scales.y.grid.color = neutral;
      this.chartJS.options.scales.x.ticks.color = light;
      this.chartJS.options.scales.y.ticks.color = light;
      this.chartJS.options.scales.x.title.color = light;
      this.chartJS.options.scales.y.title.color = light;
      this.chartJS.options.plugins.title.color = light;
      this.chartJS.options.plugins.legend.labels.color = light;
    } else {
      this.chartJS.options.scales.x.grid.color = dark;
      this.chartJS.options.scales.y.grid.color = dark;
      this.chartJS.options.scales.x.ticks.color = dark;
      this.chartJS.options.scales.y.ticks.color = dark;
      this.chartJS.options.scales.x.title.color = dark;
      this.chartJS.options.scales.y.title.color = dark;
      this.chartJS.options.plugins.title.color = dark;
      this.chartJS.options.plugins.legend.labels.color = dark;
    }
  }

  private redrawChart(data: any) {
    // Update chart data and redraw
    if (this.chartJS) {
      this.chartJS.data = data;
      // if (this.chartJS.data?.options?.scales?.y?.ticks) {
      //   this.chartJS.data.options.scales.y.ticks.autoSkip = chart.length >= 10;
      // }
      this.chartJS.update();
      const light = 'black',
        dark = 'white',
        neutral = '#c8c5d0',
        theme = localStorage.getItem('theme');

      if (theme === 'light') {
        this.chartJS.options.scales.x.grid.color = neutral;
        this.chartJS.options.scales.y.grid.color = neutral;
        this.chartJS.options.scales.x.ticks.color = light;
        this.chartJS.options.scales.y.ticks.color = light;
        this.chartJS.options.scales.x.title.color = light;
        this.chartJS.options.scales.y.title.color = light;
        this.chartJS.options.plugins.legend.labels.color = light;
        this.chartJS.update();
      } else {
        this.chartJS.options.scales.x.grid.color = dark;
        this.chartJS.options.scales.y.grid.color = dark;
        this.chartJS.options.scales.x.ticks.color = dark;
        this.chartJS.options.scales.y.ticks.color = dark;
        this.chartJS.options.scales.x.title.color = dark;
        this.chartJS.options.scales.y.title.color = dark;
        this.chartJS.options.plugins.legend.labels.color = dark;
        this.chartJS.update();
      }
    }
  }
}
