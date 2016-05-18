$(document).ready(function() {
	var n = 0;
	$('#add-field').on('click', function() {
		n++;
		$('.new-fields').append(
			'<div class="form-group">' + 
			'<input type="text" class="form-control new" name="new-' + n + '"></div>'
		);

		$('#new-fields').val(n);
	});
});

function makePieChart(data) {
  console.log(data);
  // chart based on Mike Bostock block at 
  // https://bl.ocks.org/mbostock/3887235

  // set up pie chart vars
  var width = 350;
  var height = 350;
  var r = Math.min(width, height) / 2;
  var color = d3.scale.category20();
  // pie slices
  var arc = d3.svg.arc()
    .outerRadius(radius - 10)
    .innerRadius(0);

  // labels for data
  var labelArc = d3.svg.arc()
    .outerRadius(radius - 20)
    .innerRadius(radius - 20);

  var pie = d3.layout.pie()
    .sort(null)
    .value(function(d){ return d.count; });

  var svg = d3.select('.pie-chart')
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  var g = svg.selectAll(".arc")
    .data(pie(data))
    .enter()
    .append("g")
    .attr("class", "arc");

  g.append("path")
    .attr("d", arc)
    .style("fill", function(d) {
      return color(d.data.name);
    });
  // chart labels
  g.append("text")
    .attr("transform", function(d) { 
      return "translate(" + labelArc.centroid(d) + ")"; 
    })
    .attr("dy", "0.5em")
    .text(function(d) {
      return d.data.name;
    });
}                                                                                                                           