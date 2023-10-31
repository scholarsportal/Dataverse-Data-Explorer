import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { getOpenVariableGraphValues } from 'src/state/selectors';
import * as d3 from 'd3';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit {
  @Input() datasetID: any = undefined;
  hasGraph$ = this.store.select(getOpenVariableGraphValues)
  private svg: any;
  private margin = 50;
  private width = 700 - (this.margin * 2);
  private height = 400 - (this.margin * 2);

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.store.select(getOpenVariableGraphValues).subscribe((data) => {
      this.clearSVG()
      if (data) {
        console.log(data)
        this.createSVG();
        this.drawBars(data.weighted || data.unweighted || [])
      }
    })
  }

  private createSVG(): void {
    this.svg = d3.select("figure#bar").append("svg")
      .attr("width", this.width + (this.margin * 2))
      .attr("height", this.height + (this.margin * 2))
      .append("g")
      .attr("transform", "translate(" + this.margin + "," + this.margin + ")");
  }

  private drawBars(data: any[]): void {
    // Create the X-axis band scale
    const x = d3.scaleBand()
      .range([0, this.width])
      .domain(data.map(d => d.label))
      .padding(0.2);

    // Draw the X-axis on the DOM
    this.svg.append("g")
      .attr("transform", "translate(0," + this.height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

    // Create the Y-axis band scale
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.frequency)])
      .range([this.height, 0]);

    // Draw the Y-axis on the DOM
    this.svg.append("g")
      .call(d3.axisLeft(y));

    // Create and fill the bars
    this.svg.selectAll("bars")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d: any) => x(d.label))
      .attr("y", (d: any) => y(d.frequency))
      .attr("width", x.bandwidth())
      .attr("height", (d: any) => this.height - y(d.frequency)) // Fix the height calculation
      .attr("fill", "#d04a35");
  }

  private clearSVG(): void {
    d3.select("figure#bar").selectAll("svg").remove();
  }
}
