import { ChangeDetectionStrategy, Component, effect, input } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'dct-cross-chart',
  standalone: true,
  imports: [],
  template: `
    <h3>Stacked Bar Chart</h3>
    <figure
      #crossChart
      id="crossChart"
    ></figure>
  `,
  styleUrl: './cross-chart.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrossChartComponent {
  data = input.required<{ [variableLabel: string]: string }[] | unknown[]>();
  rows = input.required<string[]>();
  cols = input.required<string[]>();
  // D3
  private svg: any;
  private margin = 50;
  private width = 750 - (this.margin * 2);
  private height = 400 - (this.margin * 2);

  constructor() {
    effect(() => {
      if (this.data().length && (this.rows() || this.cols())) {
        this.createSVG();
        this.drawBars(this.data());
      }
    });
  }

  private createSVG(): void {
    this.svg = d3.select('figure#crossChart')
      .append('svg')
      .attr('width', this.width + (this.margin * 2))
      .attr('height', this.height + (this.margin * 2))
      .append('g')
      .attr('transform', 'translate(' + this.margin + ',' + this.margin + ')');
  }

  private drawBars(data: any) {
    // Create the X-axis band scale
    const x = d3.scaleBand()
      .range([0, this.width])
      .domain(data.map((d: { category: string, [other: string]: string }) => d.category))
      .padding(0.2);

    // Draw the X-axis on the DOM
    this.svg.append('g')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'translate(-10,0)rotate(-45)')
      .style('text-anchor', 'end');

    // Create the Y-axis band scale
    const y = d3.scaleLinear()
      .domain([0, 200000])
      .range([this.height, 0]);

    // Draw the Y-axis on the DOM
    this.svg.append('g')
      .call(d3.axisLeft(y));

    // Create and fill the bars
    this.svg.selectAll('bars')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d: any) => x(d.Framework))
      .attr('y', (d: any) => y(d.Stars))
      .attr('width', x.bandwidth())
      .attr('height', (d: any) => this.height - y(d.Stars))
      .attr('fill', '#d04a35');
  }
}
