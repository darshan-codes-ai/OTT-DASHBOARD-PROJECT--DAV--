/**
 * DAV LAB WEBSITE - CHARTS ENGINE (charts.js)
 * High-fidelity Plotly.js Academic Editorial Visualizations
 */

const DAVCharts = (function () {
  // Shared Editorial Layout Configuration
  const BASE_LAYOUT = {
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    font: {
      family: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#1e2329',
      size: 12
    },
    margin: { t: 36, r: 24, b: 48, l: 60 },
    xaxis: {
      gridcolor: '#f0ede6',
      linecolor: '#e6e3dc',
      zerolinecolor: '#e6e3dc',
      tickfont: { color: '#57606a', size: 11 }
    },
    yaxis: {
      gridcolor: '#f0ede6',
      linecolor: '#e6e3dc',
      zerolinecolor: '#e6e3dc',
      tickfont: { color: '#57606a', size: 11 }
    },
    hoverlabel: {
      bgcolor: '#1e2329',
      bordercolor: '#1e2329',
      font: { color: '#ffffff', size: 12 }
    }
  };

  const CONFIG = {
    responsive: true,
    displayModeBar: false
  };

  /**
   * Helper to attach ResizeObserver to a chart container
   */
  function observeResize(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    if (window.ResizeObserver) {
      const ro = new ResizeObserver(() => {
        if (el && el.offsetParent !== null && el.data) {
          try {
            Plotly.Plots.resize(el);
          } catch (e) {
            // ignore benign resize errors when container is hidden
          }
        }
      });
      ro.observe(el);
    }
  }

  /**
   * 1. Platform Availability Bar Chart
   */
  function renderPlatformBar(containerId, counts) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const platforms = ['Netflix', 'Hulu', 'Prime Video', 'Disney+'];
    const values = [
      counts['Netflix'] || 3695,
      counts['Hulu'] || 1047,
      counts['Prime Video'] || 4113,
      counts['Disney+'] || 922
    ];

    const data = [{
      x: platforms,
      y: values,
      type: 'bar',
      marker: {
        color: ['#e50914', '#0f9d58', '#0088cc', '#113ccf'],
        line: { width: 1, color: '#e6e3dc' }
      },
      text: values.map(v => v.toLocaleString()),
      textposition: 'outside',
      cliponaxis: false,
      hovertemplate: '<b>%{x}</b><br>Available Titles: %{y:,}<extra></extra>'
    }];

    const layout = {
      ...BASE_LAYOUT,
      yaxis: {
        ...BASE_LAYOUT.yaxis,
        title: { text: 'Number of Movies', font: { size: 12, color: '#57606a' } },
        range: [0, 4800]
      }
    };

    Plotly.newPlot(el, data, layout, CONFIG);
    observeResize(containerId);
  }

  /**
   * 1b. Horizontal Platform Availability Bar Chart
   */
  function renderPlatformHorizontalBar(containerId, counts) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const platforms = ['Disney+', 'Hulu', 'Netflix', 'Prime Video'];
    const values = [
      counts['Disney+'] || 922,
      counts['Hulu'] || 1047,
      counts['Netflix'] || 3695,
      counts['Prime Video'] || 4113
    ];
    const colors = ['#113ccf', '#0f9d58', '#e50914', '#0088cc'];

    const data = [{
      y: platforms,
      x: values,
      type: 'bar',
      orientation: 'h',
      marker: {
        color: colors,
        line: { width: 1, color: '#e6e3dc' }
      },
      text: values.map(v => v.toLocaleString()),
      textposition: 'outside',
      cliponaxis: false,
      hovertemplate: '<b>%{y}</b><br>Available Titles: %{x:,}<extra></extra>'
    }];

    const layout = {
      ...BASE_LAYOUT,
      margin: { t: 20, r: 45, b: 35, l: 85 },
      xaxis: {
        ...BASE_LAYOUT.xaxis,
        title: { text: 'Available Titles', font: { size: 11, color: '#57606a' } },
        range: [0, 4800]
      },
      yaxis: {
        ...BASE_LAYOUT.yaxis,
        autorange: true
      }
    };

    Plotly.newPlot(el, data, layout, CONFIG);
    observeResize(containerId);
  }

  /**
   * 2. Chronological Release Year Trend
   */
  function renderYearTrend(containerId, yearDist) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const years = Object.keys(yearDist).map(Number).sort((a, b) => a - b);
    const counts = years.map(y => yearDist[y]);

    const data = [{
      x: years,
      y: counts,
      type: 'scatter',
      mode: 'lines',
      fill: 'tozeroy',
      line: { color: '#3b28cc', width: 2 },
      fillcolor: 'rgba(59, 40, 204, 0.08)',
      hovertemplate: '<b>Year %{x}</b><br>Released Movies: %{y:,}<extra></extra>'
    }];

    const layout = {
      ...BASE_LAYOUT,
      margin: { t: 25, r: 25, b: 40, l: 45 },
      xaxis: {
        ...BASE_LAYOUT.xaxis,
        title: { text: 'Release Year', font: { size: 11, color: '#57606a' } }
      },
      yaxis: {
        ...BASE_LAYOUT.yaxis,
        title: { text: 'Number of Titles', font: { size: 11, color: '#57606a' } }
      },
      annotations: [{
        x: 2019,
        y: 1014,
        xref: 'x',
        yref: 'y',
        text: 'Peak: 2019 (1,014)',
        showarrow: true,
        arrowhead: 2,
        ax: -40,
        ay: -25,
        font: { size: 10, color: '#3b28cc' },
        bgcolor: '#ffffff',
        bordercolor: '#3b28cc',
        borderwidth: 1,
        borderpad: 3
      }]
    };

    Plotly.newPlot(el, data, layout, CONFIG);
    observeResize(containerId);
  }

  /**
   * 3. Age Rating Distribution Bar Chart
   */
  function renderAgeDistribution(containerId, ageDist) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const categories = ['18+', '7+', '13+', 'all', '16+'];
    const values = categories.map(c => ageDist[c] || 0);

    const data = [{
      x: categories,
      y: values,
      type: 'bar',
      marker: {
        color: '#3b28cc',
        opacity: 0.85
      },
      text: values.map(v => v.toLocaleString()),
      textposition: 'outside',
      cliponaxis: false,
      hovertemplate: '<b>Age Tier: %{x}</b><br>Titles: %{y:,}<extra></extra>'
    }];

    const layout = {
      ...BASE_LAYOUT,
      yaxis: {
        ...BASE_LAYOUT.yaxis,
        title: { text: 'Movie Count', font: { size: 12, color: '#57606a' } },
        range: [0, 2600]
      }
    };

    Plotly.newPlot(el, data, layout, CONFIG);
    observeResize(containerId);
  }

  /**
   * 4. High-Rated Movies vs Total Catalog Comparison
   */
  function renderHighRatedComparison(containerId, totalCounts, highCounts) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const platforms = ['Netflix', 'Hulu', 'Prime Video', 'Disney+'];
    const highVals = [
      highCounts['Netflix'] || 168,
      highCounts['Hulu'] || 49,
      highCounts['Prime Video'] || 53,
      highCounts['Disney+'] || 75
    ];

    const data = [{
      x: platforms,
      y: highVals,
      type: 'bar',
      marker: {
        color: ['#e50914', '#0f9d58', '#0088cc', '#113ccf'],
        line: { width: 1, color: '#e6e3dc' }
      },
      text: highVals.map(v => v.toString()),
      textposition: 'outside',
      cliponaxis: false,
      hovertemplate: '<b>%{x}</b><br>High-Rated Titles (RT ≥ 8.0/10): %{y}<extra></extra>'
    }];

    const layout = {
      ...BASE_LAYOUT,
      yaxis: {
        ...BASE_LAYOUT.yaxis,
        title: { text: 'Titles Rated 8.0+ / 10', font: { size: 12, color: '#57606a' } },
        range: [0, 200]
      }
    };

    Plotly.newPlot(el, data, layout, CONFIG);
    observeResize(containerId);
  }

  /**
   * 4b. Horizontal Highly Rated by Platform Bar Chart
   */
  function renderHighRatedHorizontalBar(containerId, highCounts) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const platforms = ['Hulu', 'Prime Video', 'Disney+', 'Netflix'];
    const values = [
      highCounts['Hulu'] || 49,
      highCounts['Prime Video'] || 53,
      highCounts['Disney+'] || 75,
      highCounts['Netflix'] || 168
    ];
    const colors = ['#0f9d58', '#0088cc', '#113ccf', '#e50914'];

    const data = [{
      y: platforms,
      x: values,
      type: 'bar',
      orientation: 'h',
      marker: {
        color: colors,
        line: { width: 1, color: '#e6e3dc' }
      },
      text: values.map(v => v.toString()),
      textposition: 'outside',
      cliponaxis: false,
      hovertemplate: '<b>%{y}</b><br>High-Rated Titles (RT ≥ 8.0): %{x}<extra></extra>'
    }];

    const layout = {
      ...BASE_LAYOUT,
      margin: { t: 20, r: 40, b: 35, l: 85 },
      xaxis: {
        ...BASE_LAYOUT.xaxis,
        title: { text: 'Titles Rated 8.0+ / 10', font: { size: 11, color: '#57606a' } },
        range: [0, 200]
      },
      yaxis: {
        ...BASE_LAYOUT.yaxis,
        autorange: true
      }
    };

    Plotly.newPlot(el, data, layout, CONFIG);
    observeResize(containerId);
  }

  /**
   * 3b. Age Rating Donut Chart
   */
  function renderAgeDonut(containerId, ageDist) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const labels = ['18+', '7+', '13+', 'All', '16+', 'Unrated'];
    const values = [
      ageDist['18+'] || 2276,
      ageDist['7+'] || 1090,
      ageDist['13+'] || 998,
      ageDist['all'] || 698,
      ageDist['16+'] || 276,
      ageDist['nan'] || 4177
    ];
    const colors = ['#e50914', '#0088cc', '#0f9d58', '#113ccf', '#d97706', '#94a3b8'];

    const data = [{
      labels: labels,
      values: values,
      type: 'pie',
      hole: 0.55,
      marker: { colors: colors },
      textinfo: 'percent',
      hovertemplate: '<b>%{label}</b><br>Titles: %{value:,} (%{percent})<extra></extra>'
    }];

    const layout = {
      ...BASE_LAYOUT,
      margin: { t: 10, r: 10, b: 40, l: 10 },
      showlegend: true,
      legend: {
        orientation: 'h',
        y: -0.15,
        x: 0,
        font: { size: 10, color: '#57606a' }
      }
    };

    Plotly.newPlot(el, data, layout, CONFIG);
    observeResize(containerId);
  }

  /**
   * 5. Lab 2 Rating Distribution Bins (0-2, 2-4, 4-6, 6-8, 8-10)
   */
  function renderRatingBins(containerId, bins) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const categories = ['0–2', '2–4', '4–6', '6–8', '8–10'];
    const values = [
      bins['0-2'] || 119,
      bins['2-4'] || 1036,
      bins['4-6'] || 5429,
      bins['6-8'] || 2589,
      bins['8-10'] || 335
    ];

    const data = [{
      x: categories,
      y: values,
      type: 'bar',
      marker: {
        color: ['#cbd5e1', '#94a3b8', '#3b28cc', '#6366f1', '#a855f7']
      },
      text: values.map(v => v.toLocaleString()),
      textposition: 'outside',
      cliponaxis: false,
      hovertemplate: '<b>Score Range: %{x}</b><br>Movie Count: %{y:,}<extra></extra>'
    }];

    const layout = {
      ...BASE_LAYOUT,
      xaxis: {
        ...BASE_LAYOUT.xaxis,
        title: { text: 'Rotten Tomatoes Score Bin (0–10 Scale)', font: { size: 12, color: '#57606a' } }
      },
      yaxis: {
        ...BASE_LAYOUT.yaxis,
        title: { text: 'Number of Movies', font: { size: 12, color: '#57606a' } },
        range: [0, 6200]
      }
    };

    Plotly.newPlot(el, data, layout, CONFIG);
    observeResize(containerId);
  }

  /**
   * 6. Lab 2 Platform Exclusivity / Overlap Donut Chart
   */
  function renderOverlapDonut(containerId, overlapData) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const labels = [
      'Single Platform Exclusives (1)',
      '2 Platforms Overlap',
      '3 Platforms Overlap',
      'All 4 Platforms Overlap'
    ];
    const values = [
      overlapData[1] || 9262,
      overlapData[2] || 245,
      overlapData[3] || 7,
      overlapData[4] || 1
    ];

    const data = [{
      labels: labels,
      values: values,
      type: 'pie',
      hole: 0.55,
      marker: {
        colors: ['#3b28cc', '#6366f1', '#d97706', '#e50914']
      },
      textinfo: 'percent',
      hovertemplate: '<b>%{label}</b><br>Titles: %{value:,} (%{percent})<extra></extra>'
    }];

    const layout = {
      ...BASE_LAYOUT,
      showlegend: true,
      legend: {
        orientation: 'h',
        y: -0.15,
        x: 0,
        font: { size: 11, color: '#57606a' }
      }
    };

    Plotly.newPlot(el, data, layout, CONFIG);
    observeResize(containerId);
  }

  /**
   * 7. Lab 3 Boxplot by Age Rating (0-100 Score Scale)
   */
  function renderBoxplotAge(containerId, records) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const ageTiers = ['all', '7+', '13+', '16+', '18+'];
    const colors = ['#3b28cc', '#0088cc', '#0f9d58', '#d97706', '#e50914'];

    const data = ageTiers.map((tier, idx) => {
      const scores = records
        .filter(r => r.age === tier && r.rt100 !== null)
        .map(r => r.rt100);

      return {
        y: scores,
        name: tier,
        type: 'box',
        boxpoints: 'outliers',
        jitter: 0.3,
        marker: { color: colors[idx], size: 4 },
        line: { width: 1.5 }
      };
    });

    const layout = {
      ...BASE_LAYOUT,
      showlegend: false,
      xaxis: {
        ...BASE_LAYOUT.xaxis,
        title: { text: 'Age Rating Classification', font: { size: 12, color: '#57606a' } }
      },
      yaxis: {
        ...BASE_LAYOUT.yaxis,
        title: { text: 'Rotten Tomatoes Score (0–100 Scale)', font: { size: 12, color: '#57606a' } },
        range: [0, 105]
      }
    };

    Plotly.newPlot(el, data, layout, CONFIG);
    observeResize(containerId);
  }

  /**
   * 8. Lab 3 Histogram + KDE Curve (0-100 Score Scale)
   */
  function renderHistKDE(containerId, records) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const scores = records.filter(r => r.rt100 !== null).map(r => r.rt100);

    const histTrace = {
      x: scores,
      type: 'histogram',
      nbinsx: 30,
      marker: {
        color: '#3b28cc',
        opacity: 0.7,
        line: { color: '#ffffff', width: 1 }
      },
      name: 'Score Count',
      hovertemplate: '<b>Score Range: %{x}</b><br>Count: %{y:,}<extra></extra>'
    };

    const layout = {
      ...BASE_LAYOUT,
      showlegend: false,
      xaxis: {
        ...BASE_LAYOUT.xaxis,
        title: { text: 'Rotten Tomatoes Score (0–100 Scale)', font: { size: 12, color: '#57606a' } },
        range: [0, 105]
      },
      yaxis: {
        ...BASE_LAYOUT.yaxis,
        title: { text: 'Frequency (Number of Movies)', font: { size: 12, color: '#57606a' } }
      }
    };

    Plotly.newPlot(el, [histTrace], layout, CONFIG);
    observeResize(containerId);
  }

  /**
   * 9. Lab 3 Correlation Matrix Heatmap (6x6)
   */
  function renderCorrelationHeatmap(containerId, matrix) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const cols = ['Year', 'Rotten Tomatoes Score', 'Netflix', 'Hulu', 'Prime Video', 'Disney+'];
    const zVals = cols.map(rowCol => {
      return cols.map(colCol => matrix[colCol] ? matrix[colCol][rowCol] : 0);
    });

    const data = [{
      z: zVals,
      x: cols,
      y: cols,
      type: 'heatmap',
      colorscale: [
        [0.0, '#3b28cc'],
        [0.5, '#fcfbf9'],
        [1.0, '#e50914']
      ],
      zmin: -0.7,
      zmax: 1.0,
      text: zVals.map(row => row.map(v => v.toFixed(3))),
      texttemplate: '%{text}',
      textfont: { family: '"JetBrains Mono", monospace', size: 11, color: '#1e2329' },
      hoverongaps: false,
      hovertemplate: '<b>%{y} ↔ %{x}</b><br>Correlation: %{z:.4f}<extra></extra>'
    }];

    const layout = {
      ...BASE_LAYOUT,
      margin: { t: 20, r: 24, b: 80, l: 140 },
      xaxis: {
        ...BASE_LAYOUT.xaxis,
        tickangle: -30
      }
    };

    Plotly.newPlot(el, data, layout, CONFIG);
    observeResize(containerId);
  }

  /**
   * 10. Lab 3 Violin Plot by Age Rating (0-100 Score Scale)
   */
  function renderViolinAge(containerId, records) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const ageTiers = ['all', '7+', '13+', '16+', '18+'];
    const colors = ['#3b28cc', '#0088cc', '#0f9d58', '#d97706', '#e50914'];

    const data = ageTiers.map((tier, idx) => {
      const scores = records
        .filter(r => r.age === tier && r.rt100 !== null)
        .map(r => r.rt100);

      return {
        type: 'violin',
        y: scores,
        name: tier,
        points: 'none',
        box: { visible: true, width: 0.25 },
        line: { color: colors[idx], width: 1.5 },
        fillcolor: colors[idx],
        opacity: 0.6,
        meanline: { visible: true }
      };
    });

    const layout = {
      ...BASE_LAYOUT,
      showlegend: false,
      xaxis: {
        ...BASE_LAYOUT.xaxis,
        title: { text: 'Age Rating Tier', font: { size: 12, color: '#57606a' } }
      },
      yaxis: {
        ...BASE_LAYOUT.yaxis,
        title: { text: 'Rotten Tomatoes Score (0–100 Scale)', font: { size: 12, color: '#57606a' } },
        range: [0, 105]
      }
    };

    Plotly.newPlot(el, data, layout, CONFIG);
    observeResize(containerId);
  }

  return {
    renderPlatformBar,
    renderPlatformHorizontalBar,
    renderYearTrend,
    renderAgeDistribution,
    renderAgeDonut,
    renderHighRatedComparison,
    renderHighRatedHorizontalBar,
    renderRatingBins,
    renderOverlapDonut,
    renderBoxplotAge,
    renderHistKDE,
    renderCorrelationHeatmap,
    renderViolinAge
  };
})();
