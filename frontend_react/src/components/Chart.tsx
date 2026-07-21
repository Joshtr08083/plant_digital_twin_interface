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
import { useState, useEffect } from "react"

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

    const chartData = {
        labels: dataPoints.map((point) => new Date(point.time).toLocaleTimeString()),
        datasets: [
            {
                label: 'Sensor value',
                data: dataPoints.map((point) => {
                    const sensorData = point.data as Record<string, number | null >;
                    if (chartId == null || !(chartId in sensorData))  return;
                    return sensorData[chartId] ?? null;
                }),
                borderColor: "#207b3a",
                tension: 0.2,
                pointRadius: 0,
            },
        ],
    };

    const options = {
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
    };

  return (

    <div className=" w-full flex flex-col">
        <ChartSelectors settings={settings} chartId={chartId} setChartId={setChartId} />
        <div className="border rounded-lg shadow-2xl/50 overflow-hidden">
            <h2 className="m-auto text-center py-2 border-b" style={{backgroundColor: "var(--secondary)"}}>CHART {chartId}</h2>
            <div className="p-5">
                <Line data={chartData} options={options} />
            </div>
        </div>
    </div>
  )
}

export default Chart