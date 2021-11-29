const svg = d3.select("svg"),
  width = +svg.attr("width"),
  height = +svg.attr("height"),
  linkDistance = 200;

let colors = d3.scaleOrdinal(d3.schemeCategory20);


console.log('colors', colors);

const simulation = d3
  .forceSimulation()
  .force(
    "link",
    d3.forceLink().id(function (d) {
      return d.id;
    })
  )
  .force("charge", d3.forceManyBody())
  .force("center", d3.forceCenter(width / 2, height / 2));

d3.json("js/data.json", function (error, graph) {
  if (error) throw error;

  let color = d3.scaleOrdinal(d3.schemeCategory20);

  let tooltip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);

  const link = svg
    .append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(graph.links)
    .enter()
    .append("line")
    .attr("stroke-width", function (d) {
      return 1;
      //return Math.sqrt(d.value);
    });

  let node = svg
    .append("g")
    .attr("class", "nodes")
    .selectAll("g")
    .data(graph.nodes)
    .enter()
    .append("g");

  let circles = node
    .append("circle")
    .attr("r", function(d){ return d.size;})
    .attr("fill", function (d) {
      return color(d.size * 3);
    })
    // @see https://bl.ocks.org/almsuarez/4333a12d2531d6c1f6f22b74f2c57102
    .on('mouseover.tooltip', function(d) {
      tooltip.transition()
        .duration(300)
        .style("opacity", .8);
      tooltip.html("Name:" + d.id + "<p/>link:" + d.link)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY + 10) + "px");
    })
    .on("mouseout.tooltip", function() {
      tooltip.transition()
        .duration(100)
        .style("opacity", 0);
    });

  // Create a drag handler and append it to the node object instead
  const drag_handler = d3
    .drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);

  drag_handler(node);

  const lables = node
    .append("text")
    .text(function (d) {
      return d.id;
    })
    .attr("x", 6)
    .attr("y", 3);

  node.append("title").text(function (d) {
    return d.id;
  });

  simulation.nodes(graph.nodes).on("tick", ticked);

  simulation.force("link").links(graph.links);

  function ticked() {
    link
      .attr("x1", function (d) {
        return d.source.x;
      })
      .attr("y1", function (d) {
        return d.source.y;
      })
      .attr("x2", function (d) {
        return d.target.x;
      })
      .attr("y2", function (d) {
        return d.target.y;
      });

    node.attr("transform", function (d) {
      return "translate(" + d.x + "," + d.y + ")";
    });
  }
});

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}

function releasenode(d) {
  d.fx = null;
  d.fy = null;
}

function fade(opacity) {
  return d => {
    node.style('stroke-opacity', function (o) {
      const thisOpacity = isConnected(d, o) ? 1 : opacity;
      this.setAttribute('fill-opacity', thisOpacity);
      return thisOpacity;
    });

    link.style('stroke-opacity', o => (o.source === d || o.target === d ? 1 : opacity));

  };
}
