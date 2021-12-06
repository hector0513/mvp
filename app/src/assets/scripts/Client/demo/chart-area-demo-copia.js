// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = "'Quicksand'";
Chart.defaults.global.defaultFontColor = "#858796";

function number_format(number, decimals, dec_point, thousands_sep) {
  // *     example: number_format(1234.56, 2, ',', ' ');
  // *     return: '1 234,56'
  number = (number + "").replace(",", "").replace(" ", "");
  var n = !isFinite(+number) ? 0 : +number,
    prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
    sep = typeof thousands_sep === "undefined" ? "," : thousands_sep,
    dec = typeof dec_point === "undefined" ? "." : dec_point,
    s = "",
    toFixedFix = function (n, prec) {
      var k = Math.pow(10, prec);
      return "" + Math.round(n * k) / k;
    };
  // Fix for IE parseFloat(0.55).toFixed(0) = 0;
  s = (prec ? toFixedFix(n, prec) : "" + Math.round(n)).split(".");
  if (s[0].length > 3) {
    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
  }
  if ((s[1] || "").length < prec) {
    s[1] = s[1] || "";
    s[1] += new Array(prec - s[1].length + 1).join("0");
  }
  return s.join(dec);
}

var wallet = JSON.parse(
  document.getElementById("variableWalletGraphic").innerText
);
var resEne = 0;
var sumEne = 0;
var sumFeb = 0;
var resFeb = 0;
var sumMar = 0;
var resMar = 0;
var sumAbr = 0;
var resAbr = 0;
var sumMay = 0;
var resMay = 0;
var sumJun = 0;
var resJun = 0;
var sumJul = 0;
var resJul = 0;
var sumAgo = 0;
var resAgo = 0;
var sumSep = 0;
var resSep = 0;
var sumOct = 0;
var resOct = 0;
var sumNov = 0;
var resNov = 0;
var sumDic = 0;
var resDic = 0;

for (x in wallet) {
  if (wallet[x].status == "Aprobada") {
    if (
      wallet[x].retirementWallet &&
      moment(wallet[x].timeStampCreate).format("MM") == 01
    ) {
      resEne += parseFloat(wallet[x].retirementWallet.amount);
    } else if (
      wallet[x].rechargeWallet &&
      moment(wallet[x].timeStampCreate).format("MM") == 01
    ) {
      sumEne += parseFloat(wallet[x].rechargeWallet.amount);
    }
    if (
      wallet[x].retirementWallet &&
      moment(wallet[x].timeStampCreate).format("MM") == 02
    ) {
      resFeb += parseFloat(wallet[x].retirementWallet.amount);
    } else if (
      wallet[x].rechargeWallet &&
      moment(wallet[x].timeStampCreate).format("MM") == 02
    ) {
      sumFeb += parseFloat(wallet[x].rechargeWallet.amount);
    }
    if (
      wallet[x].retirementWallet &&
      moment(wallet[x].timeStampCreate).format("MM") == 03
    ) {
      resMar += parseFloat(wallet[x].retirementWallet.amount);
    } else if (
      wallet[x].rechargeWallet &&
      moment(wallet[x].timeStampCreate).format("MM") == 03
    ) {
      sumMar += parseFloat(wallet[x].rechargeWallet.amount);
    }
    if (
      wallet[x].retirementWallet &&
      moment(wallet[x].timeStampCreate).format("MM") == 04
    ) {
      resAbr += parseFloat(wallet[x].retirementWallet.amount);
    } else if (
      wallet[x].rechargeWallet &&
      moment(wallet[x].timeStampCreate).format("MM") == 04
    ) {
      sumAbr += parseFloat(wallet[x].rechargeWallet.amount);
    }
    if (
      wallet[x].retirementWallet &&
      moment(wallet[x].timeStampCreate).format("MM") == 05
    ) {
      resMay += parseFloat(wallet[x].retirementWallet.amount);
    } else if (
      wallet[x].rechargeWallet &&
      moment(wallet[x].timeStampCreate).format("MM") == 05
    ) {
      sumMay += parseFloat(wallet[x].rechargeWallet.amount);
    }
    if (
      wallet[x].retirementWallet &&
      moment(wallet[x].timeStampCreate).format("MM") == 06
    ) {
      resJun += parseFloat(wallet[x].retirementWallet.amount);
    } else if (
      wallet[x].rechargeWallet &&
      moment(wallet[x].timeStampCreate).format("MM") == 06
    ) {
      sumJun += parseFloat(wallet[x].rechargeWallet.amount);
    }
    if (
      wallet[x].retirementWallet &&
      moment(wallet[x].timeStampCreate).format("MM") == 07
    ) {
      resJul += parseFloat(wallet[x].retirementWallet.amount);
    } else if (
      wallet[x].rechargeWallet &&
      moment(wallet[x].timeStampCreate).format("MM") == 07
    ) {
      sumJul += parseFloat(wallet[x].rechargeWallet.amount);
    }
    if (
      wallet[x].retirementWallet &&
      moment(wallet[x].timeStampCreate).format("MM") == 08
    ) {
      resAgo += parseFloat(wallet[x].retirementWallet.amount);
    } else if (
      wallet[x].rechargeWallet &&
      moment(wallet[x].timeStampCreate).format("MM") == 08
    ) {
      sumAgo += parseFloat(wallet[x].rechargeWallet.amount);
    }
    if (
      wallet[x].retirementWallet &&
      moment(wallet[x].timeStampCreate).format("MM") == 09
    ) {
      resSep += parseFloat(wallet[x].retirementWallet.amount);
    } else if (
      wallet[x].rechargeWallet &&
      moment(wallet[x].timeStampCreate).format("MM") == 09
    ) {
      sumSep += parseFloat(wallet[x].rechargeWallet.amount);
    }
    if (
      wallet[x].retirementWallet &&
      moment(wallet[x].timeStampCreate).format("MM") == 10
    ) {
      resOct += parseFloat(wallet[x].retirementWallet.amount);
    } else if (
      wallet[x].rechargeWallet &&
      moment(wallet[x].timeStampCreate).format("MM") == 10
    ) {
      sumOct += parseFloat(wallet[x].rechargeWallet.amount);
    }
    if (
      wallet[x].retirementWallet &&
      moment(wallet[x].timeStampCreate).format("MM") == 11
    ) {
      resNov += parseFloat(wallet[x].retirementWallet.amount);
    } else if (
      wallet[x].rechargeWallet &&
      moment(wallet[x].timeStampCreate).format("MM") == 11
    ) {
      sumNov += parseFloat(wallet[x].rechargeWallet.amount);
    }
    if (
      wallet[x].retirementWallet &&
      moment(wallet[x].timeStampCreate).format("MM") == 12
    ) {
      resDic += parseFloat(wallet[x].retirementWallet.amount);
    } else if (
      wallet[x].rechargeWallet &&
      moment(wallet[x].timeStampCreate).format("MM") == 12
    ) {
      sumDic += parseFloat(wallet[x].rechargeWallet.amount);
    }
  }
}

