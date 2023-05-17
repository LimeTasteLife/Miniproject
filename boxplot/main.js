document.addEventListener('DOMContentLoaded', (event) => {
  let data;
  let svg;
  let x;
  let y;
  let color;
  let cells;
  let tooltip;
  let selectedTypes = [];
  let selectedBoxplots = [];

  let svg2;
  let data2;
  let line;
  let path;
  let x2;
  let y2;
  let tooltip2;
  let crosshairX
  let crosshairY
  let lineData;


 

  const margin = { top: 10, right: 0, bottom: 100, left: 150 };
  const width = 1700;
  const height = 2000;
  const width2 = 1700;
  const height2 = 500;
  const margin2 = { top: 10, right: 20, bottom: 100, left: 20 };
  function processBatch(data, start, batchSize) {
    return new Promise((resolve, reject) => {
      const end = Math.min(start + batchSize, data.length);
      for(let i = start; i < end; i++) {
        data[i]._time = new Date(data[i]._time);
        data[i]._time.setTime(data[i]._time.getTime() - (9 * 60 * 60 * 1000));
        if (data[i].boxplot !== undefined) {
          data[i].boxplot = +data[i].boxplot;
        }
      }
      resolve();
    });
  }
  const chartWidth = width2 - margin2.left - margin2.right
  async function processDataInBatch(data, batchSize) {
      for(let i = 0; i < data.length; i += batchSize) {
          await processBatch(data, i, batchSize);
      }
  }

  window.onload = async function() {
    data = await d3.csv("data.csv");

    data.sort((a, b) => {
      if (a.moduleType < b.moduleType) return -1;
      if (a.moduleType > b.moduleType) return 1;
      if (a.moduleType === b.moduleType) {
        if (a.moduleName < b.moduleName) return -1;
        if (a.moduleName > b.moduleName) return 1;
        return 0;
      }
      return 0;
    });

    await processDataInBatch(data, 1000);  // process data in batches of 1000

    svg = d3.select("#chart")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    x = d3.scaleTime()
      .domain(d3.extent(data, d => d._time))
      .range([margin.left, width - margin.right]);

    y = d3.scaleBand()
      .domain(data.map(d => d.moduleName))
      .range([margin.top, height - margin.bottom]);

    color = d3.scaleOrdinal()
      .domain([-1, 1, 2, 3, 4, 5])
      .range(["#000000", "#8B0000", "#DC143C", "#708090", "#87CEEB", "#000080"]);

    cells = svg.append("g")
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", d => x(d._time))
      .attr("y", d => y(d.moduleName))
      .attr("width", 30*(width - margin.left - margin.right) / data.length)
      .attr("height", y.bandwidth()-2)
      .attr("fill", d => color(d.boxplot));

    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(null, "%m-%dT%H"))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

    tooltip = d3.select("#chart").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    cells.on("mouseover", (event, d) => {
          tooltip.transition()
            .duration(200)
            .style("opacity", .9);
            tooltip.html(`Time: ${convertTimestamp(d._time)}<br/>Module: ${d.moduleName}<br/>Type: ${d.moduleType}<br/>Boxplot: ${d.boxplot}<br/>Value:${formatNumber(Math.round(d.amountValue))}`)
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY-200) + "px");
        })
        .on("mouseout", (d) => {
          tooltip.transition()
            .duration(500)
            .style("opacity", 0);
        });
      
  data2 = await d3.csv("data2.csv");
  await processDataInBatch(data2, 1000);  // process data2 in batches of 1000
  svg2 = d3.select("#chart2")
    .append("svg")
    .attr("width", width2)
    .attr("height", height2)
    .on("mouseover", function() {
      crosshairX.style("display", null);
      crosshairY.style("display", null);
    })
    .on("mouseout", function() {
      crosshairX.style("display", "none");
      crosshairY.style("display", "none");
    })
    .on("mousemove", mousemove);

  x2 = d3.scaleTime()
    .domain(d3.extent(data2, d => d._time))
    .range([margin2.left, width2 - margin2.right]);
  
  y2 = d3.scaleLinear()
    .domain(d3.extent(data2, d => d.price))
    .range([height2 - margin2.bottom, margin2.top]);
  
  // Create X-axis for line chart
  svg2.append("g")
    .attr("transform", `translate(0,${height2 - margin2.bottom})`)
    .call(d3.axisBottom(x2).ticks(null, "%m-%dT%H"))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-65)");
  
  // Create Y-axis for line chart
  svg2.append("g")
    .attr("transform", `translate(${margin2.left},0)`)
    .call(d3.axisLeft(y2));
  
  line = d3.line()
    .defined(d => !isNaN(d.price))
    .x(d => x2(d._time)) // Use x2 scale for line chart
    .y(d => y2(d.price));
  
  path = svg2.append("path")
    .datum(data2)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("d", line);

  // circles = svg2.selectAll("circle")
  //   .data(data2)
  //   .enter().append("circle") // Uses enter().append() to create new dots
  //   .attr("class", "dot") // Assign a class for styling
  //   .attr("cx", function(d, i) { return x2(d._time) })
  //   .attr("cy", function(d, i) { return y2(d.price) })
  //   .attr("r", 3)
  //   .style("opacity", 0);

  tooltip2 = d3.select("#chart2").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
  
  //   circles.on("mouseover", (event, d) => {
  //     tooltip2.transition()
  //       .duration(200)
  //       .style("opacity", .9);
  //       console.log(d);
  //       tooltip2.html(`Time: ${convertTimestamp(d._time)}<br/>Price: ${d.price}`)
  //       .style("left", (event.pageX) + "px")
  //       .style("top", (event.pageY-200) + "px");
  //     })
  //     .on("mouseout", (d) => {
  //     tooltip2.transition()
  //       .duration(500)
  //       .style("opacity", 0);
  //     });
  // Add two lines that will be used as crosshairs


