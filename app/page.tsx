'use client';

import { useEffect, useState } from 'react';
import * as d3 from 'd3';
import { Graph } from '../components/graph';

export default function Page() {
  const [data, setData] = useState([]);

  const margin = { top: 10, right: 20, bottom: 20, left: 10 };

  useEffect(() => {
    d3.csv(
      "https://gist.githubusercontent.com/hogwild/a716b6186d730c1d86962e9acaa1e59f/raw"
    ).then((raw) => {
      const cleaned = raw.map(d => ({
        gender: d.gender,
        ever_married: d.ever_married,
        hypertension: +d.hypertension,
        heart_disease: +d.heart_disease,
        stroke: +d.stroke,
        stroke_disease: +d.stroke
      }));

      setData(cleaned);
    });
  }, []);

  return (
    <main style={{ padding: "40px", maxWidth: "1100px", margin: "auto" }}>

      {/* ===== Title ===== */}
      <h1 style={{ fontSize: "40px", marginBottom: "10px" }}>
        Healthcare Data
      </h1>

      {/* ===== Context ===== */}
      <h2>Context</h2>
      <p>
        In this assignment, we will use the healthcare dataset. The data contains
        information about patients with stroke and heart disease. We will visualize
        the relationships between different attributes in the data.
      </p>

      <p>The following attributes in the dataset are used:</p>
      <ul>
        <li>id: unique identifier</li>
        <li>gender: "Male", "Female" or "Other"</li>
        <li>hypertension: 0 or 1</li>
        <li>heart_disease: 0 or 1</li>
        <li>ever_married: "Yes" or "No"</li>
        <li>stroke: 0 or 1</li>
      </ul>

      {/* ===== Node-link explanation ===== */}
      <h2>Node-link diagram</h2>
      <p>
        The node-link diagram shows the relationships between different attributes
        in the data. The distance between two nodes shows the level of relation between them.
      </p>

      {/* ===== Overview ===== */}
      <h2>A dataset overview</h2>

      {/* 🔥 核心：左右布局 */}
      <div style={{
        display: "flex",
        gap: "40px",
        alignItems: "flex-start"
      }}>

        {/* 左侧文字 */}
        <div style={{ flex: 1 }}>
          <p>
            Each node represents an attribute in the dataset.
          </p>
          <p>
            For example, ever_marriedis close to stroke but far from
            heart disease, which means people who ever married are more likely
            to have stroke.
          </p>
          <p>
            Also, we can see that people who never married are less likely to have
            stroke but more likely to have heart disease.
          </p>
        </div>

        {/* 右侧图 */}
        <div style={{ flex: 1.5 }}>
          {data.length > 0 && (
            <div style={{ width: "100%", height: "500px" }}>
              <Graph
                margin={margin}
                svg_width={600}
                svg_height={500}
                data={data}
              />
            </div>
          )}
        </div>

      </div>

    </main>
  );
}