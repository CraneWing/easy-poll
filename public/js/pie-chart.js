// poll choices pie chart based on 
// Mike Bostock block at 
// https://bl.ocks.org/mbostock/3887235
// also uses d3.legend.js by Ziggy Jonsson
// pie animation from 
// http://jsfiddle.net/Nw62g/3/
function makePieChart(data) {
  
  // set up pie chart vars
  var width = 500;
  var height = 300;
  var radius = Math.min(width, height) / 2;
  var colors = d3.scale.category20();
  // pie slices
  var arc = d3.svg.arc()
    .outerRadius(radius - 10)
    .innerRadius(60);

  var pie = d3.layout.pie()
    .sort(null)
    .startAngle(1.1 * Math.PI)
    .endAngle(3.1 * Math.PI)
    .value(function(d){ 
      return d.choice_count;
    });

  var svg = d3.select('.pie-chart')
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 3 + "," + height / 2 + ")");

  var g = svg.selectAll(".arc")
    .data(pie(data))
    .enter()
    .append("g")
    .attr("class", "arc");

  g.append("path")
    .attr("d", arc)
    .style("fill", function(d) {
      return colors(d.data.choice_name);
    })
    .attr("data-legend",function(d) {
      return d.data.choice_name + ': ' + d.data.choice_count ;
    })
    .transition()
    .ease("exp")
    .duration(1500)
    .attrTween("d", tweenPie);
    
  // add chart legend
  var legend = svg.append("g")
    .attr("class","legend")
    .attr("transform","translate(170,-100)")
    .attr("data-style-padding", "6")
    .style("font-size","14px")
    .call(d3.legend);
    
  function tweenPie(b) {
    var i = d3.interpolate({startAngle: 1.1*Math.PI, endAngle: 1.1*Math.PI}, b);
    return function(t) { return arc(i(t)); };
  }
} 