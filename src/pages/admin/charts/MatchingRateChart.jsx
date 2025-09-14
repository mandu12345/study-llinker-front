import React, { useEffect } from "react";
import Chart from "chart.js/auto";

const MatchingRateChart = ({ labels, data }) => {
  useEffect(() => {
    new Chart(document.getElementById("matchingRateChart"), {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "매칭 성공률 (%)",
            data,
            borderColor: "orange",
            fill: false,
          },
        ],
      },
    });
  }, [labels, data]);

  return <canvas id="matchingRateChart"></canvas>;
};

export default MatchingRateChart;
