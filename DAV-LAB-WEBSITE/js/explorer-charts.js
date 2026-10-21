/**
 * DAV LAB WEBSITE - DATA EXPLORER VISUAL ANALYTICS CONTROLLER (explorer-charts.js)
 * Implements 10 reactive Plotly visualizations organized into 4 labeled groups:
 *   A. Catalog Trends (Releases Over Time, Average Critic Rating by Year)
 *   B. Ratings Analysis (RT Score Distribution, Year vs. Rating Scatter, Audience Donut, Age Box Plot, Top-Rated Bar)
 *   C. Platform Analysis (Platform Availability, Platform Overlap)
 *   D. Data Quality (Data Completeness Stacked Bar)
 * Plus a Dynamic Insights generator derived reactively from filtered records.
 */

const DAVExplorerCharts = (function () {
  const AGE_ORDER = ['all', '7+', '13+', '16+', '18+', 'Missing/Unrated'];
  const AGE_COLORS = {
    'all': '#16a085',
    '7+': '#e9c46a',
    '13+': '#f4a261',
    '16+': '#e76f51',
    '18+': '#6c5ce7',
    'Missing/Unrated': '#94a3af'
  };

  const PLATFORM_COLORS = {
    'Netflix': '#e50914',
    'Prime Video': '#0088cc',
    'Hulu': '#0f9d58',
    'Disney+': '#113ccf'
  };

  const baseFont = {
    family: 'Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#1e2329'
  };

  const baseConfig = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['lasso2d', 'select2d']
  };

  // Track observer to avoid duplicate observers
  const observedContainers = new Set();

  function observeResize(containerId) {
    if (observedContainers.has(containerId)) return;
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
      observedContainers.add(containerId);
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

  function getNormalizedAge(rawAge) {
    if (!rawAge || rawAge === '' || rawAge === 'null') return 'Missing/Unrated';
    const trimmed = String(rawAge).trim();
    if (AGE_ORDER.includes(trimmed)) return trimmed;
    return 'Missing/Unrated';
  }

  function renderEmptyPlot(containerId, titleText) {
    const el = document.getElementById(containerId);
    if (!el || typeof Plotly === 'undefined') return;

    const layout = {
      font: baseFont,
      margin: { l: 40, r: 20, t: 30, b: 40 },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      xaxis: { showgrid: false, zeroline: false, showticklabels: false },
      yaxis: { showgrid: false, zeroline: false, showticklabels: false },
      annotations: [{
        text: 'No movies match the current filter selection.',
        showarrow: false,
        font: { size: 13, color: '#64748b' }
      }]
    };

    Plotly.react(containerId, [], layout, baseConfig);
    observeResize(containerId);
  }

  /**
   * Main Render Entrypoint
   * Called whenever filters are applied or reset in explorer.js
   */
  function render(filteredRecords, allRecords) {
    if (typeof Plotly === 'undefined') {
      console.warn('Plotly is not loaded. Cannot render explorer visual analytics.');
      return;
    }

    const totalFiltered = filteredRecords.length;
    const scoredRecords = filteredRecords.filter(m => m.rt10 !== null && !isNaN(m.rt10));
    const scoredCount = scoredRecords.length;

    // Update live status text
    updateStatusLine(totalFiltered, scoredCount, allRecords ? allRecords.length : 9515);

    // Update dynamic insights cards
    updateDynamicInsights(filteredRecords, scoredRecords, allRecords);

    // If zero records, render clean empty states for all 10 graphs
    if (totalFiltered === 0) {
      renderEmptyPlot('explorer-chart-releases', 'Releases Over Time');
      renderEmptyPlot('explorer-chart-yearly-avg', 'Average Critic Rating by Year');
      renderEmptyPlot('explorer-chart-score-dist', 'Rotten Tomatoes Score Distribution');
      renderEmptyPlot('explorer-chart-year-vs-rating', 'Release Year vs. Critic Rating');
      renderEmptyPlot('explorer-chart-age-donut', 'Audience Classification Breakdown');
      renderEmptyPlot('explorer-chart-platform-avail', 'Platform Availability');
      renderEmptyPlot('explorer-chart-age-box', 'Rating Distribution by Age');
      renderEmptyPlot('explorer-chart-platform-overlap', 'Shared Streaming Platforms');
      renderEmptyPlot('explorer-chart-top-rated', 'Top-Rated Movies');
      renderEmptyPlot('explorer-chart-completeness', 'Data Completeness');
      return;
    }

    // Render 10 Plotly Visualizations
    renderChart1ReleasesOverTime(filteredRecords);
    renderChart3YearlyAverageRating(scoredRecords);
    renderChart2ScoreDistribution(scoredRecords);
    renderChart4YearVsRatingScatter(scoredRecords);
    renderChart5AgeDonut(filteredRecords);
    renderChart6PlatformAvailability(filteredRecords);
    renderChart7AgeBoxPlot(scoredRecords);
    renderChart8PlatformOverlap(filteredRecords);
    renderChart9TopRatedMovies(scoredRecords);
    renderChart10DataCompleteness(filteredRecords);
  }

  /**
   * Live Status Line Update
   */
  function updateStatusLine(filteredCount, scoredCount, totalCatalog) {
    const statusEl = document.getElementById('explorer-analytics-status');
    if (!statusEl) return;

    if (filteredCount === 0) {
      statusEl.innerHTML = `<strong>0 movies</strong> match your current filter combination. Reset or adjust your filters above.`;
      return;
    }

    const pctCatalog = ((filteredCount / totalCatalog) * 100).toFixed(1);
    const unratedCount = filteredCount - scoredCount;
    const scoreNote = unratedCount > 0 
      ? ` (${scoredCount.toLocaleString()} with verified Rotten Tomatoes ratings, ${unratedCount.toLocaleString()} unrated)` 
      : ` (all ${scoredCount.toLocaleString()} have verified ratings)`;

    statusEl.innerHTML = `Visualizing <strong>${filteredCount.toLocaleString()}</strong> movies from the current filter selection (${pctCatalog}% of catalog)${scoreNote}.`;
  }

  /**
   * Dynamic Insights Generator
   * Generates 3 contextual, mathematically sound insights from filteredRecords
   */
  function updateDynamicInsights(records, scoredRecords, allRecords) {
    const gridEl = document.getElementById('explorer-insights-grid');
    if (!gridEl) return;

    if (records.length === 0) {
      gridEl.innerHTML = `
        <div class="explorer-insight-item" style="grid-column: 1 / -1; text-align: center; color: var(--color-text-muted); padding: var(--space-lg);">
          <em>No matching records to generate dynamic insights. Try broadening your search or resetting filters.</em>
        </div>`;
      return;
    }

    const total = records.length;

    // 1. Platform Dynamics Insight
    let netflix = 0, prime = 0, hulu = 0, disney = 0;
    records.forEach(r => {
      if (r.netflix) netflix++;
      if (r.prime) prime++;
      if (r.hulu) hulu++;
      if (r.disney) disney++;
    });

    const platforms = [
      { name: 'Prime Video', count: prime },
      { name: 'Netflix', count: netflix },
      { name: 'Hulu', count: hulu },
      { name: 'Disney+', count: disney }
    ].sort((a, b) => b.count - a.count);

    const leadPlatform = platforms[0];
    const leadPct = ((leadPlatform.count / total) * 100).toFixed(1);
    const secondPlatform = platforms[1];
    const secondPct = ((secondPlatform.count / total) * 100).toFixed(1);

    let platformInsightTitle = 'Catalog Distribution';
    let platformInsightText = '';

    if (leadPlatform.count === total && secondPlatform.count === 0) {
      platformInsightTitle = `${leadPlatform.name} Exclusivity`;
      platformInsightText = `All ${total.toLocaleString()} movies in this view are hosted on <strong>${leadPlatform.name}</strong>, with no cross-availability among other tracked services.`;
    } else {
      platformInsightTitle = `Platform Leadership: ${leadPlatform.name}`;
      platformInsightText = `<strong>${leadPlatform.name}</strong> leads this view with <strong>${leadPlatform.count.toLocaleString()}</strong> titles (${leadPct}%), followed by ${secondPlatform.name} at ${secondPlatform.count.toLocaleString()} titles (${secondPct}%).`;
    }

    // 2. Rating & Critic Consensus Insight
    let qualityTitle = 'Critic Consensus';
    let qualityText = '';
    const scoredTotal = scoredRecords.length;

    if (scoredTotal === 0) {
      qualityTitle = 'Critic Data Notice';
      qualityText = `None of the ${total.toLocaleString()} movies in the current filter selection have published Rotten Tomatoes critic scores.`;
    } else {
      const sumScore = scoredRecords.reduce((acc, r) => acc + r.rt10, 0);
      const meanScore = (sumScore / scoredTotal).toFixed(2);
      const highRatedCount = scoredRecords.filter(r => r.rt10 >= 8.0).length;
      const highRatedPct = ((highRatedCount / scoredTotal) * 100).toFixed(1);

      if (highRatedCount > 0) {
        qualityTitle = `Quality Tier: ${highRatedPct}% Acclaimed`;
        qualityText = `The filtered mean rating is <strong>${meanScore} / 10</strong>. Exactly <strong>${highRatedCount.toLocaleString()}</strong> titles (${highRatedPct}%) meet the critical acclaim threshold (RT ≥ 8.0).`;
      } else {
        qualityTitle = `Mean Score: ${meanScore} / 10`;
        qualityText = `The average rating across ${scoredTotal.toLocaleString()} scored titles is <strong>${meanScore} / 10</strong>, with no movies reaching the high-rating tier (≥ 8.0/10) in this view.`;
      }
    }

    // 3. Demographic & Era Focus Insight
    const ageCounts = {};
    const yearCounts = {};
    records.forEach(r => {
      const ageGroup = getNormalizedAge(r.age);
      ageCounts[ageGroup] = (ageCounts[ageGroup] || 0) + 1;

      if (r.year) {
        yearCounts[r.year] = (yearCounts[r.year] || 0) + 1;
      }
    });

    let topAge = 'all';
    let topAgeCount = 0;
    Object.entries(ageCounts).forEach(([age, cnt]) => {
      if (cnt > topAgeCount) {
        topAgeCount = cnt;
        topAge = age;
      }
    });
    const topAgePct = ((topAgeCount / total) * 100).toFixed(1);

    let peakYear = null;
    let peakYearCount = 0;
    Object.entries(yearCounts).forEach(([yr, cnt]) => {
      if (cnt > peakYearCount) {
        peakYearCount = cnt;
        peakYear = yr;
      }
    });

    const eraTitle = `Demographic Focus: ${topAge}`;
    let eraText = `The dominant maturity classification is <strong>${topAge}</strong> with <strong>${topAgeCount.toLocaleString()}</strong> titles (${topAgePct}%).`;
    if (peakYear) {
      eraText += ` Peak catalog release year is <strong>${peakYear}</strong> with ${peakYearCount.toLocaleString()} titles.`;
    }

    // Render the 3 cards
    gridEl.innerHTML = `
      <div class="explorer-insight-item">
        <div class="explorer-insight-item-title">${platformInsightTitle}</div>
        <p class="explorer-insight-item-text">${platformInsightText}</p>
      </div>
      <div class="explorer-insight-item">
        <div class="explorer-insight-item-title">${qualityTitle}</div>
        <p class="explorer-insight-item-text">${qualityText}</p>
      </div>
      <div class="explorer-insight-item">
        <div class="explorer-insight-item-title">${eraTitle}</div>
        <p class="explorer-insight-item-text">${eraText}</p>
      </div>
    `;
  }

  // ==========================================================================
  // GRAPH 1: Movie Releases Over Time (Bar Chart)
  // ==========================================================================
  function renderChart1ReleasesOverTime(records) {
    const containerId = 'explorer-chart-releases';
    const yearMap = {};
    const total = records.length;

    records.forEach(r => {
      if (r.year !== null && !isNaN(r.year)) {
        yearMap[r.year] = (yearMap[r.year] || 0) + 1;
      }
    });

    const years = Object.keys(yearMap).map(Number).sort((a, b) => a - b);
    const counts = years.map(y => yearMap[y]);
    const pcts = counts.map(c => ((c / total) * 100));

    const trace = {
      type: 'bar',
      x: years,
      y: counts,
      customdata: pcts,
      marker: {
        color: '#3b28cc',
        line: { color: '#ffffff', width: 0.5 }
      },
      hovertemplate: '<b>Year: %{x}</b><br>Movie Count: %{y:,}<br>Share of Selection: %{customdata:.1f}%<extra></extra>'
    };

    const layout = {
      font: baseFont,
      margin: { l: 50, r: 20, t: 25, b: 45 },
      height: 340,
      bargap: 0.1,
      xaxis: {
        title: { text: 'Release Year', font: { size: 12, weight: 600 } },
        gridcolor: '#f1f5f9',
        dtick: years.length > 30 ? 10 : (years.length > 15 ? 5 : 1)
      },
      yaxis: {
        title: { text: 'Number of Movies', font: { size: 12, weight: 600 } },
        rangemode: 'tozero',
        gridcolor: '#f1f5f9'
      },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent'
    };

    Plotly.react(containerId, [trace], layout, baseConfig);
    observeResize(containerId);
  }

  // ==========================================================================
  // GRAPH 2: Rotten Tomatoes Score Distribution (Histogram)
  // ==========================================================================
  function renderChart2ScoreDistribution(scoredRecords) {
    const containerId = 'explorer-chart-score-dist';
    if (scoredRecords.length === 0) {
      renderEmptyPlot(containerId, 'Score Distribution');
      return;
    }

    const scores = scoredRecords.map(r => r.rt10);

    const trace = {
      type: 'histogram',
      x: scores,
      autobinx: false,
      xbins: {
        start: 0,
        end: 10,
        size: 0.5
      },
      marker: {
        color: '#3b28cc',
        opacity: 0.85,
        line: { color: '#ffffff', width: 0.6 }
      },
      hovertemplate: 'Score Interval: %{x:.1f} – %{x+0.5:.1f}<br>Count: %{y:,} movies<extra></extra>'
    };

    const layout = {
      font: baseFont,
      margin: { l: 50, r: 20, t: 25, b: 45 },
      height: 340,
      bargap: 0.05,
      xaxis: {
        title: { text: 'Rotten Tomatoes Score (0–10)', font: { size: 12, weight: 600 } },
        range: [0, 10.2],
        dtick: 1,
        gridcolor: '#f1f5f9'
      },
      yaxis: {
        title: { text: 'Number of Movies', font: { size: 12, weight: 600 } },
        rangemode: 'tozero',
        gridcolor: '#f1f5f9'
      },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent'
    };

    Plotly.react(containerId, [trace], layout, baseConfig);
    observeResize(containerId);
  }

  // ==========================================================================
  // GRAPH 3: Average Critic Rating by Release Year (Line Chart)
  // ==========================================================================
  function renderChart3YearlyAverageRating(scoredRecords) {
    const containerId = 'explorer-chart-yearly-avg';
    if (scoredRecords.length === 0) {
      renderEmptyPlot(containerId, 'Average Rating by Year');
      return;
    }

    const yearStats = {};
    scoredRecords.forEach(r => {
      if (r.year !== null && !isNaN(r.year)) {
        if (!yearStats[r.year]) {
          yearStats[r.year] = { sum: 0, count: 0 };
        }
        yearStats[r.year].sum += r.rt10;
        yearStats[r.year].count += 1;
      }
    });

    const years = Object.keys(yearStats).map(Number).sort((a, b) => a - b);
    const avgScores = years.map(y => +(yearStats[y].sum / yearStats[y].count).toFixed(2));
    const sampleSizes = years.map(y => yearStats[y].count);

    const trace = {
      type: 'scatter',
      mode: 'lines+markers',
      x: years,
      y: avgScores,
      customdata: sampleSizes,
      line: { color: '#3b28cc', width: 2.5 },
      marker: { color: '#3b28cc', size: 5 },
      hovertemplate: '<b>Year: %{x}</b><br>Mean Critic Score: %{y:.2f} / 10<br>Scored Titles: %{customdata:,}<extra></extra>'
    };

    const layout = {
      font: baseFont,
      margin: { l: 50, r: 20, t: 25, b: 45 },
      height: 340,
      xaxis: {
        title: { text: 'Release Year', font: { size: 12, weight: 600 } },
        gridcolor: '#f1f5f9',
        dtick: years.length > 30 ? 10 : (years.length > 15 ? 5 : 1)
      },
      yaxis: {
        title: { text: 'Mean Score (0–10)', font: { size: 12, weight: 600 } },
        range: [0, 10.5],
        dtick: 2,
        gridcolor: '#f1f5f9'
      },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent'
    };

    Plotly.react(containerId, [trace], layout, baseConfig);
    observeResize(containerId);
  }

  // ==========================================================================
  // GRAPH 4: Release Year vs. Critic Rating (Scatter Plot)
  // ==========================================================================
  function renderChart4YearVsRatingScatter(scoredRecords) {
    const containerId = 'explorer-chart-year-vs-rating';
    if (scoredRecords.length === 0) {
      renderEmptyPlot(containerId, 'Year vs Rating Scatter');
      return;
    }

    // Group records by canonical age tiers for color coding & legend toggles
    const groups = {};
    AGE_ORDER.forEach(age => {
      groups[age] = { years: [], scores: [], customdata: [] };
    });

    scoredRecords.forEach(r => {
      if (r.year !== null && !isNaN(r.year)) {
        const ageGroup = getNormalizedAge(r.age);
        if (!groups[ageGroup]) groups[ageGroup] = { years: [], scores: [], customdata: [] };

        groups[ageGroup].years.push(r.year);
        groups[ageGroup].scores.push(r.rt10);
        groups[ageGroup].customdata.push([
          r.title,
          r.age || 'Unrated',
          getAvailablePlatformsText(r)
        ]);
      }
    });

    const traces = AGE_ORDER.map(age => {
      const g = groups[age];
      if (!g || g.years.length === 0) return null;

      return {
        type: 'scatter',
        mode: 'markers',
        name: age,
        x: g.years,
        y: g.scores,
        customdata: g.customdata,
        marker: {
          color: AGE_COLORS[age] || '#9ca3af',
          size: 6,
          opacity: 0.68,
          line: { color: '#ffffff', width: 0.3 }
        },
        hovertemplate: '<b>%{customdata[0]}</b><br>Year: %{x} | RT Score: %{y:.1f}/10<br>Age: %{customdata[1]} | Platforms: %{customdata[2]}<extra></extra>'
      };
    }).filter(Boolean);

    const layout = {
      font: baseFont,
      margin: { l: 50, r: 20, t: 25, b: 45 },
      height: 400,
      hovermode: 'closest',
      xaxis: {
        title: { text: 'Release Year', font: { size: 12, weight: 600 } },
        gridcolor: '#f1f5f9'
      },
      yaxis: {
        title: { text: 'Rotten Tomatoes Score (0–10)', font: { size: 12, weight: 600 } },
        range: [0, 10.5],
        dtick: 2,
        gridcolor: '#f1f5f9'
      },
      legend: {
        orientation: 'h',
        yanchor: 'bottom',
        y: 1.02,
        xanchor: 'right',
        x: 1,
        font: { size: 11 }
      },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent'
    };

    Plotly.react(containerId, traces, layout, baseConfig);
    observeResize(containerId);
  }

  // ==========================================================================
  // GRAPH 5: Audience Classification Breakdown (Donut Chart)
  // ==========================================================================
  function renderChart5AgeDonut(records) {
    const containerId = 'explorer-chart-age-donut';
    const ageCounts = {};
    records.forEach(r => {
      const ageGroup = getNormalizedAge(r.age);
      ageCounts[ageGroup] = (ageCounts[ageGroup] || 0) + 1;
    });

    const labels = [];
    const values = [];
    const colors = [];

    AGE_ORDER.forEach(age => {
      if (ageCounts[age] && ageCounts[age] > 0) {
        labels.push(age);
        values.push(ageCounts[age]);
        colors.push(AGE_COLORS[age] || '#9ca3af');
      }
    });

    const trace = {
      type: 'pie',
      hole: 0.52,
      labels: labels,
      values: values,
      marker: { colors: colors },
      textinfo: 'percent',
      textposition: 'inside',
      insidetextorientation: 'horizontal',
      hovertemplate: '<b>Age Tier: %{label}</b><br>Movies: %{value:,}<br>Share: %{percent}<extra></extra>'
    };

    const layout = {
      font: baseFont,
      margin: { l: 20, r: 20, t: 20, b: 20 },
      height: 340,
      showlegend: true,
      legend: {
        orientation: 'h',
        yanchor: 'top',
        y: -0.05,
        xanchor: 'center',
        x: 0.5,
        font: { size: 11 }
      },
      annotations: [{
        text: `<b>${records.length.toLocaleString()}</b><br><span style="font-size: 10px; color: #64748b;">Titles</span>`,
        showarrow: false,
        font: { size: 14, color: '#1e2329' }
      }],
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent'
    };

    Plotly.react(containerId, [trace], layout, baseConfig);
    observeResize(containerId);
  }

  // ==========================================================================
  // GRAPH 6: Platform Availability in Current Results (Horizontal Bar)
  // ==========================================================================
  function renderChart6PlatformAvailability(records) {
    const containerId = 'explorer-chart-platform-avail';
    const total = records.length;

    let netflix = 0, prime = 0, hulu = 0, disney = 0;
    records.forEach(r => {
      if (r.netflix) netflix++;
      if (r.prime) prime++;
      if (r.hulu) hulu++;
      if (r.disney) disney++;
    });

    const platformData = [
      { name: 'Disney+', count: disney, color: PLATFORM_COLORS['Disney+'] },
      { name: 'Hulu', count: hulu, color: PLATFORM_COLORS['Hulu'] },
      { name: 'Netflix', count: netflix, color: PLATFORM_COLORS['Netflix'] },
      { name: 'Prime Video', count: prime, color: PLATFORM_COLORS['Prime Video'] }
    ];

    const yLabels = platformData.map(p => p.name);
    const xValues = platformData.map(p => p.count);
    const barColors = platformData.map(p => p.color);
    const pcts = xValues.map(c => ((c / total) * 100));
    const barTexts = xValues.map((c, i) => `${c.toLocaleString()} (${pcts[i].toFixed(1)}%)`);

    const trace = {
      type: 'bar',
      orientation: 'h',
      x: xValues,
      y: yLabels,
      customdata: pcts,
      text: barTexts,
      textposition: 'auto',
      marker: {
        color: barColors,
        line: { color: '#ffffff', width: 0.8 }
      },
      hovertemplate: '<b>%{y}</b><br>Available Titles: %{x:,}<br>Share of Filtered: %{customdata:.1f}%<extra></extra>'
    };

    const layout = {
      font: baseFont,
      margin: { l: 95, r: 35, t: 25, b: 45 },
      height: 340,
      xaxis: {
        title: { text: 'Number of Movies Available', font: { size: 12, weight: 600 } },
        rangemode: 'tozero',
        gridcolor: '#f1f5f9'
      },
      yaxis: {
        gridcolor: '#f1f5f9',
        tickfont: { weight: 600 }
      },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent'
    };

    Plotly.react(containerId, [trace], layout, baseConfig);
    observeResize(containerId);
  }

  // ==========================================================================
  // GRAPH 7: Rating Distribution by Age Classification (Box Plot)
  // ==========================================================================
  function renderChart7AgeBoxPlot(scoredRecords) {
    const containerId = 'explorer-chart-age-box';
    if (scoredRecords.length === 0) {
      renderEmptyPlot(containerId, 'Score Distribution by Age');
      return;
    }

    const ageScores = {};
    AGE_ORDER.forEach(age => {
      ageScores[age] = [];
    });

    scoredRecords.forEach(r => {
      const ageGroup = getNormalizedAge(r.age);
      if (ageScores[ageGroup]) {
        ageScores[ageGroup].push(r.rt10);
      }
    });

    const traces = AGE_ORDER.map(age => {
      const scores = ageScores[age];
      if (!scores || scores.length === 0) return null;

      return {
        type: 'box',
        name: age,
        y: scores,
        marker: { color: AGE_COLORS[age] || '#9ca3af' },
        boxpoints: false,
        line: { width: 1.8 }
      };
    }).filter(Boolean);

    const layout = {
      font: baseFont,
      margin: { l: 50, r: 20, t: 25, b: 45 },
      height: 340,
      showlegend: false,
      xaxis: {
        title: { text: 'Age Classification', font: { size: 12, weight: 600 } },
        gridcolor: '#f1f5f9'
      },
      yaxis: {
        title: { text: 'Rotten Tomatoes Score (0–10)', font: { size: 12, weight: 600 } },
        range: [0, 10.5],
        dtick: 2,
        gridcolor: '#f1f5f9'
      },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent'
    };

    Plotly.react(containerId, traces, layout, baseConfig);
    observeResize(containerId);
  }

  // ==========================================================================
  // GRAPH 8: Movies Shared Across Streaming Platforms (Overlap Bar Chart)
  // ==========================================================================
  function renderChart8PlatformOverlap(records) {
    const containerId = 'explorer-chart-platform-overlap';
    const total = records.length;
    const overlapCounts = [0, 0, 0, 0, 0]; // 0, 1, 2, 3, 4 platforms

    records.forEach(r => {
      const pCount = Math.min(Math.max(r.platformCount || 0, 0), 4);
      overlapCounts[pCount]++;
    });

    const categories = ['0 Platforms', '1 Platform (Exclusive)', '2 Platforms', '3 Platforms', 'All 4 Platforms'];
    const pcts = overlapCounts.map(c => ((c / total) * 100));
    const barTexts = overlapCounts.map((c, i) => `${c.toLocaleString()} (${pcts[i].toFixed(1)}%)`);

    const trace = {
      type: 'bar',
      x: categories,
      y: overlapCounts,
      customdata: pcts,
      text: barTexts,
      textposition: 'auto',
      marker: {
        color: '#3b28cc',
        line: { color: '#ffffff', width: 0.6 }
      },
      hovertemplate: '<b>%{x}</b><br>Count: %{y:,} movies<br>Catalog Share: %{customdata:.1f}%<extra></extra>'
    };

    const layout = {
      font: baseFont,
      margin: { l: 50, r: 20, t: 25, b: 55 },
      height: 340,
      bargap: 0.15,
      xaxis: {
        tickfont: { size: 11 },
        gridcolor: '#f1f5f9'
      },
      yaxis: {
        title: { text: 'Number of Movies', font: { size: 12, weight: 600 } },
        rangemode: 'tozero',
        gridcolor: '#f1f5f9'
      },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent'
    };

    Plotly.react(containerId, [trace], layout, baseConfig);
    observeResize(containerId);
  }

  // ==========================================================================
  // GRAPH 9: Top-Rated Movies in Current Results (Horizontal Bar Chart)
  // ==========================================================================
  function renderChart9TopRatedMovies(scoredRecords) {
    const containerId = 'explorer-chart-top-rated';
    if (scoredRecords.length === 0) {
      renderEmptyPlot(containerId, 'Top-Rated Movies');
      return;
    }

    // Sort descending by score, then secondary by year descending, then title
    const sorted = [...scoredRecords].sort((a, b) => {
      if (b.rt10 !== a.rt10) return b.rt10 - a.rt10;
      if (b.year !== a.year) return (b.year || 0) - (a.year || 0);
      return a.title.localeCompare(b.title);
    });

    // Take top 10 (or fewer if less available)
    const topN = sorted.slice(0, 10).reverse(); // Reverse for Plotly horizontal bar order (top at top)

    const titles = topN.map(r => {
      return r.title.length > 26 ? r.title.substring(0, 24) + '...' : r.title;
    });
    const scores = topN.map(r => r.rt10);
    const barTexts = scores.map(s => `${s.toFixed(1)} / 10`);

    const customdata = topN.map(r => [
      r.title,
      r.rt100 !== null ? r.rt100 : Math.round(r.rt10 * 10),
      r.year || 'Unknown',
      r.age || 'Unrated',
      getAvailablePlatformsText(r)
    ]);

    const trace = {
      type: 'bar',
      orientation: 'h',
      x: scores,
      y: titles,
      customdata: customdata,
      text: barTexts,
      textposition: 'inside',
      insidetextanchor: 'end',
      marker: {
        color: '#15803d', // Academic emerald
        line: { color: '#ffffff', width: 0.6 }
      },
      hovertemplate: '<b>%{customdata[0]}</b><br>Rotten Tomatoes: <b>%{x:.1f}/10</b> (%{customdata[1]}%)<br>Year: %{customdata[2]} | Age: %{customdata[3]}<br>Platforms: %{customdata[4]}<extra></extra>'
    };

    const layout = {
      font: baseFont,
      margin: { l: 150, r: 25, t: 25, b: 45 },
      height: 340,
      xaxis: {
        title: { text: 'Rotten Tomatoes Score (0–10)', font: { size: 12, weight: 600 } },
        range: [0, 10.5],
        dtick: 2,
        gridcolor: '#f1f5f9'
      },
      yaxis: {
        gridcolor: '#f1f5f9',
        tickfont: { size: 11, weight: 600 }
      },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent'
    };

    Plotly.react(containerId, [trace], layout, baseConfig);
    observeResize(containerId);
  }

  // ==========================================================================
  // GRAPH 10: Data Completeness of Current Results (100% Stacked Bar)
  // ==========================================================================
  function renderChart10DataCompleteness(records) {
    const containerId = 'explorer-chart-completeness';
    const total = records.length;

    let yearCount = 0;
    let ageCount = 0;
    let rtCount = 0;

    records.forEach(r => {
      if (r.year !== null && !isNaN(r.year)) yearCount++;
      if (r.age !== null && r.age !== '' && r.age !== 'null') ageCount++;
      if (r.rt10 !== null && !isNaN(r.rt10)) rtCount++;
    });

    const dimensions = ['Rotten Tomatoes', 'Age Rating', 'Release Year'];
    const knownCounts = [rtCount, ageCount, yearCount];
    const missingCounts = [total - rtCount, total - ageCount, total - yearCount];

    const knownPcts = knownCounts.map(c => ((c / total) * 100));
    const missingPcts = missingCounts.map(c => ((c / total) * 100));

    const traceKnown = {
      type: 'bar',
      orientation: 'h',
      name: 'Complete / Known',
      y: dimensions,
      x: knownPcts,
      customdata: knownCounts,
      text: knownPcts.map((p, i) => `${knownCounts[i].toLocaleString()} (${p.toFixed(1)}%)`),
      textposition: 'inside',
      marker: {
        color: '#10b981',
        line: { color: '#ffffff', width: 0.5 }
      },
      hovertemplate: '<b>%{y}</b><br>Known Records: %{customdata:,} (%{x:.1f}%)<extra>Complete</extra>'
    };

    const traceMissing = {
      type: 'bar',
      orientation: 'h',
      name: 'Missing / Unspecified',
      y: dimensions,
      x: missingPcts,
      customdata: missingCounts,
      text: missingPcts.map((p, i) => p > 3 ? `${missingCounts[i].toLocaleString()} (${p.toFixed(1)}%)` : ''),
      textposition: 'auto',
      marker: {
        color: '#e2e8f0',
        line: { color: '#cbd5e1', width: 0.8 }
      },
      hovertemplate: '<b>%{y}</b><br>Missing Records: %{customdata:,} (%{x:.1f}%)<extra>Missing</extra>'
    };

    const layout = {
      font: baseFont,
      barmode: 'stack',
      margin: { l: 120, r: 30, t: 20, b: 45 },
      height: 250,
      xaxis: {
        title: { text: 'Completeness Percentage (%)', font: { size: 12, weight: 600 } },
        range: [0, 100],
        ticksuffix: '%',
        gridcolor: '#f1f5f9'
      },
      yaxis: {
        gridcolor: '#f1f5f9',
        tickfont: { weight: 600 }
      },
      legend: {
        orientation: 'h',
        yanchor: 'bottom',
        y: 1.05,
        xanchor: 'right',
        x: 1,
        font: { size: 11 }
      },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent'
    };

    Plotly.react(containerId, [traceKnown, traceMissing], layout, baseConfig);
    observeResize(containerId);
  }

  return {
    render
  };
})();

