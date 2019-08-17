"use strict";

const render = data => {
  console.log({ data });
  d3.select("svg").remove();
  d3.select(".tooltip").remove();
  const title = data.name;
  const width = 960;
  const height = 600;
  const margin = { top: 1, right: 1, bottom: 177, left: 1 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const body = d3.select("body");

  const tooltip = body
    .append("div")
    .attr("class", "tooltip")
    .attr("id", "tooltip")
    .style("opacity", 0);

  const svg = d3
    .select("div#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const color = d3.scaleOrdinal(d3.schemeCategory10);

  const treemap = d3
    .treemap()
    .size([innerWidth, innerHeight])
    .paddingInner(1);

  const root = d3
    .hierarchy(data)
    .eachBefore(
      d => (d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name)
    )
    .sum(sumBySize)
    .sort((a, b) => b.height - a.height || b.value - a.value);

  treemap(root);

  const cell = svg
    .selectAll("g")
    .data(root.leaves())
    .enter()
    .append("g")
    .attr("class", "group")
    .attr("transform", d => "translate(" + d.x0 + "," + d.y0 + ")");

  const tile = cell
    .append("rect")
    .attr("id", d => d.data.id)
    .attr("class", "tile")
    .attr("width", d => d.x1 - d.x0)
    .attr("height", d => d.y1 - d.y0)
    .attr("data-name", d => d.data.name)
    .attr("data-category", d => d.data.category)
    .attr("data-value", d => d.data.value)
    .attr("fill", d => color(d.data.category))
    .on("mouseover", d => {
      tooltip.style("opacity", 0.9);
      tooltip
        .html(
          "<strong>Name: </strong>" +
            d.data.name +
            "<br><strong>Category:</strong> " +
            d.data.category +
            "<br><strong>Value:</strong> " +
            d.data.value
        )
        .attr("data-value", d.data.value)
        .style("left", d3.event.pageX + 10 + "px")
        .style("top", d3.event.pageY - 28 + "px");
    })
    .on("mouseout", function(d) {
      tooltip.style("opacity", 0);
    });

  cell
    .append("text")
    .attr("class", "tile-text")
    .selectAll("tspan")
    .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g))
    .enter()
    .append("tspan")
    .attr("x", 4)
    .attr("y", function(d, i) {
      return 13 + i * 10;
    })
    .text(d => d);

  let categories = root.leaves().map(function(nodes) {
    return nodes.data.category;
  });
  categories = categories.filter(function(category, index, self) {
    return self.indexOf(category) === index;
  });

  svg
    .append("text")
    .attr("class", "title")
    .attr("id", "description")
    .attr("y", 580)
    .attr("x", 1)
    .attr("text-anchor", "start")
    .text(title);

  const legend = d3.select("svg").attr("id", "legend");
  const legendWidth = 500;
  const legendHeight = 500;
  const legendSize = 15;
  const legendColumnSpacing = 120;
  const legendRowSpacing = 10;
  const legendXoffset = 3;
  const legendYoffset = -2;
  const legendItemsPerRow = Math.floor(legendWidth / legendColumnSpacing);

  const legendItem = legend
    .append("g")
    .attr("transform", "translate(600," + legendHeight + ")")
    .selectAll("g")
    .data(categories)
    .enter()
    .append("g")
    .attr("transform", function(d, i) {
      return (
        "translate(" +
        (i % legendItemsPerRow) * legendColumnSpacing +
        "," +
        (Math.floor(i / legendItemsPerRow) * legendSize +
          legendRowSpacing * Math.floor(i / legendItemsPerRow)) +
        ")"
      );
    });

  legendItem
    .append("rect")
    .attr("width", legendSize)
    .attr("height", legendSize)
    .attr("class", "legend-item")
    .attr("fill", d => color(d));
  legendItem
    .append("text")
    .attr("x", legendSize + legendXoffset)
    .attr("y", legendSize + legendYoffset)
    .text(d => d);

  function sumBySize(d) {
    return d.value;
  }
};

Promise.all([
  d3.json(
    "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/kickstarter-funding-data.json"
  ),
  d3.json(
    "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json"
  ),
  d3.json(
    "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json"
  )
]).then(([kick, movie, game]) => {
  const kickButton = document.getElementById("kick");
  const movieButton = document.getElementById("movie");
  const gameButton = document.getElementById("game");

  kickButton.onclick = renderKick;
  movieButton.onclick = renderMovie;
  gameButton.onclick = renderGame;

  render(game); //for initial values

  function renderKick() {
    gameButton.classList.remove("init");
    movieButton.classList.remove("init");
    kickButton.classList.add("init");
    render(kick);
  }

  function renderMovie() {
    gameButton.classList.remove("init");
    kickButton.classList.remove("init");
    movieButton.classList.add("init");
    render(movie);
  }

  function renderGame() {
    kickButton.classList.remove("init");
    movieButton.classList.remove("init");
    gameButton.classList.add("init");
    render(game);
  }
});
