'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { getNodes } from '../utils/getNodes';
import { getLinks } from '../utils/getLinks';
import { drag } from '../utils/drag';

export function Graph(props) {
    const { margin, svg_width, svg_height, data } = props;

    const nodes = getNodes({ rawData: data });
    const links = getLinks({ rawData: data });

    const width = svg_width - margin.left - margin.right;
    const height = svg_height - margin.top - margin.bottom;

    const lineWidth = d3.scaleLinear()
        .range([2, 6])
        .domain([d3.min(links, d => d.value), d3.max(links, d => d.value)]);

    const radius = d3.scaleLinear()
        .range([10, 50])
        .domain([d3.min(nodes, d => d.value), d3.max(nodes, d => d.value)]);

    const color = d3.scaleOrdinal()
        .range(d3.schemeCategory10)
        .domain(nodes.map(d => d.name));

    const d3Selection = useRef();

    useEffect(() => {

        let g = d3.select(d3Selection.current);


        g.selectAll("*").remove();


        d3.select("body").selectAll(".tooltip").remove();


        const tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("background", "white")
            .style("border", "1px solid #ccc")
            .style("padding", "5px 8px")
            .style("font-size", "12px")
            .style("pointer-events", "none")
            .style("opacity", 0);

        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links)
                .id(d => d.name)
                .distance(d => 20 / d.value))
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("y", d3.forceY(height / 2).strength(0.02))
            .force("collide", d3.forceCollide().radius(d => radius(d.value) + 20));

        // ===== Links =====
        const link = g.append("g")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(links)
            .join("line")
            .attr("stroke-width", d => lineWidth(d.value));

        // ===== Nodes =====
        const node = g.append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .selectAll("circle")
            .data(nodes)
            .enter();

        const point = node.append("circle")
            .attr("r", d => radius(d.value))
            .attr("fill", d => color(d.name))
            .call(drag(simulation))


            .on("mouseover", function (event, d) {
                tooltip
                    .style("opacity", 1)
                    .html(d.name)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY + 10) + "px");
            })
            .on("mousemove", function (event) {
                tooltip
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY + 10) + "px");
            })
            .on("mouseout", function () {
                tooltip.style("opacity", 0);
            });


        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            point
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
        });


        const legend = g.append("g")
            .attr("transform", "translate(0, 0)");

        const legendItem = legend.selectAll(".legend-item")
            .data(nodes)
            .enter()
            .append("g")
            .attr("class", "legend-item")
            .attr("transform", (d, i) => `translate(0, ${i * 20})`);

        legendItem.append("rect")
            .attr("width", 12)
            .attr("height", 12)
            .attr("fill", d => color(d.name));

        legendItem.append("text")
            .attr("x", 18)
            .attr("y", 10)
            .text(d => d.name)
            .style("font-size", "12px")
            .attr("alignment-baseline", "middle");

    }, [width, height, nodes, links]);

    return (
        <svg
            viewBox={`0 0 ${svg_width} ${svg_height}`}
            preserveAspectRatio="xMidYMid meet"
            style={{ width: "100%", height: "100%" }}
        >
            <g
                ref={d3Selection}
                transform={`translate(${margin.left}, ${margin.top})`}
            >
            </g>
        </svg>
    );
}