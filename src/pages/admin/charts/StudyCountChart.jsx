import React, { useEffect } from "react";
import Chart from "chart.js/auto";

const StudyCountChart = ({ labels, data }) => {
  useEffect(() => {
    new Chart(document.getElementById("studyCountChart"), {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "스터디 개설 수",
            data,
            backgroundColor: "rgba(54, 162, 235, 0.6)",
          },
        ],
      },
    });
  }, [labels, data]);

  return <canvas id="studyCountChart"></canvas>;
};

export default StudyCountChart;
