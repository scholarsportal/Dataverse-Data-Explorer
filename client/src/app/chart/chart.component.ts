import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit {
  @ViewChild('chart', { static: true }) private chartContainer: ElementRef;
  colorArray = [
    '#3366cc',
    '#dc3912',
    '#ff9900',
    '#109618',
    '#990099',
    '#0099c6',
    '#dd4477',
    '#66aa00',
    '#b82e2e',
    '#316395',
    '#994499',
    '#22aa99',
    '#aaaa11',
    '#6633cc',
    '#e67300',
    '#8b0707',
    '#651067',
    '#329262',
    '#5574a6',
    '#3b3eac',
    '#b77322',
    '#16d620',
    '#b91383',
    '#f4359e',
    '#9c5935',
    '#a9c413',
    '#2a778d',
    '#668d1c',
    '#bea413',
    '#0c5922',
    '#743411'
  ];
  maxStringLength = 13;
  @Input() private data: Array<any>;

  constructor() {}

  ngOnInit() {
    this.createChart(this.data);
  }

  createChart(_data) {
    const obj = this;
    let data = this.data;
    data = [];
    for (let i = 0; i < _data.length; i++) {
      let freq = null;
      let freqWeight = null;
      if (typeof _data[i].catStat !== 'undefined') {
        for (let j = 0; j < _data[i].catStat.length; j++) {
          const subObj = _data[i].catStat[j];
          if (subObj['@type'] === 'freq' && !subObj['@wgtd']) {
            freq = subObj['#text'];
          } else {
            if (subObj['@type'] === 'freq' && subObj['@wgtd'] && subObj['#text'] !== '') {
              freqWeight = subObj['#text'];
            }
          }
        }
        // dataverse ddi exception
        if (!freq) {
          freq = _data[i].catStat['#text'];
        }
      }
      let shortName = _data[i].labl['#text'];

      if (shortName.length > this.maxStringLength) {
        shortName = shortName.substring(0, this.maxStringLength) + '...';
      }
      shortName = shortName;
      // switching to weighted frequencies
      if (freqWeight != null) { freq = freqWeight; }
      data.push({
        name: shortName,
        freq: freq
      });
    }
    const maxHeight = (data.length + 1) * 25;

    // sort based on catStat
    data = data.sort(function(a, b) {
      return a.catStat - b.catStat;
    });

    // set the dimensions and margins of the graph
    const margin = { top: 0, right: 20, bottom: 30, left: 90 };
    const width = 500 - margin.left - margin.right;
    const height = maxHeight - margin.top - margin.bottom;

    // set the ranges
    const y = d3
      .scaleBand()
      .range([height, 0])
      .padding(0.3);

    const x = d3.scaleLinear().range([0, width]);

    const element = this.chartContainer.nativeElement;

    const svg = d3
      .select(element)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // format the data
    data.forEach((d) => {
      d.freq = +d.freq;
    });

    // Scale the range of the data in the domains
    x.domain([
      0,
      d3.max(data, (d) => {
        return d.freq;
      })
    ]);
    y.domain(
      data.map((d) => {
        return d.name;
      })
    );

    // append the rectangles for the bar chart
    let count = 0;
    svg
      .selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('width', (d) => {
        return x(d.freq);
      })
      .attr('y', (d) => {
        return y(d.name);
      })
      .attr('fill', (d) => {
        count += 1;
        return obj.getColor(count);
      })
      .attr('height', y.bandwidth());

    // add the x Axis
    svg
      .append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x));

    // add the y Axis
    svg.append('g').call(d3.axisLeft(y));
  }

  getColor(num) {
    let color = '';
    if (num < this.colorArray.length) {
      color = this.colorArray[num];
    } else {
      color = this.getRandomColor();
    }
    return color;
  }
  getRandomColor() {
    const letters = '0123456789ABCDEF'.split('');
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
}
