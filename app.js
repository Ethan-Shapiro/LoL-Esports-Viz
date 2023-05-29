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
const width = 600 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

const container = d3.select("#plot-1-container");

// Create the SVG element
const svg = container
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

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
    .select("body")
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
    svg.selectAll(".point").remove();

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
    teams.forEach((team) => {
      const teamData = filteredData.filter((d) => d.TeamName === team);

      // Add the line
      svg.append("path").datum(teamData).attr("class", "line").attr("d", line);

      // Add the points
      svg
        .selectAll(".point")
        .data(teamData)
        .enter()
        .append("circle")
        .attr("class", "point")
        .attr("cx", (d) => xScale(d.Year))
        .attr("cy", (d) => yScale(d.WinPercentage))
        .attr("r", 4);
    });
  }

  // Call the updateChart function initially
  updateChart();
});
