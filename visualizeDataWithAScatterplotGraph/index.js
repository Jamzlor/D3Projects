//mise en place
const width = 1200;
const height = 800;
const margin = {top: 50, right : 50, bottom: 100, left: 100};
const graphHeight = height - margin.top - margin.bottom;
const graphWidth = width - margin.left - margin.right;

//json file (dataset)
const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json';

//scales
const xScale = d3.scaleLinear().range([0, graphWidth]);

const yScale = d3.scaleTime().range([0, graphHeight]);

const color = d3.scaleOrdinal(d3.schemeCategory10);

const xAxis = d3.axisBottom(xScale).tickFormat(x => x);

const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat('%M:%S'));

const timeFormat = d3.timeFormat('%M:%S');
//tooltip div setup
const tooltip = d3.select('#graph-display')
    .append('div')
    .attr('class', 'tooltip')
    .attr('id', 'tooltip')
    .style('opacity', 0);

//svg elements
const svg = d3.select('#graph-display')
    .append('svg')
    .attr('class', 'background')
    .attr('width', width)
    .attr('height', height);

const graph = svg.append('g')
    .attr('class', 'graph')
    .attr('width', graphWidth)
    .attr('height', graphHeight)
    .attr('transform', `translate(${margin.left}, ${margin.top})`)

d3.json(url, function(data) {
    data.forEach(function(d) {
        let parsedTime = d.Time.split(':');
        d.Time = new Date(Date.UTC(1970, 0, 1, 0, parsedTime[0], parsedTime[1])); 
    });
    
    xScale.domain([
        d3.min(data, (d) => d.Year - 1),
        d3.max(data, (d) => d.Year + 1)
    ]);

    yScale.domain(d3.extent(data, (d) => d.Time));

    svg.append('g')
        .attr('class', 'x-axis')
        .attr('id', 'x-axis')
        .attr('transform', `translate(${margin.left}, ${graphHeight + margin.top})`)
        .call(xAxis)
        
    svg.append('g')
        .attr('class', 'y-axis')
        .attr('id', 'y-axis')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)
        .call(yAxis)
    
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', margin.left / 2)
        .attr('x', -200)
        .attr('font-size', 18)
        .text('Time in Minutes')

    graph.selectAll('.dot')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('r', 5)
        .attr('data-xvalue', (d) => d.Year)
        .attr('data-yvalue', (d) => d.Time)
        .attr('cx', (d) => xScale(d.Year))
        .attr('cy', (d) => yScale(d.Time))
        .style('fill', (d) => color(d.Doping !== ''))
        .on('mouseover', function(d) {
            tooltip.style('opacity', 0.9)
            tooltip.attr('data-year', d.Year)
            tooltip
                .html(
                    `${d.Name}: ${d.Nationality}
                    Year: ${d.Year}, Time: ${timeFormat(d.Time)}` +
                    (d.Doping ? '<br/>' + d.Doping : '')
                )
            .style('left', d3.event.pageX + 30 + 'px')
            .style('top', d3.event.pageY - 40 + 'px');
        })
        .on('mouseout', () => tooltip.style('opacity', 0));

        const legendContainer = graph.append('g').attr('id', 'legend')

        const legend = legendContainer.selectAll('#legend')
            .data(color.domain())
            .enter()
            .append('g')
            .attr('class', 'legend-label')
            .attr('transform', (d, i) => `translate(0, ${(graphHeight / 2) - i * 30})`)

        legend.append('rect')
            .attr('width', 20)
            .attr('height', 20)
            .attr('x', graphWidth - 50)
            .style('fill', color);

        legend.append('text')
            .attr('x', graphWidth - 60)
            .attr('y', 13)
            .style('text-anchor', 'end')
            .text((d) => d ? 'Riders with doping allegation' : 'Riders without doping allegations');

})