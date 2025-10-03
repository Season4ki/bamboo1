<template>
  <div class="chart-container">
    <canvas id="radarChart"></canvas>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js';
import config from '../config.js';

Chart.register(...registerables);

export default {
  name: 'radarChart',
  data() {
    return {
      configdata: config,
      skills: null,
      skillPoints: null,
    };
  },
  mounted() {
    if (import.meta.env.VITE_CONFIG) {
      this.configdata = JSON.parse(import.meta.env.VITE_CONFIG);
    }
    this.skills = this.configdata.radarChart.skills;
    this.skillPoints = this.configdata.radarChart.skillPoints;
    this.renderChart();
  },
  methods: {
    createGradient(ctx, color) {
      const gradient = ctx.createLinearGradient(0, 0, 0, 400);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, "rgba(255,255,255,0.1)");
      return gradient;
    },
    renderChart() {
      const ctx = document.getElementById('radarChart').getContext('2d');
      const baseColors = [
        "rgba(255,99,132,0.6)",
        "rgba(54,162,235,0.6)",
        "rgba(255,206,86,0.6)",
        "rgba(75,192,192,0.6)",
        "rgba(153,102,255,0.6)",
        "rgba(255,159,64,0.6)"
      ];

      const backgroundColors = baseColors.map(c => this.createGradient(ctx, c));

      new Chart(ctx, {
        type: 'radar',
        data: {
          labels: this.skills,
          datasets: [{
            label: 'スキルレベル',
            data: this.skillPoints,
            backgroundColor: "rgba(54,162,235,0.3)",
            borderColor: "rgba(54,162,235,1)",
            borderWidth: 3,
            pointBackgroundColor: baseColors,
            pointBorderColor: "#fff",
            pointRadius: 6,
            pointHoverRadius: 10,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              labels: {
                color: "#fff",
                font: {
                  size: 14,
                  weight: "bold"
                }
              }
            },
            tooltip: {
              backgroundColor: "rgba(0,0,0,0.8)",
              titleColor: "#ffcc00",
              bodyColor: "#fff",
              callbacks: {
                label: function (context) {
                  return `${context.label}: ${context.raw} ポイント`;
                }
              }
            }
          },
          scales: {
            r: {
              angleLines: { color: "rgba(200,200,200,0.3)" },
              grid: { color: "rgba(200,200,200,0.2)" },
              pointLabels: {
                color: "#ffcc00",
                font: {
                  size: 14,
                  weight: "bold"
                }
              },
              ticks: {
                color: "#fff",
                backdropColor: "transparent"
              }
            }
          },
          animation: {
            duration: 2000,
            easing: 'easeOutElastic'
          }
        }
      });
    }
  }
};
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 500px;
  background: transparent;
  padding: 20px;
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
}
</style>