// Add a mousemove event to the SVG that updates the crosshairs' positions
svg2.selectAll("circle")
.data(data2)
.enter()
.append("circle")
.attr("cx", d => x2(d._time))
.attr("cy", d => y2(d.price))
.attr("r", 4)
.style("opacity", 0)
.on("mouseover", (event, d) => {
  tooltip2.transition()
    .duration(200)
    .style("opacity", 0.9);
  tooltip2.html(`Time: ${convertTimestamp(d._time)}<br/>Price: ${d.price}`)
    .style("left", (event.clientX) + "px")
    .style("top", (event.clientY - 300) + "px");
})
.on("mouseout", (d) => {
  tooltip2.transition()
    .duration(500)
    .style("opacity", 0);
});

  
  function mousemove(event) {
    const [mx, my] = d3.pointer(event);
  
    // Only update crosshair if within bounds
    if (mx >= margin2.left && mx <= 1674 && my >= margin2.top && my <= 390) {
      crosshairX
        .attr('x1', mx)
        .attr('x2', mx)
        .style("display", null);
  
      crosshairY
        .attr('y1', my)
        .attr('y2', my)
        .style("display", null);
    } else {
      crosshairX.style("display", "none");
      crosshairY.style("display", "none");
    }
  }
  
  // crosshair 선들을 생성하는 코드는 이 부분에 남겨둡니다
  crosshairX = svg2.append('line')
    .attr('stroke', 'black')
    .attr('stroke-width', 1)
    .attr('y1', margin2.top)
    .attr('y2', height2 - margin2.bottom);
  
  crosshairY = svg2.append('line')
    .attr('stroke', 'black')
    .attr('stroke-width', 1)
    .attr('x1', margin2.left)
    .attr('x2', width2 - margin2.right);
};



  document.getElementById("applyDateRange").addEventListener('click', updateDateRange);
  document.getElementById("applyLineChart").addEventListener('click', updateLineChartRange);


  let selectedDateRanges = [];
  let selectedLineChartRanges = [];

  function updateLineChartRange() {
    const fromInput = document.getElementById("fromLineChart").value;
    const toInput = document.getElementById("toLineChart").value;
    const from = parseDate(fromInput);
    const to = parseDate(toInput);
    if (from && to) {
      const range = { from: from, to: to, active: true };
      selectedLineChartRanges.push(range);
      addLineChartRangeToDisplay(range);
      drawLineChart(data2, range); // draw chart with new range
    }
  }

