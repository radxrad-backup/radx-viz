"use client"; // Ensure this file is treated as a Client Component

import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";

const processNodes = (nodes: any[]) => {
  // Define the configuration for styling based on node type and category
  const styleConfig: any = {
    publication: {
      "RADx-rad": {
        symbol: "circle",
        symbolSize: 3,
        itemStyle: { color: "#FF4500", shadowColor: "#FFD700", shadowBlur: 20 },
      },
      "RADx-UP": {
        symbol: "circle",
        symbolSize: 3,
        itemStyle: { color: "#006400", shadowColor: "#00FF00", shadowBlur: 20 },
      },
      "RADx Tech": {
        symbol: "circle",
        symbolSize: 3,
        itemStyle: { color: "#0000FF", shadowColor: "#0000FF", shadowBlur: 20 },
      },
      "RADx DHT": {
        symbol: "circle",
        symbolSize: 3,
        itemStyle: { color: "#FFFF00", shadowColor: "#FFFF00", shadowBlur: 20 },
      },
    },
    study: {
      "RADx-rad": {
        symbol: "rect",
        symbolSize: 6,
        itemStyle: { color: "#FF4500", shadowColor: "#FFD700", shadowBlur: 20 }, // Bright red
      },
      "RADx-UP": {
        symbol: "rect",
        symbolSize: 6,
        itemStyle: { color: "#006400", shadowColor: "#00FF00", shadowBlur: 20 }, // Bright green
      },
      "RADx Tech": {
        symbol: "rect",
        symbolSize: 6,
        itemStyle: { color: "#0000FF", shadowColor: "#0000FF", shadowBlur: 20 }, // Bright blue
      },
      "RADx DHT": {
        symbol: "rect",
        symbolSize: 6,
        itemStyle: { color: "#FFFF00", shadowColor: "#FFFF00", shadowBlur: 20 }, // Bright yellow
      },
    },
    dataset: {
      "RADx-rad": {
        symbol: "diamond",
        symbolSize: 6,
        itemStyle: { color: "#FF4500", shadowColor: "#FFD700", shadowBlur: 10 }, // Bright red
      },
      "RADx-UP": {
        symbol: "diamond",
        symbolSize: 6,
        itemStyle: { color: "#006400", shadowColor: "#00FF00", shadowBlur: 10 }, // Bright green
      },
      "RADx Tech": {
        symbol: "diamond",
        symbolSize: 6,
        itemStyle: { color: "#0000FF", shadowColor: "#0000FF", shadowBlur: 10 }, // Bright blue
      },
      "RADx DHT": {
        symbol: "diamond",
        symbolSize: 6,
        itemStyle: { color: "#FFFF00", shadowColor: "#FFFF00", shadowBlur: 10 }, // Bright yellow
      },
    },
    author: {
      "RADx-rad": {
        symbol: "triangle",
        symbolSize: 3,
        itemStyle: { color: "#FFFFFF", shadowColor: "#FFFFFF", shadowBlur: 10 },
      },
      "RADx-UP": {
        symbol: "triangle",
        symbolSize: 3,
        itemStyle: { color: "#FFFFFF", shadowColor: "#FFFFFF", shadowBlur: 10 },
      },
      "RADx Tech": {
        symbol: "triangle",
        symbolSize: 3,
        itemStyle: { color: "#FFFFFF", shadowColor: "#FFFFFF", shadowBlur: 10 },
      },
      "RADx DHT": {
        symbol: "triangle",
        symbolSize: 3,
        itemStyle: { color: "#FFFFFF", shadowColor: "#FFFFFF", shadowBlur: 10 },
      },
      "RADx-rad-UP": {
        symbol: "triangle",
        symbolSize: 3,
        itemStyle: { color: "#FFFFFF", shadowColor: "#FFFFFF", shadowBlur: 10 },
      },
    },
  };

  return nodes.map((node) => {
    const { nodeType, category } = node;

    if (nodeType === "publication" && styleConfig.publication[category]) {
      const { symbol, symbolSize, itemStyle } = styleConfig.publication[category];
      node.symbol = symbol;
      node.symbolSize = symbolSize;
      node.itemStyle = itemStyle;
    } else if (nodeType === "study" && styleConfig.study?.[category]) {
      const { symbol, symbolSize, itemStyle } = styleConfig.study[category];
      node.symbol = symbol;
      node.symbolSize = symbolSize;
      node.itemStyle = itemStyle;
    } else if (nodeType === "dataset" && styleConfig.dataset?.[category]) {
      const { symbol, symbolSize, itemStyle } = styleConfig.dataset[category];
      node.symbol = symbol;
      node.symbolSize = symbolSize;
      node.itemStyle = itemStyle;
    } else if (nodeType === "author") {
      // Apply author-specific styling using the author config
      const authorStyle = styleConfig.author[category] || styleConfig.author.default;
      node.symbol = authorStyle.symbol;
      node.symbolSize = authorStyle.symbolSize;
      node.itemStyle = authorStyle.itemStyle;
    } else {
      // Default style for other node types
      node.symbol = "roundRect";
      node.symbolSize = 2;
    }

    return node;
  });
};

