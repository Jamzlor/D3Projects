const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';

d3.json(url, function (data) {
    // mise en place
    const width = 1200;
    const height = 700;
    const margin = {
        top: 50,
        right: 50,
        bottom: 200,
        left: 100
    };
    const graphHeight = height - margin.top - margin.bottom;
    const graphWidth = width - margin.left - margin.right;

    const color = [
        '#28527a',
        '#16a596',
        '#01c5c4',
        '#94ebcd',
        '#f9f871',
        '#ffc75f',
        '#f2a154',
        '#eb5e0b',
        '#a20a0a'
    ]

    //this part is for manipulating the data into useful infomation
    const baseTemperature = data.baseTemperature;
    const monthlyVariance = data.monthlyVariance;

    let allYears = [];
    let allMonths = [];
    let months = [];
    let years = [];
    let allTempVariance = [];

    const legendCell = legendHeight = 40;
    const legendWidth = legendHeight * 11;

    const formatMonth = d3.timeFormat('%B'); //time format method will translate a new Date argument into an output of users choice;

    monthlyVariance.forEach(x => allYears.push(x.year));
    monthlyVariance.forEach(x => allMonths.push(x.month)); //these 2 lines will iterate through the json file and push all years listed into an array
    monthlyVariance.forEach(x => allTempVariance.push((x.variance + baseTemperature)));

    const minTemp = d3.min(allTempVariance);
    const maxTemp = d3.max(allTempVariance);

    Array.prototype.iterateMonth = function (n) {
        let i = 0;
        while (i < n) {
            this.push(i);
            i++;
        }
    };

    months.iterateMonth(d3.max(allMonths));
    years = [...new Set(allYears)]; //spread operator ... with new Set will remove any duplicates in an array and sort it

    const legendSteps = [];
    const step = ((maxTemp - minTemp) / 11);
    for (var i = 1; i < 11; i++) {
        legendSteps.push(minTemp + i * step);
    }

    //scales and axis manipulations
    const xScale = d3.scaleLinear()
        .domain(d3.extent(years))
        .range([0, graphWidth]);

    const yScale = d3.scaleBand()
        .domain(months)
        .range([0, graphHeight]);

    const xAxis = d3.axisBottom(xScale)
        .ticks(years.length / 10)
        .tickFormat(x => x);

    const yAxis = d3.axisLeft(yScale)
        .ticks(12)
        .tickFormat(x => formatMonth(new Date(Date.UTC(1970, x, 1, 0, 0, 0)))); //this line will help with creating the y-axis from json file;

    const legendThreshold = d3.scaleThreshold()
        .domain(legendSteps) //legendSteps is an array of cutting points for each step of the temperature
        .range(color);

    const legendXScale = d3.scaleLinear()
        .domain([minTemp, maxTemp])
        .range([0, legendWidth]);

    const legendXAxis = d3.axisBottom(legendXScale)
        .tickValues(legendThreshold.domain())
        .tickFormat(x => Number(x.toFixed(1)))

    
    //this will append a svg background to the #graph-display div within HTML
    const svg = d3.select('#graph-display')
        .append('svg')
        .attr('id', 'background')
        .attr('class', 'background')
        .attr('width', width)
        .attr('height', height)
        .style('border', '1px solid')
        .style('box-shadow', '2px 1px 1px grey');

    //this will append a graph canvas to background layer
    const graph = svg.append('g')
        .attr('id', 'graph')
        .attr('class', 'graph')
        .attr('width', graphWidth)
        .attr('height', graphHeight)
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const tooltip = d3.select('#graph-display')
        .append('div')
        .attr('id','tooltip')
        .attr('class', 'tooltip')
        .style('opacity', 0)
    //this append the x-axis to bottom of graph within the background layer
    svg.append('g')
        .attr('id', 'x-axis')
        .attr('class', 'x-axis')
        .attr('transform', `translate(${margin.left}, ${margin.top + graphHeight})`)
        .call(xAxis);

    //this append the y-axis to left of graph within the background layer
    svg.append('g')
        .attr('id', 'y-axis')
        .attr('class', 'y-axis')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)
        .call(yAxis);

    //this appends the legend section underneath the graph
    const legend = svg.append('g')
        .attr('id', 'legend')
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .attr('transform', `translate(${margin.left}, ${graphHeight + (margin.bottom / 2)})`)

    legend.append('g')
        .selectAll('rect')
        .data(
            legendThreshold.range().map(function (x) {
                var d = legendThreshold.invertExtent(x);
                if (d[0] == null) {
                    d[0] = legendXScale.domain()[0];
                } else if (d[1] == null) {
                    d[1] = legendXScale.domain()[1]; //these if else statement will make sure if the number is out of range it will still be regarded as one of the end colors
                }
                return d;
            })
        )
        .enter()
        .append('rect')
        .style('fill', (d) => legendThreshold(d[0]))
        .attr('width', legendCell)
        .attr('height', legendHeight)
        .attr('x', (d, i) => i * legendCell)
        .attr('transform', `translate(${legendCell}, 0)`)

    legend.append('g')
        .attr('transform', `translate(0, ${legendHeight})`)
        .call(legendXAxis)

    const rectWidth = graphWidth / years.length;
    const rectHeight = graphHeight / 12; //these variables are the height and width of the rect being rendered
    
    

    graph.selectAll('rect')
        .data(monthlyVariance)
        .enter()
        .append('rect')
        .attr('class', 'cell')
        .attr('width', rectWidth)
        .attr('height', rectHeight)
        .attr('data-year', (d) => d.year)
        .attr('data-month', (d) => d.month - 1)
        .attr('data-temp', (d, i) => allTempVariance[i])
        .attr('x', (d) => xScale(d.year))
        .attr('y', (d) => yScale(d.month - 1)) //d.month is numbered and will need to subtract one to fit the index order
        .attr('fill', (d, i) => legendThreshold(allTempVariance[i]))
        .on('mouseover', function(d){
            var dateMonth = formatMonth(new Date(Date.UTC(0,d.month,0,0,0,0)));
            tooltip.style('opacity', 0.9)
                .style('left', d3.event.pageX + 30 + 'px')
                .style('top', d3.event.pageY - 70 + 'px')
                .attr('data-year', d.year)
                .html(
                    `${d.year} - ${dateMonth} <br/>
                    ${Number((baseTemperature + d.variance).toFixed(2))}&#x2103 <br/>
                    ${Number((d.variance).toFixed(2))}&#x2103`
                )
                
        })
        .on('mouseout', function () {
            tooltip.style('opacity', 0)
        });

});