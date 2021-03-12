// initial setup of the svg canvas on #graph-display and 'g' in 'svg
const width = 1100;
const height = 600;
const margin = {"top": 50, "right": 50, "bottom": 100, "left": 100};
const graphWidth = width - margin.right - margin.left;
const graphHeight = height - margin.top - margin.bottom;


const svg = d3.select('#graph-display')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

    svg.append('text')
        .text('Year')
        .attr('x', width/2)
        .attr('y', height -(margin.bottom /2));

const graph = svg.append('g')
    .attr('width', graphWidth)
    .attr('height', graphHeight)
    .attr('transform', `translate(${margin.left}, ${margin.top})`);
    
    graph.append('text')
        .text('Gross Domestic Product')
        .attr('x', -200)
        .attr('y', 20)
        .style('font-size', '1rem')
        .attr('transform', 'rotate(-90)');

d3.json('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json').then(function(data){
    
    // dataset extracts the array within data key in the json object
    var dataset = data.data;

    // Quarters is used to identify the quarter of the year in the tool tip later on
    var quarters = dataset.map(function(x) {
        var quarter;
        var temp = x[0].substring(5,7);

        switch(temp){
            case '01':
                quarter = "Q1";
                break;
            case '04':
                quarter = "Q2";
                break;
            case '07':
                quarter = "Q3";
                break;
            case '10':
                quarter = "Q4";
                break;
        }

        return x[0].substring(0, 4) + ' ' + quarter;
    }); //output would be (e.g 1947 Q1)
    
    // yearsDate is the full Date of the given data. 
    var yearsDate = dataset.map(x => new Date(x[0]));

    // xScale takes min of yearsDate and max of yearsDate to fill the horizontal range of the graph
    var xScale = d3.scaleTime()
        .domain([d3.min(yearsDate), d3.max(yearsDate)])
        .range([0, graphWidth]);

    // creates a method when called will create an axis of the bottom of graph to for x axis with x scale
    var xAxis = d3.axisBottom().scale(xScale);

    svg.append('g')
        .call(xAxis) //call method calls the xAxis function
        .attr('id', 'x-axis')
        .attr('transform', `translate (${margin.left}, ${graphHeight + margin.top})`);

    // this maps through the dataset to create an array of GDP scores
    var scores = dataset.map(x => x[1]);

    // yScale takes the min and max of scores as domain to fill the range from 0 to graph height
    var yScale = d3.scaleLinear()
        .domain([d3.min(scores), d3.max(scores)])
        .range([graphHeight, 0]);

    // creates a method when called will create an axis of the left of graph to for y axis with yScale
    var yAxis = d3.axisLeft().scale(yScale);

    svg.append('g')
        .call(yAxis) 
        .attr('id', 'y-axis')
        .attr('transform', `translate (${margin.left}, ${margin.top})`);

    // before creating bars for the graph, scale all the data first
    var scaledScores = [];

    var scoresMax = d3.max(scores);

    var linearScale = d3.scaleLinear()
        .domain([0, scoresMax])
        .range([0, graphHeight]);
    
    scaledScores = scores.map(x => linearScale(x));

    const barWidth = graphWidth / dataset.length;

    const tooltip = d3.select('body')
        .append('div')
        .attr('class', 'tooltip')
        .attr('text-align', 'center');

    graph.selectAll('rect')
        .data(scaledScores) //.data() method is the dataset being set into this selection
        .enter() //.enter() method is similar to .map when each of value is .data() is entered
        .append('rect')
        .attr('class', 'bar')
        .attr('data-date', (d, i) => dataset[i][0])
        .attr('data-gdp',(d, i) => scores[i])
        .attr('width', barWidth)
        .attr('height', (d) => d) //height is already set because the data in .data() is already scaled 
        .attr('y', function(d, i) {
            return graphHeight - d; //graph height - d helps flips the graph around and make the graph upright
        })
        .attr('x', function(d, i){
            return i * barWidth; 
        })
        .attr('fill', '#3da9fc')
        .on('mouseover', function(d, i) {
            console.log(i)
            d3.select(this).style('fill', '#d0a305');
            tooltip.style('left', '500px')
                .style('top', '500px')
                .transition(200).style('opacity', 0.9);
        })
        .on('mouseout', function(d) {
            d3.select(this).style('fill', '#3da9fc');
            tooltip.transition(200).style('opacity', 0);
        });
        
    });