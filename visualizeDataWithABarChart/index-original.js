var dataset = [];
d3.json('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json')
.then(function (data) {

    const dataset = data.data;

    const minY = d3.min(dataset, (d) => d[1]);
    const maxY = d3.max(dataset, (d) => d[1]);
    const minX = d3.min(dataset, (d) => d[0]).replace(/.{6}$/, "");
    const maxX = d3.max(dataset, (d) => d[0]).replace(/.{6}$/, "");
    const w = 1000;
    const h = 600;
    const padding = 60;
    
    console.log(maxX);
    
    const xScale = d3.scaleLinear()
                     .domain([minX, maxX])
                     .range([0, (w - padding)]);
                     
    const yScale = d3.scaleLinear()
                     .domain([minY, maxY])
                     .range([10, h - padding]);

    const yScaleAxis = d3.scaleLinear()
                         .domain([minY, maxY])
                         .range([h - padding, 10]);



    const svg = d3.select("#graph-display")
                  .append('svg')
                  .attr('width', w + 60)
                  .attr('height', h);
                  

    svg.selectAll('rect')
       .data(dataset)
       .enter()
       .append('rect')
       .attr('data-date', (d) => d[0])
       .attr('data-gdp', (d) => d[1])
       .attr('class', 'bar')
       .attr('x', (d, i) => (i * ((w - padding) / dataset.length) + padding))
       .attr('y', (d) => h - yScale(d[1]) - padding )
       .attr('width', 2.5)
       .attr('height', (d) => yScale(d[1]))
       .attr('fill', '#094067')
       .on('mouseover', function(e) {
         d3.select(e.currentTarget).style('fill', '#ffa500');
       })
       .on('mouseout', function(e) {
         d3.select(e.currentTarget).style('fill', '#094067');
       });
  
    const yAxis = d3.axisLeft(yScaleAxis);

    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));

    svg.append('g')
       .attr('id', 'y-axis')
       .attr('transform', 'translate(' + padding + ', 0)')
       .call(yAxis);

    svg.append('g')
       .attr('id', 'x-axis')
       .attr('transform', 'translate(60,' + (h - padding) + ')')
       .call(xAxis);

});
  