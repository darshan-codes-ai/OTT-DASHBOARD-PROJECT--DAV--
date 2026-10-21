/**
 * DAV LAB WEBSITE - LAB 4: INTERACTIVE PLOTLY VISUALIZATIONS (lab4.js)
 * Implements 7 dynamic Plotly charts from DAV_Lab_Assignment_4_Movie_Streaming_Plotly.ipynb
 * Calculated from real CSV data (9,515 records)
 */

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const movies = await DAVData.loadMovies();
    if (!movies || movies.length === 0) {
      console.error('Lab 4: No movie data available.');
      return;
    }

    renderAllLab4Charts(movies);
  } catch (err) {
    console.error('Lab 4 Initialization Error:', err);
  }
});

function renderAllLab4Charts(movies) {
  const AGE_ORDER = ['all', '7+', '13+', '16+', '18+', 'Missing/Unrated'];
  const AGE_COLORS = {
    'all': '#16a085',
    '7+': '#e9c46a',
    '13+': '#f4a261',
    '16+': '#e76f51',
    '18+': '#6c5ce7',
    'Missing/Unrated': '#9ca3af'
  };

  const baseFont = { family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#1e293b' };
  const baseConfig = { responsive: true, displayModeBar: true, displaylogo: false, modeBarButtonsToRemove: ['lasso2d', 'select2d'] };

  function observeResize(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    if (window.ResizeObserver) {
      const ro = new ResizeObserver(() => {
        if (el && el.offsetParent !== null && el.data) {
          try {
            Plotly.Plots.resize(el);
          } catch (e) {}
        }
      });
      ro.observe(el);
    }
  }

  function getAvailablePlatformsText(m) {
    const p = [];
    if (m.netflix === 1) p.push('Netflix');
    if (m.hulu === 1) p.push('Hulu');
    if (m.prime === 1) p.push('Prime Video');
    if (m.disney === 1) p.push('Disney+');
    return p.length > 0 ? p.join(', ') : 'None marked';
  }

  // --------------------------------------------------------------------------
  // CHART 1: Interactive Rotten Tomatoes Histogram with Range Slider
  // --------------------------------------------------------------------------
  const scoredMovies = movies.filter(m => m.rt10 !== null && !isNaN(m.rt10));
  const rtScores = scoredMovies.map(m => m.rt10);

  const histTrace = {
    type: 'histogram',
    x: rtScores,
    autobinx: false,
    xbins: {
      start: 0,
      end: 10,
      size: 0.5
    },
    marker: {
      color: '#3b28cc',
      line: { color: '#ffffff', width: 0.6 },
      opacity: 0.85
    },
    hovertemplate: 'Rating: %{x:.1f} – %{x+0.5:.1f}<br>Number of Movies: %{y:,}<extra></extra>'
  };

  const histLayout = {
    font: baseFont,
    margin: { l: 55, r: 25, t: 30, b: 40 },
    height: 440,
    bargap: 0.05,
    hovermode: 'closest',
    xaxis: {
      title: { text: 'Rotten Tomatoes Score (0–10)', font: { size: 12, weight: 600 } },
      range: [0, 10],
      dtick: 1,
      gridcolor: '#f1f5f9',
      rangeslider: {
        visible: true,
        thickness: 0.12,
        bgcolor: '#f8fafc',
        bordercolor: '#cbd5e1',
        borderwidth: 1
      }
    },
    yaxis: {
      title: { text: 'Number of Movies', font: { size: 12, weight: 600 } },
      rangemode: 'tozero',
      gridcolor: '#f1f5f9'
    },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent'
  };

  if (document.getElementById('lab4-chart-histogram')) {
    Plotly.newPlot('lab4-chart-histogram', [histTrace], histLayout, baseConfig);
    observeResize('lab4-chart-histogram');
  }

  // --------------------------------------------------------------------------
  // CHART 2: Movie Release Year vs. Rotten Tomatoes Score (Multivariate Scatter)
  // --------------------------------------------------------------------------
  const scatterMovies = movies.filter(m => m.year !== null && m.rt10 !== null && !isNaN(m.year) && !isNaN(m.rt10));
  
  const scatterTraces = AGE_ORDER.map(age => {
    const subset = scatterMovies.filter(m => (m.age ? m.age.trim() : 'Missing/Unrated') === age);
    return {
      type: 'scatter',
      mode: 'markers',
      name: age,
      x: subset.map(m => m.year),
      y: subset.map(m => m.rt10),
      marker: {
        color: AGE_COLORS[age],
        size: 5,
        opacity: 0.65
      },
      customdata: subset.map(m => [
        m.title,
        m.rtRaw || (m.rt10 * 10 + '/100'),
        m.age || 'Missing/Unrated',
        getAvailablePlatformsText(m),
        m.netflix,
        m.hulu,
        m.prime,
        m.disney
      ]),
      hovertemplate: 
        '<b>%{customdata[0]}</b><br>' +
        'Release Year: %{x}<br>' +
        'RT Score: %{y:.1f}/10 (%{customdata[1]})<br>' +
        'Age Rating: %{customdata[2]}<br>' +
        'Platforms: %{customdata[3]}<extra>' + age + '</extra>'
    };
  });

  const scatterLayout = {
    font: baseFont,
    margin: { l: 55, r: 25, t: 55, b: 50 },
    height: 440,
    hovermode: 'closest',
    legend: {
      orientation: 'h',
      x: 0,
      y: 1.15,
      font: { size: 11 },
      title: { text: 'Age: ', font: { size: 11, weight: 600 } }
    },
    xaxis: {
      title: { text: 'Movie Release Year', font: { size: 12, weight: 600 } },
      dtick: 10,
      gridcolor: '#f1f5f9'
    },
    yaxis: {
      title: { text: 'Rotten Tomatoes Score (0–10)', font: { size: 12, weight: 600 } },
      range: [0, 10.2],
      dtick: 1,
      gridcolor: '#f1f5f9'
    },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent'
  };

  if (document.getElementById('lab4-chart-scatter')) {
    Plotly.newPlot('lab4-chart-scatter', scatterTraces, scatterLayout, baseConfig);
    observeResize('lab4-chart-scatter');
  }

  // --------------------------------------------------------------------------
  // CHART 3: Box Plot by Age Classification
  // --------------------------------------------------------------------------
  const boxTraces = AGE_ORDER.map(age => {
    const subset = scoredMovies.filter(m => (m.age ? m.age.trim() : 'Missing/Unrated') === age);
    return {
      type: 'box',
      name: age,
      y: subset.map(m => m.rt10),
      boxpoints: 'outliers',
      marker: { color: AGE_COLORS[age], size: 4 },
      line: { color: AGE_COLORS[age], width: 1.5 },
      text: subset.map(m => m.title),
      hovertemplate: '<b>%{text}</b><br>Score: %{y:.1f}/10<extra>' + age + '</extra>'
    };
  });

  const boxLayout = {
    font: baseFont,
    margin: { l: 55, r: 25, t: 25, b: 45 },
    height: 420,
    showlegend: false,
    xaxis: {
      title: { text: 'Age Classification', font: { size: 12, weight: 600 } },
      gridcolor: '#f1f5f9'
    },
    yaxis: {
      title: { text: 'Rotten Tomatoes Score (0–10)', font: { size: 12, weight: 600 } },
      range: [0, 10.2],
      dtick: 1,
      gridcolor: '#f1f5f9'
    },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent'
  };

  if (document.getElementById('lab4-chart-boxplot')) {
    Plotly.newPlot('lab4-chart-boxplot', boxTraces, boxLayout, baseConfig);
    observeResize('lab4-chart-boxplot');
  }

  // --------------------------------------------------------------------------
  // CHART 4: Violin Plot by Age Classification
  // --------------------------------------------------------------------------
  const violinTraces = AGE_ORDER.map(age => {
    const subset = scoredMovies.filter(m => (m.age ? m.age.trim() : 'Missing/Unrated') === age);
    return {
      type: 'violin',
      name: age,
      y: subset.map(m => m.rt10),
      box: { visible: true, width: 0.22 },
      points: false,
      meanline: { visible: true },
      line: { color: AGE_COLORS[age], width: 1.4 },
      fillcolor: AGE_COLORS[age],
      opacity: 0.55,
      hovertemplate: 'Age Tier: ' + age + '<br>Score: %{y:.1f}/10<extra></extra>'
    };
  });

  const violinLayout = {
    font: baseFont,
    margin: { l: 55, r: 25, t: 25, b: 45 },
    height: 420,
    showlegend: false,
    xaxis: {
      title: { text: 'Age Classification', font: { size: 12, weight: 600 } },
      gridcolor: '#f1f5f9'
    },
    yaxis: {
      title: { text: 'Rotten Tomatoes Score (0–10)', font: { size: 12, weight: 600 } },
      range: [0, 10.2],
      dtick: 1,
      gridcolor: '#f1f5f9'
    },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent'
  };

  if (document.getElementById('lab4-chart-violin')) {
    Plotly.newPlot('lab4-chart-violin', violinTraces, violinLayout, baseConfig);
    observeResize('lab4-chart-violin');
  }

  // --------------------------------------------------------------------------
  // CHART 5: 6×6 Correlation Heatmap (Year, RT Score, Netflix, Hulu, Prime Video, Disney+)
  // --------------------------------------------------------------------------
  const corrCols = ['Year', 'RT Score', 'Netflix', 'Hulu', 'Prime Video', 'Disney+'];
  
  // Extract parallel series for movies with valid year & RT Score
  const matrixData = scatterMovies.map(m => [
    m.year,
    m.rt10,
    m.netflix,
    m.hulu,
    m.prime,
    m.disney
  ]);

  function calcPearson(idxA, idxB) {
    let n = 0;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
    for (let i = 0; i < matrixData.length; i++) {
      const x = matrixData[i][idxA];
      const y = matrixData[i][idxB];
      if (x === null || y === null || isNaN(x) || isNaN(y)) continue;
      n++;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
      sumY2 += y * y;
    }
    if (n === 0) return 0;
    const num = n * sumXY - sumX * sumY;
    const den = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    return den === 0 ? 0 : num / den;
  }

  const corrZ = [];
  const corrText = [];
  for (let i = 0; i < corrCols.length; i++) {
    const rowZ = [];
    const rowText = [];
    for (let j = 0; j < corrCols.length; j++) {
      const val = calcPearson(i, j);
      rowZ.push(val);
      const formatted = (val > 0 ? '+' : '') + val.toFixed(2);
      rowText.push(val === 1 ? '1.00' : formatted);
    }
    corrZ.push(rowZ);
    corrText.push(rowText);
  }

  const heatmapTrace = {
    type: 'heatmap',
    z: corrZ,
    x: corrCols,
    y: corrCols,
    zmin: -1,
    zmax: 1,
    zmid: 0,
    colorscale: [
      [0.0, '#b91c1c'],
      [0.25, '#f87171'],
      [0.5, '#ffffff'],
      [0.75, '#60a5fa'],
      [1.0, '#1d4ed8']
    ],
    text: corrText,
    texttemplate: '%{text}',
    textfont: { size: 12, family: 'monospace', color: '#0f172a' },
    colorbar: {
      title: { text: 'Pearson (r)', font: { size: 11, weight: 600 } },
      thickness: 14,
      len: 0.95
    },
    hovertemplate: 
      'Variable 1: %{x}<br>' +
      'Variable 2: %{y}<br>' +
      'Pearson Correlation: %{z:.3f}' +
      '<extra></extra>'
  };

  const heatmapLayout = {
    font: baseFont,
    margin: { l: 95, r: 25, t: 25, b: 65 },
    height: 450,
    xaxis: { tickfont: { size: 12, weight: 600 } },
    yaxis: { tickfont: { size: 12, weight: 600 } },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent'
  };

  if (document.getElementById('lab4-chart-heatmap')) {
    Plotly.newPlot('lab4-chart-heatmap', [heatmapTrace], heatmapLayout, baseConfig);
    observeResize('lab4-chart-heatmap');
  }

  // --------------------------------------------------------------------------
  // CHART 6: Average Rotten Tomatoes Rating by Release Year
  // --------------------------------------------------------------------------
  const yearlyMap = {};
  for (let i = 0; i < scatterMovies.length; i++) {
    const y = scatterMovies[i].year;
    const s = scatterMovies[i].rt10;
    if (!yearlyMap[y]) yearlyMap[y] = { sum: 0, count: 0 };
    yearlyMap[y].sum += s;
    yearlyMap[y].count += 1;
  }

  const sortedYears = Object.keys(yearlyMap).map(Number).sort((a, b) => a - b);
  const avgRatings = sortedYears.map(y => Math.round((yearlyMap[y].sum / yearlyMap[y].count) * 100) / 100);
  const movieCounts = sortedYears.map(y => yearlyMap[y].count);

  const yearlyTrace = {
    type: 'scatter',
    mode: 'lines+markers',
    x: sortedYears,
    y: avgRatings,
    customdata: movieCounts,
    line: { color: '#3b28cc', width: 2.2 },
    marker: { color: '#3b28cc', size: 5 },
    hovertemplate: 
      'Release Year: %{x}<br>' +
      'Average Rating: %{y:.2f}/10<br>' +
      'Movies Rated: %{customdata:,}' +
      '<extra></extra>'
  };

  const yearlyLayout = {
    font: baseFont,
    margin: { l: 55, r: 25, t: 25, b: 45 },
    height: 420,
    hovermode: 'x unified',
    xaxis: {
      title: { text: 'Movie Release Year', font: { size: 12, weight: 600 } },
      dtick: 10,
      gridcolor: '#f1f5f9'
    },
    yaxis: {
      title: { text: 'Average Rotten Tomatoes Score (0–10)', font: { size: 12, weight: 600 } },
      range: [0, 10.2],
      dtick: 1,
      gridcolor: '#f1f5f9'
    },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent'
  };

  if (document.getElementById('lab4-chart-yearly')) {
    Plotly.newPlot('lab4-chart-yearly', [yearlyTrace], yearlyLayout, baseConfig);
    observeResize('lab4-chart-yearly');
  }

  // --------------------------------------------------------------------------
  // CHART 7: Movies by Number of Platforms (Donut Chart & Verification Table)
  // --------------------------------------------------------------------------
  const platformOverlapCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
  movies.forEach(m => {
    const count = (m.netflix || 0) + (m.hulu || 0) + (m.prime || 0) + (m.disney || 0);
    if (count >= 1 && count <= 4) {
      platformOverlapCounts[count]++;
    }
  });

  const overlapLabels = ['1 Platform', '2 Platforms', '3 Platforms', '4 Platforms'];
  const overlapValues = [
    platformOverlapCounts[1],
    platformOverlapCounts[2],
    platformOverlapCounts[3],
    platformOverlapCounts[4]
  ];
  const totalCount = overlapValues.reduce((a, b) => a + b, 0);

  const donutTrace = {
    type: 'pie',
    labels: overlapLabels,
    values: overlapValues,
    hole: 0.58,
    sort: false,
    textinfo: 'label+percent',
    marker: {
      colors: ['#3b28cc', '#06b6d4', '#f59e0b', '#ef4444']
    },
    hovertemplate: 
      '<b>%{label}</b><br>' +
      'Number of Movies: %{value:,}<br>' +
      'Percentage: %{percent}' +
      '<extra></extra>'
  };

  const donutLayout = {
    font: baseFont,
    margin: { l: 20, r: 20, t: 25, b: 25 },
    height: 400,
    showlegend: false,
    annotations: [
      {
        text: `<b>${totalCount.toLocaleString()}</b><br><span style="font-size:12px;color:#64748b;">Movies</span>`,
        x: 0.5,
        y: 0.5,
        font: { size: 18, family: baseFont.family },
        showarrow: false
      }
    ],
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent'
  };

  if (document.getElementById('lab4-chart-platform-overlap')) {
    Plotly.newPlot('lab4-chart-platform-overlap', [donutTrace], donutLayout, baseConfig);
    observeResize('lab4-chart-platform-overlap');
  }

  // Populate dynamic summary table beside/beneath donut chart
  const tableContainer = document.getElementById('lab4-donut-table');
  if (tableContainer) {
    let tableHtml = `
      <table class="editorial-table" style="font-size: 0.85rem; margin: 0; width: 100%;">
        <thead>
          <tr>
            <th>Platforms</th>
            <th class="num">Movies</th>
            <th class="num">Share</th>
          </tr>
        </thead>
        <tbody>
    `;
    overlapLabels.forEach((label, i) => {
      const count = overlapValues[i];
      const pct = totalCount > 0 ? ((count / totalCount) * 100).toFixed(2) : '0.00';
      tableHtml += `
        <tr>
          <td><strong>${label}</strong></td>
          <td class="num font-mono">${count.toLocaleString()}</td>
          <td class="num font-mono">${pct}%</td>
        </tr>
      `;
    });
    tableHtml += `
        </tbody>
        <tfoot>
          <tr style="font-weight: 700; background: var(--color-surface);">
            <td>Total Evaluated</td>
            <td class="num font-mono">${totalCount.toLocaleString()}</td>
            <td class="num font-mono">100.00%</td>
          </tr>
        </tfoot>
      </table>
    `;
    tableContainer.innerHTML = tableHtml;
  }
}

