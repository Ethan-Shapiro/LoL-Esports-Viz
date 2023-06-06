function loadPlots() {
  part1();
  part2();
  part3();
  part4();
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

    function updateChart() {
      const selectedLeague = d3
        .select("input[name='league']:checked")
        .node().value;
      const filteredData = data.filter((d) => d.League === selectedLeague);

      // Set the domains for the scales
      xScale.domain(d3.extent(filteredData, (d) => d.Year));
      yScale.domain([0, 1]);

      // Remove existing x-axis
      svg.select(".x-axis").remove();

      // Add the x-axis
      svg
        .append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);

      // Remove existing lines and points
      svg.selectAll(".line").remove();
      svg.selectAll("#point").remove();

      var line = d3
        .line()
        .x((d) => xScale(d.Year))
        .y((d) => yScale(d.WinPercentage))
        .curve(d3.curveMonotoneX);

      // Remove existing y-axis
      svg.select(".y-axis").remove();

      // Add the y-axis
      svg.append("g").attr("class", "y-axis").call(yAxis);

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
    d3.select("#part2")
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

function part3() {
  const margin = { top: 20, right: 30, bottom: 30, left: 60 };
  const width = 1200 - margin.left - margin.right;
  const height = 1000 - margin.top - margin.bottom;
  var mapContainer = d3
    .select("#plot-3-container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const legendContainer = mapContainer
    .append("g")
    .attr("class", "legend-container")
    .attr("transform", `translate(${width - 120}, ${height - 150})`);
  //TO DO: Create projection and pathgeo variables for world
  const projection = d3
    .geoNaturalEarth1()
    .center([0, 0])
    .scale(225)
    .translate([width / 2, height / 2]);

  const pathgeo = d3.geoPath().projection(projection);

  function classMapper(countryName) {
    const countries = [
      "France",
      "Ireland",
      "United Kingdom",
      "Germany",
      "Norway",
      "Sweden",
      "Finland",
      "Denmark",
      "Netherlands",
      "Mexico",
      "Honduras",
      "Guatemala",
      "El Salvador",
      "Nicaragua",
      "Columbia",
      "Peru",
      "Bolivia",
      "Chile",
      "Paraguay",
      "Argentina",
      "USA",
      "Canada",
      "South Korea",
      "China",
    ];
    if (countries.includes(countryName)) return "tochange";
    return "worldpath";
  }

  function idMapper(id) {
    const europeCountries = [
      "France",
      "Ireland",
      "United Kingdom",
      "Germany",
      "Norway",
      "Sweden",
      "Finland",
      "Denmark",
      "Netherlands",
    ];
    const latinCountries = [
      "Mexico",
      "Honduras",
      "Guatemala",
      "El Salvador",
      "Nicaragua",
      "Columbia",
      "Peru",
      "Bolivia",
      "Chile",
      "Paraguay",
      "Argentina",
    ];
    const northCountries = ["USA", "Canada"];

    if (europeCountries.includes(id)) {
      return "europe";
    } else if (latinCountries.includes(id)) {
      return "latin";
    } else if (northCountries.includes(id)) {
      return "america";
    }
    return id;
  }
  const legendWidth = 20;
  const legendHeight = 150;
  //TO DO: Load JSON file and create the map
  d3.json("world.json").then((map) => {
    mapContainer
      .selectAll(".worldpath")
      .data(map.features)
      .enter()
      .append("path")
      .attr("class", (d) => classMapper(d.properties.name))
      .attr("id", (d) => idMapper(d.properties.name))
      .attr("d", pathgeo)
      .attr("fill", "grey")
      .style("opacity", 0.25)
      .style("stroke-width", 2)
      .style("stroke", "black")
      .style("stroke-opacity", 0.5);

    const regionsMap = {
      america: "LCS",
      "South Korea": "LCK",
      China: "LPL",
      latin: "LLA",
      europe: "LEC",
    };

    // Load the CSV data
    d3.csv("regional_data.csv").then((data) => {
      // Convert numerical values to numbers
      data.forEach((d) => {
        d.year = +d.year;
        d.deaths = +d.deaths;
        d.assists = +d.assists;
        d.kills = +d.kills;
        d.damagetochampions = +d.damagetochampions;
        d.wardsplaced = +d.wardsplaced;
        d.wardskilled = +d.wardskilled;
        d.controlwardsbought = +d.controlwardsbought;
        d.totalgold = +d.totalgold;
        d.totalcs = +d.totalcs;
      });

      // Create a slider for years
      const years = data.map((d) => d.year);
      const sliderContainer = d3.select("#slider-container");

      const slider = d3
        .sliderBottom()
        .min(d3.min(years))
        .max(d3.max(years))
        .width(800)
        .tickFormat(d3.format("d"))
        .ticks(5)
        .step(1)
        .default(d3.max(years))
        .on("onchange", (year) => {
          // Update the map based on the selected year
          updateMap(year);
        });

      sliderContainer
        .append("svg")
        .attr("width", 900)
        .attr("height", 100)
        .append("g")
        .attr("transform", "translate(30,30)")
        .call(slider);

      // Create a dropdown for statistics
      const statsContainer = d3.select("#stats-container");

      const stats = [
        { value: "deaths", label: "Deaths" },
        { value: "assists", label: "Assists" },
        { value: "kills", label: "Kills" },
        { value: "damagetochampions", label: "Damage to Champions" },
        { value: "wardsplaced", label: "Wards Placed" },
        { value: "wardskilled", label: "Wards Killed" },
        { value: "controlwardsbought", label: "Control Wards Bought" },
        { value: "totalgold", label: "Total Gold" },
        { value: "total cs", label: "Total CS" },
      ];

      const statDropdown = statsContainer
        .append("select")
        .attr("id", "stat-dropdown")
        .on("change", () => {
          // Update the map based on the selected statistic
          const selectedStat = document.getElementById("stat-dropdown").value;
          updateMap(slider.value(), selectedStat);
        });

      statDropdown
        .selectAll("option")
        .data(stats)
        .enter()
        .append("option")
        .attr("value", (d) => d.value)
        .text((d) => d.label);

      function updateLegend(colorScale) {
        // Remove existing legend
        legendContainer.selectAll("*").remove();

        const legendAxis = d3
          .axisRight()
          .scale(
            d3
              .scaleLinear()
              .range([legendHeight, 0])
              .domain(colorScale.domain())
          )
          .ticks(5);

        legendContainer
          .append("g")
          .attr("class", "legend-axis")
          .attr("transform", `translate(${legendWidth}, 0)`)
          .call(legendAxis);

        const legendGradient = legendContainer
          .append("defs")
          .append("linearGradient")
          .attr("id", "legend-gradient")
          .attr("gradientTransform", "rotate(90)");

        legendGradient
          .append("stop")
          .attr("offset", "0%")
          .attr("stop-color", colorScale.range()[1]);

        legendGradient
          .append("stop")
          .attr("offset", "100%")
          .attr("stop-color", colorScale.range()[0]);

        legendContainer
          .append("rect")
          .attr("x", 0)
          .attr("y", 0)
          .attr("width", legendWidth)
          .attr("height", legendHeight)
          .style("fill", "url(#legend-gradient)");
      }

      // Function to update the map based on the selected year and statistic
      function updateMap(year, statistic = "deaths") {
        const filteredData = data.filter((d) => d.year === year);
        const regionsData = d3.rollup(
          filteredData,
          (v) => d3.mean(v, (d) => d[statistic]),
          (d) => d.league
        );
        // Create a continuous color scale
        const colorScale = d3
          .scaleSequential(d3.interpolateBlues)
          .domain(d3.extent(Array.from(regionsData.values())));

        mapContainer
          .selectAll(".tochange")
          .style("opacity", 1)
          .attr("fill", (d) => {
            const region = idMapper(d.properties.name);
            const value = regionsData.get(regionsMap[region]);
            return value ? colorScale(value) : "grey";
          });

        updateLegend(colorScale);
      }

      // Initial map update
      updateMap(d3.max(years));

      // Update the legend when the slider value changes
      slider.on("onchange", (year) => {
        // Update the map based on the selected year
        const selectedStat = document.getElementById("stat-dropdown").value;
        updateMap(year, selectedStat);
      });
    });
  });
}

function part4() {
  // Assuming you have an HTML element with id "chart" to render the chart
  const svg = d3
    .select("#plot-4-container")
    .append("svg")
    .attr("width", 800)
    .attr("height", 400);

  // Load the CSV data
  d3.csv("champ_stats.csv")
    .then((data) => {
      // Get the available categories from the data
      const categories = Object.keys(data[0]).slice(1);
      console.log(categories);

      // Create the dropdown menu
      const dropdown = d3
        .select("#dropdown")
        .append("select")
        .on("change", function () {
          const selectedCategory = d3.select(this).property("value");
          updateChart(selectedCategory);
        });

      dropdown
        .selectAll("option")
        .data(categories)
        .enter()
        .append("option")
        .attr("value", (d) => d)
        .text((d) => d);

      // Function to update the chart based on the selected category
      const updateChart = (category) => {
        // Sort the data based on the selected category
        data.sort((a, b) => b[category] - a[category]);
        // Get the top 10 champions for the selected category
        const topChampions = data.slice(0, 10);

        // Clear the previous chart
        svg.selectAll("*").remove();

        // Define the chart dimensions
        const margin = { top: 50, right: 20, bottom: 30, left: 40 };
        const width = +svg.attr("width") - margin.left - margin.right;
        const height = +svg.attr("height") - margin.top - margin.bottom;

        // Create the x-axis scale
        const xScale = d3
          .scaleBand()
          .rangeRound([0, width])
          .padding(0.1)
          .domain(topChampions.map((d) => d.champion));

        // Create the y-axis scale
        const yScale = d3
          .scaleLinear()
          .rangeRound([height, 0])
          .domain([0, d3.max(topChampions, (d) => +d[category])]);

        // Create the x-axis
        svg
          .append("g")
          .attr(
            "transform",
            `translate(${margin.left}, ${height + margin.top})`
          )
          .call(d3.axisBottom(xScale));

        // Create the y-axis
        svg
          .append("g")
          .attr("transform", `translate(${margin.left}, ${margin.top})`)
          .call(d3.axisLeft(yScale));

        // Create the bars
        svg
          .selectAll(".bar")
          .data(topChampions)
          .enter()
          .append("rect")
          .attr("class", "bar")
          .attr("x", (d) => xScale(d.champion) + margin.left)
          .attr("y", (d) => yScale(+d[category]) + margin.top)
          .attr("width", xScale.bandwidth())
          .attr("height", (d) => height - yScale(+d[category]))
          .attr("fill", "steelblue");

        svg
          .append("text")
          .attr("x", width / 2 + margin.left)
          .attr("y", margin.top / 2)
          .attr("text-anchor", "middle")
          .attr("font-weight", "bold")
          .text(`Top 10 Champions - ${category}`);
      };

      // Initial chart
      const initialCategory = categories[0];
      updateChart(initialCategory);
    })
    .catch((error) => {
      console.log(error);
    });
}
