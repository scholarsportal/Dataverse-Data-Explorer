import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { Chart } from 'chart.js/auto';
import { TranslateModule } from '@ngx-translate/core';
import { Theme, ThemeService } from 'src/app/services/theme.service';
import { applyChartTheme } from 'src/app/shared/util/chart';

@Component({
  selector: 'dct-cross-chart',
  standalone: true,
  imports: [NgClass, TranslateModule],
  template: `
    <h3 class="sr-only">{{ 'CROSS_TABULATION.CHART' | translate }}</h3>
    <div class="flex h-full w2/3 mt-4">
      <canvas id="crossTabChart"> {{ chartJS }}</canvas>
    </div>
  `,
  styleUrl: './cross-chart.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrossChartComponent implements OnInit {
  rows = input.required<any>();
  cols = input.required<any>();
  data = input.required<any>();
  public chartJS: any;
  private themeService = inject(ThemeService);

  // constructor() {
  //   effect(() => {
  //     const data = this.data();
  //     if (data) {
  //       this.redrawChart(data);
  //     }
  //   });
  // }

  redrawChart$ = effect(() => {
    const data = this.data();

    // Reading the theme here recolours the chart when it is toggled
    const theme = this.themeService.theme();
    if (data) {
      this.redrawChart(data, theme);
    }
  });

  relabelChart$ = effect(() => {
    if (this.cols() || this.rows()) {
      this.redrawChart(this.data(), this.themeService.theme());
    }
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
            text: this.cols().join(', '),
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
              text: this.rows().join(' - '),
              display: true,
            },
            stacked: true,
          },
        },
      },
    });
    applyChartTheme(this.chartJS, this.themeService.theme());
  }

  private redrawChart(data: any, theme: Theme) {
    // Update chart data and redraw
    if (this.chartJS) {
      this.chartJS.data = data;
      applyChartTheme(this.chartJS, theme);
      this.chartJS.update();
    }
  }
}
