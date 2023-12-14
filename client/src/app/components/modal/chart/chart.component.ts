import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import * as d3 from 'd3';
import { selectOpenModalDetail } from 'src/state/selectors/modal.selectors';
import { getSumStatData, getSumStatHeader, getVariableData } from './chart.util';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css'],
})
export class ChartComponent implements OnInit {
  data: any = {};
  data$: any = {};
  total: any = 0;
  total$: any = 0;
  sumStats: any = [];
  sumStats$: any = [];
  variable: any = {}
  private svg: any;

  constructor(private store: Store) {
  }

  ngOnInit(): void {
    this.store.select(selectOpenModalDetail).subscribe(({ data, total, sumStats, variable }) => {
      this.clearSVG();
      if (data) {
        this.data = data;
        this.total = total
        this.sumStats = sumStats
        this.variable = variable
        this.createSVG(Object.values(data));
        this.drawBars(Object.values(data));
      }
    });
  }

  getSumStatData = (index: number) => getSumStatData(index, this.sumStats)

  getSumStatHeader = (index: number) => getSumStatHeader(index)

  // Not used
  // getVariableData = (index: number) => getVariableData(index, this.variable)

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

  private truncateText(text: string): string {
    const maxLength = 13;
    if (text.length > maxLength) {
      return text.substring(0, maxLength - 3) + '...';
    }
    return text;
  }

  private createSVG(data: any[]): void {
    const maxHeight = (data.length + 1) * 25;
    const margin = { top: 0, bottom: 50, left: 90, right: 20 }
    const width = 500 - margin.left - margin.right;
    const height = maxHeight - margin.top - margin.bottom;

    this.svg = d3
      .select('figure#bar')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      // .attr('class', 'mx-auto')
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')'); // Adjusting y-axis position
  }

  private drawBars(data: any[]): void {
    const maxHeight = (data.length + 1) * 25;
    const margin = { top: 0, bottom: 50, left: 90, right: 20 }
    const width = 500 - margin.left - margin.right;
    const height = maxHeight - margin.top - margin.bottom;

    // Create the Y-axis band scale
    const y = d3
      .scaleBand()
      .range([height, 0])
      .domain(data.map((d) => this.truncateText(d.category)))
      .padding(0.3);

    // Create the X-axis linear scale
    const x = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.weightedCount)])
      .range([0, width]);

    // Draw the Y-axis on the DOM
    this.svg
      .append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .attr('transform', 'translate(-10,0)rotate(-45)')
      .style('text-anchor', 'end');

    // Draw the X-axis on the DOM
    this.svg
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', 'translate(0,' + height + ')')
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
      .attr('y', (d: any) => y(this.truncateText(d.category)))
      .attr('width', (d: any) => x(d.weightedCount))
      .attr('height', y.bandwidth());

    // Enter new bars
    bars
      .enter()
      .append('rect')
      .attr('y', (d: any) => y(this.truncateText(d.category)))
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
