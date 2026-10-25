// Shared data code for index.html and dashboard.html.
// Every number on both pages is computed here, in the browser, from summer_medals_1992_2008.csv.

const DATA_FILE = 'summer_medals_1992_2008.csv';

// Fill this in once the Tableau dashboard is live. The agreement table on the report page
// appears only when url is set. Type the four numbers exactly as Tableau shows them
// with all filters at their defaults (every Games, every country, every sport).
const TABLEAU = {
  url: 'https://public.tableau.com/app/profile/thomas.pluchinsky7929/viz/HostMedalBump/Dashboard',
  medals: 4463,       // Medals awarded
  gold: 1432,         // Gold medals
  countries: 116,     // Countries winning a medal
  perGames: 892.6,    // Average medals per Games
  note: ''            // one sentence if a number differs: which build you kept and why
};

const GAMES = [1992, 1996, 2000, 2004, 2008];
const CITY = { 1992: 'Barcelona', 1996: 'Atlanta', 2000: 'Sydney', 2004: 'Athens', 2008: 'Beijing' };
const HOST = { 1992: 'ESP', 1996: 'USA', 2000: 'AUS', 2004: 'GRE', 2008: 'CHN' };
const HOST_GAMES = { ESP: 1992, USA: 1996, AUS: 2000, GRE: 2004, CHN: 2008 };
const HOST_ORDER = ['ESP', 'USA', 'AUS', 'GRE', 'CHN'];

// Display names for the NOC codes in the file (labels only; the code is the group).
const NAMES = {
  AFG:'Afghanistan', ALG:'Algeria', ARG:'Argentina', ARM:'Armenia', AUS:'Australia', AUT:'Austria',
  AZE:'Azerbaijan', BAH:'Bahamas', BAR:'Barbados', BDI:'Burundi', BEL:'Belgium', BLR:'Belarus',
  BRA:'Brazil', BUL:'Bulgaria', CAN:'Canada', CHI:'Chile', CHN:'China', CMR:'Cameroon',
  COL:'Colombia', CRC:'Costa Rica', CRO:'Croatia', CUB:'Cuba', CZE:'Czech Republic', DEN:'Denmark',
  DOM:'Dominican Republic', ECU:'Ecuador', EGY:'Egypt', ERI:'Eritrea', ESP:'Spain', EST:'Estonia',
  ETH:'Ethiopia', EUN:'Unified Team (1992)', FIN:'Finland', FRA:'France', GBR:'Great Britain',
  GEO:'Georgia', GER:'Germany', GHA:'Ghana', GRE:'Greece', HKG:'Hong Kong', HUN:'Hungary',
  INA:'Indonesia', IND:'India', IOP:'Independent Olympic Participants (1992)', IRI:'Iran',
  IRL:'Ireland', ISL:'Iceland', ISR:'Israel', ITA:'Italy', JAM:'Jamaica', JPN:'Japan',
  KAZ:'Kazakhstan', KEN:'Kenya', KGZ:'Kyrgyzstan', KOR:'South Korea', KSA:'Saudi Arabia',
  KUW:'Kuwait', LAT:'Latvia', LTU:'Lithuania', MAR:'Morocco', MAS:'Malaysia', MDA:'Moldova',
  MEX:'Mexico', MGL:'Mongolia', MKD:'North Macedonia', MOZ:'Mozambique', MRI:'Mauritius',
  NAM:'Namibia', NED:'Netherlands', NGR:'Nigeria', NOR:'Norway', NZL:'New Zealand', PAK:'Pakistan',
  PAN:'Panama', PAR:'Paraguay', PER:'Peru', PHI:'Philippines', POL:'Poland', POR:'Portugal',
  PRK:'North Korea', PUR:'Puerto Rico', QAT:'Qatar', ROU:'Romania', RSA:'South Africa',
  RUS:'Russia', SCG:'Serbia and Montenegro', SIN:'Singapore', SLO:'Slovenia', SRB:'Serbia',
  SRI:'Sri Lanka', SUD:'Sudan', SUI:'Switzerland', SUR:'Suriname', SVK:'Slovakia', SWE:'Sweden',
  SYR:'Syria', TCH:'Czechoslovakia (1992)', TGA:'Tonga', THA:'Thailand', TJK:'Tajikistan',
  TOG:'Togo', TPE:'Chinese Taipei', TRI:'Trinidad and Tobago', TUN:'Tunisia', TUR:'Turkey',
  UAE:'United Arab Emirates', UGA:'Uganda', UKR:'Ukraine', URU:'Uruguay', USA:'United States',
  UZB:'Uzbekistan', VEN:'Venezuela', VIE:'Vietnam', YUG:'Yugoslavia', ZAM:'Zambia', ZIM:'Zimbabwe'
};
const nameOf = noc => NAMES[noc] || noc;

