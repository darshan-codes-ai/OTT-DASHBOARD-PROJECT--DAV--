/**
 * DAV LAB WEBSITE - DASHBOARD CONTROLLER (dashboard.js)
 * Coordinates summary data, full dataset load, and Plotly visualizations
 */

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 1. Load Precomputed Summary Metrics (Zero-Latency Baseline)
    const summary = await DAVData.loadSummary();
    if (!summary) {
      console.error('Failed to load dataset summary for dashboard');
      return;
    }

    // Render summary-based charts immediately
    DAVCharts.renderPlatformBar('dashboard-chart-platform', summary.platformCounts);
    DAVCharts.renderRatingBins('dashboard-chart-bins', summary.ratingBins);
    DAVCharts.renderAgeDistribution('dashboard-chart-age', summary.ageDistribution);
    DAVCharts.renderYearTrend('dashboard-chart-year', summary.yearDistribution);
    DAVCharts.renderHighRatedComparison('dashboard-chart-high-rated', summary.platformCounts, summary.highRatedPlatformCounts);
    DAVCharts.renderOverlapDonut('dashboard-chart-overlap', summary.platformOverlap);
    DAVCharts.renderCorrelationHeatmap('dashboard-chart-correlation', summary.correlationMatrix);

    // 2. Load Full Cleaned CSV Records for Advanced Distribution Models (Boxplot, KDE, Violin)
    const movies = await DAVData.loadMovies();
    if (movies && movies.length > 0) {
      DAVCharts.renderBoxplotAge('dashboard-chart-boxplot', movies);
      DAVCharts.renderHistKDE('dashboard-chart-kde', movies);
      DAVCharts.renderViolinAge('dashboard-chart-violin', movies);
    }

    // 3. Sub-navigation Active State Observer on Scroll
    initDashboardScrollSpy();

  } catch (err) {
    console.error('Error initializing dashboard controller:', err);
  }
});

function initDashboardScrollSpy() {
  const sections = document.querySelectorAll('.dashboard-section');
  const subnavLinks = document.querySelectorAll('.dashboard-subnav-link');

  if (!sections.length || !subnavLinks.length) return;

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPos = window.scrollY + 160;

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = sec.getAttribute('id');
      }
    });

    if (currentId) {
      subnavLinks.forEach(link => {
        if (link.getAttribute('href') === `#${currentId}`) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  }, { passive: true });
}
