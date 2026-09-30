/**
 * DAV LAB WEBSITE - DATA ENGINE (data.js)
 * Academic Source of Truth Data Manager using PapaParse
 */

const DAVData = (function () {
  let cachedRecords = null;
  let cachedSummary = null;

  /**
   * Load summary JSON baseline (precomputed for zero latency)
   */
  async function loadSummary() {
    if (cachedSummary) return cachedSummary;
    try {
      const response = await fetch('./data/summary.json');
      if (response.ok) {
        cachedSummary = await response.json();
        return cachedSummary;
      }
    } catch (e) {
      console.warn('Could not load summary.json directly, fallback to in-memory defaults', e);
    }
    return null;
  }

  /**
   * Load and parse MoviesOnStreamingPlatforms.csv using PapaParse
   */
  async function loadMovies() {
    if (cachedRecords) return cachedRecords;

    return new Promise((resolve) => {
      Papa.parse('./data/MoviesOnStreamingPlatforms.csv', {
        download: true,
        header: true,
        dynamicTyping: false,
        skipEmptyLines: true,
        complete: function (results) {
          if (results && results.data && results.data.length > 0) {
            cachedRecords = processRecords(results.data);
            resolve(cachedRecords);
          } else {
            console.error('PapaParse returned empty dataset');
            resolve([]);
          }
        },
        error: function (err) {
          console.error('Error loading CSV via PapaParse:', err);
          resolve([]);
        }
      });
    });
  }

  /**
   * Clean and normalize raw CSV records
   */
  function processRecords(rawRows) {
    const cleaned = [];

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];
      if (!row.Title && !row.ID) continue;

      const id = parseInt(row.ID || i + 1, 10);
      const title = (row.Title || '').trim();
      const year = parseInt(row.Year, 10) || null;
      const age = row.Age ? row.Age.trim() : null;

      // Clean Rotten Tomatoes
      let rtRaw = row['Rotten Tomatoes'] ? String(row['Rotten Tomatoes']).trim() : null;
      let rt100 = null;
      let rt10 = null;

      if (rtRaw && rtRaw !== '' && rtRaw !== 'null') {
        const numVal = parseFloat(rtRaw.replace('/100', '').trim());
        if (!isNaN(numVal)) {
          rt100 = numVal;
          rt10 = Math.round((numVal / 10) * 10) / 10;
        }
      }

      // Platforms
      const netflix = parseInt(row.Netflix, 10) === 1 ? 1 : 0;
      const hulu = parseInt(row.Hulu, 10) === 1 ? 1 : 0;
      const prime = parseInt(row['Prime Video'], 10) === 1 ? 1 : 0;
      const disney = parseInt(row['Disney+'], 10) === 1 ? 1 : 0;
      const platformCount = netflix + hulu + prime + disney;

      cleaned.push({
        id,
        title,
        year,
        age,
        rtRaw,
        rt100,
        rt10,
        netflix,
        hulu,
        prime,
        disney,
        platformCount
      });
    }

    return cleaned;
  }

  /**
   * Calculate summary metrics from a given list of records
   */
  function calculateMetrics(records) {
    const total = records.length;
    if (total === 0) {
      return {
        total: 0,
        meanScore10: 0,
        medianScore10: 0,
        meanScore100: 0,
        medianScore100: 0,
        highRatedCount: 0,
        netflixCount: 0,
        huluCount: 0,
        primeCount: 0,
        disneyCount: 0
      };
    }

    const scores10 = [];
    const scores100 = [];
    let netflix = 0;
    let hulu = 0;
    let prime = 0;
    let disney = 0;
    let highRated = 0;

    for (let i = 0; i < total; i++) {
      const r = records[i];
      if (r.rt10 !== null) {
        scores10.push(r.rt10);
        scores100.push(r.rt100);
        if (r.rt10 >= 8.0) highRated++;
      }
      if (r.netflix) netflix++;
      if (r.hulu) hulu++;
      if (r.prime) prime++;
      if (r.disney) disney++;
    }

    scores10.sort((a, b) => a - b);
    scores100.sort((a, b) => a - b);

    const sum10 = scores10.reduce((acc, v) => acc + v, 0);
    const sum100 = scores100.reduce((acc, v) => acc + v, 0);

    const mean10 = scores10.length ? Math.round((sum10 / scores10.length) * 100) / 100 : 0;
    const mean100 = scores100.length ? Math.round((sum100 / scores100.length) * 100) / 100 : 0;

    let median10 = 0;
    let median100 = 0;
    if (scores10.length) {
      const mid = Math.floor(scores10.length / 2);
      median10 = scores10.length % 2 !== 0 ? scores10[mid] : (scores10[mid - 1] + scores10[mid]) / 2;
      median100 = scores100.length % 2 !== 0 ? scores100[mid] : (scores100[mid - 1] + scores100[mid]) / 2;
    }

    return {
      total,
      meanScore10: mean10,
      medianScore10: Math.round(median10 * 10) / 10,
      meanScore100: mean100,
      medianScore100: Math.round(median100 * 10) / 10,
      highRatedCount: highRated,
      netflixCount: netflix,
      huluCount: hulu,
      primeCount: prime,
      disneyCount: disney
    };
  }

  return {
    loadSummary,
    loadMovies,
    calculateMetrics
  };
})();
