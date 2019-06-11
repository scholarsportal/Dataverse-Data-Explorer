import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit {
  @ViewChild('chart') private chartContainer: ElementRef;
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
    console.log(_data);
    for (let i = 0; i < _data.length; i++) {
      console.log('chart: data.length ' + _data.length);
      let freq = null;
      let freqWeight = null;
      if (typeof _data[i].catStat !== 'undefined') {
        console.log(_data[i].catStat);
        for (let j = 0; j < _data[i].catStat.length; j++) {
          const sub_obj = _data[i].catStat[j];
          if (sub_obj['@type'] === 'freq' && !sub_obj['@wgtd']) {
            freq = sub_obj['#text'];
          } else {
            if (sub_obj['@type'] === 'freq' && sub_obj['@wgtd'] && sub_obj['#text'] !== '') {
              freqWeight = sub_obj['#text'];
            }
          }
        }
        // dataverse ddi exception
        if (!freq) {
          freq = _data[i].catStat['#text'];
        }
      }
      let short_name = _data[i].labl['#text'];

      if (short_name.length > this.maxStringLength) {
        short_name = short_name.substring(0, this.maxStringLength) + '...';
      }
      short_name = short_name;
      // switching to weighted frequencies
      if (freqWeight != null) { freq = freqWeight; }
      data.push({
        name: short_name,
        freq: freq
      });
    }
    const max_height = (data.length + 1) * 25;

    // sort bars based on value
    data = data.sort(function(a, b) {
      return d3.ascending(a.freq, b.freq);
    });

    // set the dimensions and margins of the graph
    const margin = { top: 0, right: 20, bottom: 30, left: 90 };
    const width = 500 - margin.left - margin.right;
    const height = max_height - margin.top - margin.bottom;

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
    let color;
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
