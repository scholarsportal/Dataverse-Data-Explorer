import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { getOpenVariableGraphValues } from 'src/state/selectors';
import * as d3 from 'd3';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css'],
})
export class ChartComponent implements OnInit {
  data: any = [];
  total: any = 0;
  hasGraph$ = this.store.select(getOpenVariableGraphValues);
  private svg: any;
  private margin = 50;
  private width = 800 - this.margin * 2;
  private height = 400 - this.margin * 2;

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.store.select(getOpenVariableGraphValues).subscribe((data) => {
      this.clearSVG();
      if (data) {
        this.createSVG();
        this.drawBars(data.weighted || data.unweighted || []);
        this.createTable()
      }
    });
  }

  getLabel(value: any) {
    return value.label
  }

  getCategories(value: any) {
    return value.frequency
  }

  getCount(value: any) {
    console.log(value)
  }

  getCountPercent(value: any) {
    console.log(this.total)

    console.log(Object.values(this.data).reduce((a: any, b: any) => a + b.frequency, 0))
    return ( value.frequency/this.total ) * 100
  }

  getCountWeighted(value: any) {
    console.log(value)
    return value.frequency
  }

  createTable() {
    this.hasGraph$.subscribe((data: any) => {
      if (data) {
        console.log(Object.values(data.weighted))
        Object.values(data.weighted).map((item: any) => {
          this.data.push(item)
        })
        this.total = Object.values(data.weighted).reduce((a: any, b: any) => a + b.frequency, 0);
      }
    })
  }

  private createSVG(): void {
    this.svg = d3
      .select('figure#bar')
      .append('svg')
      .attr('width', this.width + this.margin * 2)
      .attr('height', this.height + this.margin * 2)
      .append('g')
      .attr('transform', 'translate(' + this.margin + ',' + this.margin + ')');
  }

  private drawBars(data: any[]): void {
    // Create the Y-axis band scale
    const y = d3
      .scaleBand()
      .range([0, this.height])
      .domain(data.map((d) => d.label))
      .padding(0.2);

    // Draw the Y-axis on the DOM
    this.svg
      .append('g')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .attr('transform', 'translate(-10,0)rotate(-45)')
      .style('text-anchor', 'end');

    // Create the X-axis linear scale
    const x = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.frequency)])
      .range([0, this.width]);

    // Draw the X-axis on the DOM
    this.svg.append('g').attr('transform', 'translate(0,' + this.height + ')').call(d3.axisBottom(x));

    // Create and fill the bars
    this.svg
      .selectAll('bars')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', 0)
      .attr('y', (d: any) => y(d.label))
      .attr('width', (d: any) => x(d.frequency))
      .attr('height', y.bandwidth())
      .attr('fill', '#d04a35');
  }

  private clearSVG(): void {
    d3.select('figure#bar').selectAll('svg').remove();
  }
}
