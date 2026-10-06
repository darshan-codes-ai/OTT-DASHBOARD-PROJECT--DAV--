/**
 * DAV LAB WEBSITE - MODERN ANALYTICS DASHBOARD CONTROLLER (dashboard.js)
 * High-performance data ingestion, Plotly graph rendering, and view switching
 */

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 1. Initialize Sidebar & Viewport Controls
    initSidebarControls();
    initViewToggles();

    // 2. Load Precomputed Summary Metrics (Zero-Latency Baseline)
    const summary = await DAVData.loadSummary();
    if (summary) {
      // Primary Analytics Charts
      DAVCharts.renderPlatformHorizontalBar('dashboard-chart-platform', summary.platformCounts);
      DAVCharts.renderYearTrend('dashboard-chart-year', summary.yearDistribution);
      DAVCharts.renderAgeDonut('dashboard-chart-age', summary.ageDistribution);
      DAVCharts.renderHighRatedHorizontalBar('dashboard-chart-high-rated', summary.highRatedPlatformCounts);
      DAVCharts.renderOverlapDonut('dashboard-chart-overlap', summary.platformOverlap);
      DAVCharts.renderCorrelationHeatmap('dashboard-chart-correlation', summary.correlationMatrix);
      DAVCharts.renderRatingBins('dashboard-chart-density', summary.ratingBins);
    }

    // 3. Load Cleaned Records for Advanced Distribution Models (KDE, Boxplot, Violin)
    const movies = await DAVData.loadMovies();
    if (movies && movies.length > 0) {
      DAVCharts.renderHistKDE('dashboard-chart-kde', movies);
      DAVCharts.renderBoxplotAge('dashboard-chart-boxplot', movies);
      DAVCharts.renderViolinAge('dashboard-chart-violin', movies);
    }

  } catch (err) {
    console.error('Error initializing dashboard controller:', err);
  }
});

/**
 * Mobile Sidebar Drawer and Overlay Management
 */
function initSidebarControls() {
  const toggleBtn = document.querySelector('.dash-mobile-toggle');
  const sidebar = document.querySelector('.dash-sidebar');
  const overlay = document.querySelector('.dash-sidebar-overlay');

  if (!toggleBtn || !sidebar || !overlay) return;

  function toggleSidebar() {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
  }

  toggleBtn.addEventListener('click', toggleSidebar);
  overlay.addEventListener('click', toggleSidebar);

  // Close sidebar when clicking any navigation link on mobile
  sidebar.querySelectorAll('.dash-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('open');
    });
  });
}

/**
 * Interactive vs Excel View Switching (Card-level and Global)
 */
function initViewToggles() {
  // Individual card toggles
  document.querySelectorAll('.dash-card').forEach(card => {
    const viewButtons = card.querySelectorAll('.dash-view-btn');
    const plotView = card.querySelector('.dash-plot-container');
    const excelView = card.querySelector('.dash-excel-container');

    if (!viewButtons.length || !plotView || !excelView) return;

    viewButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.view; // 'plot' or 'excel'
        viewButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (mode === 'excel') {
          plotView.classList.add('hidden');
          excelView.classList.add('active');
        } else {
          excelView.classList.remove('active');
          plotView.classList.remove('hidden');
          // Trigger Plotly resize when returning to plot view
          const plotEl = plotView.querySelector('.js-plotly-plot') || plotView;
          if (window.Plotly && plotEl.data && plotEl.offsetParent !== null) {
            try {
              Plotly.Plots.resize(plotEl);
            } catch (e) {
              // ignore benign resize errors during rapid switching
            }
          }
        }
      });
    });
  });

  // Global toolbar mode switcher
  const globalModeButtons = document.querySelectorAll('.dash-mode-btn');
  globalModeButtons.forEach(gBtn => {
    gBtn.addEventListener('click', () => {
      const targetMode = gBtn.dataset.mode; // 'plot' or 'excel'
      globalModeButtons.forEach(b => b.classList.remove('active'));
      gBtn.classList.add('active');

      document.querySelectorAll('.dash-card').forEach(card => {
        const btn = card.querySelector(`.dash-view-btn[data-view="${targetMode}"]`);
        if (btn) btn.click();
      });
    });
  });
}
