

// mise en place
const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';
d3.json(url, function(data){
const width = 1200;
const height = 600;
const margin = {top: 50, right : 50, bottom: 100, left: 100};
const graphHeight = height - margin.top - margin.bottom;
const graphWidth = width - margin.left - margin.right;



const monthlyVariance = data.monthlyVariance;
let allYears = [];
let allMonths = [];
let months = [];
let years = []

monthlyVariance.forEach(x => allYears.push(x.year));
monthlyVariance.forEach(x => allMonths.push(x.month)); //these 2 lines will iterate through the json file and push all years listed into an array

Array.prototype.iterateMonth = function (n){
    const formatMonth = d3.timeFormat('%B'); //time format method will translate a new Date argument into an output of users choice;
    let i = 0;
    while(i < n){
        this.push(formatMonth(new Date(Date.UTC(1970, i, 1, 0, 0, 0))));//this line will help with creating the y-axis from json file;
        i++;
    }
}

months.iterateMonth(d3.max(allMonths));
years = [...new Set(allYears)]; //spread operator ... with new Set will remove any duplicates in an array and sort it
console.log(years)
console.log(months)


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
    .ticks(12);

//these methods will help create an array of months and years of given specifications


const svg = d3.select('#graph-display')
    .append('svg')
    .attr('id', 'background')
    .attr('class', 'background')
    .attr('width', width)
    .attr('height', height)

const graph = svg.append('g')
    .attr('id', 'graph')
    .attr('class', 'graph')
    .attr('width', graphWidth)
    .attr('height', graphHeight)
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

    svg.append('g')
        .attr('id', 'x-axis')
        .attr('class', 'x-axis')
        .attr('transform', `translate(${margin.left}, ${margin.top + graphHeight})`)
        .call(xAxis);

    svg.append('g')
        .attr('id', 'y-axis')
        .attr('class', 'y-axis')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)
        .call(yAxis);

});
    