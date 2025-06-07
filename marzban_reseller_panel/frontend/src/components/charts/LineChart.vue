<template>
  <Line :data="chartData" :options="chartOptions" />
</template>

<script setup>
import { defineProps } from 'vue';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale);

/* eslint-disable-next-line no-unused-vars */
const props = defineProps({
  chartData: {
    type: Object,
    required: true,
    default: () => ({
      labels: [],
      datasets: [{ data: [] }],
    }),
  },
  chartOptions: {
    type: Object,
    default: () => ({
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
      plugins: {
        legend: {
          display: true,
        },
        title: {
          display: true,
          text: 'Chart Title',
        },
      },
    }),
  },
});
</script>
