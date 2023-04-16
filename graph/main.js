const symbols = [
    "BAND",
    "BTC",
    "COSMOS",
    "CRO",
    "ETH",
    "FET",
    "INJ",
    "JUNO",
    "KAVA",
    "KDA",
    "MED",
    "OSMO",
    "RUNE",
  ];
  
  const datasets = {};

  let chart;
  
  async function loadData(symbol) {
    return new Promise((resolve) => {
      Papa.parse(`./${symbol}_USD(1h_1month).csv`, {
        download: true,
        header: true,
        complete: function (results) {
          datasets[symbol] = results.data;
          resolve();
        },
      });
    });
  }
  
  async function loadAllData() {
    const promises = symbols.map(loadData);
    await Promise.all(promises);
  }
  
  function calculatePercentageChange(oldValue, newValue) {
    return ((newValue - oldValue) / oldValue) * 100;
  }
  
  function processData(symbol) {
    const data = datasets[symbol];
    const timestamps = [];
    const percentageChanges = [];
  
    for (let i = 1; i < data.length; i++) {
      const current = data[i];
      const previous = data[i - 1];
  
      const timeOpen = current.time_open;
      const closeCurrent = parseFloat(current.close);
      const closePrevious = parseFloat(previous.close);
  
      const percentageChange = calculatePercentageChange(closePrevious, closeCurrent);
  
      timestamps.push(timeOpen);
      percentageChanges.push(percentageChange);
    }
  
    return { timestamps, percentageChanges };
  }

  
// 기존 코드 유지
const selectedSymbols = new Set();

function createChart() {
  if (chart) {
    chart.destroy();
  }
  const ctx = document.getElementById("myChart").getContext("2d");

  const datasets = Array.from(selectedSymbols).map((symbol) => {
    const { timestamps, percentageChanges } = processData(symbol);
    return {
      label: `${symbol} 등락률 (%)`,
      data: percentageChanges,
      borderColor: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 1)`,
      backgroundColor: "rgba(0, 0, 0, 0)",
      tension: 0.1,
    };
  });

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: processData(symbols[0]).timestamps, // 모든 코인의 timestamps는 동일하므로 첫 번째 코인의 timestamps를 사용합니다.
      datasets: datasets,
    },
    options: {
      interaction: {
        mode: "nearest",
        axis: "x",
        intersect: false,
      },
      plugins: {
        zoom: {
          pan: {
            enabled: true,
            mode: "x",
            speed: 10,
            scaleMode: "x",
            overScaleMode: "x",
          },
          zoom: {
            wheel: {
              enabled: true,
              mode: "x",
            },
            pinch: {
              enabled: true,
              mode: "x",
            },
            drag: {
                enabled: true,
                mode: "x",
            },
            mode: "x",
          },
          limits: {
            x: {
              min: "original",
              max: "original",
            },
          },
        },
      },
      scales: {
        x: {
          type: "time",
          time: {
            unit: "hour",
            displayFormats: {
              hour: "MM-DD HH:mm",
            },
            tooltipFormat: "MM-DD HH:mm",
          },
          title: {
            display: true,
            text: "시간",
          },
        },
        y: {
          title: {
            display: true,
            text: "등락률 (%)",
          },
          grid: {
            color: function (context) {
              return context.tick.value === 0 ? "rgba(0, 0, 0, 1)" : "rgba(0, 0, 0, 0.1)";
            },
            lineWidth: function (context) {
              return context.tick.value === 0 ? 1 : 1;
            },
          },
        },
      },
    },
  });
}

function createButtons() {
  const container = document.createElement("div");
  container.id = "buttons-container";

  symbols.forEach((symbol) => {
    const button = document.createElement("button");
    button.textContent = symbol;
    button.onclick = () => {
      if (selectedSymbols.has(symbol)) {
        selectedSymbols.delete(symbol);
        button.style.backgroundColor = "";
      } else {
        selectedSymbols.add(symbol);
        button.style.backgroundColor = "lightblue";
      }
      createChart();
    };
    container.appendChild(button);
  });

  document.body.appendChild(container);
}

(async function () {
  await loadAllData();
  createButtons();
})();
