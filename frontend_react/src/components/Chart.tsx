import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { DataPoint } from "../api/useWebsockets";
import type { SettingsMap } from '../api/useSettings';
import ChartSelectors from './ChartSelectors';
import React, { useState, useEffect, useRef, useMemo } from "react"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

interface Props {
    dataPoints: DataPoint[];
    settings: SettingsMap;
}

const Chart = ({dataPoints, settings} : Props) => {
    const [chartId, setChartId] = useState<string | undefined>(Object.keys(settings)[0]);

    useEffect(() => {
        const first = Object.keys(settings)[0];
        if (first) setChartId(first);
    }, [settings]);

    const yMax = 
        (chartId != null && settings[chartId]?.max != null && settings[chartId].max > 0) 
        ? settings[chartId].max 
        : undefined;

    const yMin =
        (chartId != null && settings[chartId]?.min != null && settings[chartId]?.min != null && yMax != null)
        ? settings[chartId].min
        : undefined

    const chartRef = useRef<any>(null);

    const chartData = useMemo(() => ({
        labels: dataPoints.map((point) => new Date(point.time).toLocaleTimeString()),
        datasets: [
            {
                label: 'Sensor value',
                data: dataPoints.map((point) => {
                    const sensorData = point.data as Record<string, number | null >;
                    if (chartId == null || !(chartId in sensorData))  return null;
                    return sensorData[chartId] ?? null;
                }),
                borderColor: "#207b3a",
                tension: 0.2,
                pointRadius: 0,
            },
        ],
    }), [dataPoints, chartId]);

    const options = useMemo(() => ({
        animation: false as const, 
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: { display: false }, 
            y: { 
                beginAtZero: false,
                grid: {color: "#828282"},
                ticks: { color: '#828282' },
                min: yMin,
                max: yMax
            },
            
        },
        plugins: {
            legend: { display: false },
        },
    }), [yMin, yMax]);

    useEffect(() => {
        const chart = chartRef.current;
        if (!chart) return;

        try {
            chart.data.labels = dataPoints.map((point: any) => new Date(point.time).toLocaleTimeString());
            chart.data.datasets[0].data = dataPoints.map((point: any) => {
                const sensorData = point.data as Record<string, number | null>;
                if (chartId == null || !(chartId in sensorData)) return null;
                return sensorData[chartId] ?? null;
            });

            if (chart.options?.scales?.y) {
                chart.options.scales.y.min = yMin;
                chart.options.scales.y.max = yMax;
            }
            if (typeof chart.update === 'function') chart.update();
        } catch (e) {
            console.warn('Chart update failed, falling back to full render', e);
        }
    }, [dataPoints, chartId, yMin, yMax]);

  return (

    <div className=" w-full flex flex-col">
        <ChartSelectors settings={settings} chartId={chartId} setChartId={setChartId} />
        <div className="border rounded-lg shadow-2xl/50 overflow-hidden">
            <h2 className="m-auto text-center py-2 border-b" style={{backgroundColor: "var(--secondary)"}}>CHART {chartId}</h2>
            <div className="p-5">
                                <Line ref={chartRef} data={chartData} options={options} />
            </div>
        </div>
    </div>
  )
}


export default React.memo(Chart)