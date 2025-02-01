'use client';

import { useEffect, useState } from 'react';
import DataTable from '@components/DataTable';

// NOTE: This is an experimental approach. Not all browsers support pipeline statistics queries.
export default function GPUMonitor() {
  const [timeData, setTimeData] = useState<string[][]>([
    ['Frame #', 'Time (ms)'],
    // Data rows populate here
  ]);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      console.error('WebGL not supported in this browser');
      return;
    }

    let frameIdx = 0;
    let stop = false;

    const measureFrame = () => {
      if (stop) return;
      frameIdx++;

      // Example: Clear the canvas
      gl.clear(gl.COLOR_BUFFER_BIT);

      // Simulate some GPU work
      const startTime = performance.now();
      // (Any optional GPU compute/draw calls here)
      const endTime = performance.now();

      const gpuTimeMs = endTime - startTime;

      setTimeData(prev => [
        ...prev,
        [frameIdx.toString(), gpuTimeMs.toFixed(2)],
      ]);

      requestAnimationFrame(measureFrame);
    };

    requestAnimationFrame(measureFrame);

    // Cleanup
    return () => {
      stop = true;
    };
  }, []);

  return <DataTable data={timeData} />;
}
