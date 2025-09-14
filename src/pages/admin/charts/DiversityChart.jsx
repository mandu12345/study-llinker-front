import React, { useEffect } from "react";
import Chart from "chart.js/auto";

const DiversityChart = ({ labels, data }) => {
  useEffect(() => {
    new Chart(document.getElementById("diversityChart"), {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "추천 다양성 지표",
            data,
            backgroundColor: "rgba(153, 102, 255, 0.6)",
          },
        ],
      },
    });
  }, [labels, data]);

  return <canvas id="diversityChart"></canvas>;
};

export default DiversityChart;
