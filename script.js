async function analyseerAandeel() {
  const ticker = document.getElementById("tickerInput").value.toUpperCase();
  const resultDiv = document.getElementById("result");

  // Soft criteria
  const brandScore = document.getElementById("brandRecognition").checked ? 1 : 0;
  const loyalScore = document.getElementById("loyalCustomers").checked ? 1 : 0;
  const feeling = document.getElementById("personalFeeling").value.trim();
  const feelingScore = feeling ? 1 : 0;

  resultDiv.innerHTML = "Laden...";

  try {
    // Data ophalen van backend API
    const metricRes = await fetch(`http://localhost:3000/api/metrics/${ticker}`);
    const metricData = await metricRes.json();

    const cashflowRes = await fetch(`http://localhost:3000/api/cashflow/${ticker}`);
    const cashflowData = await cashflowRes.json();

    const m = metricData.metric;
    const latestCashflow = cashflowData[0]; // Aangezien je nu een array krijgt, pak je het eerste element.

    let score = 0;
    let maxScore = 0;
    const details = [];
    let complete = true;

    // Current ratio
    if (m.currentRatio !== undefined) {
      maxScore++;
      if (m.currentRatio > 1) {
        score++;
        details.push("✅ Current ratio is gezond (>1)");
      } else {
        details.push("❌ Current ratio is te laag");
      }
    } else {
      complete = false;
      details.push("⚠️ Current ratio niet beschikbaar");
    }

    // Operating margin
    if (m.operatingMarginTTM !== undefined) {
      maxScore += 2;
      if (m.operatingMarginTTM > 20) {
        score += 2;
        details.push("✅ Hoge operating margin (>20%)");
      } else if (m.operatingMarginTTM > 10) {
        score++;
        details.push("⚠️ Gezonde operating margin (10-20%)");
      } else {
        details.push("❌ Lage operating margin (<10%)");
      }
    } else {
      complete = false;
      details.push("⚠️ Operating margin niet beschikbaar");
    }

    // Nettowinst per aandeel
    if (m.netIncomePerShareTTM !== undefined) {
      maxScore++;
      if (m.netIncomePerShareTTM > 0) {
        score++;
        details.push("✅ Positieve nettowinst per aandeel");
      } else {
        details.push("❌ Negatieve nettowinst per aandeel");
      }
    } else {
      complete = false;
      details.push("⚠️ Nettowinst per aandeel niet beschikbaar");
    }

// Cashflow
if (latestCashflow) {
  maxScore++;
  if (latestCashflow.netCashProvidedByOperatingActivities > 0) {
    score++;
    details.push("✅ Positieve operationele cashflow");
  } else {
    details.push("❌ Negatieve operationele cashflow");
  }

  maxScore++;
  if (latestCashflow.netCashUsedForInvestingActivites < 0) {
    score++;
    details.push("✅ Negatieve investing cashflow (herinvestering)");
  } else {
    details.push("⚠️ Positieve investing cashflow (kan verkoop activa zijn)");
  }

  if (latestCashflow.freeCashFlow > 0) {
    score++;
    details.push("✅ Positieve vrije kasstroom");
  } else {
    details.push("❌ Negatieve vrije kasstroom");
  }
} else {
  complete = false;
  details.push("⚠️ Geen cashflow-data beschikbaar");
}


    // Soft criteria (optellen bij score, maar niet bij maxScore)
    if (brandScore) details.push("✅ Brand recognition: aanwezig");
    else details.push("❌ Brand recognition: ontbreekt");

    if (loyalScore) details.push("✅ Loyale klanten: aanwezig");
    else details.push("❌ Loyale klanten: onzeker");

    if (feelingScore) details.push("✅ Persoonlijk gevoel toegevoegd");
    else details.push("❌ Geen persoonlijk gevoel toegevoegd");

    score += brandScore + loyalScore + feelingScore;

    // Advies
    let advies = "Niet kopen";
    if (score >= maxScore + 2) advies = "Sterk aandeel — kopen is reële optie";
    else if (score >= maxScore) advies = "Potentie — volg je gevoel & nieuws";

    const statusText = complete ? "✅ Analyse is compleet" : "⚠️ Analyse is gedeeltelijk (niet alle data beschikbaar)";

    resultDiv.innerHTML = `
      <h3>Analyse voor ${ticker}</h3>
      <p>${statusText}</p>
      <ul>${details.map(d => `<li>${d}</li>`).join("")}</ul>
      <h4>Score: ${score}/${maxScore + 3}</h4>
      <p><strong>Advies:</strong> ${advies}</p>
    `;
  } catch (error) {
    resultDiv.innerHTML = "❌ Er ging iets mis bij het ophalen van de data.";
    console.error("Error bij het ophalen van data:", error);
  }
}
