function loadPlots() {
  part1();
  part2();
}

function part1() {
  let dateParser = d3.timeParse("%Y");

  let rowConverter = function (d) {
    return {
      Year: new Date(d.year, 0),
      League: d.league,
      TeamName: d.teamname,
      WinPercentage: parseFloat(d.result),
    };
  };

  // Define the SVG dimensions and margins
  const margin = { top: 20, right: 30, bottom: 30, left: 60 };
  const width = 900 - margin.left - margin.right;
  const height = 700 - margin.top - margin.bottom;

  const container = d3.select("#plot-1-container");

  // Create the SVG element
  const svg = container
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Create a title element
  // Create a title element
  svg
    .append("text")
    .attr("x", width / 2) // Set x position at the center of the SVG
    .attr("y", margin.top / 2) // Set y position above the top margin
    .attr("text-anchor", "middle") // Set the text anchor to the middle
    .text("Pro Team Winrate by Region") // Set the title text
    .attr("class", "title") // Set a class for styling (optional)
    .style("font-size", "16px") // Adjust the font size (optional)
    .style("font-weight", "bold"); // Adjust the font weight (optional)

  const tooltip = d3
    .select("#tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px");

  // Define the scales
  const xScale = d3.scaleTime().range([0, width]);
  const yScale = d3.scaleLinear().range([height, 0]);

  // Define the axes
  const xAxis = d3.axisBottom().scale(xScale);
  const yAxis = d3.axisLeft().scale(yScale);

  // Define the line generator
  const line = d3
    .line()
    .x((d) => xScale(d.Year))
    .y((d) => yScale(d.WinPercentage));

  // Load the data
  d3.csv("team_winperc_by_year.csv", rowConverter).then((data) => {
    // Extract unique league names
    const leagues = Array.from(new Set(data.map((d) => d.League)));

    // Create radio buttons for league selection
    const radioButtons = d3
      .select("#btn-containers")
      .append("div")
      .attr("class", "radio-buttons")
      .selectAll("input")
      .data(leagues)
      .enter()
      .append("label")
      .text((d) => d)
      .append("input")
      .attr("type", "radio")
      .attr("name", "league")
      .attr("value", (d) => d)
      .on("change", updateChart);

    // Set the initial selection
    radioButtons.property("checked", (d, i) => i === 0);

    // Function to update the chart based on the selected league
    function updateChart() {
      const selectedLeague = d3
        .select("input[name='league']:checked")
        .node().value;
      const filteredData = data.filter((d) => d.League === selectedLeague);

      // Set the domains for the scales
      xScale.domain(d3.extent(filteredData, (d) => d.Year));
      yScale.domain([0, 1]);

      // Remove existing lines and points
      svg.selectAll(".line").remove();
      svg.selectAll("#point").remove();

      // Add the x-axis
      svg
        .append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);

      // Add the y-axis
      svg.append("g").attr("class", "y-axis").call(yAxis);

      var line = d3
        .line()
        .x((d) => xScale(d.Year))
        .y((d) => yScale(d.WinPercentage))
        .curve(d3.curveMonotoneX);

      // Add lines and points for each team
      const teams = Array.from(new Set(filteredData.map((d) => d.TeamName)));
      const colorScale = d3
        .scaleOrdinal([
          "#6e40aa",
          "#bf3caf",
          "#fe4b83",
          "#ff7847",
          "#e2b72f",
          "#aff05b",
          "#52f667",
          "#1ddfa3",
          "#23abd8",
          "#4c6edb",
          "#6e40aa",
        ])
        .domain(teams);
      teams.forEach((team) => {
        const teamData = filteredData.filter((d) => d.TeamName === team);
        // Add the line
        svg
          .append("path")
          .datum(teamData)
          .attr("class", "line")
          .attr("d", line)
          .style("fill", "none")
          .style("stroke", (d) => colorScale(d[0].TeamName))
          .style("stroke-width", "5")
          .on("mouseover", handleMouseOver) // Attach mouseover event handler
          .on("mouseout", handleMouseOut); // Attach mouseout event handler;

        // Add the points
        svg
          .selectAll(".point")
          .data(teamData)
          .enter()
          .append("circle")
          .attr("class", (d, i) => `point${i}`)
          .attr("id", "point")
          .attr("cx", (d) => xScale(d.Year))
          .attr("cy", (d) => yScale(d.WinPercentage))
          .attr("r", 7)
          .attr("fill", (d) => colorScale(d.TeamName))
          .on("mouseover", handleMouseOver) // Attach mouseover event handler
          .on("mouseout", handleMouseOut); // Attach mouseout event handler;
      });
      // Event handler for mouseover event
      function handleMouseOver(event, d) {
        // Set tooltip content
        tooltip
          .html(d.TeamName)
          .style("opacity", 1)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 10 + "px");
        // Show tooltip
        // tooltip.transition().duration(200).style("opacity", 1);
      }

      // Event handler for mouseout event
      function handleMouseOut(d, i) {
        // Hide tooltip
        tooltip.transition().duration(200).style("opacity", 0);
      }
    }

    // Call the updateChart function initially
    updateChart();
  });
}

