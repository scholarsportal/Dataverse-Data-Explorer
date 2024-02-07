import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { selectChartData } from 'src/app/state/selectors/ui.selectors';

@Component({
  selector: 'dct-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.css',
})
export class ChartComponent implements OnInit, OnDestroy {
  sub$!: Subscription;
  chart!: any;
  form!: any;
  sumStat!: any;
  selectList: any[] = [];

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.sub$ = this.store
      .select(selectChartData)
      .subscribe(({ form, chart, sumStat }) => {
        this.form = form;
        this.chart = chart;
        this.sumStat = sumStat;
      });
  }

  ngOnDestroy(): void {
    this.sub$.unsubscribe;
  }
}
