import React, { useEffect } from "react";
import Chart from "chart.js/auto";

const MemberRatioChart = ({ labels, data }) => {
  useEffect(() => {
    new Chart(document.getElementById("memberRatioChart"), {
      type: "pie",
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: ["#ff6384", "#36a2eb", "#ffcd56"],
          },
        ],
      },
    });
  }, [labels, data]);

  return <canvas id="memberRatioChart"></canvas>;
};

export default MemberRatioChart;
