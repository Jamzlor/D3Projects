// mise en place
const url = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json';

const width = 1000;
const height = 500;


const color = d3.scaleOrdinal(d3.schemeCategory10);



const LEGEND_WIDTH = 20;
const LEGEND_HEIGHT = 20;
const LEGEND_X_SPACING = 10;

d3.json(url).then((data, error) => {
    if (error) {
        throw error;
    }
    const category = data.children.map(x => x.name);
    console.log(category)
    const treemap = d3.treemap()
        .size([width, height])
        .paddingInner(1);

    const root = d3.hierarchy(data, (node) => {
        return node.children
    })
        .sum((node) => node.value)
        .sort((node1, node2) => {
            return node2.value - node1.value;
        })

    treemap(root);

    console.log(root.leaves())

    const svg = d3.select('#graph-display')
        .append('svg')
        .attr('width', width)
        .attr('height', height);
    
    const tooltip = d3.select('#graph-display')
        .append('div')
        .attr('class', 'tooltip')
        .attr('class', 'centered')
        .attr('id', 'tooltip')
        .style('opacity', 0)
        
    
    const blocks = svg.selectAll('g')
        .data(root.leaves())
        .enter()
        .append('g')
        .attr('transform', (d) => `translate(${d.x0}, ${d.y0})`)

    const tiles = blocks
        .append('rect')
        .attr('class', 'tile')
        .attr('fill', (d) => {
            let category = d.data.category;
            return color(category);            
        })
        .attr('data-name', (d) => d.data.name)
        .attr('data-category', (d) => d.data.category)
        .attr('data-value', (d) => d.data.value)
        .attr('width', (d) => d.x1 - d.x0)
        .attr('height', (d) => d.y1 - d.y0)
        .on('mouseover', function(d) {
            console.log(d)
            tooltip.style('opacity', 0.9)
            tooltip
                .html(
                    `Name: ${d.data.name} <br/>
                    Genre: ${d.data.category} <br/>
                    Value: $${d.data.value}`
                )
                .attr('data-value', d.data.value)
        })
        .on('mouseout', (d) =>{
            tooltip.style('opacity', 0);
        })
        
    blocks.append('text')
        .text((d) => d.data.name)
        .attr('x', 5)
        .attr('y', 20)
        .style('font-size', 10)

    const legend = d3.select('#legend')
        .attr('height', 200)
        .style('padding-top', 30)
        .selectAll('g')
        .data(category)
        .enter()
        .append('g')
        .attr('transform', (d, i) => `translate(0, ${(LEGEND_HEIGHT + 5) * i})`)

    legend
        .append('rect')
        .attr('class', 'legend-item')
        .attr('fill', (d) => color(d))
        .attr('width', LEGEND_WIDTH)
        .attr('height', LEGEND_HEIGHT)
        
    legend
        .append('text')
        .text((d) => d)
        .attr('x', 30)
        .attr('y', 13)
        
});