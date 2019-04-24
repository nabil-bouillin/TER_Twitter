/* BASE DU SUNBURST*/

var colors = {
       "RT": "#5687d1",
       "LINKS": "#7b615c",
       "COORD": "#de783b",
       "OTHERS" : "#049B0E"
};

var width = 500;
var height = 400;
var radius = Math.min(width, height) / 2;

// Breadcrumb dimensions: width, height, spacing, width of tip/tail.
var b = {
  w: 75, h: 30, s: 3, t: 10
};

// Total size of all segments; we set this later, after loading the data.
var totalSize = 0;

var vis = d3.select("#chart").append("svg:svg")
           .attr("width", width)
           .attr("height", height)
           .append("svg:g")
           .attr("id", "container")
           .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");




/*********************************/
function createVisualization(json) {
 var partition = d3.partition()
                .size([2 * Math.PI, radius * radius]);
 var arc = d3.arc()
            .startAngle(function(d) { return d.x0; })
           .endAngle(function(d) { return d.x1; })
           .innerRadius(function(d) { return Math.sqrt(d.y0); })
           .outerRadius(function(d) { return Math.sqrt(d.y1); });
 // Basic setup of page elements.
 drawLegend();

 // Bounding circle underneath the sunburst, to make it easier to detect
 // when the mouse leaves the parent g.
 vis.append("svg:circle")
     .attr("r", radius)
     .style("opacity", 0);

 // Turn the data into a d3 hierarchy and calculate the sums.
 var root = d3.hierarchy(json)
     .sum(function(d) { return d.size; })
     .sort(function(a, b) { return b.value - a.value; });
 console.log(json);

 // For efficiency, filter nodes to keep only those large enough to see.
 var nodes = partition(root).descendants()
     .filter(function(d) {
         return (d.x1 - d.x0 > 0.005); // 0.005 radians = 0.29 degrees
     });

 var path = vis.data([json]).selectAll("path")
     .data(nodes)
     .enter().append("svg:path")
     .attr("display", function(d) { return d.depth ? null : "none"; })
     .attr("d", arc)
     .attr("fill-rule", "evenodd")
     .style("fill", function(d) { return colors[d.data.name]; })
     .style("opacity", 1)
     .on("mouseover", mouseover);


 // Add the mouseleave handler to the bounding circle.
 d3.select("#container").on("mouseleave", mouseleave);

 // Get total size of the tree = value of root node from partition.
 totalSize = path.datum().value;
}

// Fade all but the current sequence, and show it in the breadcrumb trail.
function mouseover(d) {
 var percentage = (100 * d.value / totalSize).toPrecision(3);
 var size = d.value + "/" + totalSize;
 var name = d.data.name;
 var percentageString = percentage + "%";
 if(name.length>6){
   d3.select("#name")
       .style("font-size","1.8em");
 }else{
   d3.select("#name")
       .style("font-size","2.8em");
 }
 if (percentage < 0.1) {
   percentageString = "< 0.1%";
 }
 d3.select("#percentage")
     .text(percentageString);
 d3.select("#size")
     .text(size);
 d3.select("#name")
     .text(name);
 d3.select("#explanation")
     .style("visibility", "");

 var sequenceArray = d.ancestors().reverse();
 sequenceArray.shift(); // remove root node from the array

 // Fade all the segments.
 d3.selectAll("path")
     .style("opacity", 0.3);

 // Then highlight only those that are an ancestor of the current segment.
 vis.selectAll("path")
     .filter(function(node) {
               return (sequenceArray.indexOf(node) >= 0);
             })
     .style("opacity", 1);
}

// Restore everything to full opacity when moving off the visualization.
function mouseleave(d) {
  // Desactivate all segments during transition.
 d3.selectAll("path").on("mouseover", null);

 // Transition each segment to full opacity and then reactivate it.
 d3.selectAll("path")
     .transition()
     .duration(1000)
     .style("opacity", 1)
     .on("end", function() {
             d3.select(this).on("mouseover", mouseover);
           });

 d3.select("#explanation")
     .style("visibility", "hidden");
}

function drawLegend() {
 var li = {
   w: 75, h: 30, s: 3, r: 3
 };

 var legend = d3.select("#legend").append("svg:svg")
     .attr("width", li.w)
     .attr("height", d3.keys(colors).length * (li.h + li.s));

 var g = legend.selectAll("g")
     .data(d3.entries(colors))
     .enter().append("svg:g")
     .attr("transform", function(d, i) {
             return "translate(0," + i * (li.h + li.s) + ")";
          });

 g.append("svg:rect")
     .attr("rx", li.r)
     .attr("ry", li.r)
     .attr("width", li.w)
     .attr("height", li.h)
     .style("fill", function(d) { return d.value; });

 g.append("svg:text")
     .attr("x", li.w / 2)
     .attr("y", li.h / 2)
     .attr("dy", "0.35em")
     .attr("text-anchor", "middle")
     .style("font-size",function(d) {
         if (d.key.length>8){
           return "9px";
         }else{
           return "12px";
         }
     })
     .text(function(d) {
         return d.key;
     });

}