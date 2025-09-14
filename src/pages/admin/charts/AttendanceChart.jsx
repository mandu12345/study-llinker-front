import React, { useEffect } from "react";
import Chart from "chart.js/auto";

const AttendanceChart = ({ labels, data }) => {
  useEffect(() => {
    new Chart(document.getElementById("attendanceChart"), {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "출석률 (%)",
            data,
            borderColor: "green",
            fill: false,
          },
        ],
      },
    });
  }, [labels, data]);

  return <canvas id="attendanceChart"></canvas>;
};

export default AttendanceChart;
