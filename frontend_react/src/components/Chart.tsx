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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

interface Props {
    dataPoints: DataPoint[];
    id: number;
    settings: SettingsMap;
}

const Chart = ({dataPoints, id, settings} : Props) => {

    const yMax = 
        (settings[id]?.max !== undefined && settings[id]?.max !== null && settings[id].max > 0) 
        ? settings[id].max 
        : undefined;

    const yMin =
        (settings[id]?.min !== undefined && settings[id]?.min !== null && yMax !== undefined)
        ? settings[id].min
        : undefined

    const chartData = {
        labels: dataPoints.map((point) => new Date(point.time).toLocaleTimeString()),
        datasets: [
            {
                label: 'Sensor value',
                data: dataPoints.map((point) => {
                    const sensorData = point.data as Record<number, number | null >;
                    return sensorData[id] ?? null;
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

    <div className=" w-full h-72 border  rounded-lg shadow-xl/50">
        <h2 className="m-auto text-center py-2 border-b" style={{backgroundColor: "var(--secondary)"}}>CHART [{id}]</h2>
        <div className="p-5">
            <Line data={chartData} options={options} />
        </div>
    </div>
  )
}

export default Chart