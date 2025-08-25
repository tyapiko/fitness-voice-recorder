import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const ExerciseChart = ({ topExercises }) => {
  if (!topExercises || topExercises.length === 0) {
    return (
      <div className="exercise-chart">
        <div className="chart-header">
          <h3>種目別分布</h3>
        </div>
        <div className="no-chart-data">
          <p>データがありません</p>
        </div>
      </div>
    );
  }

  // カラーパレット（種目別に色分け - より鮮やかで見やすい色）
  const colors = [
    '#667eea', // メインブルー
    '#764ba2', // パープル
    '#f093fb', // ピンク
    '#f5576c', // レッド
    '#4facfe', // ライトブルー
    '#43e97b', // グリーン
    '#fa709a', // オレンジピンク
    '#fee140'  // イエロー
  ];

  const chartData = {
    labels: topExercises.map(exercise => exercise.name),
    datasets: [
      {
        data: topExercises.map(exercise => exercise.totalReps),
        backgroundColor: colors.slice(0, topExercises.length).map(color => color + 'B3'), // 透明度70%
        borderColor: colors.slice(0, topExercises.length),
        borderWidth: 4,
        hoverBackgroundColor: colors.slice(0, topExercises.length).map(color => color + 'E6'), // 透明度90%
        hoverBorderWidth: 5,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 13,
            weight: '500'
          },
          color: '#4a5568',
          generateLabels: function(chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              const dataset = data.datasets[0];
              return data.labels.map((label, index) => {
                const value = dataset.data[index];
                const total = dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                
                return {
                  text: `${label} (${percentage}%)`,
                  fillStyle: dataset.backgroundColor[index],
                  strokeStyle: dataset.borderColor[index],
                  lineWidth: dataset.borderWidth,
                  index: index
                };
              });
            }
            return [];
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(0, 123, 255, 1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value}回 (${percentage}%)`;
          }
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
      easing: 'easeInOutQuart'
    },
    cutout: '65%', // ドーナツの穴のサイズ - より見やすく
    elements: {
      arc: {
        borderJoinStyle: 'round'
      }
    }
  };

  // 中央に合計数値を表示するプラグイン
  const centerTextPlugin = {
    id: 'centerText',
    beforeDraw: function(chart) {
      const { width, height, ctx } = chart;
      ctx.restore();
      
      const total = topExercises.reduce((sum, exercise) => sum + exercise.totalReps, 0);
      
      ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
      ctx.fillStyle = '#4a5568';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const centerX = width / 2;
      const centerY = height / 2;
      
      ctx.fillText(total.toString(), centerX, centerY - 10);
      
      ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
      ctx.fillStyle = '#718096';
      ctx.fillText('合計回数', centerX, centerY + 15);
      
      ctx.save();
    }
  };

  return (
    <div className="exercise-chart">
      <div className="chart-header">
        <h3>種目別分布</h3>
        <div className="chart-period">
          <span className="period-badge">TOP5</span>
        </div>
      </div>
      <div className="doughnut-container">
        <Doughnut 
          data={chartData} 
          options={options} 
          plugins={[centerTextPlugin]}
        />
      </div>
    </div>
  );
};

export default ExerciseChart;