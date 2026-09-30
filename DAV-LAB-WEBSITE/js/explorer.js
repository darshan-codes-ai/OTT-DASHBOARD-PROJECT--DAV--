/**
 * DAV LAB WEBSITE - DATA EXPLORER ENGINE (explorer.js)
 * Interactive Filtering, Dynamic Stats, Sorting, Pagination & CSV Export
 */

const DAVExplorer = (function () {
  let allRecords = [];
  let filteredRecords = [];

  const state = {
    search: '',
    platform: 'all',
    age: 'all',
    minYear: null,
    maxYear: null,
    minScore: 0,
    page: 1,
    pageSize: 25,
    sortCol: 'title',
    sortAsc: true
  };

  /**
   * Initialize Data Explorer
   */
  async function init() {
    const tableBody = document.getElementById('explorer-table-body');
    if (!tableBody) return; // Not on explorer page

    tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 40px; color: var(--color-text-muted);">Loading dataset (9,515 records)...</td></tr>`;

    allRecords = await DAVData.loadMovies();
    filteredRecords = [...allRecords];

    setupEventListeners();
    applyFilters();
  }

  function setupEventListeners() {
    // Search input (debounced)
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      let debounceTimer;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          state.search = e.target.value.trim().toLowerCase();
          state.page = 1;
          applyFilters();
        }, 150);
      });
    }

    // Platform chips
    const platformChips = document.querySelectorAll('.chip-btn[data-platform]');
    platformChips.forEach(chip => {
      chip.addEventListener('click', () => {
        platformChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.platform = chip.getAttribute('data-platform');
        state.page = 1;
        applyFilters();
      });
    });

    // Age dropdown
    const ageSelect = document.getElementById('age-select');
    if (ageSelect) {
      ageSelect.addEventListener('change', (e) => {
        state.age = e.target.value;
        state.page = 1;
        applyFilters();
      });
    }

    // Year inputs
    const minYearInput = document.getElementById('min-year-input');
    const maxYearInput = document.getElementById('max-year-input');
    if (minYearInput) {
      minYearInput.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        state.minYear = isNaN(val) ? null : val;
        state.page = 1;
        applyFilters();
      });
    }
    if (maxYearInput) {
      maxYearInput.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        state.maxYear = isNaN(val) ? null : val;
        state.page = 1;
        applyFilters();
      });
    }

    // Score filter slider / input
    const scoreSlider = document.getElementById('score-slider');
    const scoreValDisplay = document.getElementById('score-val-display');
    if (scoreSlider) {
      scoreSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        state.minScore = isNaN(val) ? 0 : val;
        if (scoreValDisplay) {
          scoreValDisplay.textContent = state.minScore > 0 ? `≥ ${state.minScore.toFixed(1)}/10` : 'All Scores';
        }
        state.page = 1;
        applyFilters();
      });
    }

    // Reset button
    const resetBtn = document.getElementById('reset-filters-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        state.search = '';
        state.platform = 'all';
        state.age = 'all';
        state.minYear = null;
        state.maxYear = null;
        state.minScore = 0;
        state.page = 1;

        if (searchInput) searchInput.value = '';
        if (ageSelect) ageSelect.value = 'all';
        if (minYearInput) minYearInput.value = '';
        if (maxYearInput) maxYearInput.value = '';
        if (scoreSlider) scoreSlider.value = 0;
        if (scoreValDisplay) scoreValDisplay.textContent = 'All Scores';
        platformChips.forEach(c => c.classList.toggle('active', c.getAttribute('data-platform') === 'all'));

        applyFilters();
      });
    }

    // Page size select
    const pageSizeSelect = document.getElementById('page-size-select');
    if (pageSizeSelect) {
      pageSizeSelect.addEventListener('change', (e) => {
        state.pageSize = parseInt(e.target.value, 10) || 25;
        state.page = 1;
        renderTable();
        renderPagination();
      });
    }

    // CSV Export button
    const exportBtn = document.getElementById('export-csv-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', exportFilteredCSV);
    }

    // Table Column Sorting
    const sortHeaders = document.querySelectorAll('th[data-sort]');
    sortHeaders.forEach(th => {
      th.style.cursor = 'pointer';
      th.addEventListener('click', () => {
        const col = th.getAttribute('data-sort');
        if (state.sortCol === col) {
          state.sortAsc = !state.sortAsc;
        } else {
          state.sortCol = col;
          state.sortAsc = true;
        }
        sortRecords();
        renderTable();
        renderPagination();
      });
    });
  }

  function applyFilters() {
    filteredRecords = allRecords.filter(r => {
      // Search
      if (state.search && !r.title.toLowerCase().includes(state.search)) {
        return false;
      }

      // Platform
      if (state.platform === 'netflix' && !r.netflix) return false;
      if (state.platform === 'hulu' && !r.hulu) return false;
      if (state.platform === 'prime' && !r.prime) return false;
      if (state.platform === 'disney' && !r.disney) return false;

      // Age
      if (state.age !== 'all') {
        if (state.age === 'unrated') {
          if (r.age !== null) return false;
        } else if (r.age !== state.age) {
          return false;
        }
      }

      // Year range (blank = unrestricted)
      if (state.minYear !== null && r.year !== null && r.year < state.minYear) return false;
      if (state.maxYear !== null && r.year !== null && r.year > state.maxYear) return false;

      // Min Rotten Tomatoes score
      if (state.minScore > 0) {
        if (r.rt10 === null || r.rt10 < state.minScore) return false;
      }

      return true;
    });

    sortRecords();
    updateLiveMetrics();
    renderTable();
    renderPagination();
  }

  function sortRecords() {
    filteredRecords.sort((a, b) => {
      let valA = a[state.sortCol];
      let valB = b[state.sortCol];

      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = (valB || '').toLowerCase();
      }

      if (valA < valB) return state.sortAsc ? -1 : 1;
      if (valA > valB) return state.sortAsc ? 1 : -1;
      return 0;
    });
  }

  function updateLiveMetrics() {
    const metrics = DAVData.calculateMetrics(filteredRecords);

    const countEl = document.getElementById('stat-filtered-count');
    const meanEl = document.getElementById('stat-filtered-mean');
    const medianEl = document.getElementById('stat-filtered-median');
    const highEl = document.getElementById('stat-filtered-high');

    if (countEl) countEl.textContent = metrics.total.toLocaleString();
    if (meanEl) meanEl.textContent = metrics.total > 0 ? `${metrics.meanScore10.toFixed(2)} / 10` : '—';
    if (medianEl) medianEl.textContent = metrics.total > 0 ? `${metrics.medianScore10.toFixed(1)} / 10` : '—';
    if (highEl) highEl.textContent = metrics.highRatedCount.toLocaleString();

    const resultCountSummary = document.getElementById('result-count-summary');
    if (resultCountSummary) {
      const pct = allRecords.length > 0 ? ((metrics.total / allRecords.length) * 100).toFixed(1) : 0;
      resultCountSummary.textContent = `Showing ${metrics.total.toLocaleString()} of 9,515 movies (${pct}%)`;
    }
  }

  function renderTable() {
    const tableBody = document.getElementById('explorer-table-body');
    if (!tableBody) return;

    if (filteredRecords.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 48px; color: var(--color-text-muted);">
            <strong>No matching movies found</strong><br>
            Try adjusting your search criteria, year bounds, or score threshold.
          </td>
        </tr>`;
      return;
    }

    const startIdx = (state.page - 1) * state.pageSize;
    const endIdx = Math.min(startIdx + state.pageSize, filteredRecords.length);
    const pageRecords = filteredRecords.slice(startIdx, endIdx);

    const rowsHtml = pageRecords.map(r => {
      // Platform badges
      const badges = [];
      if (r.netflix) badges.push(`<span class="badge badge-netflix">Netflix</span>`);
      if (r.hulu) badges.push(`<span class="badge badge-hulu">Hulu</span>`);
      if (r.prime) badges.push(`<span class="badge badge-prime">Prime</span>`);
      if (r.disney) badges.push(`<span class="badge badge-disney">Disney+</span>`);

      // Age badge
      const ageDisplay = r.age ? `<span class="badge badge-default">${r.age}</span>` : `<span class="text-subtle">—</span>`;

      // RT score display
      let rtDisplay = `<span class="text-subtle">—</span>`;
      if (r.rt10 !== null) {
        const isHigh = r.rt10 >= 8.0;
        rtDisplay = `
          <strong style="${isHigh ? 'color: var(--color-accent); font-weight: 700;' : ''}">${r.rt10.toFixed(1)}</strong>
          <span class="text-subtle" style="font-size: 0.78rem;">/10 (${r.rt100}%)</span>`;
      }

      return `
        <tr>
          <td><strong>${escapeHtml(r.title)}</strong></td>
          <td class="num">${r.year || '—'}</td>
          <td>${ageDisplay}</td>
          <td class="num font-mono">${rtDisplay}</td>
          <td><div style="display: flex; gap: 4px; flex-wrap: wrap;">${badges.join(' ')}</div></td>
        </tr>`;
    }).join('');

    tableBody.innerHTML = rowsHtml;
  }

  function renderPagination() {
    const paginationContainer = document.getElementById('pagination-container');
    if (!paginationContainer) return;

    const totalPages = Math.ceil(filteredRecords.length / state.pageSize) || 1;
    if (state.page > totalPages) state.page = totalPages;

    const startRecord = filteredRecords.length === 0 ? 0 : (state.page - 1) * state.pageSize + 1;
    const endRecord = Math.min(state.page * state.pageSize, filteredRecords.length);

    let html = `
      <div>Showing <strong>${startRecord}–${endRecord}</strong> of <strong>${filteredRecords.length.toLocaleString()}</strong></div>
      <div class="page-buttons">
        <button class="page-btn" id="prev-page-btn" ${state.page <= 1 ? 'disabled' : ''}>← Prev</button>
        <span style="display: inline-flex; align-items: center; padding: 0 8px; font-family: var(--font-mono); font-size: 0.8rem;">
          ${state.page} / ${totalPages}
        </span>
        <button class="page-btn" id="next-page-btn" ${state.page >= totalPages ? 'disabled' : ''}>Next →</button>
      </div>`;

    paginationContainer.innerHTML = html;

    const prevBtn = document.getElementById('prev-page-btn');
    const nextBtn = document.getElementById('next-page-btn');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (state.page > 1) {
          state.page--;
          renderTable();
          renderPagination();
        }
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (state.page < totalPages) {
          state.page++;
          renderTable();
          renderPagination();
        }
      });
    }
  }

  function exportFilteredCSV() {
    if (filteredRecords.length === 0) {
      alert('No records to export with current filters.');
      return;
    }

    const exportRows = filteredRecords.map(r => ({
      'ID': r.id,
      'Title': r.title,
      'Year': r.year,
      'Age': r.age || '',
      'Rotten Tomatoes (Original)': r.rtRaw || '',
      'Rotten Tomatoes (0-10 Scale)': r.rt10 !== null ? r.rt10 : '',
      'Netflix': r.netflix,
      'Hulu': r.hulu,
      'Prime Video': r.prime,
      'Disney+': r.disney
    }));

    const csvString = Papa.unparse(exportRows);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `DAV_Filtered_Movies_${filteredRecords.length}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  return {
    init
  };
})();
