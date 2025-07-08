import React, { useEffect, useRef } from 'react';
import { Network } from 'vis-network';
import 'vis-network/styles/vis-network.css';

function GraphCours({ nodes, edges }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!nodes.length) return;

    const data = {
      nodes: nodes.map(n => ({
        id: n.id,
        label: n.label,
        title: n.title,
        color: n.color,
        level: n.level || 1,
      })),
      edges: edges.map(e => ({
        from: e.from,
        to: e.to,
        arrows: 'to',
        dashes: e.dashes || false,
      })),
    };

    const options = {
      layout: {
        hierarchical: {
          enabled: true,
          direction: 'UD',
          sortMethod: 'directed',
          nodeSpacing: 200,
          levelSeparation: 250,
        },
      },
      physics: false,
      interaction: {
        dragNodes: true,
        dragView: true,
        zoomView: true,
      },
      nodes: {
        shape: 'dot',
        size: 20,
        font: { color: '#000', size: 14 },
        borderWidth: 2,
      },
      edges: {
        arrows: { to: { enabled: true, scaleFactor: 0.8 } },
        smooth: {
          type: 'cubicBezier',
          forceDirection: 'vertical',
          roundness: 0.3,
        },
      },
    };

    const network = new Network(containerRef.current, data, options);

    return () => network.destroy();
  }, [nodes, edges]);

  return <div ref={containerRef} style={{ width: '100%', height: '600px' }} />;
}

export default GraphCours;
