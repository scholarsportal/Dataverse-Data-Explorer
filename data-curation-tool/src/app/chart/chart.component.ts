import { Component, OnInit,ViewChild, ElementRef,Input } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit {
  @ViewChild('chart') private chartContainer: ElementRef;

  color_array=["#3366cc","#dc3912","#ff9900","#109618","#990099","#0099c6","#dd4477","#66aa00","#b82e2e","#316395","#994499","#22aa99","#aaaa11","#6633cc","#e67300","#8b0707","#651067","#329262","#5574a6","#3b3eac","#b77322","#16d620","#b91383","#f4359e","#9c5935","#a9c413","#2a778d","#668d1c","#bea413","#0c5922","#743411"];

  @Input() private data: Array<any>;

  constructor() { }

  ngOnInit() {

   this.createChart(this.data)
  }

  createChart(_data){
    var obj=this;
    var data = this.data;
      data=[];
      for(var i =0;i<_data.length;i++){

        var freq=null
        for(var j =0;j<_data[i].catStat.length;j++) {
          var sub_obj=_data[i].catStat[j]
          if(sub_obj["@type"]=="freq" && !sub_obj["@wgtd"]){
            freq=sub_obj["#text"]
          }
        }
        //dataverse ddi exception
        if(!freq){
          freq=_data[i].catStat["#text"]
        }
        data.push({
          name:_data[i].labl["#text"],
          freq:freq

        })
      }
  var max_height = (data.length+1)*25

    //sort bars based on value
    data = data.sort(function (a, b) {
      return d3.ascending(a.freq, b.freq);
    })

    // set the dimensions and margins of the graph
    var margin = {top: 0, right: 20, bottom: 30, left: 90},
      width = 500 - margin.left - margin.right,
      height = max_height - margin.top - margin.bottom;


    // set the ranges
    var y = d3.scaleBand()
      .range([height, 0])
      .padding(0.3);

    var x = d3.scaleLinear()
      .range([0, width]);

    const element = this.chartContainer.nativeElement;


    const svg = d3.select(element).append('svg')
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    // format the data
    data.forEach(function(d) {
      d.freq = +d.freq;
    });

    // Scale the range of the data in the domains
    x.domain([0, d3.max(data, function(d){ return d.freq; })])
    y.domain(data.map(function(d) { return d.name; }));
    //y.domain([0, d3.max(data, function(d) { return d.freq; })]);

    // append the rectangles for the bar chart
    var count=0
    svg.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("width", function(d) {return x(d.freq); } )
      .attr("y", function(d) { return y(d.name); })
      .attr("fill",
        function(d) {
          count+=1
          return obj.getColor(count);
        })
      .attr("height", y.bandwidth());

    // add the x Axis
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    // add the y Axis
    svg.append("g")
      .call(d3.axisLeft(y));

  }


  getColor(num){
    var color;
    if(num<this.color_array.length){
      color=this.color_array[num]
    }else{
      color=this.getRandomColor()
    }
    return color
  }
  getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');//'0123456789ABCDEF'
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

}
