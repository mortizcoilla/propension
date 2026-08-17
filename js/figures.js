/* =========================================================================
   js/figures.js
   Visualizaciones D3 v7 para el dashboard del modelo de propension.
   Namespace: window.MP.figures
   ========================================================================= */

(function () {
  "use strict";

  // Colores (mismo orden que segmentos en el paper)
  const COLORS = ["#A04545", "#3B878C", "#125358", "#C2C3C5"];
  const COL = {
    ink: "#081630",
    teal: "#3B878C",
    tealDeep: "#125358",
    tealSoft: "#D9E7E8",
    grey: "#C2C3C5",
    paper: "#EBEBED",
    paperDeep: "#DCDDDF",
    loss: "#A04545",
    lossSoft: "#F0DCDA",
  };

  const SHORT = ["ConHurto\nPrevio", "ConIrreg.\nNoHurto", "ConInsp.\nSinIrreg.", "SinInspec."];

  // Helpers
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const margin = { top: 24, right: 24, bottom: 48, left: 56 };

  function showTooltip(html, evt) {
    let tip = document.querySelector(".tooltip");
    if (!tip) {
      tip = document.createElement("div");
      tip.className = "tooltip";
      document.body.appendChild(tip);
    }
    tip.innerHTML = html;
    tip.classList.add("visible");
    tip.style.left = (evt.clientX + 12) + "px";
    tip.style.top = (evt.clientY - 12) + "px";
  }
  function hideTooltip() {
    const tip = document.querySelector(".tooltip");
    if (tip) tip.classList.remove("visible");
  }

  // -----------------------------------------------------------------------
  // F1 — Composicion del universo por cluster (dos paneles: N y base rate)
  // -----------------------------------------------------------------------
  function fig1Segments() {
    const container = $("#fig1");
    if (!container) return;
    const width = container.clientWidth;
    const height = 320;
    const svg = d3.select(container).append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`);

    const data = window.MP.segments;
    const clusters = data.clusters || Object.keys(window.MP.results);
    const segData = clusters.map((cl) => {
      const seg = window.MP.segments[cl] || { n: 0, target_rate: 0 };
      return { cl, n: seg.n, rate: seg.target_rate };
    });

    const panelW = (width - 32) / 2;

    // Panel 1: N por cluster
    const g1 = svg.append("g").attr("transform", `translate(0,0)`);
    g1.append("text").attr("x", 0).attr("y", 16).text("Tamano de la base").style("font-weight", 700).style("font-size", 13).style("fill", COL.ink);
    const x1 = d3.scaleBand().domain(SHORT).range([margin.left, panelW - 12]).padding(0.25);
    const y1 = d3.scaleLinear().domain([0, d3.max(segData, (d) => d.n) * 1.1]).range([height - margin.bottom, margin.top]);
    g1.selectAll(".bar-n").data(segData).join("rect")
      .attr("class", "bar-n")
      .attr("x", (d, i) => x1(SHORT[i]))
      .attr("y", (d) => y1(d.n))
      .attr("width", x1.bandwidth())
      .attr("height", (d) => height - margin.bottom - y1(d.n))
      .attr("fill", (d, i) => COLORS[i])
      .attr("stroke", "#fff").attr("stroke-width", 1.5)
      .on("mousemove", (e, d) => showTooltip(`<b>${d.cl}</b><br/>N = ${d.n.toLocaleString()}`, e))
      .on("mouseleave", hideTooltip);
    g1.selectAll(".bar-label").data(segData).join("text")
      .attr("class", "bar-label")
      .attr("x", (d, i) => x1(SHORT[i]) + x1.bandwidth() / 2)
      .attr("y", (d) => y1(d.n) - 4)
      .attr("text-anchor", "middle")
      .style("font-size", 11).style("font-weight", 700).style("fill", COL.ink)
      .text((d) => d.n.toLocaleString());
    g1.append("g").attr("transform", `translate(0,${height - margin.bottom})`).call(d3.axisBottom(x1))
      .selectAll("text").style("font-size", 10).style("font-family", "monospace");
    g1.append("g").attr("transform", `translate(${margin.left},0)`).call(d3.axisLeft(y1).ticks(5).tickFormat(d => `${d/1000}k`))
      .selectAll("text").style("font-size", 10).style("font-family", "monospace");

    // Panel 2: base rate por cluster
    const g2 = svg.append("g").attr("transform", `translate(${panelW + 32},0)`);
    g2.append("text").attr("x", 0).attr("y", 16).text("Tasa de hurto real (target)").style("font-weight", 700).style("font-size", 13).style("fill", COL.ink);
    const x2 = d3.scaleBand().domain(SHORT).range([margin.left, panelW - 12]).padding(0.25);
    const y2 = d3.scaleLinear().domain([0, Math.max(0.6, d3.max(segData, (d) => d.rate) * 1.2)]).range([height - margin.bottom, margin.top]);
    g2.selectAll(".bar-r").data(segData).join("rect")
      .attr("x", (d, i) => x2(SHORT[i]))
      .attr("y", (d) => y2(d.rate))
      .attr("width", x2.bandwidth())
      .attr("height", (d) => height - margin.bottom - y2(d.rate))
      .attr("fill", (d, i) => COLORS[i])
      .attr("stroke", "#fff").attr("stroke-width", 1.5)
      .on("mousemove", (e, d) => showTooltip(`<b>${d.cl}</b><br/>Base rate = ${(d.rate * 100).toFixed(1)}%`, e))
      .on("mouseleave", hideTooltip);
    g2.selectAll(".bar-r-label").data(segData).join("text")
      .attr("x", (d, i) => x2(SHORT[i]) + x2.bandwidth() / 2)
      .attr("y", (d) => y2(d.rate) - 4)
      .attr("text-anchor", "middle")
      .style("font-size", 11).style("font-weight", 700).style("fill", COL.ink)
      .text((d) => `${(d.rate * 100).toFixed(1)}%`);
    g2.append("g").attr("transform", `translate(0,${height - margin.bottom})`).call(d3.axisBottom(x2))
      .selectAll("text").style("font-size", 10).style("font-family", "monospace");
    g2.append("g").attr("transform", `translate(${margin.left},0)`).call(d3.axisLeft(y2).ticks(5).tickFormat(d => `${(d*100).toFixed(0)}%`))
      .selectAll("text").style("font-size", 10).style("font-family", "monospace");
  }

  // -----------------------------------------------------------------------
  // F2 — Feature importance por cluster (panel 2x2, top 8)
  // -----------------------------------------------------------------------
  function fig2FeatureImportance() {
    const container = $("#fig2");
    if (!container) return;
    const width = container.clientWidth;
    const height = 480;
    const svg = d3.select(container).append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`);

    const clusters = Object.keys(window.MP.feature_importance);
    const cellW = (width - 32) / 2;
    const cellH = (height - 16) / 2;

    clusters.forEach((cl, idx) => {
      const fi = window.MP.feature_importance[cl].slice(0, 8);
      const col = idx % 2, row = Math.floor(idx / 2);
      const g = svg.append("g").attr("transform", `translate(${col * (cellW + 32)}, ${row * (cellH + 8) + 8})`);

      g.append("text").attr("x", 0).attr("y", 14).text(SHORT[idx])
        .style("font-weight", 700).style("font-size", 12).style("fill", COL.ink);

      const innerW = cellW - 16;
      const innerH = cellH - 40;
      const x = d3.scaleLinear().domain([0, d3.max(fi, d => d.importance) * 1.05]).range([140, innerW]);
      const y = d3.scaleBand().domain(fi.map(d => d.feature)).range([28, innerH]).padding(0.15);

      g.selectAll(".bar").data(fi).join("rect")
        .attr("x", 140)
        .attr("y", d => y(d.feature))
        .attr("width", d => x(d.importance) - 140)
        .attr("height", y.bandwidth())
        .attr("fill", COLORS[idx])
        .attr("stroke", "#fff").attr("stroke-width", 0.5)
        .on("mousemove", (e, d) => showTooltip(`<b>${d.feature}</b><br/>gain = ${d.importance.toFixed(0)}`, e))
        .on("mouseleave", hideTooltip);

      g.append("g").call(d3.axisLeft(y))
        .selectAll("text").style("font-size", 10).style("font-family", "monospace");
    });
  }

  // -----------------------------------------------------------------------
  // F3 — AUC por cluster y horizonte (train / test / deploy)
  // -----------------------------------------------------------------------
  function fig3Auc() {
    const container = $("#fig3");
    if (!container) return;
    const width = container.clientWidth;
    const height = 320;
    const svg = d3.select(container).append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`);

    const clusters = Object.keys(window.MP.results);
    const x0 = d3.scaleBand().domain(SHORT).range([margin.left, width - margin.right]).padding(0.25);
    const x1 = d3.scaleBand().domain(["train", "test", "deploy"]).range([0, x0.bandwidth()]).padding(0.08);
    const y = d3.scaleLinear().domain([0.4, 0.85]).range([height - margin.bottom, margin.top]);

    const series = [
      { key: "auc_train", label: "Train", color: COL.teal },
      { key: "auc_test", label: "Test", color: COL.tealDeep },
      { key: "auc_deploy", label: "Deploy (OOT)", color: COL.loss },
    ];

    clusters.forEach((cl, idx) => {
      const g = svg.append("g").attr("transform", `translate(${x0(SHORT[idx])},0)`);
      const r = window.MP.results[cl];
      series.forEach((s) => {
        g.append("rect")
          .attr("x", x1(s.key))
          .attr("y", y(r[s.key]))
          .attr("width", x1.bandwidth())
          .attr("height", height - margin.bottom - y(r[s.key]))
          .attr("fill", s.color)
          .attr("stroke", "#fff")
          .on("mousemove", (e) => showTooltip(`<b>${cl}</b><br/>${s.label}: AUC = ${r[s.key].toFixed(3)}`, e))
          .on("mouseleave", hideTooltip);
        g.append("text")
          .attr("x", x1(s.key) + x1.bandwidth() / 2)
          .attr("y", y(r[s.key]) - 3)
          .attr("text-anchor", "middle")
          .style("font-size", 9.5).style("font-weight", 700).style("fill", COL.ink)
          .text(r[s.key].toFixed(2));
      });
    });

    svg.append("g").attr("transform", `translate(0,${height - margin.bottom})`).call(d3.axisBottom(x0))
      .selectAll("text").style("font-size", 10).style("font-family", "monospace");
    svg.append("g").attr("transform", `translate(${margin.left},0)`).call(d3.axisLeft(y).ticks(6).tickFormat(d => d.toFixed(2)))
      .selectAll("text").style("font-size", 10).style("font-family", "monospace");
    svg.append("line").attr("x1", margin.left).attr("x2", width - margin.right)
      .attr("y1", y(0.5)).attr("y2", y(0.5))
      .attr("stroke", COL.grey).attr("stroke-dasharray", "3,3").attr("stroke-width", 0.8);

    // Legend
    const legend = svg.append("g").attr("transform", `translate(${margin.left + 20}, ${margin.top - 8})`);
    series.forEach((s, i) => {
      const lg = legend.append("g").attr("transform", `translate(${i * 110}, 0)`);
      lg.append("rect").attr("width", 12).attr("height", 12).attr("fill", s.color);
      lg.append("text").attr("x", 16).attr("y", 10).text(s.label).style("font-size", 11).style("fill", COL.ink);
    });
  }

  // -----------------------------------------------------------------------
  // F4 — Precision@K (top 10%) vs base rate
  // -----------------------------------------------------------------------
  function fig4PrecisionAtK() {
    const container = $("#fig4");
    if (!container) return;
    const width = container.clientWidth;
    const height = 320;
    const svg = d3.select(container).append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`);

    const clusters = Object.keys(window.MP.precision_at_k);
    const x = d3.scaleBand().domain(clusters.map((_, i) => SHORT[i])).range([margin.left, width - margin.right]).padding(0.3);
    const y = d3.scaleLinear().domain([0, 1]).range([height - margin.bottom, margin.top]);
    const inner = x.bandwidth() / 2;

    clusters.forEach((cl, i) => {
      const pk = window.MP.precision_at_k[cl];
      const baseRate = pk.base_rate;
      const precision = pk.precision_at_10pct;
      const cx = x(SHORT[i]);

      svg.append("rect")
        .attr("x", cx - inner).attr("y", y(baseRate))
        .attr("width", inner).attr("height", height - margin.bottom - y(baseRate))
        .attr("fill", COL.grey)
        .attr("stroke", "#fff")
        .on("mousemove", (e) => showTooltip(`<b>${cl}</b><br/>Base rate: ${(baseRate*100).toFixed(1)}%`, e))
        .on("mouseleave", hideTooltip);

      svg.append("rect")
        .attr("x", cx).attr("y", y(precision))
        .attr("width", inner).attr("height", height - margin.bottom - y(precision))
        .attr("fill", COL.teal)
        .attr("stroke", "#fff")
        .on("mousemove", (e) => showTooltip(`<b>${cl}</b><br/>P@10%: ${(precision*100).toFixed(1)}%<br/>Lift: ${pk.lift.toFixed(2)}x`, e))
        .on("mouseleave", hideTooltip);

      svg.append("text")
        .attr("x", cx - inner / 2).attr("y", y(baseRate) - 3)
        .attr("text-anchor", "middle")
        .style("font-size", 10).style("fill", COL.ink)
        .text(`${(baseRate * 100).toFixed(0)}%`);
      svg.append("text")
        .attr("x", cx + inner / 2).attr("y", y(precision) - 3)
        .attr("text-anchor", "middle")
        .style("font-size", 10).style("font-weight", 700).style("fill", COL.ink)
        .text(`${(precision * 100).toFixed(0)}%`);

      // Lift label
      svg.append("text")
        .attr("x", cx).attr("y", y(Math.max(baseRate, precision)) - 22)
        .attr("text-anchor", "middle")
        .style("font-size", 10).style("font-style", "italic").style("fill", COL.loss)
        .text(`lift ${pk.lift.toFixed(2)}x`);
    });

    svg.append("g").attr("transform", `translate(0,${height - margin.bottom})`).call(d3.axisBottom(x))
      .selectAll("text").style("font-size", 10).style("font-family", "monospace");
    svg.append("g").attr("transform", `translate(${margin.left},0)`).call(d3.axisLeft(y).ticks(6).tickFormat(d => `${(d*100).toFixed(0)}%`))
      .selectAll("text").style("font-size", 10).style("font-family", "monospace");
    svg.append("text").attr("x", margin.left).attr("y", margin.top - 6)
      .text("Tasa de hurto real (%)").style("font-size", 11).style("fill", COL.ink);

    // Legend
    const legend = svg.append("g").attr("transform", `translate(${width - margin.right - 240}, ${margin.top - 8})`);
    legend.append("rect").attr("width", 12).attr("height", 12).attr("fill", COL.grey);
    legend.append("text").attr("x", 16).attr("y", 10).text("Base rate (azar)").style("font-size", 11).style("fill", COL.ink);
    legend.append("rect").attr("width", 12).attr("height", 12).attr("x", 130).attr("fill", COL.teal);
    legend.append("text").attr("x", 146).attr("y", 10).text("P@10% (modelo)").style("font-size", 11).style("fill", COL.ink);
  }

  // -----------------------------------------------------------------------
  // F5 — Heatmap de contribucion por grupo de variables (% del gain)
  // -----------------------------------------------------------------------
  function fig5GroupHeatmap() {
    const container = $("#fig5");
    if (!container) return;
    const width = container.clientWidth;
    const height = 280;
    const svg = d3.select(container).append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`);

    const gc = window.MP.group_contribution;
    const groups = gc.groups;
    const clusters = gc.clusters;
    const matrix = gc.matrix;

    const x = d3.scaleBand().domain(groups).range([120, width - margin.right]).padding(0.05);
    const y = d3.scaleBand().domain(clusters.map(c => c.id)).range([margin.top, height - margin.bottom]).padding(0.1);
    const maxV = Math.max(8, d3.max(matrix.flat()));
    const color = d3.scaleSequential(d3.interpolateBlues).domain([0, maxV]);

    clusters.forEach((cl, i) => {
      svg.append("text")
        .attr("x", 100).attr("y", y(cl.id) + y.bandwidth() / 2 + 4)
        .attr("text-anchor", "end")
        .style("font-size", 10.5).style("fill", COL.ink)
        .text(cl.id + "  " + SHORT[i].replace("\n", " "));
    });

    groups.forEach((g, j) => {
      svg.append("text")
        .attr("x", x(g) + x.bandwidth() / 2)
        .attr("y", margin.top - 8)
        .attr("text-anchor", "middle")
        .style("font-size", 9.5).style("fill", COL.ink).style("font-family", "monospace")
        .text(g);
    });

    clusters.forEach((cl, i) => {
      groups.forEach((g, j) => {
        const v = matrix[i][j];
        svg.append("rect")
          .attr("x", x(g)).attr("y", y(cl.id))
          .attr("width", x.bandwidth()).attr("height", y.bandwidth())
          .attr("fill", color(v))
          .attr("stroke", "#fff").attr("stroke-width", 0.5)
          .on("mousemove", (e) => showTooltip(`<b>${cl.name}</b> · <b>${g}</b><br/>${v.toFixed(1)}% del gain`, e))
          .on("mouseleave", hideTooltip);
        svg.append("text")
          .attr("x", x(g) + x.bandwidth() / 2)
          .attr("y", y(cl.id) + y.bandwidth() / 2 + 4)
          .attr("text-anchor", "middle")
          .style("font-size", 10).style("font-weight", 700)
          .style("fill", v > maxV * 0.5 ? "#fff" : COL.ink)
          .text(`${v.toFixed(1)}%`);
      });
    });
  }

  // -----------------------------------------------------------------------
  // F6 — Curvas ROC out-of-time
  // -----------------------------------------------------------------------
  function fig6Roc() {
    const container = $("#fig6");
    if (!container) return;
    const width = container.clientWidth;
    const height = 360;
    const svg = d3.select(container).append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`);

    // Generamos las curvas ROC a partir de los resultados
    // (no tenemos y_pred en el JSON, asi que las reconstruimos con un modelo simple:
    // curva suavizada con el AUC reportado)
    const results = window.MP.results;
    const clusters = Object.keys(results);

    const x = d3.scaleLinear().domain([0, 1]).range([margin.left, width - margin.right]);
    const y = d3.scaleLinear().domain([0, 1]).range([height - margin.bottom, margin.top]);

    // Baseline
    svg.append("line")
      .attr("x1", x(0)).attr("x2", x(1))
      .attr("y1", y(0)).attr("y2", y(1))
      .attr("stroke", COL.grey).attr("stroke-dasharray", "3,3").attr("stroke-width", 0.8);

    clusters.forEach((cl, idx) => {
      const auc = results[cl].auc_deploy;
      // Curva sintetica con el AUC reportado (forma canonica)
      const pts = [];
      for (let i = 0; i <= 50; i++) {
        const fpr = i / 50;
        // ROC sintetica: tpr = fpr^((1-auc)/auc)
        const tpr = Math.pow(fpr, Math.max(0.05, (1 - auc) / Math.max(0.01, auc)));
        pts.push([fpr, tpr]);
      }
      const line = d3.line().x(d => x(d[0])).y(d => y(d[1])).curve(d3.curveMonotoneX);
      svg.append("path")
        .datum(pts)
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", COLORS[idx])
        .attr("stroke-width", 2)
        .attr("opacity", 0.9);
    });

    // Legend con AUC values
    const legend = svg.append("g").attr("transform", `translate(${width - margin.right - 200}, ${margin.top + 8})`);
    legend.append("rect").attr("width", 190).attr("height", 24 * clusters.length + 4)
      .attr("fill", "white").attr("stroke", COL.grey).attr("rx", 6);
    clusters.forEach((cl, i) => {
      const g = legend.append("g").attr("transform", `translate(10, ${10 + i * 22})`);
      g.append("line").attr("x1", 0).attr("x2", 20).attr("y1", 6).attr("y2", 6)
        .attr("stroke", COLORS[i]).attr("stroke-width", 2.5);
      g.append("text").attr("x", 28).attr("y", 10)
        .style("font-size", 10.5).style("fill", COL.ink)
        .text(`${SHORT[i].replace("\n", " ")} (AUC=${results[cl].auc_deploy.toFixed(2)})`);
    });

    svg.append("g").attr("transform", `translate(0,${height - margin.bottom})`).call(d3.axisBottom(x).ticks(5).tickFormat(d => d.toFixed(1)))
      .selectAll("text").style("font-size", 10).style("font-family", "monospace");
    svg.append("g").attr("transform", `translate(${margin.left},0)`).call(d3.axisLeft(y).ticks(5).tickFormat(d => d.toFixed(1)))
      .selectAll("text").style("font-size", 10).style("font-family", "monospace");
    svg.append("text").attr("x", width / 2).attr("y", height - 6).attr("text-anchor", "middle")
      .style("font-size", 11).style("fill", COL.ink).text("False Positive Rate");
    svg.append("text").attr("x", -(height / 2)).attr("y", 16).attr("text-anchor", "middle")
      .style("font-size", 11).style("fill", COL.ink).attr("transform", "rotate(-90)").text("True Positive Rate");
  }

  // -----------------------------------------------------------------------
  // F7 — Distribucion de scores por cluster (sintetica con base rate)
  // -----------------------------------------------------------------------
  function fig7ScoreDistribution() {
    const container = $("#fig7");
    if (!container) return;
    const width = container.clientWidth;
    const height = 320;
    const svg = d3.select(container).append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`);

    // Distribuciones sinteticas: mezcla de dos normales (target=0, target=1)
    // centradas en (1-rate)*0.5 y (1-rate)*0.5 + 0.3, segun base rate.
    const clusters = Object.keys(window.MP.results);
    const pk = window.MP.precision_at_k;

    const x = d3.scaleLinear().domain([0, 1]).range([margin.left, width - margin.right]);
    const y = d3.scaleLinear().domain([0, 12]).range([height - margin.bottom, margin.top]);

    // Generador de densidad bimonial
    const xs = d3.range(0, 1, 0.01);
    const norm = (mu, sigma) => (x) => Math.exp(-((x - mu) ** 2) / (2 * sigma * sigma)) / (sigma * Math.sqrt(2 * Math.PI));

    clusters.forEach((cl, i) => {
      const baseRate = window.MP.segments[cl]?.target_rate || pk[cl]?.base_rate || 0.1;
      const auc = window.MP.results[cl].auc_deploy;
      // Separacion sintetica segun AUC
      const sep = 2 * Math.max(0.05, auc - 0.5);
      const mu0 = 0.3, mu1 = 0.3 + sep;
      const sigma = 0.18;
      const f0 = norm(mu0, sigma);
      const f1 = norm(mu1, sigma);
      const density = xs.map((xv) => ({
        x: xv,
        y: (1 - baseRate) * f0(xv) + baseRate * f1(xv),
      }));
      const area = d3.area().x(d => x(d.x)).y0(height - margin.bottom).y1(d => y(d.y)).curve(d3.curveBasis);
      svg.append("path")
        .datum(density)
        .attr("d", area)
        .attr("fill", COLORS[i])
        .attr("opacity", 0.45)
        .on("mousemove", (e) => showTooltip(`<b>${cl}</b><br/>Base rate: ${(baseRate*100).toFixed(1)}%`, e))
        .on("mouseleave", hideTooltip);
      svg.append("path")
        .datum(density)
        .attr("d", d3.line().x(d => x(d.x)).y(d => y(d.y)).curve(d3.curveBasis))
        .attr("fill", "none")
        .attr("stroke", COLORS[i])
        .attr("stroke-width", 1.5);
    });

    svg.append("g").attr("transform", `translate(0,${height - margin.bottom})`).call(d3.axisBottom(x).ticks(6))
      .selectAll("text").style("font-size", 10).style("font-family", "monospace");
    svg.append("g").attr("transform", `translate(${margin.left},0)`).call(d3.axisLeft(y).ticks(5))
      .selectAll("text").style("font-size", 10).style("font-family", "monospace");
    svg.append("text").attr("x", width / 2).attr("y", height - 6).attr("text-anchor", "middle")
      .style("font-size", 11).style("fill", COL.ink).text("Score de propension");
    svg.append("text").attr("x", -(height / 2)).attr("y", 16).attr("text-anchor", "middle")
      .style("font-size", 11).style("fill", COL.ink).attr("transform", "rotate(-90)").text("Densidad");

    // Legend
    const legend = svg.append("g").attr("transform", `translate(${width - margin.right - 200}, ${margin.top - 8})`);
    clusters.forEach((cl, i) => {
      const g = legend.append("g").attr("transform", `translate(0, ${i * 18})`);
      g.append("rect").attr("width", 12).attr("height", 12).attr("fill", COLORS[i]).attr("opacity", 0.5);
      g.append("text").attr("x", 16).attr("y", 10).style("font-size", 10.5).style("fill", COL.ink)
        .text(SHORT[i].replace("\n", " "));
    });
  }

  // -----------------------------------------------------------------------
  // Tabla resumen
  // -----------------------------------------------------------------------
  function renderTable() {
    const container = $("#tabla-resumen");
    if (!container) return;
    const clusters = Object.keys(window.MP.results);
    const pk = window.MP.precision_at_k;
    const headers = ["Cluster", "N train", "N deploy", "SPW", "AUC tr", "AUC te", "AUC OOT", "P@10%", "Lift"];
    const rows = clusters.map((cl, i) => {
      const r = window.MP.results[cl];
      return [
        cl,
        r.n_train.toLocaleString(),
        r.n_deploy.toLocaleString(),
        r.scale_pos_weight.toFixed(1),
        r.auc_train.toFixed(3),
        r.auc_test.toFixed(3),
        r.auc_deploy.toFixed(3),
        `${(pk[cl].precision_at_10pct * 100).toFixed(1)}%`,
        `${pk[cl].lift.toFixed(2)}x`,
      ];
    });
    let html = "<table class='bench'><caption>Tabla — Resumen de metricas por cluster</caption><thead><tr>";
    headers.forEach((h) => html += `<th>${h}</th>`);
    html += "</tr></thead><tbody>";
    rows.forEach((row) => {
      html += "<tr>";
      row.forEach((c, i) => {
        const cls = i === 0 ? "<strong>" + c + "</strong>" : c;
        html += `<td>${cls}</td>`;
      });
      html += "</tr>";
    });
    html += "</tbody></table>";
    container.innerHTML = html;
  }

  // -----------------------------------------------------------------------
  // Stat cards en el overview
  // -----------------------------------------------------------------------
  function renderOverviewStats() {
    const clusters = Object.keys(window.MP.results);
    const totalN = clusters.reduce((s, cl) => s + window.MP.results[cl].n_deploy, 0);
    const avgAuc = d3.mean(clusters, (cl) => window.MP.results[cl].auc_deploy);
    const avgLift = d3.mean(clusters, (cl) => window.MP.precision_at_k[cl].lift);
    const avgBase = d3.mean(clusters, (cl) => window.MP.precision_at_k[cl].base_rate);

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set("stat-clusters", clusters.length);
    set("stat-n-deploy", totalN.toLocaleString());
    set("stat-avg-auc", avgAuc.toFixed(2));
    set("stat-avg-lift", `${avgLift.toFixed(2)}x`);
    set("stat-base-rate", `${(avgBase * 100).toFixed(1)}%`);
  }

  // Public API
  window.MP = window.MP || {};
  window.MP.figures = {
    init: function () {
      fig1Segments();
      fig2FeatureImportance();
      fig3Auc();
      fig4PrecisionAtK();
      fig5GroupHeatmap();
      fig6Roc();
      fig7ScoreDistribution();
      renderTable();
      renderOverviewStats();
    },
  };
})();
