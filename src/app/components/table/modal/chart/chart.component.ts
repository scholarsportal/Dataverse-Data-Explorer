import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { selectChartData } from 'src/app/state/selectors/ui.selectors';

interface Chart {
  [id: number]: {
    values: number;
    categories: string;
    count: string | number;
    countPercent: number;
    countWeighted?: string | number;
  };
}
@Component({
  selector: 'dct-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.css',
})
export class ChartComponent implements OnInit, OnDestroy {
  sub$!: Subscription;
  chart!: Chart;
  form!: any;
  sumStat!: {
    Mean?: string;
    Mode?: string;
    Median?: string | number;
    'Total Valid Count'?: string;
    'Total Invalid Count'?: string;
    Minimum?: string;
    Maximum?: string;
    'Standard Deviation'?: string;
  };
  selectList: any[] = [];
  groups: any[] = [];
  weight: string = '';

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.sub$ = this.store
      .select(selectChartData)
      .subscribe(({ form, chart, sumStat }) => {
        this.form = form?.formData;
        form?.groups.map((group) => {
          this.groups.push(group.labl);
        });
        this.weight = JSON.stringify(form?.variableWeights);
        this.chart = chart;
        console.log(chart);
        this.sumStat = sumStat;
      });
  }

  ngOnDestroy(): void {
    this.sub$.unsubscribe;
  }

  getStat(stat: any) {
    console.log(stat);
  }

  getCategory(value: any) {
    return value.categories;
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
}
