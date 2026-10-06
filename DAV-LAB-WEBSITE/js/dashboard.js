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
    initSmoothAnchors();

    // Ensure page loads at the top if no anchor is explicitly provided in URL
    if (!window.location.hash) {
      if (window.history.scrollRestoration) {
        window.history.scrollRestoration = 'manual';
      }
      window.scrollTo(0, 0);
    }

  } catch (err) {
    console.error('Error initializing dashboard controller:', err);
  }
});

function initSmoothAnchors() {
  document.querySelectorAll('.dashboard-subnav-link, .hero-cta-group a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth' });
          history.replaceState(null, '', targetId);
        }
      }
    });
  });
}

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