// CSV parser that handles quoted fields (65 event names contain commas).
function parseCSV(text) {
  const rows = []; let row = []; let field = ''; let i = 0; let inQ = false;
  while (i < text.length) {
    const c = text[i];
    if (inQ) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i += 2; continue; } inQ = false; i++; continue; }
      field += c; i++; continue;
    }
    if (c === '"') { inQ = true; i++; continue; }
    if (c === ',') { row.push(field); field = ''; i++; continue; }
    if (c === '\r') { i++; continue; }
    if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; i++; continue; }
    field += c; i++;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  const head = rows.shift();
  return rows.filter(r => r.length === head.length).map(r => Object.fromEntries(head.map((h, j) => [h, r[j]])));
}

// One medal = one Games + discipline + event + event gender + country + medal colour.
// A team's 12 basketball rows share one key, so the team's medal counts once.
const medalKey = r => [r.Edition, r.Discipline, r.Event, r.Event_gender, r.NOC, r.Medal].join('|');

async function loadData() {
  const text = await (await fetch(DATA_FILE)).text();
  const rows = parseCSV(text);
  rows.forEach(r => { r.Edition = +r.Edition; });
  const seen = new Map();
  rows.forEach(r => { const k = medalKey(r); if (!seen.has(k)) seen.set(k, r); });
  return { rows, medals: [...seen.values()] };
}

// The four summary numbers, computed from a list of medals (already deduplicated).
function summarize(medals) {
  const games = new Set(medals.map(m => m.Edition));
  return {
    medals: medals.length,
    gold: medals.filter(m => m.Medal === 'Gold').length,
    countries: new Set(medals.map(m => m.NOC)).size,
    perGames: games.size ? medals.length / games.size : null
  };
}

// Medals per country per Games, and share = country's medals / all medals awarded at that Games.
// `denomMedals` decides the denominator (all medals, or all medals in the selected sports).
function shareTable(medals, denomMedals) {
  const tot = {}; denomMedals.forEach(m => { tot[m.Edition] = (tot[m.Edition] || 0) + 1; });
  const t = {};
  medals.forEach(m => {
    const c = (t[m.NOC] ||= {}); const g = (c[m.Edition] ||= { n: 0, gold: 0 });
    g.n++; if (m.Medal === 'Gold') g.gold++;
  });
  Object.values(t).forEach(c => Object.entries(c).forEach(([y, g]) => { g.share = tot[y] ? 100 * g.n / tot[y] : 0; }));
  return { t, tot };
}
const cell = (st, noc, y) => (st.t[noc] && st.t[noc][y]) || { n: 0, gold: 0, share: 0 };
const mean = a => a.length ? a.reduce((s, x) => s + x, 0) / a.length : null;

const fmtInt = n => n == null ? '—' : Math.round(n).toLocaleString('en-US');
const fmt1 = n => n == null ? '—' : n.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const fmt2 = n => n == null ? '—' : n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Colours come from CSS tokens so light and dark mode each use their own steps.
const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const seriesColor = i => css(`--series-${(i % 8) + 1}`);
const HOST_COLOR = noc => seriesColor(HOST_ORDER.indexOf(noc));

function chartDefaults() {
  Chart.defaults.font.family = 'system-ui, -apple-system, "Segoe UI", sans-serif';
  Chart.defaults.font.size = 12;
  Chart.defaults.color = css('--text-secondary');
  Chart.defaults.borderColor = css('--grid');
  Chart.defaults.plugins.legend.labels.boxWidth = 12;
  Chart.defaults.plugins.legend.labels.boxHeight = 12;
  Chart.defaults.plugins.tooltip.backgroundColor = css('--tooltip-bg');
  Chart.defaults.plugins.tooltip.titleColor = css('--tooltip-ink');
  Chart.defaults.plugins.tooltip.bodyColor = css('--tooltip-ink');
  Chart.defaults.maintainAspectRatio = false;
  Chart.defaults.animation.duration = 250;
}

function setText(id, v) { const el = document.getElementById(id); if (el) el.textContent = v; }
function renderKPIs(s) {
  setText('kpi-medals', fmtInt(s.medals));
  setText('kpi-gold', fmtInt(s.gold));
  setText('kpi-countries', fmtInt(s.countries));
  setText('kpi-pergames', fmt1(s.perGames));
}

// Theme toggle shared by both pages.
function initTheme() {
  const btn = document.getElementById('theme-toggle');
  let saved = null; try { saved = localStorage.getItem('theme'); } catch (e) {}
  if (saved) document.documentElement.setAttribute('data-theme', saved);
  if (!btn) return;
  btn.addEventListener('click', () => {
    const dark = document.documentElement.getAttribute('data-theme') === 'dark' ||
      (!document.documentElement.getAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);
    const next = dark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    location.reload();
  });
}
