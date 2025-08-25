import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

// Chart.jsのコンポーネントを登録
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const WeeklyChart = ({ weekData, chartType = 'bar' }) => {
  // Chart.js用のデータ形式に変換
  const chartData = {
    labels: weekData.map(day => `${day.dayName}\n${day.date}日`),
    datasets: [
      {
        label: '回数',
        data: weekData.map(day => day.reps),
        backgroundColor: weekData.map(day => 
          day.hasRecord 
            ? 'rgba(102, 126, 234, 0.9)' 
            : 'rgba(226, 232, 240, 0.6)'
        ),
        borderColor: weekData.map(day => 
          day.hasRecord 
            ? '#667eea' 
            : '#e2e8f0'
        ),
        borderWidth: 2,
        borderRadius: chartType === 'bar' ? 12 : 0,
        borderSkipped: false,
        hoverBackgroundColor: weekData.map(day => 
          day.hasRecord 
            ? 'rgba(102, 126, 234, 1)' 
            : 'rgba(203, 213, 225, 0.8)'
        ),
        hoverBorderColor: weekData.map(day => 
          day.hasRecord 
            ? '#5a67d8' 
            : '#cbd5e1'
        ),
        hoverBorderWidth: 3,
      }
    ]
  };

  // 線グラフ用の追加設定
  if (chartType === 'line') {
    chartData.datasets[0] = {
      ...chartData.datasets[0],
      backgroundColor: 'rgba(102, 126, 234, 0.2)',
      borderColor: '#667eea',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: weekData.map(day => 
        day.hasRecord ? '#667eea' : '#e2e8f0'
      ),
      pointBorderColor: '#ffffff',
      pointBorderWidth: 3,
      pointRadius: 8,
      pointHoverRadius: 12,
      pointHoverBackgroundColor: weekData.map(day => 
        day.hasRecord ? '#5a67d8' : '#cbd5e1'
      ),
      pointHoverBorderColor: '#ffffff',
      pointHoverBorderWidth: 4,
    };
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(0, 123, 255, 1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: function(context) {
            const index = context[0].dataIndex;
            const day = weekData[index];
            return `${day.dayName} ${day.date}日`;
          },
          label: function(context) {
            const value = context.parsed.y;
            if (value === 0) return 'トレーニング記録なし';
            return `${value}回のトレーニング`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        border: {
          display: false
        },
        ticks: {
          color: '#4a5568',
          font: {
            size: 12,
            weight: '500'
          },
          maxRotation: 0
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(102, 126, 234, 0.1)',
          drawBorder: false
        },
        border: {
          display: false
        },
        ticks: {
          color: '#4a5568',
          font: {
            size: 12,
            weight: '500'
          },
          callback: function(value) {
            return value === 0 ? '0' : `${value}回`;
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    }
  };

  const ChartComponent = chartType === 'line' ? Line : Bar;

  return (
    <div className="weekly-chart">
      <div className="chart-header">
        <h3>週間アクティビティ</h3>
        <div className="chart-legend">
          <span className="legend-item">
            <span className="legend-color active"></span>
            記録あり
          </span>
          <span className="legend-item">
            <span className="legend-color inactive"></span>
            記録なし
          </span>
        </div>
      </div>
      <div className="chart-container-real">
        <ChartComponent data={chartData} options={options} />
      </div>
    </div>
  );
};

export default WeeklyChart;