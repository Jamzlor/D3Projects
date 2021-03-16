const project_name = "dataVisualizationWithChoroplethChart";

const US_EDUCATION_DATA_URL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
const US_COUNTY_DATA_URL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

d3.queue()
    .defer(d3.json, US_EDUCATION_DATA_URL)
    .defer(d3.json, US_COUNTY_DATA_URL)
    .await(ready)

function ready(error, educationData, countyData) {
    if (error) {
        throw error;
    }

    // mise en place
    const width = 1200;
    const height = 800;

    const percentageArr = educationData.map(obj => obj.bachelorsOrHigher)

    const minPercentage = d3.min(percentageArr)
    const maxPercentage = d3.max(percentageArr)

    const keyWidth = 260;
    const keyHeight = 5;

    const path = d3.geoPath();
    // scales and axis
    const xScale = d3.scaleLinear()
        .domain(d3.extent(percentageArr))
        .rangeRound([0, keyWidth])

    const color = d3.scaleThreshold()
        .domain(d3.range(minPercentage, maxPercentage, ((maxPercentage - minPercentage) / 8)))
        .range(d3.schemeBlues[9]);

    const keyAxis = d3.axisBottom(xScale)
        .tickFormat((d) => Math.round(d) + '%')
        .tickValues(color.domain());


    // d3 manipulations
    const svg = d3.select('#graph-display') //svg set up
        .append('svg')
        .attr('id', 'background')
        .attr('class', 'background')
        .attr('width', width)
        .attr('height', height);

    const tooltip = d3.select('#graph-display') //tooltip div setup
        .append('div')
        .attr('class', 'tooltip')
        .attr('id', 'tooltip')
        .style('opacity', 0)
        .style('position', 'absolute');


    const key = svg //key setup
        .append('g')
        .attr('id', 'legend')
        .attr('width', keyWidth)
        .attr('height', keyHeight)
        .attr('transform', `translate(${width * 0.60}, 100)`);

    key.append('g') //key setting
        .selectAll('rect')
        .data(
            color.range().map(function (d) {
                d = color.invertExtent(d);
                if (d[0] === null) {
                    d[0] = xScale.domain()[0]
                }
                if (d[1] === null) {
                    d[1] = xScale.domain()[1]
                }
                console.log(d)
                return d;

            })
        )
        .enter()
        .append('rect')
        .attr('class', 'keyCell')
        .attr('height', keyHeight)
        .attr('width', (d) => xScale(d[1]) - xScale(d[0]))
        .attr('x', (d) => xScale(d[0]))
        .style('fill', (d) => color(d[0]))

    key.append('g') //keyAxis
        .call(keyAxis)
        .select('.domain') //this will select the horizontal line from the axis
        .remove();

    svg
        .append('g')
        .attr('class', 'counties')
        .selectAll('path')
        .data(topojson.feature(countyData, countyData.objects.counties).features) //topojson.feature takes the dataset and the object being transformed and creates a geoJSON feature 
        .enter()
        .append('path')
        .attr('class', 'county')
        .attr('data-fips', (d) => d.id)
        .attr('data-education', function (d) {
            let result = educationData.filter(obj => obj.fips === d.id); //this filter array.method will map through each entry and see if the fips are matched. if not it will return 0
            if (result[0]) {
                return result[0].bachelorsOrHigher;
            } else {
                console.log('could not find data for: ', d.id);
                return 0;
            }
        })
        .style('fill', function (d) {
            let result = educationData.filter(obj => obj.fips === d.id);
            if (result[0]) {
                return color(result[0].bachelorsOrHigher);
            }
            return color(0);
        })
        .attr('d', path)
        .attr('transform', `translate(150, 100)`)
        .on('mouseover', function (d) {
            tooltip
                .style('opacity', 0.9);
            tooltip
                .html(function () {
                    let result = educationData.filter(obj => obj.fips === d.id);
                    if (result[0]) {
                        return (
                            `${result[0].area_name}, 
                            ${result[0].state}: 
                            ${result[0].bachelorsOrHigher}%`
                        )
                    }
                    return 0;
                })
                .attr('data-education', function () {
                    let result = educationData.filter(obj => obj.fips === d.id);
                    if (result[0]) {
                        return result[0].bachelorsOrHigher;
                    }
                    return 0;
                })
                .style('left', d3.event.pageX + 'px')
                .style('top', d3.event.pageY + 'px');
        })
        .on('mouseout', function () {
            tooltip
                .style('opacity', 0)
        });

}