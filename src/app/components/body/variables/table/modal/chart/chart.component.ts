import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js/auto';
import { shuffleColours } from './chart.interface';
import { Store } from '@ngrx/store';
import { SummaryStatisticsComponent } from './summary-statistics/summary-statistics.component';
import { SummaryStatistics, VariableForm } from 'src/app/new.state/ui/ui.interface';
import { VariableInformationComponent } from './variable-information/variable-information.component';

interface ChartData {
  values: number;
  categories: string;
  count: string | number;
  countPercent: number;
  valid: boolean;

  countWeighted?: string | number | undefined;
}

@Component({
  selector: 'dct-chart',
  standalone: true,
  imports: [CommonModule, SummaryStatisticsComponent, VariableInformationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.css'
})
export class ChartComponent implements OnInit, OnChanges {
  store = inject(Store);
  // $groups = this.store.selectSignal(selectOpenVariableSelectedGroups);
  @Input() chart!: { y: string; x: number | null }[] | null;
  @Input() chartTable!: { [id: number]: ChartData } | null;
  form = input.required<VariableForm>();
  sumStat = input.required<SummaryStatistics>();
  @Input() weight!: { [id: string]: string } | null;

  public chartJS: any;
  selectList: any[] = [];

  ngOnInit(): void {
    this.selectList = [];
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes) {
      this.selectList = [];
      this.redrawChart();
    }
  }

  getCategory(value: ChartData | null) {
    return value?.categories;
  }

  getCount(value: any) {
    return value.count;
  }

  getCountPercent(value: any) {
    return value.countPercent;
  }

  getCountWeighted(value: any) {
    return value.countWeighted;
  }

  getChecked(value: any) {
    return this.selectList.includes(value.categories);
  }

  toggleCheckbox(item: any) {
    const index = this.selectList.indexOf(item.categories);
    if (index !== -1) {
      this.selectList.splice(index, 1);
    } else {
      this.selectList.push(item.categories);
    }
    this.redrawChart();
    // redraw chart without items in select list
  }

  private createChart() {
    this.chartJS = new Chart('variableChart', {
      type: 'bar',
      data: {
        datasets: [
          {
            data: this.chart,
            backgroundColor: shuffleColours()
          }
        ]
      },
      options: {
        indexAxis: 'y'
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

  private redrawChart() {
    const filteredData: { y: string; x: number | null }[] = [];
    this.chart?.map((item) => {
      if (!this.selectList.includes(item.y)) {
        filteredData.push(item);
      }
    });
    // Update chart data and redraw
    if (this.chartJS) {
      this.chartJS.data.datasets[0].data = filteredData;
      this.chartJS.update();
    }
  }
}