const createChartOption = (graph: any) => ({
  backgroundColor: "#000000",
  tooltip: { /* … your existing tooltip config … */ },
  legend: {
    data: graph.categories.map((cat: any) => cat.name),
    textStyle: { color: "#fff" },
  },
  series: [
    {
      type: "graph",
      layout: "none",
      large: true,
      largeThreshold: 1000,
      progressive: 1000,
      progressiveThreshold: 1000,
      data: graph.nodes,
      links: graph.links,
      categories: graph.categories,
      roam: true,
      label: { show: false, position: "right", formatter: "{b}" },
      emphasis: { disabled: true },
      states: {
        draggable: {
          itemStyle: { shadowBlur: 0, opacity: 0.5 },
          lineStyle: { width: 0.5, opacity: 0.1 },
        },
      },
      labelLayout: { hideOverlap: true },
        scaleLimit: { min: 0.1, max: 200 },
        edgeSymbolSize: [2, 10],
        lineStyle: { color: "source", curveness: 0.2 },
    },
  ],
});

const CitationNetwork = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts>();
  const [allNodes, setAllNodes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<any[]>([]);

  // 1) Initialize chart & load data
  useEffect(() => {
    if (!chartRef.current) return;
    const chart = echarts.init(chartRef.current);
    chartInstanceRef.current = chart;
    chart.showLoading();

    fetch("/data/radx_studies_datasets_publications_edges.json")
      .then((r) => r.json())
      .then((graph) => {
        chart.hideLoading();
        graph.nodes = processNodes(graph.nodes);
        setAllNodes(graph.nodes);
        chart.setOption(createChartOption(graph));
      })
      .catch((e) => {
        console.error(e);
        chart.hideLoading();
      });

    return () => {
      chart.dispose();
    };
  }, []);

  // 2) On each searchTerm change: highlight & compute results
  useEffect(() => {
    const chart = chartInstanceRef.current;
    if (!chart) return;

    // clear previous highlights
    chart.dispatchAction({ type: "downplay", seriesIndex: 0 });

    // filter
    const lower = searchTerm.toLowerCase();
    const matches = allNodes.filter((node) =>
      String(node.name ?? "").toLowerCase().includes(lower)
    );
    setResults(matches);

    // highlight all matches on chart
    matches.forEach((node) => {
      const idx = allNodes.indexOf(node);
      chart.dispatchAction({
        type: "highlight",
        seriesIndex: 0,
        dataIndex: idx,
      });
    });
  }, [searchTerm, allNodes]);

  const highlightedIndexRef = useRef<number | null>(null);

  // helper to highlight + show tooltip when clicking a result
  const showTooltip = (idx: number) => {
    const chart = chartInstanceRef.current;
    if (!chart) return;

    // If you click the same node again, un-highlight it
    if (highlightedIndexRef.current === idx) {
      chart.dispatchAction({ type: "downplay", seriesIndex: 0, dataIndex: idx });
      chart.dispatchAction({ type: "hideTip" });
      highlightedIndexRef.current = null;
      return;
    }

    // Otherwise, remove highlight from the previous one
    if (highlightedIndexRef.current != null) {
      chart.dispatchAction({
        type: "downplay",
        seriesIndex: 0,
        dataIndex: highlightedIndexRef.current,
      });
    }

    // Highlight & show tooltip on the newly clicked node
    chart.dispatchAction({
      type: "highlight",
      seriesIndex: 0,
      dataIndex: idx,
    });
    chart.dispatchAction({
      type: "showTip",
      seriesIndex: 0,
      dataIndex: idx,
    });

    // Remember it
    highlightedIndexRef.current = idx;
  };

  return (
    <>
      {/* Search input */}
      <input
        type="text"
        placeholder="Search nodes…"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          zIndex: 20,
          padding: "6px 8px",
          borderRadius: 4,
          border: "1px solid #ccc",
          background: "#fff",
        }}
      />

      {/* Results panel */}
      <div
        style={{
          position: "absolute",
          top: 48,
          left: 12,
          zIndex: 20,
          maxHeight: "50vh",
          width: 300,
          overflowY: "auto",
          background: "rgba(255,255,255,0.9)",
          border: "1px solid #ddd",
          borderRadius: 4,
          padding: 8,
        }}
      >
        {results.map((node, i) => {
          const idx = allNodes.indexOf(node);
          return (
            <div
              key={node.id}
              onClick={() => showTooltip(idx)}
              style={{
                marginBottom: 6,
                cursor: "pointer",
                padding: 4,
                borderRadius: 2,
                background:
                  String(node.name)
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) &&
                  searchTerm
                    ? "rgba(0, 150, 250, 0.1)"
                    : "transparent",
              }}
            >
              <strong style={{ fontSize: 14 }}>{node.name}</strong>
              <div style={{ fontSize: 12, color: "#555" }}>
                {node.category} — {node.nodeType}
              </div>
            </div>
          );
        })}
        {results.length === 0 && searchTerm && (
          <div style={{ fontSize: 12, color: "#999" }}>No matches</div>
        )}
      </div>

      {/* The chart */}
      <div ref={chartRef} style={{ width: "100vw", height: "100vh" }} />
    </>
  );
};

export default CitationNetwork;