var Enero = sumEne - resEne;
var Febrero = sumFeb - resFeb;
var Marzo = sumMar - resMar;
var Abril = sumAbr - resAbr;
var Mayo = sumMay - resMay;
var Junio = sumJun - resJun;
var Julio = sumJul - resJul;
var Agosto = sumAgo - resAgo;
var Septiembre = sumSep - resSep;
var Octubre = sumOct - resOct;
var Noviembre = sumNov - resNov;
var Diciembre = sumDic - resDic;

// Area Chart Example
var ctx = document.getElementById("myAreaChart");
var myLineChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ],
    datasets: [
      {
        label: "Ganancia",
        lineTension: 0.3,
        backgroundColor: "rgba(78,115, 223, 0.05)",
        borderColor: "rgba(78,115, 223, 1)",
        pointRadius: 3,
        pointBackgroundColor: "rgba(78,115, 223, 1)",
        pointBorderColor: "rgba(78,115, 223, 1)",
        pointHoverRadius: 3,
        pointHoverBackgroundColor: "rgba(78,115, 223, 1)",
        pointHoverBorderColor: "rgba(78,115, 223, 1)",
        pointHitRadius: 10,
        pointBorderWidth: 2,
        data: [
          Enero,
          Febrero,
          Marzo,
          Abril,
          Mayo,
          Junio,
          Julio,
          Agosto,
          Septiembre,
          Octubre,
          Noviembre,
          Diciembre,
        ],
      },
    ],
  },
  options: {
    maintainAspectRatio: false,
    layout: {
      padding: {
        left: 10,
        right: 25,
        top: 25,
        bottom: 0,
      },
    },
    scales: {
      xAxes: [
        {
          time: {
            unit: "date",
          },
          gridLines: {
            display: false,
            drawBorder: false,
          },
          ticks: {
            maxTicksLimit: 7,
          },
        },
      ],
      yAxes: [
        {
          ticks: {
            maxTicksLimit: 5,
            padding: 10,
            // Include a dollar sign in the ticks
            callback: function (value, index, values) {
              return "$" + number_format(value);
            },
            suggestedMin: 0,
          },
          gridLines: {
            color: "rgb(234, 236, 244)",
            zeroLineColor: "rgb(234, 236, 244)",
            drawBorder: false,
            borderDash: [2],
            zeroLineBorderDash: [2],
          },
        },
      ],
    },
    legend: {
      display: false,
    },
    tooltips: {
      backgroundColor: "rgb(255,255,255)",
      bodyFontColor: "#858796",
      titleMarginBottom: 10,
      titleFontColor: "#6e707e",
      titleFontSize: 14,
      borderColor: "#dddfeb",
      borderWidth: 1,
      xPadding: 15,
      yPadding: 15,
      displayColors: false,
      intersect: false,
      mode: "index",
      caretPadding: 10,
      callbacks: {
        label: function (tooltipItem, chart) {
          var datasetLabel =
            chart.datasets[tooltipItem.datasetIndex].label || "";
          return datasetLabel + ": $" + number_format(tooltipItem.yLabel);
        },
      },
    },
  },
});