function part2() {
  const margin = { top: 20, right: 30, bottom: 30, left: 60 };
  const width = 900 - margin.left - margin.right;
  const height = 700 - margin.top - margin.bottom;
  const container = d3.select("#plot-2-container");

  // Create the SVG element
  const svg = container
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  function zoomed(event) {
    svg.attr("transform", event.transform);
  }

  // Create the zoom behavior
  const zoom = d3.zoom().scaleExtent([0.1, 3]).on("zoom", zoomed);

  // Apply the zoom behavior to the SVG container
  container.call(zoom);

  d3.csv("node_data.csv").then(function (data) {
    // Extract the required columns from the data
    let unique_champs_1 = new Set(
      data.map(function (d) {
        return d.champ1;
      })
    );
    let unique_champs_2 = new Set(
      data.map(function (d) {
        return d.champ2;
      })
    );
    let unique_champs = Array.from(
      new Set([...unique_champs_1, ...unique_champs_2])
    );
    var champions = Array.from(
      unique_champs.map(function (d) {
        return { champ: d };
      })
    );

    data = d3.filter(data, (d) => d.playrate > 0.06 && d.winrate > 0.4);

    // Set the default force to playrate
    var forceData = data.map(function (d) {
      return {
        source: d.champ1,
        target: d.champ2,
        playrate: +d.playrate,
        winrate: +d.winrate,
        count: +d.count,
      };
    });

    // Create the force simulation
    var simulation = d3
      .forceSimulation(champions)
      .force(
        "link",
        d3
          .forceLink(forceData)
          .id(function (d) {
            return d.champ;
          })
          .distance(200)
          .strength(3)
      )
      .force("charge", d3.forceManyBody().strength(-20))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // Create the links
    var links = svg
      .selectAll("line")
      .data(forceData)
      .enter()
      .append("line")
      .attr("stroke", "black")
      .attr("stroke-width", function (d) {
        return d.playrate * 10; // Adjust the scale factor as needed
      });

    // Create the nodes
    var nodes = svg
      .selectAll("circle")
      .data(champions)
      .enter()
      .append("circle")
      .attr("r", 10)
      .attr("fill", "blue")
      .call(
        d3
          .drag()
          .on("start", dragStarted)
          .on("drag", dragged)
          .on("end", dragEnded)
      );

    // Create the node labels
    var labels = svg
      .selectAll("text")
      .data(champions)
      .enter()
      .append("text")
      .text(function (d) {
        return d.champ;
      })
      .attr("font-size", "12px")
      .attr("dx", 15)
      .attr("dy", 4);

    // Toggle between playrate and winrate forces
    function toggleForce() {
      var forceType = this.value; // "playrate" or "winrate"

      // Update the force data based on the selected force type
      forceData = data.map(function (d) {
        return {
          source: d.champ1,
          target: d.champ2,
          value: forceType === "winrate" ? +d.winrate : +d.playrate,
        };
      });

      // Update the link stroke widths
      links.attr("stroke-width", function (d) {
        return d.value * 5; // Adjust the scale factor as needed
      });

      // Restart the simulation with the updated forces
      simulation.force(
        "link",
        d3
          .forceLink(forceData)
          .id(function (d) {
            return d.champ;
          })
          .distance(200)
          .strength(3)
      );
      simulation.alpha(1).restart();
    }

    // Event listener for force toggle
    d3.select("body")
      .append("div")
      .attr("class", "force-toggle")
      .html(
        '<input type="radio" name="force" value="playrate" checked> Playrate<br>' +
          '<input type="radio" name="force" value="winrate"> Winrate'
      )
      .on("change", toggleForce);

    // Start the simulation
    simulation.on("tick", function () {
      links
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

      nodes
        .attr("cx", function (d) {
          return d.x;
        })
        .attr("cy", function (d) {
          return d.y;
        });

      labels
        .attr("x", function (d) {
          return d.x;
        })
        .attr("y", function (d) {
          return d.y;
        });
    });

    function dragStarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragEnded(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  });
}

function part3() {}
