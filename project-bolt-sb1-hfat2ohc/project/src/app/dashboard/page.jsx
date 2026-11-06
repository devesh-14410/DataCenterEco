'use client';
import React, { useState, useEffect } from 'react';

export default function EcoVoltLiveDashboard() {
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiveMetrics = async () => {
      try {
       // Connect to EcoVolt AI telemetry API
const res = await fetch('/api/telemetry', {
  cache: 'no-store'
});

if (!res.ok) {
  throw new Error(`Telemetry API Error: ${res.status}`);
}

const data = await res.json();

if (data && data.node_id && data.metrics) {
  setTelemetry(data);
}
       
      } catch (err) {
        console.log("Ingestion point sync issue...");
      } finally {
        setLoading(false);
      }
    };

    // Auto update logic - Updates screens exactly every 2 seconds without lagging
    fetchLiveMetrics();
    const clusterInterval = setInterval(fetchLiveMetrics, 2000);
    return () => clearInterval(clusterInterval);
  }, []);

  return (
    <div style={{ backgroundColor: '#0a0f1d', color: '#fff', minHeight: '100vh', padding: '40px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* HEADER STATUS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #1e293b', paddingBottom: '20px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2.5rem', color: '#00f2fe', textShadow: '0 0 10px rgba(0,242,254,0.5)' }}>EcoVolt AI Enterprise</h1>
            <p style={{ margin: '5px 0 0 0', color: '#94a3b8' }}>Live Server Cluster Management Network</p>
          </div>
          <div style={{ backgroundColor: telemetry ? '#059669' : '#dc2626', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.85rem', boxShadow: telemetry ? '0 0 15px rgba(5,150,105,0.4)' : 'none' }}>
            {telemetry ? '● Cluster Active' : '● System Standby'}
          </div>
        </div>

        {/* METRICS DISPLAY PANEL */}
        {loading ? (
          <h2 style={{ textAlign: 'center', marginTop: '100px', color: '#94a3b8' }}>Synchronizing secure hardware data pipes...</h2>
        ) : (
          <div style={{ marginTop: '40px' }}>
            <div style={{ marginBottom: '25px', backgroundColor: '#111827', padding: '20px', borderRadius: '12px', border: '1px solid #1f2937' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>ACTIVE HARWARE NODE IDENTIFIER</span>
              <h3 style={{ margin: '5px 0 0 0', color: '#38bdf8' }}>{telemetry ? telemetry.node_id : 'Searching for local Omen telemetry registry streams...'}</h3>
              <p style={{ margin: '5px 0 0 0', color: '#e2e8f0', fontSize: '0.95rem' }}>Core Layer: {telemetry ? telemetry.hardware_type : 'N/A'}</p>
            </div>

            {/* NEON CHARTS GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px' }}>
              
              {/* CPU LOAD CARD */}
              <div style={{ backgroundColor: '#111827', padding: '25px', borderRadius: '12px', border: '1px solid #1f2937', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.5)' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#94a3b8', fontSize: '0.9rem' }}>CPU CORE WORKLOAD</h4>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#00f2fe' }}>
                  {telemetry ? `${telemetry.metrics.cpu_utilization_percent}%` : '0%'}
                </div>
                <div style={{ marginTop: '15px', backgroundColor: '#1f2937', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ backgroundColor: '#00f2fe', height: '100%', width: telemetry ? `${telemetry.metrics.cpu_utilization_percent}%` : '0%', transition: 'width 0.5s ease-in-out' }}></div>
                </div>
              </div>

              {/* GPU TEMPERATURE CARD */}
              <div style={{ backgroundColor: '#111827', padding: '25px', borderRadius: '12px', border: '1px solid #1f2937', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.5)' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#94a3b8', fontSize: '0.9rem' }}>NVIDIA GPU CORE THERMAL</h4>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#f43f5e' }}>
                  {telemetry ? `${telemetry.metrics.gpu_temperature_celsius}°C` : '0°C'}
                </div>
                <div style={{ marginTop: '15px', backgroundColor: '#1f2937', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ backgroundColor: '#f43f5e', height: '100%', width: telemetry ? `${Math.min(telemetry.metrics.gpu_temperature_celsius, 100)}%` : '0%', transition: 'width 0.5s ease-in-out' }}></div>
                </div>
              </div>

              {/* GPU LOAD / VRAM CARD */}
              <div style={{ backgroundColor: '#111827', padding: '25px', borderRadius: '12px', border: '1px solid #1f2937', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.5)' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#94a3b8', fontSize: '0.9rem' }}>ACTIVE VRAM ALLOCATION</h4>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#a855f7' }}>
                  {telemetry ? `${telemetry.metrics.vram_utilization_percent}%` : '0%'}
                </div>
                <div style={{ marginTop: '15px', backgroundColor: '#1f2937', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ backgroundColor: '#a855f7', height: '100%', width: telemetry ? `${telemetry.metrics.vram_utilization_percent}%` : '0%', transition: 'width 0.5s ease-in-out' }}></div>
                </div>
              </div>

              {/* POWER DRAW CARD */}
              <div style={{ backgroundColor: '#111827', padding: '25px', borderRadius: '12px', border: '1px solid #1f2937', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.5)' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#94a3b8', fontSize: '0.9rem' }}>ENERGY DEMAND MATRIX</h4>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#22c55e' }}>
                  {telemetry ? `${telemetry.metrics.gpu_power_draw_watts}W` : '0W'}
                </div>
                <div style={{ marginTop: '15px', color: '#22c55e', fontSize: '0.85rem', fontWeight: 'bold' }}>
                  {telemetry ? `⚡ Savings Delta: ${telemetry.metrics.cooling_fan_efficiency_delta}% Efficient` : '⚡ Optimization Off'}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
