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
import type { DataPoint} from "../api/WebSockets";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

interface Props {
    dataPoints: DataPoint[];
}

const Chart = ({dataPoints} : Props) => {
    
    const chartData = {
        labels: dataPoints.map((p) => new Date(p.t).toLocaleTimeString()),
        datasets: [
            {
                label: 'Sensor value',
                data: dataPoints.map((p) => p.v),
                borderColor: "#71c7c7",
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
                grid: {color: "#ffffff80"},
                ticks: { color: '#ffffff80' }
            },
            
        },
        plugins: {
            legend: { display: false },
        },
    };

  return (
    <Line data={chartData} options={options} />
  )
}

export default Chart