function drawLineChart(data, range) {
  
      // Filter data based on the range
      const filteredData = data.filter(d => d._time >= range.from && d._time <= range.to);
  
      // Update the domain of the x scale
      x2.domain(d3.extent(filteredData, d => d._time));
  
      // Redraw the line and x-axis
      path.datum(filteredData).attr("d", line);
      svg2.select('g').call(d3.axisBottom(x2).ticks(null, "%m-%dT%H"));
  
      // Clear existing lines
      svg2.selectAll("line.vertLine").remove();
  
      const k = Math.floor(filteredData.length / chartWidth);
      const k1 = filteredData.length / chartWidth
      if (k >= 1) {
          lineData = filteredData.filter((d, i) => i % (k + 1) === 0);
          svg2.selectAll("line.vertLine")
          .data(lineData)
          .enter()
          .append("line")
          .attr("class", "vertLine")
          .attr("x1", d => x2(d._time))
          .attr("x2", d => x2(d._time))
          .attr("y1", margin2.top)
          .attr("y2", height2 - margin2.bottom)
          .attr("stroke", "grey")
          .attr("stroke-width", 1)  // The width is 1 as per your requirement
          .style("opacity", 0)  // This makes the lines initially invisible
          .on("mouseover", (event, d) => {
            tooltip2.transition()
              .duration(200)
              .style("opacity", 0.9);
            tooltip2.html(`Time: ${convertTimestamp(d._time)}<br/>Price: ${d.price}`)
              .style("left", (event.clientX) + "px")
              .style("top", (event.clientY - 350) + "px");
          })
          .on("mouseout", (d) => {
              tooltip2.transition()
                  .duration(500)
                  .style("opacity", 0);
          });
        } else {
          lineData = filteredData.filter((d, i) => i % (k + 1) === 0);
          svg2.selectAll("line.vertLine")
          .data(lineData)
          .enter()
          .append("line")
          .attr("class", "vertLine")
          .attr("x1", d => x2(d._time))
          .attr("x2", d => x2(d._time))
          .attr("y1", margin2.top)
          .attr("y2", height2 - margin2.bottom)
          .attr("stroke", "grey")
          .attr("stroke-width", Math.floor(1 / k1))  // The width is 1 as per your requirement
          .style("opacity", 0)  // This makes the lines initially invisible
          .on("mouseover", (event, d) => {
            tooltip2.transition()
              .duration(200)
              .style("opacity", 0.9);
            tooltip2.html(`Time: ${convertTimestamp(d._time)}<br/>Price: ${d.price}`)
              .style("left", (event.clientX) + "px")
              .style("top", (event.clientY - 350) + "px");
          })
          .on("mouseout", (d) => {
              tooltip2.transition()
                  .duration(500)
                  .style("opacity", 0);
          });
        }
  
      // Add vertical lines to each data point

  }

  
  
  
  function addLineChartRangeToDisplay(range) {
    const dateRangesDiv = document.getElementById("lineChartRanges");
    const button = document.createElement("button");
    button.textContent = `From: ${range.from.toLocaleString()} To: ${range.to.toLocaleString()}`;
    button.addEventListener('click', () => {
      drawLineChart(data2, range);
    });
    dateRangesDiv.appendChild(button);
    dateRangesDiv.appendChild(document.createElement("br")); // adds a line break
  }
  
  function updateDateRange() {
    const fromInput = document.getElementById("from").value;
    const toInput = document.getElementById("to").value;
    const from = parseDate(fromInput);
    const to = parseDate(toInput);
    console.log(from);
    if (from && to) {
      const range = { from: from, to: to, active: true };
      selectedDateRanges.push(range);
      addDateRangeToDisplay(range);
      updateChart();
    }
  }

  function formatNumber(number) {
    const units = ['', 'k', 'M', 'B', 'T', 'Q'];
    let unitCount = 0;

    while(number >= 1000) {
        number /= 1000;
        unitCount++;
    }

    let shortNumber = parseFloat(number.toFixed(3));

    // If the number is an integer, remove the decimal part
    if (shortNumber % 1 === 0) {
        shortNumber = shortNumber.toFixed(0);
    }

    return shortNumber + units[unitCount];
}

  function convertTimestamp(timestamp) {
    const date = new Date(timestamp);
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 월
    const day = date.getDate().toString().padStart(2, '0'); // 일
    const hours = date.getHours().toString().padStart(2, '0'); // 시간
  
    return `${month}/${day}T${hours}`;
  }
  function parseDate(input) {
    // Input is expected to be in MM/DD/HH format
    const parts = input.split('/');
    const date = new Date();
    date.setMonth(parseInt(parts[0]) - 1);
    date.setDate(parseInt(parts[1]));
    date.setHours(parseInt(parts[2]));
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
  }

  function addDateRangeToDisplay(range) {
    const dateRangesDiv = document.getElementById("dateRanges");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = true;
    checkbox.addEventListener('change', () => {
      range.active = checkbox.checked;
      updateChart();
    });
    dateRangesDiv.appendChild(checkbox);
    dateRangesDiv.append(` From: ${range.from.toLocaleString()} To: ${range.to.toLocaleString()}`);
    dateRangesDiv.appendChild(document.createElement("br"));
  }


function isDateInRange(date) {
  // If no date ranges are selected, return true
  if (selectedDateRanges.length === 0 || !selectedDateRanges.some(range => range.active)) {
    return true;
  }
  return selectedDateRanges.some(range => 
    range.active && date >= range.from && date <= range.to
  );
}

  function updateChart() {
    // First, set the color of all cells to #eee
    cells.attr("fill", "#eee");
  
    // Then, change the color of the cells that meet the conditions
    cells.filter(d => 
        selectedBoxplots.includes(d.boxplot) && 
        selectedTypes.includes(d.moduleType) &&
        isDateInRange(d._time))
      .attr("fill", d => color(d.boxplot));
  }

  const moduleTypes = ['MODULE', 'EXCHANGE', 'PERSONAL', 'FOUNDER'];
  moduleTypes.forEach(type => {
    document.getElementById(`typeButton-${type}`).addEventListener('change', (event) => {
      onTypeButtonChange(event.target, type);
    });
  });

  // Boxplot types
  const boxplotTypes = [-1, 1, 2, 3, 4, 5];
  boxplotTypes.forEach(type => {
    document.getElementById(`boxplotButton-${type}`).addEventListener('change', (event) => {
      onBoxplotButtonChange(event.target, type);
    });
  });
  function onTypeButtonChange(element, type) {
    if (element.checked) {
      selectedTypes.push(type);
    } else {
      const index = selectedTypes.indexOf(type);
      if (index > -1) {
        selectedTypes.splice(index, 1);
      }
    }
    updateChart();
  }
  
  function onBoxplotButtonChange(element, type) {
    if (element.checked) {
      selectedBoxplots.push(type);
    } else {
      const index = selectedBoxplots.indexOf(type);
      if (index > -1) {
        selectedBoxplots.splice(index, 1);
      }
    }
    updateChart();
  }
  
});
