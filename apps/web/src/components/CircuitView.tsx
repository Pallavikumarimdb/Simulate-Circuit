
import React, { useMemo } from 'react';
import ReactFlow, { Controls, Background } from 'reactflow';
import 'reactflow/dist/style.css';

interface Component {
  id: string;
  type: string;
  x: number;
  y: number;
  label: string;
}

interface Connection {
  from: string;
  to: string;
  fromPin: string;
  toPin: string;
}

interface CircuitViewProps {
  components: Component[];
  connections: Connection[];
}

const CircuitView = ({ components, connections }: CircuitViewProps) => {
  // Map components to React Flow nodes
  const nodes = useMemo(
    () =>
      components.map((component) => ({
        id: component.id,
        type: 'custom',
        position: { x: component.x, y: component.y },
        data: { label: component.label },
      })),
    [components]
  );

  // Map connections to React Flow edges
  const edges = useMemo(
    () =>
      connections.map((connection, index) => ({
        id: `edge-${index}`,
        source: connection.from,
        target: connection.to,
        label: `${connection.fromPin} → ${connection.toPin}`,
      })),
    [connections]
  );

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <ReactFlow nodes={nodes} edges={edges}>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default CircuitView;