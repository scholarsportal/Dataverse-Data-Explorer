import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { VariableForm, VariableGroup } from 'src/app/state/interface';
import { Chart, Colors } from 'chart.js/auto';
import { backgroundColor, shuffleColours } from './chart.interface';

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
  imports: [CommonModule],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.css',
})
export class ChartComponent implements OnInit, OnChanges {
  @Input() chart!: { y: string; x: number | null }[] | null;
  @Input() chartTable!: { [id: number]: ChartData } | null;
  @Input() form!: VariableForm | null | undefined;
  @Input() sumStat!: { key: string; value: string }[] | null;
  @Input() groups!: VariableGroup[] | null;
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
            backgroundColor: shuffleColours(),
          },
        ],
      },
      options: {
        indexAxis: 'y',
      },
    });
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
