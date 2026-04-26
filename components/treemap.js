'use client';

import React from "react";
import * as d3 from "d3";


function NodeText({ label, value, width, height }) {
    if (width < 30 || height < 20) return null;

    const fontSize = 11;
    const maxChars = Math.floor(width / (fontSize * 0.6));
    const truncate = (str) =>
        str.length > maxChars ? str.slice(0, maxChars - 1) + "…" : str;

    return (
        <text x={4} y={14} fontSize={`${fontSize}px`} fill="white" style={{ pointerEvents: "none" }}>
            <tspan x={4} dy="0">{truncate(label)}</tspan>
            {height > 32 && (
                <tspan x={4} dy="1.4em" fill="rgba(255,255,255,0.85)">
                    {truncate(value)}
                </tspan>
            )}
        </text>
    );
}

export function TreeMap(props) {
    const { margin, svg_width, svg_height, tree, selectedCell, setSelectedCell } = props;
    const [hoveredCell, setHoveredCell] = React.useState(null);

    const innerWidth = svg_width - margin.left - margin.right;
    const innerHeight = svg_height - margin.top - margin.bottom;

    if (!tree || !tree.children) return null;

    const root = d3.hierarchy(tree)

        .sum(d => (!d.children || d.children.length === 0) ? (d.value || 0) : 0)
        .sort((a, b) => b.value - a.value);

    d3.treemap()
        .size([innerWidth, innerHeight])
        .paddingInner(2)
        .paddingOuter(2)
        (root);


    const colorScale = d3.scaleOrdinal(d3.schemeDark2);


    const getColorNode = (d) => {
        if (d.parent && d.parent.depth > 0) return d.parent;
        return d;
    };
    // 安全取 attr，沿祖先链向上找第一个有 attr 的节点
    const getAttr = (node) => {
        let cur = node;
        while (cur) {
            if (cur.data && cur.data.attr) return cur.data.attr;
            cur = cur.parent;
        }
        return "";
    };
    const getColor = (d) => colorScale(getColorNode(d).data.name);


    const leafNodes = root.leaves();


    const legendMap = new Map();
    leafNodes.forEach(d => {
        const colorNode = getColorNode(d);
        const name = colorNode.data.name;
        const attr = getAttr(colorNode);
        const key = `${attr}:${name}`;
        if (!legendMap.has(key)) {
            legendMap.set(key, {
                label: attr ? `${attr}: ${name}` : name,
                color: colorScale(name),
            });
        }
    });
    const legendItems = Array.from(legendMap.values());


    const watermarkNodes = (() => {
        const map = new Map();
        leafNodes.forEach(d => {
            const colorNode = getColorNode(d);
            const name = colorNode.data.name;
            const attr = getAttr(colorNode);
            const key = `${attr}:${name}`;
            if (!map.has(key)) {
                map.set(key, {
                    label: attr ? `${attr}: ${name}` : name,
                    x0: d.x0, y0: d.y0, x1: d.x1, y1: d.y1,
                });
            } else {
                const entry = map.get(key);
                entry.x0 = Math.min(entry.x0, d.x0);
                entry.y0 = Math.min(entry.y0, d.y0);
                entry.x1 = Math.max(entry.x1, d.x1);
                entry.y1 = Math.max(entry.y1, d.y1);
            }
        });
        return Array.from(map.values());
    })();

    const legendHeight = 20;

    return (
        <svg
            viewBox={`0 0 ${svg_width} ${svg_height + legendHeight}`}
            preserveAspectRatio="xMidYMid meet"
            style={{ width: "100%", height: "100%" }}
        >

            <g transform={`translate(${margin.left}, 4)`}>
                {legendItems.map((item, i) => (
                    <g key={i} transform={`translate(${i * 130}, 0)`}>
                        <rect width={14} height={14} fill={item.color} rx={2} />
                        <text x={18} y={11} fontSize="12px" fill="#333" style={{ pointerEvents: "none" }}>
                            {item.label}
                        </text>
                    </g>
                ))}
            </g>


            <g transform={`translate(${margin.left},${margin.top + legendHeight})`}>


                <rect
                    x={0}
                    y={0}
                    width={innerWidth}
                    height={innerHeight}
                    fill="none"
                    stroke="#333"
                    strokeWidth={1.5}
                />


                {leafNodes.map((d, i) => {
                    const width = d.x1 - d.x0;
                    const height = d.y1 - d.y0;
                    const clipId = `clip-leaf-${i}`;
                    const color = getColor(d);

                    const isHovered =
                        hoveredCell &&
                        hoveredCell.x0 === d.x0 &&
                        hoveredCell.y0 === d.y0;

                    const isSelected =
                        selectedCell &&
                        selectedCell.x0 === d.x0 &&
                        selectedCell.y0 === d.y0;


                    const groupTotal = d.parent ? d.parent.value : root.value;
                    const percentage = ((d.value / groupTotal) * 100).toFixed(1);
                    const label = `${d.data.attr}:${d.data.name}`;
                    const valueLabel = `Value: ${percentage}%`;

                    return (
                        <g
                            key={i}
                            transform={`translate(${d.x0},${d.y0})`}
                            onClick={() => setSelectedCell && setSelectedCell(isSelected ? null : d)}
                            onMouseEnter={() => setHoveredCell(d)}
                            onMouseLeave={() => setHoveredCell(null)}
                            style={{ cursor: "pointer" }}
                        >
                            <defs>
                                <clipPath id={clipId}>
                                    <rect width={width} height={height} />
                                </clipPath>
                            </defs>

                            <rect
                                width={width}
                                height={height}
                                fill={isHovered ? "#e53e3e" : color}
                                stroke="white"
                                strokeWidth={isSelected ? 3 : 1}
                            />



                            <g clipPath={`url(#${clipId})`}>
                                <NodeText
                                    label={label}
                                    value={valueLabel}
                                    width={width}
                                    height={height}
                                />
                            </g>
                        </g>
                    );
                })}


                {watermarkNodes.map((wm, i) => {
                    const cx = (wm.x0 + wm.x1) / 2;
                    const cy = (wm.y0 + wm.y1) / 2;
                    const regionW = wm.x1 - wm.x0;
                    const regionH = wm.y1 - wm.y0;
                    const isSingle = watermarkNodes.length === 1;
                    const fontSize = isSingle
                        ? Math.min(regionW / (wm.label.length * 0.6), regionH / 4, 48)
                        : Math.min(regionH / 8, 28);
                    return (
                        <text
                            key={i}
                            x={cx}
                            y={cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize={`${fontSize}px`}
                            fill="rgba(0,0,0,0.22)"
                            fontWeight="bold"
                            transform={isSingle ? undefined : `rotate(90, ${cx}, ${cy})`}
                            style={{ pointerEvents: "none", userSelect: "none" }}
                        >
                            {wm.label}
                        </text>
                    );
                })}
            </g>
        </svg>
    );
}
