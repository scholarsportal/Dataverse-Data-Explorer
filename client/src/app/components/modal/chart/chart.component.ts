import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectOpenVarDetail, selectOpenVariable } from 'src/state/selectors';
import * as d3 from 'd3';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css'],
})
export class ChartComponent implements OnInit {
  data: any = {};
  total: any = 0;
  hasGraph$ = this.store.select(selectOpenVarDetail);
  values = new Map();
  private svg: any;
  private margin = 50;
  private width = 500 - this.margin * 2;
  private height = 400 - this.margin * 2;

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.store.select(selectOpenVariable).subscribe((data) => {
      this.clearSVG();
      if (data) {
        const graphData: any = []

        data['catgry'].forEach((item: any) => {
          this.total += item.catStat[0]['#text']
          this.data = {
            ...this.data,
            [item.catValu]: {
              category: item.labl['#text'],
              count: item.catStat[0]['#text'],
              weightedCount: item.catStat[1]['#text'],
            }
          }
          graphData.push({ label: item.labl['#text'], frequency: item.catStat[1]['#text'] })
        });

        this.createSVG();
        this.drawBars(Object.values(this.data));
      }
    });

  }

  getCategories(value: any) {
    return value.category
  }

  getCount(value: any) {
    return value.count
  }

  getCountPercent(value: any) {
    // this ensures specificity in decimal place rounding. to locale ensures commas, or period
    return (Math.round((((value.count / this.total) * 100) + Number.EPSILON) * 1000) / 1000).toLocaleString('en', { useGrouping: true })
  }

  getCountWeighted(value: any) {
    // this ensures specificity in decimal place rounding. to locale ensures commas, or period
    return (Math.round((value.weightedCount + Number.EPSILON) * 1000) / 1000).toLocaleString('en', { useGrouping: true })
  }

  private createSVG(): void {
this.svg = d3
    .select('figure#bar')
    .append('svg')
    .attr('width', this.width + this.margin * 2)
    .attr('height', this.height + this.margin * 2 + 50) // Adding extra space for x-axis labels
    .attr('class', 'mx-auto w-2/3')
    .append('g')
    .attr('transform', 'translate(' + this.margin + ',' + (this.margin + 50) + ')'); // Adjusting y-axis position
}

private drawBars(data: any[]): void {
  // Create the Y-axis band scale
  const y = d3
    .scaleBand()
    .range([0, this.height])
    .domain(data.map((d) => d.category))
    .padding(0.2);

  // Create the X-axis linear scale
  const x = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.weightedCount)])
    .range([0, this.width]);

  // Draw the Y-axis on the DOM
  this.svg
    .append('g')
    .attr('class', 'y-axis text-label')
    .call(d3.axisLeft(y))
    .selectAll('text')
    .attr('transform', 'translate(-10,0)rotate(-45)')
    .style('text-anchor', 'end');

  // Draw the X-axis on the DOM
  this.svg
    .append('g')
    .attr('class', 'x-axis')
    .attr('transform', 'translate(0,' + this.height + ')')
    .call(d3.axisBottom(x))
    .selectAll('text')
    .attr('transform', 'translate(-10,0)rotate(-45)')
    .style('text-anchor', 'end');
  // Create and fill the bars with random colors from interpolateSpectral
  const colorScale = d3.scaleSequential(d3.interpolateSpectral).domain([0, data.length]);

  // Create and update the bars with transitions
  const bars = this.svg.selectAll('rect').data(data);

  // Exit old bars
  bars
    .exit()
    .transition()
    .duration(500)
    .attr('width', 0)
    .remove();

  // Update existing bars
  bars
    .transition()
    .duration(500)
    .attr('y', (d: any) => y(d.category))
    .attr('width', (d: any) => x(d.weightedCount))
    .attr('height', y.bandwidth());

  // Enter new bars
  bars
    .enter()
    .append('rect')
    .attr('y', (d: any) => y(d.category))
    .attr('height', y.bandwidth())
    .attr('fill', (_: any, i: any) => colorScale(i))
    .transition()
    .duration(500)
    .attr('width', (d: any) => x(d.weightedCount));

  // Update the Y-axis and X-axis class attributes for selection
  this.svg.select('.y-axis').attr('class', 'y-axis');
  this.svg.select('.x-axis').attr('class', 'x-axis');
}

  private clearSVG(): void {
    d3.select('figure#bar').selectAll('svg').remove();
  }
}
