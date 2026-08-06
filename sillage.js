window.__flightCanvasSourceRevision = '3t-cycle';
const PROJECT_NAME = 'Sillage du Ciel';
const UNIT = 160;
const MIN_CANVAS_COLS = 4;
const MIN_CANVAS_ROWS = 3;
const FORBIDDEN_EMPTY_RUN = 10;
const PROJECT_DB_NAME = 'flight-canvas-flip-local';
const PROJECT_STORE_NAME = 'projects';
const PROJECT_KEY = 'current-project';

const airportFallback = {
  PEK: { city: '北京', latitude: 40.080, longitude: 116.584 },
  PKX: { city: '北京大兴', latitude: 39.512, longitude: 116.410 },
  PVG: { city: '上海浦东', latitude: 31.143, longitude: 121.805 },
  SHA: { city: '上海虹桥', latitude: 31.198, longitude: 121.336 },
  CAN: { city: '广州', latitude: 23.392, longitude: 113.299 },
  SZX: { city: '深圳', latitude: 22.639, longitude: 113.811 },
  TFU: { city: '成都', latitude: 30.319, longitude: 104.445 },
  CTU: { city: '成都双流', latitude: 30.579, longitude: 103.947 },
  HGH: { city: '杭州', latitude: 30.229, longitude: 120.434 },
  XIY: { city: '西安', latitude: 34.447, longitude: 108.752 },
  KMG: { city: '昆明', latitude: 25.102, longitude: 102.929 },
  URC: { city: '乌鲁木齐', latitude: 43.907, longitude: 87.475 },
};

const defaultTags = [];

const demoFlights = [];

const defaultWidgets = [
  { id: 'default-stack-map', type: 'stack', x: 0, y: 0, w: 4, h: 3, settings: { direction: 'up', duration: 2.5, activeIndex: 1, children: [
    { id: 'default-heatmap', type: 'heatmap', x: 0, y: 0, w: 4, h: 3, settings: { heatmapLocationMode: 'city', airportLabelMode: 'chinese', highlightColor: '#1677c8' }, appearance: 'inherit' },
    { id: 'default-map', type: 'map', x: 0, y: 0, w: 4, h: 3, settings: { airportLabelMode: 'iata', airportVisibility: 'partial', highlightRoutes: '', highlightColor: '#e9573f' }, appearance: 'inherit' },
  ] } },
  { id: 'default-summary', type: 'summary', x: 2, y: 3, w: 1, h: 2, appearance: 'light', settings: { metrics: ['segments', 'airports', 'distance', 'duration'] } },
  { id: 'default-extremes', type: 'extremes', x: 2, y: 5, w: 1, h: 1, settings: { extremeScope: 'airport' } },
  { id: 'default-trend', type: 'trend', x: 2, y: 6, w: 3, h: 1, settings: { chartType: 'line', showValues: false, showAxes: false, showPoints: false, period: 'week' } },
  { id: 'default-calendar', type: 'calendar', x: 4, y: 0, w: 1, h: 1, appearance: 'highlight', settings: { calendarScale: '53weeks', highlightColor: '#e9573f' } },
  { id: 'default-text', type: 'text', x: 0, y: 6, w: 2, h: 1, settings: { text: '', fontFamily: 'zcool-xiaowei', textAlign: 'center', fontSizeOffset: 10 } },
  { id: 'default-stack-ranking', type: 'stack', x: 0, y: 4, w: 2, h: 2, settings: { direction: 'up', duration: 2.5, activeIndex: 0, children: [
    { id: 'default-airport-ranking', type: 'ranking', x: 0, y: 0, w: 2, h: 2, settings: { rankingType: 'airport', airportLabelMode: 'both' } },
    { id: 'default-route-ranking', type: 'ranking', x: 0, y: 0, w: 2, h: 2, settings: { rankingType: 'route', airportLabelMode: 'chinese' } },
  ] } },
  { id: 'default-stack-airline', type: 'stack', x: 4, y: 1, w: 1, h: 2, settings: { direction: 'up', duration: 2.5, activeIndex: 0, children: [
    { id: 'default-airline-ranking', type: 'ranking', x: 0, y: 0, w: 1, h: 2, settings: { rankingType: 'airline', airportLabelMode: 'both' } },
    { id: 'default-aircraft-ranking', type: 'ranking', x: 0, y: 0, w: 1, h: 2, settings: { rankingType: 'aircraft', airportLabelMode: 'both' } },
  ] } },
  { id: 'default-featured', type: 'featured', x: 0, y: 3, w: 2, h: 1, settings: { flightIds: [], airportLabelMode: 'both', showRemark: true, showTags: true, title: '' } },
  { id: 'default-image', type: 'image', x: 3, y: 3, w: 2, h: 3, settings: { imageData: '', imagePreviewData: '', imageScale: 1, imageOffsetX: 0, imageOffsetY: 0, note: '', notePosition: 'bottom' } },
];

const textFontOptions = [
  ['noto-sans', 'Noto Sans SC', '"Noto Sans SC","Microsoft YaHei",sans-serif'],
  ['noto-serif', 'Noto Serif SC', '"Noto Serif SC","Songti SC",serif'],
  ['lxgw-wenkai', '霞鹜文楷', '"LXGW WenKai",KaiTi,serif'],
  ['zcool-xiaowei', '站酷小薇体', '"ZCOOL XiaoWei","Noto Serif SC",serif'],
  ['ibm-plex-mono', 'IBM Plex Mono', '"IBM Plex Mono",ui-monospace,monospace'],
  ['allura', 'Allura', 'Allura,"LXGW WenKai",cursive'],
];

function textFontId(settings = {}) {
  if (textFontOptions.some(([id]) => id === settings.fontFamily)) return settings.fontFamily;
  return { sans: 'noto-sans', serif: 'noto-serif', kai: 'lxgw-wenkai', mono: 'ibm-plex-mono', script: 'allura' }[settings.fontStyle] || 'noto-sans';
}

const widgetDefinitions = {
  stack: { name: '卡片叠放', icon: '▱', category: 'layout', default: { w: 2, h: 2 } },
  featured: { name: '航班卡片', icon: '🎫', category: 'flight', default: { w: 2, h: 1 } },
  summary: { name: '飞行总览', icon: '✨', category: 'statistics', default: { w: 2, h: 2 } },
  ranking: { name: '排行榜', icon: '🏅', category: 'statistics', default: { w: 2, h: 2 } },
  extremes: { name: '地理四极', icon: '🧷', category: 'statistics', default: { w: 2, h: 2 } },
  trend: { name: '飞行趋势', icon: '〽️', category: 'statistics', default: { w: 3, h: 2 } },
  calendar: { name: '飞行日历', icon: '🗓️', category: 'statistics', default: { w: 3, h: 2 } },
  map: { name: '航线地图', icon: '🗺️', category: 'map', default: { w: 4, h: 3 } },
  heatmap: { name: '飞行热力图', icon: '🌡️', category: 'map', default: { w: 3, h: 3 } },
  text: { name: '文字卡片', icon: '💬', category: 'custom', default: { w: 2, h: 1 } },
  image: { name: '图片卡片', icon: '🖼️', category: 'custom', default: { w: 2, h: 2 } },
};

const state = {
  isDemo: true,
  flights: structuredClone(demoFlights),
  tags: structuredClone(defaultTags),
  airports: { ...airportFallback },
  filters: { start: '', end: '', airlines: [], aircraft: [], airlineMode: 'all', aircraftMode: 'all', tags: [] },
  canvas: { cols: 5, rows: 7, theme: 'dark', accent: '#1677c8', font: 'serif', scale: 3, locked: false, originReady: true, stackDirection: 'up', motionCycleSeconds: 9 },
  widgets: structuredClone(defaultWidgets),
  selectedWidgetId: null,
  history: [],
  historyIndex: -1,
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const canvasEl = $('#design-canvas');
const stageEl = $('#canvas-stage');
let toastTimer;
let dragState = null;
let imagePanState = null;
let imageWheelSaveTimer = null;
let stackResizeState = null;
let touchHoldTimer = null;
let touchState = null;
let stagePanState = null;
let viewportScale = null;
let viewportOffsetX = 0;
let viewportOffsetY = 0;
let resizeFrame = null;
let routeMapFrame = null;
let suppressedCardClickId = null;
let persistenceReady = false;
let stackPickerTarget = null;
let exportMode = 'static';
let motionFps = 30;
let lastImportSkippedRows = 0;
let motionCycleSeconds = 8;
let motionExporting = false;
let activeExportFormat = '';
let motionDownloadUrl = '';
let motionPreviewFrame = null;
let motionPreviewStartedAt = 0;
let motionPreviewTime = 0;
let motionPreviewPlaying = false;
let motionPreviewVisible = false;
const leafletMaps = new Map();
const imagePreviewJobs = new Set();

function projectSnapshotLegacy() {
  return { schemaVersion: 3, isDemo: state.isDemo, flights: state.flights, tags: state.tags, filters: state.filters, canvas: state.canvas, widgets: state.widgets, selectedWidgetId: state.selectedWidgetId };
}

function stackChildren(stack) { return stack?.type === 'stack' && Array.isArray(stack.settings?.children) ? stack.settings.children : []; }
function findWidgetById(id) {
  for (const widget of state.widgets) {
    if (widget.id === id) return widget;
    const child = stackChildren(widget).find((item) => item.id === id);
    if (child) return child;
  }
  return null;
}
function parentStackForChild(id) { return state.widgets.find((widget) => widget.type === 'stack' && stackChildren(widget).some((child) => child.id === id)); }
function selectedStackFor(stack) { return stack.id === state.selectedWidgetId || stackChildren(stack).some((child) => child.id === state.selectedWidgetId); }
function renderedMapWidgets() {
  return state.widgets.flatMap((widget) => widget.type === 'stack' ? stackChildren(widget) : [widget]).filter((widget) => widget.type === 'map' || widget.type === 'heatmap');
}
function completeStacks() { return state.widgets.filter((widget) => widget.type === 'stack' && stackChildren(widget).length === 2); }
function motionTimelineDurationLegacy() {
  return completeStacks().length ? motionCycleSeconds : 0;
}

function stackRandomOffset(stack) {
  let hash = 2166136261;
  for (const character of String(stack.id || 'stack')) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967296;
}

function openProjectDb() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) { reject(new Error('IndexedDB unavailable')); return; }
    const request = indexedDB.open(PROJECT_DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(PROJECT_STORE_NAME);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function persistProject() {
  if (!persistenceReady) return;
  try {
    const db = await openProjectDb();
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(PROJECT_STORE_NAME, 'readwrite');
      transaction.objectStore(PROJECT_STORE_NAME).put(projectSnapshot(), PROJECT_KEY);
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
    });
    db.close();
  } catch { /* 浏览器禁用本地存储时仍可正常编辑本次项目 */ }
}

async function restoreProject() {
  try {
    const db = await openProjectDb();
    const saved = await new Promise((resolve, reject) => {
      const request = db.transaction(PROJECT_STORE_NAME, 'readonly').objectStore(PROJECT_STORE_NAME).get(PROJECT_KEY);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    db.close();
    applyProjectState(saved);
  } catch { /* 首次访问或受限环境使用内置示例 */ }
}

function applyProjectState(saved, options = {}) {
  if (!saved || !Array.isArray(saved.flights) || !Array.isArray(saved.widgets)) throw new Error('这不是有效的 Flight Canvas 项目文件。');
  state.isDemo = Boolean(saved.isDemo);
  state.flights = saved.flights;
  state.tags = Array.isArray(saved.tags) ? saved.tags : structuredClone(defaultTags);
  state.filters = { ...defaultFilters(), ...(saved.filters || {}) };
  state.filters.start = normalizeFlightDate(state.filters.start);
  state.filters.end = normalizeFlightDate(state.filters.end);
  if (state.filters.start && state.filters.end && state.filters.start > state.filters.end) [state.filters.start, state.filters.end] = [state.filters.end, state.filters.start];
  if (!saved.filters?.airlineMode) state.filters.airlineMode = 'all';
  if (!saved.filters?.aircraftMode) state.filters.aircraftMode = 'all';
  state.canvas = { ...state.canvas, ...(saved.canvas || {}) };
  if (!Object.hasOwn(saved.canvas || {}, 'originReady')) state.canvas.originReady = false;
  if (!saved.schemaVersion) state.canvas.theme = 'system';
  const normalizeWidget = (widget) => {
    // Export snapshots are transient transport data, never editable project data.
    const { exportMapSnapshot, exportRouteHighlights, ...savedSettings } = widget.settings || {};
    const settings = options.keepExportMapSnapshots
      ? { ...savedSettings, ...(exportMapSnapshot ? { exportMapSnapshot } : {}), ...(exportRouteHighlights ? { exportRouteHighlights } : {}) }
      : savedSettings;
    if (widget.type === 'longest') return { ...widget, type: 'featured', settings: { ...settings, title: settings.title || '最长航班', mode: 'longest', flightIds: [] } };
    if (widget.type === 'records') return normalizeWidget({ ...widget, type: 'summary', settings: { ...settings, metrics: ['segments', 'airports', 'distance'] } });
    if (['airline', 'aircraft', 'airport', 'route'].includes(widget.type)) return normalizeWidget({ ...widget, type: 'ranking', settings: { ...settings, rankingType: widget.type } });
    if (widget.type === 'stack') return { ...widget, settings: { direction: 'up', duration: 2.5, activeIndex: 0, ...settings, children: (settings.children || []).map(normalizeWidget).slice(0, 2) } };
      const defaults = widget.type === 'featured' ? { flightIds: [], airportLabelMode: 'both', showRemark: true, showTags: true }
      : widget.type === 'summary' ? { metrics: ['segments', 'airports'] }
      : widget.type === 'ranking' ? { rankingType: 'airline', airportLabelMode: 'both' }
      : widget.type === 'extremes' ? { extremeScope: 'airport' }
      : widget.type === 'trend' ? { chartType: 'line', showValues: false, showAxes: true, showPoints: true, period: 'month' }
      : widget.type === 'calendar' ? { calendarScale: '53weeks' }
      : widget.type === 'map' ? { airportLabelMode: 'both', airportVisibility: 'all', highlightRoutes: '' }
      : widget.type === 'heatmap' ? { heatmapLocationMode: 'airport', airportLabelMode: 'both' }
      : widget.type === 'text' ? { text: '', fontFamily: 'noto-sans', textAlign: 'center', fontSizeOffset: 0 }
      : widget.type === 'image' ? { imageData: '', imagePreviewData: '', imageScale: 1, imageOffsetX: 0, imageOffsetY: 0, note: '', notePosition: 'bottom-left' }
      : {};
    const normalizedSettings = { ...defaults, ...settings };
    if (widget.type === 'text' && !settings.fontFamily) normalizedSettings.fontFamily = textFontId(settings);
    const appearance = widget.type === 'heatmap' && widget.appearance === 'highlight' ? 'inherit' : widget.appearance;
    return { ...widget, appearance, settings: normalizedSettings };
  };
  state.widgets = saved.widgets.map(normalizeWidget);
  state.selectedWidgetId = saved.selectedWidgetId || null;
}

function saveHistory() {
  const snapshot = JSON.stringify({ flights: state.flights, tags: state.tags, filters: state.filters, canvas: state.canvas, widgets: state.widgets, selectedWidgetId: state.selectedWidgetId, isDemo: state.isDemo });
  if (state.history[state.historyIndex] === snapshot) return;
  state.history = state.history.slice(0, state.historyIndex + 1);
  state.history.push(snapshot);
  state.historyIndex = state.history.length - 1;
  if (state.history.length > 30) { state.history.shift(); state.historyIndex--; }
  updateHistoryButtons();
  persistProject();
}

function restoreHistory(direction) {
  const next = state.historyIndex + direction;
  if (next < 0 || next >= state.history.length) return;
  const restored = JSON.parse(state.history[next]);
  Object.assign(state, restored);
  if (!Object.hasOwn(state.canvas || {}, 'originReady')) state.canvas.originReady = false;
  state.filters = { ...defaultFilters(), ...state.filters };
  if (!state.filters.airlineMode) state.filters.airlineMode = 'all';
  if (!state.filters.aircraftMode) state.filters.aircraftMode = 'all';
  state.historyIndex = next;
  renderAll();
}

function updateHistoryButtons() {
  $('#undo-button').disabled = state.historyIndex <= 0;
  $('#redo-button').disabled = state.historyIndex >= state.history.length - 1;
}

function showToast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char]));
}

function hexToRgb(hex) {
  const value = hex.replace('#', '');
  return `${parseInt(value.slice(0, 2), 16)}, ${parseInt(value.slice(2, 4), 16)}, ${parseInt(value.slice(4, 6), 16)}`;
}

function isDarkHex(hex) {
  const [r, g, b] = hexToRgb(hex).split(',').map((value) => {
    const channel = Number(value) / 255;
    return channel <= .03928 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
  });
  // Linear luminance .39 corresponds to roughly 66% sRGB gray.
  return (r * .2126 + g * .7152 + b * .0722) < .39;
}

function contrastColorForHex(hex) { return isDarkHex(hex) ? '#ffffff' : '#000000'; }

function widgetCustomColor(widget) {
  const color = String(widget?.settings?.highlightColor || state.canvas.accent || '#e9573f');
  return /^#[0-9a-f]{6}$/i.test(color) ? color : '#e9573f';
}

function widgetThemeColor(widget) {
  if (widget?.type === 'heatmap') return widget.settings?.highlightColor ? widgetCustomColor(widget) : state.canvas.accent;
  return widget?.appearance === 'highlight' ? widgetCustomColor(widget) : state.canvas.accent;
}

function widgetAppearanceStyle(widget) {
  if (widget?.appearance !== 'highlight') return '';
  const background = widgetCustomColor(widget);
  const foreground = contrastColorForHex(background);
  if (widget.type === 'map') return `--map-tooltip-bg:${background}b8;--map-tooltip-fg:${foreground};`;
  if (widget.type === 'heatmap') return '';
  const accentContrast = foreground === '#ffffff' ? '#000000' : '#ffffff';
  return `--highlight-bg:${background};--highlight-fg:${foreground};--accent:${foreground};--accent-rgb:${hexToRgb(foreground)};--accent-contrast:${accentContrast};`;
}

function normalizeFlightDate(value) {
  if (value instanceof Date && Number.isFinite(value.getTime())) return value.toISOString().slice(0, 10);
  const text = String(value ?? '').trim();
  if (!text) return '';
  const format = (year, month, day) => {
    const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
    if (date.getUTCFullYear() !== Number(year) || date.getUTCMonth() !== Number(month) - 1 || date.getUTCDate() !== Number(day)) return '';
    return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };
  let match = text.match(/^(\d{4})[-/.年](\d{1,2})[-/.月](\d{1,2})(?:日|\b)/);
  if (match) return format(match[1], match[2], match[3]);
  match = text.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (match) return format(match[1], match[2], match[3]);
  match = text.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2}|\d{4})$/);
  if (match) {
    const year = match[3].length === 2 ? Number(match[3]) + 2000 : match[3];
    const dayFirst = Number(match[1]) > 12;
    return format(year, dayFirst ? match[2] : match[1], dayFirst ? match[1] : match[2]);
  }
  if (/^\d{5}(?:\.\d+)?$/.test(text)) {
    const serial = Number(text);
    const date = new Date(Date.UTC(1899, 11, 30) + Math.floor(serial) * 86400000);
    return Number.isFinite(date.getTime()) ? date.toISOString().slice(0, 10) : '';
  }
  return '';
}

function visibleFlights() {
  const f = state.filters;
  return state.flights.filter((flight) => {
    if (!flight.enabled) return false;
    const date = normalizeFlightDate(flight.date);
    if (f.start && (!date || date < f.start)) return false;
    if (f.end && (!date || date > f.end)) return false;
    if (f.airlineMode !== 'all' && !f.airlines.includes(airlineCode(flight))) return false;
    if (f.aircraftMode !== 'all' && !aircraftTypes(flight).some((type) => f.aircraft.includes(type))) return false;
    if (f.tags.length && !flight.tagIds?.some((tag) => f.tags.includes(tag))) return false;
    return true;
  });
}

function aircraftTypes(flight) { return String(flight.aircraftType || '').split('/').map((type) => type.trim()).filter(Boolean); }
function airlineCode(flight) { return String(flight.flightNumber || '').trim().slice(0, 2).toUpperCase() || '未知'; }
function aggregateByAirlineCode(flights) {
  return Object.values(flights.reduce((result, flight) => {
    const name = airlineCode(flight);
    result[name] ??= { name, count: 0, distance: 0 };
    result[name].count += 1; result[name].distance += Number(flight.distanceKm || 0);
    return result;
  }, {})).sort((a, b) => b.count - a.count || b.distance - a.distance);
}
function aircraftSize(type) {
  const code = String(type || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (/^(?:B73|B75|B707|MD82|MD83|MD88|MD90|A320|A321|A319|A20N|A21N|A19N|C919)/.test(code)) return '窄';
  if (/^(?:A30|A310|A312|A313|A33|A34|A35|A38|B74|B76|B77|B78|IL62|IL86|MD11)/.test(code)) return '宽';
  return '支';
}

function aggregateBy(flights, key) {
  return Object.values(flights.reduce((result, flight) => {
    const name = flight[key] || '未知';
    result[name] ??= { name, count: 0, distance: 0 };
    result[name].count += 1;
    result[name].distance += Number(flight.distanceKm || 0);
    return result;
  }, {})).sort((a, b) => b.count - a.count || b.distance - a.distance);
}

function airportRanking(flights, airportLabelMode = 'both') {
  const counts = {};
  flights.forEach((flight) => [flight.originIata, flight.destinationIata].filter(Boolean).forEach((code) => { counts[code] ??= { name: formatAirportLabel(code, airportLabelMode), count: 0, distance: 0 }; counts[code].count += 1; counts[code].distance += Number(flight.distanceKm || 0); }));
  return Object.values(counts).sort((a, b) => b.count - a.count || b.distance - a.distance);
}

function routeRanking(flights, airportLabelMode = 'both') {
  const counts = {};
  flights.forEach((flight) => { const [first, second] = [flight.originIata, flight.destinationIata].sort(); const key = `${first} - ${second}`; counts[key] ??= { name: `${formatAirportLabel(first, airportLabelMode)} ↔ ${formatAirportLabel(second, airportLabelMode)}`, count: 0, distance: 0 }; counts[key].count += 1; counts[key].distance += Number(flight.distanceKm || 0); });
  return Object.values(counts).sort((a, b) => b.count - a.count || b.distance - a.distance);
}

function geographicExtremes(flights, scope = 'airport') {
  const airportCodes = [...new Set(flights.flatMap((flight) => [flight.originIata, flight.destinationIata]).filter(Boolean))];
  const airports = airportCodes.map((code) => ({ code, ...airportFor(code) })).filter((airport) => airport.latitude || airport.longitude);
  const places = scope === 'city'
    ? Object.values(airports.reduce((result, airport) => {
      const name = String(airport.city || airport.code).split('/')[0].trim() || airport.code;
      result[name] ??= { primary: name, secondary: '', latitude: 0, longitude: 0, count: 0 };
      result[name].latitude += Number(airport.latitude); result[name].longitude += Number(airport.longitude); result[name].count += 1;
      return result;
    }, {})).map((city) => ({ ...city, latitude: city.latitude / city.count, longitude: city.longitude / city.count }))
    : airports.map((airport) => ({ primary: airport.code, secondary: formatAirportLabel(airport.code, 'chinese'), latitude: airport.latitude, longitude: airport.longitude }));
  if (!places.length) return [];
  return [
    { label: '最北', place: [...places].sort((a, b) => b.latitude - a.latitude)[0] },
    { label: '最南', place: [...places].sort((a, b) => a.latitude - b.latitude)[0] },
    { label: '最东', place: [...places].sort((a, b) => b.longitude - a.longitude)[0] },
    { label: '最西', place: [...places].sort((a, b) => a.longitude - b.longitude)[0] },
  ];
}

function airportFor(code) { return state.airports[code?.toUpperCase()] || { city: code || '未知', latitude: 0, longitude: 0 }; }
function formatKm(value) { return `${Math.round(Number(value || 0)).toLocaleString('zh-CN')} km`; }
function tagFor(id) { return state.tags.find((tag) => tag.id === id); }
function routeLabel(flight) { return `${airportFor(flight.originIata).city} - ${airportFor(flight.destinationIata).city}`; }

function cardLayout(widget) {
  const w = Math.max(1, Number(widget?.w) || 1); const h = Math.max(1, Number(widget?.h) || 1);
  return w === 1 && h === 1 ? 'compact' : h > w ? 'portrait' : 'landscape';
}

function airportCityName(airport) {
  return String(airport?.city || airport?.code || '未知').split('/')[0].trim() || '未知';
}

function formatAirportLabel(code, mode = 'both', options = {}) {
  const iata = String(code || '').toUpperCase() || '---'; const airport = airportFor(iata);
  if (options.cityOnly) return airportCityName(airport);
  const chinese = String(airport.city || iata).trim() || iata;
  if (mode === 'iata') return iata;
  if (mode === 'chinese') return chinese;
  return `${chinese} ${iata}`;
}

function parseFlightMinutes(value) {
  const match = String(value || '').trim().match(/^(\d{1,2}):(\d{2})$/); if (!match) return null;
  const hours = Number(match[1]); const minutes = Number(match[2]);
  return hours < 24 && minutes < 60 ? hours * 60 + minutes : null;
}

function flightDurationMinutes(flight) {
  const departure = parseFlightMinutes(flight?.departureTime); const arrival = parseFlightMinutes(flight?.arrivalTime);
  if (departure == null || arrival == null) return null;
  return (arrival < departure ? arrival + 1440 : arrival) - departure;
}

function formatDuration(flights) {
  const total = flights.map(flightDurationMinutes).filter((minutes) => minutes != null).reduce((sum, value) => sum + value, 0);
  if (!total) return '--';
  const hours = Math.floor(total / 60); const minutes = total % 60;
  return hours < 100 ? `${hours} h${minutes ? ` ${minutes} m` : ''}` : `${hours} h`;
}

function formatSummaryDuration(flights) {
  const total = flights.map(flightDurationMinutes).filter((minutes) => minutes != null).reduce((sum, value) => sum + value, 0);
  if (!total) return '--';
  return (total / 60).toLocaleString('zh-CN', { maximumFractionDigits: 1 });
}

function rankingItems(flights, type, airportLabelMode = 'both') {
  if (type === 'airline') return aggregateByAirlineCode(flights);
  if (type === 'aircraft') return aggregateBy(flights, 'aircraftType');
  if (type === 'airport') return airportRanking(flights, airportLabelMode);
  if (type === 'city') {
    const counts = {};
    flights.forEach((flight) => [flight.originIata, flight.destinationIata].filter(Boolean).forEach((code) => {
      const city = airportCityName(airportFor(code)); counts[city] ??= { name: city, count: 0, distance: 0 };
      counts[city].count += 1; counts[city].distance += Number(flight.distanceKm || 0);
    }));
    return Object.values(counts).sort((a, b) => b.count - a.count || b.distance - a.distance);
  }
  return routeRanking(flights, airportLabelMode);
}

function renderAll() {
  ensureCanvasOrigin();
  syncCanvasBounds();
  renderSidebars();
  renderCanvas();
  fitCanvas();
  scheduleMissingImagePreviews();
}

function renderSidebars() {
  const visible = visibleFlights();
  $('#visible-flight-count').textContent = `${visible.length} 条航班`;
  $('#drop-zone').classList.toggle('awaiting-import', state.isDemo || !state.flights.length);
  $('#clear-flights').disabled = !state.flights.length;
  const airlines = [...new Set(state.flights.map(airlineCode).filter(Boolean))];
  renderFilterChips('airline-filters', airlines, state.filters.airlineMode === 'all' ? airlines : state.filters.airlines, 'airline');
  renderAircraftFilter();
  const activeFilterCount = Number(Boolean(state.filters.start || state.filters.end)) + Number(state.filters.airlineMode !== 'all') + Number(state.filters.aircraftMode !== 'all') + state.filters.tags.length;
  $('#filter-active-count').textContent = activeFilterCount ? `${activeFilterCount} 项已启用` : '未启用';
  renderTagManager();
  $('#filter-date-start').value = state.filters.start;
  $('#filter-date-end').value = state.filters.end;
  renderFlightTable();
  renderCatalog();
  renderInspector();
  updateInspectorContrast();
  $('#canvas-size-label').textContent = `${state.canvas.cols} x ${state.canvas.rows}`;
  $('#canvas-pixels').textContent = `${state.canvas.cols * UNIT} x ${state.canvas.rows * UNIT} px`;
  const preview = $('#canvas-preview');
  preview.className = `canvas-preview theme-${state.canvas.theme} font-${state.canvas.font}`;
  preview.style.setProperty('--preview-accent', state.canvas.accent);
  $$('#theme-mode button').forEach((button) => button.classList.toggle('selected', button.dataset.value === state.canvas.theme));
  $$('#font-mode button').forEach((button) => button.classList.toggle('selected', button.dataset.value === state.canvas.font));
  $$('[data-global-stack-direction]').forEach((button) => button.classList.toggle('selected', button.dataset.globalStackDirection === (state.canvas.stackDirection || 'up')));
  $$('#accent-swatches button').forEach((button) => button.classList.toggle('selected', button.dataset.color === state.canvas.accent));
  $('#accent-custom').value = state.canvas.accent;
  $('#accent-custom-picker').style.setProperty('--picker-color', state.canvas.accent);
  $$('#export-scale button').forEach((button) => button.classList.toggle('selected', Number(button.dataset.value) === state.canvas.scale));
  const bg = state.canvas.theme === 'light' ? '浅色背景' : state.canvas.theme === 'dark' ? '暗色背景' : '透明背景';
  const exportPixels = `${state.canvas.cols * UNIT * state.canvas.scale} x ${state.canvas.rows * UNIT * state.canvas.scale}`;
  $('#export-summary').textContent = `${exportPixels} px，${bg}`;
  $('#export-pixel-size').textContent = `实际像素 ${exportPixels}`;
  renderExportControls();
  updateHistoryButtons();
}

function renderExportControlsLegacy() {
  const stacks = completeStacks();
  if (!stacks.length && motionPreviewVisible) hideMotionPreview(true);
  $$('[data-export-mode]').forEach((button) => { button.classList.toggle('selected', button.dataset.exportMode === exportMode); button.disabled = motionExporting; });
  $$('[data-export-panel]').forEach((panel) => panel.classList.toggle('active', panel.dataset.exportPanel === exportMode));
  $$('[data-motion-fps]').forEach((button) => { button.classList.toggle('selected', Number(button.dataset.motionFps) === motionFps); button.disabled = motionExporting; });
  $('#preview-motion').disabled = !stacks.length || motionExporting;
  $('#stop-motion-preview').disabled = !motionPreviewVisible;
  $('#motion-preview-scrubber').disabled = !stacks.length || motionExporting;
  $('#download-mov').disabled = !stacks.length || motionExporting;
  $('#download-mov').textContent = motionExporting ? '正在生成 MOV…' : '导出 MOV';
  updateMotionPreviewControls();
}

function renderFilterChips(containerId, values, active, filter) {
  $(`#${containerId}`).innerHTML = values.map((value) => `<button class="filter-chip ${active.includes(value) ? 'active' : ''}" data-filter="${filter}" data-value="${escapeHtml(value)}" type="button">${escapeHtml(value)}</button>`).join('') || '<span class="muted-inline">暂无数据</span>';
}

function renderAircraftFilter() {
  const types = [...new Set(state.flights.flatMap(aircraftTypes))].sort();
  const selected = state.filters.aircraftMode === 'all' ? types : state.filters.aircraft;
  const groupData = ['宽', '窄', '支'].map((size) => ({ size, items: types.filter((type) => aircraftSize(type) === size) })).filter((group) => group.items.length);
  const groups = groupData.map(({ size, items }) => `<section class="aircraft-filter-group"><span class="aircraft-filter-size">${size}</span><div class="aircraft-filter-items">${items.map((type) => `<button class="filter-chip aircraft-chip ${selected.includes(type) ? 'active' : ''}" data-filter="aircraft" data-value="${escapeHtml(type)}" type="button">${escapeHtml(type)}</button>`).join('')}</div></section>`).join('');
  const columns = groupData.map(({ items }) => `${Math.sqrt(items.length).toFixed(3)}fr`).join(' ');
  $('#aircraft-filters').innerHTML = groups ? `<div class="aircraft-filter-grid" style="grid-template-columns:${columns}">${groups}</div>` : '<span class="muted-inline">暂无数据</span>';
}

function renderFlightTable() {
  const visibleIds = new Set(visibleFlights().map((flight) => flight.id));
  $('#flight-table').innerHTML = state.flights.map((flight) => {
    const tag = tagFor(flight.primaryTagId);
    const options = [`<option value="">未标记</option>`, ...state.tags.map((item) => `<option value="${item.id}" ${item.id === flight.primaryTagId ? 'selected' : ''}>${escapeHtml(item.name)}</option>`)].join('');
    return `<div class="flight-row ${visibleIds.has(flight.id) ? '' : 'filtered-out'}" data-flight-id="${flight.id}">
      <input type="checkbox" ${flight.enabled ? 'checked' : ''} aria-label="是否展示 ${escapeHtml(flight.flightNumber || routeLabel(flight))}" />
      <div class="flight-main"><div class="flight-route">${escapeHtml(flight.originIata)} <span>→</span> ${escapeHtml(flight.destinationIata)} <b>${escapeHtml(flight.flightNumber || '')}</b></div><div class="flight-meta">${escapeHtml(flight.date || '日期未知')} · ${escapeHtml(flight.registration || '注册号未知')} · ${escapeHtml(flight.remark || '无备注')}</div></div>
      <select class="flight-tag-select" style="--tag-color:${tag?.color || '#c7d1cd'}" aria-label="${escapeHtml(flight.flightNumber || routeLabel(flight))} 标签">${options}</select>
    </div>`;
  }).join('') || '<div class="empty-widget">没有可用航班记录</div>';
}

function renderTagManager() {
  const tags = state.tags.map((tag) => `<div class="tag-editor-row" data-tag-id="${tag.id}"><label class="color-ring-picker tag-color-picker" style="--picker-color:${tag.color}" title="${escapeHtml(tag.name)} 颜色"><input data-tag-color="${tag.id}" type="color" value="${tag.color}" aria-label="${escapeHtml(tag.name)} 颜色"/></label><input data-tag-name="${tag.id}" type="text" maxlength="16" size="${Math.max(2, [...tag.name].length)}" value="${escapeHtml(tag.name)}" aria-label="标签名称"/><button class="tag-remove" data-remove-tag="${tag.id}" type="button" aria-label="删除 ${escapeHtml(tag.name)}"></button></div>`).join('');
  const nextColor = ['#e9573f', '#1677c8', '#16856d', '#d18919'][state.tags.length % 4];
  $('#tag-manager').innerHTML = `<div class="tag-editor-grid">${tags}<form class="tag-editor-row tag-add-row" id="tag-add-form"><label class="color-ring-picker tag-color-picker" style="--picker-color:${nextColor}" title="新标签颜色"><input id="new-tag-color" type="color" value="${nextColor}" aria-label="新标签颜色"/></label><input id="new-tag-name" type="text" maxlength="16" placeholder="添加标签" aria-label="添加标签"/></form></div>`;
}

function renderCatalog() {
  const catalog = $('#widget-buttons');
  const categories = [{ id: 'layout', label: '布局' }, { id: 'flight', label: '航班类' }, { id: 'statistics', label: '统计类' }, { id: 'map', label: '地图类' }, { id: 'custom', label: '自定类' }];
  catalog.innerHTML = categories.map((category) => {
    const cards = Object.entries(widgetDefinitions).filter(([, definition]) => definition.category === category.id).map(([type, definition]) => `<button class="widget-add" data-add-widget="${type}" type="button"><span class="widget-catalog-icon" aria-hidden="true">${definition.icon}</span><strong>${definition.name}</strong></button>`).join('');
    return `<section class="card-catalog-group"><h3>${category.label}</h3><div class="card-catalog-grid">${cards}</div></section>`;
  }).join('');
  catalog.querySelectorAll('[data-add-widget]').forEach((button) => {
    button.addEventListener('pointerenter', () => showCatalogPreview(button.dataset.addWidget, button));
    button.addEventListener('pointerleave', hideCatalogPreview);
    button.addEventListener('mouseenter', () => showCatalogPreview(button.dataset.addWidget, button));
    button.addEventListener('mouseleave', hideCatalogPreview);
    button.addEventListener('focus', () => showCatalogPreview(button.dataset.addWidget, button));
    button.addEventListener('blur', hideCatalogPreview);
  });
}

function showCatalogPreview(type, trigger) {
  const definition = widgetDefinitions[type]; if (!definition) return;
  const existing = state.widgets.find((item) => item.type === type);
  const widget = { id: `catalog-${type}`, type, ...definition.default, settings: existing?.settings || (type === 'featured' ? { title: '', flightIds: [] } : type === 'stack' ? { children: [] } : {}) };
  const preview = $('#card-hover-preview'); const rect = trigger.getBoundingClientRect();
  const previewUnit = 80; const maxWidth = 360; const maxHeight = 260;
  const scale = Math.min(1, maxWidth / (widget.w * previewUnit), maxHeight / (widget.h * previewUnit));
  const width = Math.round(widget.w * previewUnit * scale); const height = Math.round(widget.h * previewUnit * scale);
  preview.style.width = `${width}px`; preview.style.height = `${height}px`;
  preview.style.left = `${Math.max(12, Math.min(window.innerWidth - width - 12, rect.left + rect.width / 2 - width / 2))}px`;
  preview.style.top = `${Math.max(12, rect.top - height - 10)}px`;
  preview.innerHTML = `<div class="catalog-preview-card widget-${type}">${renderWidgetContent(widget)}</div>`;
  if (preview.showPopover && !preview.matches(':popover-open')) preview.showPopover();
  preview.setAttribute('aria-hidden', 'false');
  preview.classList.add('show');
}

function hideCatalogPreview() {
  const preview = $('#card-hover-preview'); preview.classList.remove('show');
  preview.setAttribute('aria-hidden', 'true');
  if (preview.hidePopover && preview.matches(':popover-open')) preview.hidePopover();
}

function highlightRouteInputValidation(input) {
  const entries = String(input || '').split(/[;；\n]+/).map((entry) => entry.trim()).filter(Boolean);
  const errors = [];
  const seen = new Set();
  const availableRoutes = new Set(state.flights.map((flight) => `${String(flight.originIata || '').toUpperCase()}-${String(flight.destinationIata || '').toUpperCase()}`));
  if (entries.length > 3) errors.push('最多输入 3 条航线');
  entries.forEach((entry) => {
    const match = entry.toUpperCase().match(/^([A-Z]{3})\s*[-–—>→]\s*([A-Z]{3})$/);
    if (!match) { errors.push(`${entry} 格式不正确`); return; }
    const route = `${match[1]}-${match[2]}`;
    if (seen.has(route)) { errors.push(`${route} 重复`); return; }
    seen.add(route);
    if (!availableRoutes.has(route)) errors.push(`${route} 不在航班列表中`);
  });
  return { valid: errors.length === 0, message: errors.join('；') };
}

function renderMapSettings(widget) {
  const value = widget.settings?.highlightRoutes || '';
  const validation = highlightRouteInputValidation(value);
  const visibility = ['none', 'partial', 'all'].includes(widget.settings?.airportVisibility) ? widget.settings.airportVisibility : 'all';
  const visibilityOptions = [['none', '不显示'], ['partial', '部分显示'], ['all', '全部显示']].map(([mode, label]) => `<button class="${visibility === mode ? 'active-choice' : ''}" data-map-airport-visibility="${widget.id}" data-value="${mode}" type="button">${label}</button>`).join('');
  const color = widgetThemeColor(widget);
  return `${renderAirportLabelSettings(widget)}<div class="inspector-label">显示机场</div><div class="inspector-actions segmented-choice">${visibilityOptions}</div><div class="inspector-label">高光航线（最多 3 条）</div><div class="map-highlight-input${validation.valid ? '' : ' is-invalid'}"><input class="inspector-input" data-map-highlight-routes="${widget.id}" type="text" maxlength="47" value="${escapeHtml(value)}" placeholder="PEK-SHA;PVG-CAN" aria-invalid="${!validation.valid}"/><span class="map-highlight-error" title="${escapeHtml(validation.message)}" aria-label="${escapeHtml(validation.message)}">!</span></div><div class="inspector-label">地图操作</div><div class="inspector-actions"><button class="map-reset-button" data-reset-map-view="${widget.id}" style="--map-action-color:${color};--map-action-contrast:${contrastColorForHex(color)}" type="button">↺ 重置视角</button></div>`;
}

function renderHeatmapSettings(widget) {
  const locationMode = widget.settings?.heatmapLocationMode === 'city' ? 'city' : 'airport';
  const locationOptions = [['airport', '机场'], ['city', '城市']].map(([value, label]) => `<button class="${locationMode === value ? 'active-choice' : ''}" data-heatmap-location="${widget.id}" data-value="${value}" type="button">${label}</button>`).join('');
  const labelSettings = locationMode === 'airport' ? renderAirportLabelSettings(widget) : '';
  const color = widgetThemeColor(widget);
  return `<div class="inspector-label">显示</div><div class="inspector-actions segmented-choice">${locationOptions}</div>${labelSettings}<div class="inspector-label">地图操作</div><div class="inspector-actions"><button class="map-reset-button" data-reset-map-view="${widget.id}" style="--map-action-color:${color};--map-action-contrast:${contrastColorForHex(color)}" type="button">↺ 重置视角</button></div>`;
}

function updateMapHighlightInputValidation(input) {
  const validation = highlightRouteInputValidation(input.value);
  const wrapper = input.closest('.map-highlight-input');
  const error = wrapper?.querySelector('.map-highlight-error');
  wrapper?.classList.toggle('is-invalid', !validation.valid);
  input.setAttribute('aria-invalid', String(!validation.valid));
  if (error) {
    error.title = validation.message;
    error.setAttribute('aria-label', validation.message);
  }
}

function renderStackInspectorLegacy(stack) {
  const children = stackChildren(stack);
  const slots = [0, 1].map((index) => {
    const child = children[index];
    if (!child) return `<div class="stack-inspector-slot"><span>${String(index + 1).padStart(2, '0')}</span><strong>空位</strong><button data-open-stack-picker="${stack.id}" data-stack-slot="${index}" type="button">添加</button></div>`;
    return `<div class="stack-inspector-slot"><span>${String(index + 1).padStart(2, '0')}</span><button class="stack-inspector-select" data-select-widget="${child.id}" type="button">${escapeHtml(widgetDefinitions[child.type]?.name || '卡片')}</button><button data-remove-stack-child="${child.id}" type="button">移出</button></div>`;
  }).join('');
  const activeOptions = children.map((child, index) => `<button class="${Number(stack.settings?.activeIndex || 0) === index ? 'active-choice' : ''}" data-stack-active="${stack.id}" data-value="${index}" type="button">${index + 1}</button>`).join('');
  const duration = Number(stack.settings?.duration || 2.5);
  $('#card-inspector').innerHTML = `<div class="inspector-card"><div class="inspector-title"><span aria-hidden="true">▱</span>卡片叠放</div><div class="inspector-label">叠放内容</div><div class="stack-inspector-slots">${slots}</div>${children.length ? `<div class="inspector-label">默认显示</div><div class="inspector-actions">${activeOptions}</div>` : ''}<div class="inspector-label">滑动方向</div><div class="inspector-actions">${directions}</div><div class="inspector-label">动画时长</div><div class="stack-duration-row"><input data-stack-duration="${stack.id}" type="range" min="1" max="5" step="0.5" value="${duration}" /><output>${duration.toFixed(1)} 秒</output></div><div class="inspector-actions"><button data-dissolve-stack="${stack.id}" type="button">解散叠放</button></div></div>`;
  $('#card-inspector').classList.add('show');
}

function renderInspector() {
  const widget = findWidgetById(state.selectedWidgetId);
  if (!widget) { $('#card-inspector').innerHTML = ''; $('#card-inspector').classList.remove('show'); return; }
  if (widget.type === 'stack') { renderStackInspector(widget); return; }
  const definition = widgetDefinitions[widget.type];
  if (!definition) { state.selectedWidgetId = null; $('#card-inspector').innerHTML = ''; $('#card-inspector').classList.remove('show'); return; }
  const parentStack = parentStackForChild(widget.id);
  const sizeTarget = parentStack || widget;
  const appearance = widget.appearance || 'inherit';
  const appearanceChoices = [['inherit', '随画布'], ['light', '明亮'], ['dark', '黑暗']];
  const appearanceOptions = appearanceChoices.map(([value, label]) => `<button class="${appearance === value ? 'active-choice' : ''}" data-widget-appearance="${widget.id}" data-value="${value}" type="button">${label}</button>`).join('');
  const customSize = `<div class="custom-size-row inspector-compact-size"><input data-card-width="${sizeTarget.id}" type="number" min="1" max="9" value="${sizeTarget.w}" aria-label="卡片宽度" title="宽度" /><span aria-hidden="true">×</span><input data-card-height="${sizeTarget.id}" type="number" min="1" max="9" value="${sizeTarget.h}" aria-label="卡片高度" title="高度" /></div>`;
  const customColor = widgetCustomColor(widget);
  const customColorSelected = widget.type === 'heatmap' ? Boolean(widget.settings?.highlightColor) : appearance === 'highlight';
  const colorOptions = ['#e9573f', '#16856d', '#1677c8'].map((color) => `<button class="inspector-color-swatch${customColorSelected && customColor.toLowerCase() === color ? ' selected' : ''}" data-widget-highlight-color="${widget.id}" data-color="${color}" type="button" style="--swatch:${color}" aria-label="选择颜色 ${color}" title="${color}"></button>`).join('');
  const colorPicker = `<label class="inspector-color-picker color-ring-picker" style="--picker-color:${customColor}" title="自定义颜色"><input data-widget-highlight-custom="${widget.id}" type="color" value="${customColor}" aria-label="自定义卡片颜色" /></label>`;
  const cardSettings = widget.type === 'featured' ? renderFlightCardSettings(widget)
    : widget.type === 'summary' ? renderSummarySettings(widget)
    : widget.type === 'ranking' ? renderRankingSettings(widget)
    : widget.type === 'extremes' ? renderExtremesSettings(widget)
    : widget.type === 'trend' ? renderTrendSettings(widget)
    : widget.type === 'calendar' ? renderCalendarSettings(widget)
    : widget.type === 'text' ? renderTextSettings(widget)
    : widget.type === 'image' ? renderImageSettings(widget)
    : widget.type === 'map' ? renderMapSettings(widget)
    : widget.type === 'heatmap' ? renderHeatmapSettings(widget) : '';
  const removeAction = parentStack ? `<button class="inspector-remove-child" data-remove-stack-child="${widget.id}" type="button">移出叠放</button>` : `<button class="inspector-delete-button" data-remove-widget="${widget.id}" type="button">删除</button>`;
  const specificSettings = cardSettings ? `<div class="inspector-specific">${cardSettings}</div>` : '';
  $('#card-inspector').innerHTML = `<div class="inspector-card"><div class="inspector-watermark">${escapeHtml(definition.name)}</div><div class="inspector-common-grid"><div class="inspector-common-size"><div class="inspector-label">尺寸</div>${customSize}</div><div class="inspector-common-appearance"><div class="inspector-label">外观</div><div class="inspector-actions inspector-appearance-actions segmented-choice">${appearanceOptions}</div></div><div class="inspector-common-action">${removeAction}</div><div class="inspector-color-row"><span class="inspector-color-label">自定</span>${colorOptions}${colorPicker}</div></div>${specificSettings}</div>`;
  $('#card-inspector').classList.add('show');
}

function renderCanvas() {
  cancelAnimationFrame(routeMapFrame);
  disposeRouteMaps();
  updateCanvasDimensions();
  const hasExpandedStack = state.widgets.some((widget) => widget.type === 'stack' && selectedStackFor(widget)) && !motionPreviewVisible;
  canvasEl.className = `design-canvas theme-${state.canvas.theme} font-${state.canvas.font}${state.canvas.locked ? ' locked' : ''}${state.selectedWidgetId ? ' has-selection' : ''}${hasExpandedStack ? ' has-expanded-stack' : ''}`;
  $('#canvas-scale').className = 'canvas-scale';
  document.documentElement.style.setProperty('--accent', state.canvas.accent);
  document.documentElement.style.setProperty('--accent-rgb', hexToRgb(state.canvas.accent));
  document.documentElement.style.setProperty('--accent-contrast', contrastColorForHex(state.canvas.accent));
  const canvasIsDark = state.canvas.theme === 'dark' || (state.canvas.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.style.setProperty('--canvas-overlay-text', canvasIsDark ? '#b8b8bd' : '#73737a');
  document.documentElement.style.setProperty('--canvas-overlay-muted', canvasIsDark ? '#98989f' : '#8e8e93');
  document.documentElement.style.setProperty('--canvas-overlay-popup-bg', canvasIsDark ? 'rgba(20,20,22,.88)' : 'rgba(255,255,255,.9)');
  document.documentElement.style.setProperty('--canvas-overlay-popup-border', canvasIsDark ? 'rgba(255,255,255,.15)' : 'rgba(60,60,67,.14)');
  document.documentElement.style.setProperty('--github-logo-filter', canvasIsDark ? 'grayscale(1) brightness(0) invert(1) drop-shadow(0 1px 3px rgba(0,0,0,.95)) drop-shadow(0 0 6px rgba(0,0,0,.72))' : 'grayscale(1) brightness(0) drop-shadow(0 0 3px rgba(255,255,255,.98)) drop-shadow(0 0 7px rgba(255,255,255,.78))');
  document.documentElement.style.setProperty('--carto-attribution-color', canvasIsDark ? '#ffffff' : '#111111');
  document.documentElement.style.setProperty('--carto-attribution-edge', canvasIsDark ? '0 1px 3px rgba(0,0,0,.95),0 0 6px rgba(0,0,0,.72)' : '0 0 3px rgba(255,255,255,.98),0 0 7px rgba(255,255,255,.78)');
  document.documentElement.style.setProperty('--disclaimer-color', canvasIsDark ? '#ffffff' : '#111111');
  document.documentElement.style.setProperty('--disclaimer-edge', canvasIsDark ? '0 1px 3px rgba(0,0,0,.95),0 0 6px rgba(0,0,0,.72)' : '0 0 3px rgba(255,255,255,.98),0 0 7px rgba(255,255,255,.78)');
  canvasEl.innerHTML = state.widgets.map((widget) => renderWidget(widget)).join('');
  canvasEl.querySelectorAll('.widget').forEach(bindWidgetInteractions);
  routeMapFrame = requestAnimationFrame(() => { routeMapFrame = null; initializeRouteMaps(); });
  requestAnimationFrame(positionCardInspector);
  if (motionPreviewVisible) requestAnimationFrame(() => applyMotionFrameToCanvas(motionPreviewTime));
}

function updateCanvasDimensions() {
  const width = state.canvas.cols * UNIT;
  const height = state.canvas.rows * UNIT;
  canvasEl.style.setProperty('--cols', state.canvas.cols);
  canvasEl.style.setProperty('--rows', state.canvas.rows);
  canvasEl.style.width = `${width}px`;
  canvasEl.style.height = `${height}px`;
  const scaleSurface = $('#canvas-scale');
  scaleSurface.style.width = `${width * currentCanvasScale()}px`;
  scaleSurface.style.height = `${height * currentCanvasScale()}px`;
}

function positionCardInspector() {
  const inspector = $('#card-inspector'); const selected = canvasEl.querySelector('.widget.selected');
  if (!selected || !inspector.classList.contains('show')) return;
  const rect = selected.getBoundingClientRect(); const width = inspector.offsetWidth || 310; const left = rect.right + 14 + width <= window.innerWidth ? rect.right + 14 : Math.max(12, rect.left - width - 14);
  inspector.style.left = `${left}px`;
  inspector.style.top = `${Math.max(14, Math.min(window.innerHeight - inspector.offsetHeight - 14, rect.top))}px`;
}

function renderWidget(widget) {
  const definition = widgetDefinitions[widget.type];
  if (widget.type === 'stack') return renderStackWidget(widget);
  const selected = widget.id === state.selectedWidgetId ? ' selected' : '';
  const style = `grid-column:${widget.x + 1} / span ${widget.w};grid-row:${widget.y + 1} / span ${widget.h};${widgetAppearanceStyle(widget)}`;
  return `<article class="widget widget-${widget.type} appearance-${widget.appearance || 'inherit'}${selected}" data-widget-id="${widget.id}" data-card-layout="${cardLayout(widget)}" style="${style}" tabindex="0" aria-label="${escapeHtml(definition.name)}" aria-selected="${widget.id === state.selectedWidgetId}"><div class="widget-content" data-card-layout="${cardLayout(widget)}">${renderWidgetContent(widget)}</div></article>`;
}

function renderStackWidget(stack) {
  const children = stackChildren(stack);
  const expanded = !motionPreviewVisible && selectedStackFor(stack);
  const activeIndex = Math.min(children.length - 1, Math.max(0, Number(stack.settings?.activeIndex || 0)));
  const activeChild = children[Math.max(0, activeIndex)];
  const style = `grid-column:${stack.x + 1} / span ${stack.w};grid-row:${stack.y + 1} / span ${stack.h};`;
  const childIds = children.map((child) => child.id).join(' ');
  let content;
  if (!expanded) {
    const renderMotionLayer = (child, role, transform = '') => child ? `<div class="stack-motion-card stack-motion-${role} widget-${child.type} appearance-${child.appearance || 'inherit'}" data-stack-motion-layer="${role}" data-stack-motion-child="${child.id}" style="${transform}${widgetAppearanceStyle(child)}"><div class="widget-content">${renderWidgetContent(child)}</div></div>` : '';
    let face;
    if (children.length === 2) {
      const rearChild = children[1 - activeIndex];
      face = `${renderMotionLayer(rearChild, 'rear', 'visibility:hidden;opacity:0;')}${renderMotionLayer(activeChild, 'front')}`;
    } else {
      face = activeChild ? renderMotionLayer(activeChild, 'front') : `<div class="stack-empty-collapsed"><span aria-hidden="true">+</span></div>`;
    }
    const add = children.length < 2 ? `<button class="stack-collapsed-add" data-open-stack-picker="${stack.id}" data-stack-slot="${children.length}" type="button" aria-label="向叠放添加卡片">+</button>` : '';
    content = `<div class="stack-shell">${face}${children.length ? '<span class="stack-motion-badge" aria-label="循环叠放" title="循环叠放">叠放</span>' : ''}${add}</div>`;
  } else {
    const slots = [0, 1].map((index) => {
      const child = children[index];
      if (!child) return `<button class="stack-empty-slot" data-open-stack-picker="${stack.id}" data-stack-slot="${index}" type="button"><span aria-hidden="true">+</span><small>添加卡片</small></button>`;
      const definition = widgetDefinitions[child.type];
      const selected = child.id === state.selectedWidgetId ? ' selected-child' : '';
      return `<section class="stack-child-card widget-${child.type} appearance-${child.appearance || 'inherit'}${selected}" data-stack-child-id="${child.id}" style="${widgetAppearanceStyle(child)}" tabindex="0" aria-label="${escapeHtml(definition?.name || '卡片')}" aria-selected="${child.id === state.selectedWidgetId}"><span class="stack-child-label">${index + 1} · ${escapeHtml(definition?.name || '卡片')}</span><div class="widget-content">${renderWidgetContent(child)}</div></section>`;
    }).join('');
    content = `<div class="stack-shell stack-expanded-shell"><div class="stack-expanded-header"><strong>卡片叠放</strong><span>${children.length} / 2</span></div>${slots}</div>`;
  }
  const resizeHandle = expanded && !state.canvas.locked ? `<button class="stack-resize-handle" data-stack-resize="${stack.id}" type="button" aria-label="拖动调整叠放大小" title="拖动调整大小"></button>` : '';
  return `<article class="widget widget-stack${expanded ? ' selected stack-expanded' : ''}" data-widget-id="${stack.id}" data-stack-children="${childIds}" style="${style}" tabindex="0" aria-label="卡片叠放" aria-selected="${expanded}">${content}${resizeHandle}</article>`;
}

function renderWidgetContent(widget) {
  const flights = visibleFlights();
  if (widget.type === 'stack') return '<div class="stack-empty-collapsed"><span aria-hidden="true">+</span></div>';
  if (widget.type === 'map') return renderMap(widget, flights);
  if (widget.type === 'heatmap') return renderHeatmap(flights, widget);
  if (widget.type === 'text') return renderTextCard(widget);
  if (widget.type === 'image') return renderImageCard(widget);
  if (!flights.length) return '<div class="empty-widget">当前筛选下没有航班<br />请调整数据或筛选条件</div>';
  if (widget.type === 'summary') return renderSummary(flights, widget);
  if (widget.type === 'ranking') return renderRanking(rankingItems(flights, widget.settings?.rankingType, widget.settings?.airportLabelMode), widget);
  if (widget.type === 'extremes') return renderExtremes(geographicExtremes(flights, widget.settings?.extremeScope), widget);
  if (widget.type === 'featured') return renderFlightCards(widget, flights);
  if (widget.type === 'trend') return renderTrend(flights, widget);
  if (widget.type === 'calendar') return renderCalendar(flights, widget);
  if (widget.type === 'records') return renderRecords(flights);
  return '<div class="empty-widget">组件即将加入</div>';
}

function renderMap(widget, flights) {
  const mode = widget.appearance === 'light' || widget.appearance === 'dark' ? widget.appearance : 'system';
  const resolvedMode = mode === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : mode;
  if (widget.settings?.exportMapSnapshot) return `<div class="route-map route-map-${resolvedMode} route-map-snapshot" data-route-map="${widget.id}" aria-label="航线地图"><img src="${widget.settings.exportMapSnapshot}" alt=""/>${renderRouteHighlightOverlay(widget.settings.exportRouteHighlights)}<span class="map-caption">${flights.length ? `${flights.length} 条航段` : '等待数据'}</span></div>`;
  if (!window.L) return `<div class="route-map route-map-${resolvedMode} route-map-unavailable" data-route-map="${widget.id}" aria-label="航线地图"><span>地图资源尚未加载</span></div>`;
  return `<div class="route-map route-map-${resolvedMode}" data-route-map="${widget.id}" aria-label="航线地图"><span class="map-caption">${flights.length ? `${flights.length} 条航段` : '等待数据'}</span></div>`;
}

function disposeRouteMaps() {
  leafletMaps.forEach((map) => map.remove());
  leafletMaps.clear();
}

function heatmapAirportData(flights, locationMode = 'airport') {
  const counts = new Map();
  flights.forEach((flight) => [flight.originIata, flight.destinationIata].filter(Boolean).forEach((code) => counts.set(code, (counts.get(code) || 0) + 1)));
  const airports = [...counts.entries()].map(([code, count]) => {
    const airport = airportFor(code);
    return { code, label: airportCityName(airport), count, point: [Number(airport.latitude), Number(airport.longitude)] };
  }).filter((airport) => airport.point.every(Number.isFinite) && airport.point[0] && airport.point[1]);
  if (locationMode !== 'city') return airports;
  const cities = new Map();
  airports.forEach((airport) => {
    if (!cities.has(airport.label)) cities.set(airport.label, { label: airport.label, count: 0, points: [] });
    const city = cities.get(airport.label);
    city.count += airport.count;
    city.points.push(airport.point);
  });
  return [...cities.values()].map((city) => ({
    label: city.label,
    count: city.count,
    point: [
      city.points.reduce((sum, point) => sum + point[0], 0) / city.points.length,
      city.points.reduce((sum, point) => sum + point[1], 0) / city.points.length,
    ],
  }));
}

function partialRouteAirportLabels(flights, airports) {
  const counts = new Map();
  flights.forEach((flight) => {
    [flight.originIata, flight.destinationIata].filter(Boolean).forEach((code) => counts.set(code, (counts.get(code) || 0) + 1));
  });
  const regions = new Map();
  airports.forEach((airport, code) => {
    const latitude = Number(airport.point?.[0]);
    const longitude = Number(airport.point?.[1]);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
    const regionKey = `${Math.floor((latitude + 90) / 3)}:${Math.floor((longitude + 180) / 4)}`;
    if (!regions.has(regionKey)) regions.set(regionKey, []);
    regions.get(regionKey).push({ code, count: counts.get(code) || 0 });
  });
  const visible = new Set();
  regions.forEach((regionAirports) => {
    if (regionAirports.length <= 3) {
      regionAirports.forEach(({ code }) => visible.add(code));
      return;
    }
    regionAirports
      .sort((left, right) => right.count - left.count || left.code.localeCompare(right.code))
      .slice(0, Math.max(2, Math.ceil(regionAirports.length / 2)))
      .forEach(({ code }) => visible.add(code));
  });
  return visible;
}

function installHeatmapDensityLayer(map, container, airports, color) {
  const canvas = document.createElement('canvas');
  canvas.className = 'heatmap-density-canvas';
  container.appendChild(canvas);
  let frame = null;
  const redraw = () => {
    frame = null;
    const size = map.getSize();
    if (!size.x || !size.y) return;
    const pixelRatio = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    canvas.width = Math.round(size.x * pixelRatio); canvas.height = Math.round(size.y * pixelRatio);
    canvas.style.width = `${size.x}px`; canvas.style.height = `${size.y}px`;
    const fieldScale = Math.min(1, 440 / Math.max(size.x, size.y));
    const fieldWidth = Math.max(1, Math.round(size.x * fieldScale));
    const fieldHeight = Math.max(1, Math.round(size.y * fieldScale));
    const field = new Float32Array(fieldWidth * fieldHeight);
    airports.forEach((airport) => {
      const point = map.latLngToContainerPoint(airport.point);
      const centerX = point.x * fieldScale; const centerY = point.y * fieldScale;
      const latitude = Math.max(-85, Math.min(85, Number(airport.point[0])));
      const metersPerPixel = 156543.03392 * Math.cos(latitude * Math.PI / 180) / (2 ** map.getZoom());
      const radius = 150000 * Math.sqrt(airport.count) / Math.max(.01, metersPerPixel) * fieldScale;
      const left = Math.max(0, Math.floor(centerX - radius)); const right = Math.min(fieldWidth - 1, Math.ceil(centerX + radius));
      const top = Math.max(0, Math.floor(centerY - radius)); const bottom = Math.min(fieldHeight - 1, Math.ceil(centerY + radius));
      const radiusSquared = radius * radius;
      for (let y = top; y <= bottom; y++) {
        const dy = y + .5 - centerY;
        for (let x = left; x <= right; x++) {
          const dx = x + .5 - centerX; const distanceSquared = dx * dx + dy * dy;
          if (distanceSquared >= radiusSquared) continue;
          const ratio = Math.sqrt(distanceSquared / radiusSquared);
          const falloff = (1 - ratio * ratio) ** 2;
          field[y * fieldWidth + x] += airport.count * falloff;
        }
      }
    });
    let maximum = 0;
    for (let index = 0; index < field.length; index++) maximum = Math.max(maximum, field[index]);
    const [red, green, blue] = hexToRgb(color).split(',').map(Number);
    const fieldCanvas = document.createElement('canvas'); fieldCanvas.width = fieldWidth; fieldCanvas.height = fieldHeight;
    const fieldContext = fieldCanvas.getContext('2d'); const image = fieldContext.createImageData(fieldWidth, fieldHeight);
    for (let index = 0; index < field.length; index++) {
      const value = field[index]; if (value <= .0001 || !maximum) continue;
      const alpha = Math.min(.94, Math.pow(value / maximum, .58) * .94);
      const pixel = index * 4;
      image.data[pixel] = red; image.data[pixel + 1] = green; image.data[pixel + 2] = blue; image.data[pixel + 3] = Math.round(alpha * 255);
    }
    fieldContext.putImageData(image, 0, 0);
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(fieldCanvas, 0, 0, canvas.width, canvas.height);
  };
  const scheduleRedraw = () => { if (frame == null) frame = requestAnimationFrame(redraw); };
  map.on('move zoom resize', scheduleRedraw);
  scheduleRedraw();
  return scheduleRedraw;
}

function initializeRouteMaps() {
  if (!window.L) return;
  renderedMapWidgets().forEach((widget) => {
    const container = canvasEl.querySelector(`[data-route-map="${widget.id}"]`);
    if (!container) return;
    if (container.classList.contains('route-map-snapshot')) return;
    const mode = widget.appearance === 'light' || widget.appearance === 'dark' ? widget.appearance : 'system';
    const isDark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const map = window.L.map(container, { attributionControl: false, zoomControl: false, preferCanvas: false, zoomSnap: .25, zoomDelta: .5, scrollWheelZoom: false, dragging: false, touchZoom: false, doubleClickZoom: false, boxZoom: false, keyboard: false });
    const tileUrl = isDark ? 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png' : 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png';
    window.L.tileLayer(tileUrl, { subdomains: 'abcd', maxZoom: 19, crossOrigin: true }).addTo(map);
    const flights = visibleFlights();
    if (widget.type === 'heatmap') {
      const locationMode = widget.settings?.heatmapLocationMode === 'city' ? 'city' : 'airport';
      const airports = heatmapAirportData(flights, locationMode);
      const labelMode = widget.settings?.airportLabelMode || 'both';
      airports.forEach((airport) => {
        window.L.circleMarker(airport.point, { radius: 1, opacity: 0, fillOpacity: 0, interactive: false })
          .bindTooltip(escapeHtml(locationMode === 'city' ? airport.label : formatAirportLabel(airport.code, labelMode)), { permanent: true, direction: 'top', offset: [0, -6], className: 'heatmap-airport', opacity: 1 })
          .addTo(map);
      });
      const savedView = widget.settings?.mapView;
      if (savedView) map.setView(savedView.center, savedView.zoom);
      else if (airports.length) map.fitBounds(window.L.latLngBounds(airports.map((airport) => airport.point)), { padding: [30, 30], maxZoom: 5.4 });
      else map.setView([35.5, 103], 4.2);
      const redrawDensity = installHeatmapDensityLayer(map, container, airports, widget.settings?.highlightColor || state.canvas.accent);
      map.on('moveend', () => {
        widget.settings ??= {};
        widget.settings.mapView = { center: [map.getCenter().lat, map.getCenter().lng], zoom: map.getZoom() };
        redrawDensity();
        persistProject();
      });
      map.on('click', () => selectWidget(widget.id));
      leafletMaps.set(widget.id, map);
      setTimeout(() => { map.invalidateSize(); redrawDensity(); }, 0);
      return;
    }
    const points = [];
    const airports = new Map();
    flights.forEach((flight) => {
      const origin = airportFor(flight.originIata); const destination = airportFor(flight.destinationIata);
      if (!origin.latitude || !origin.longitude || !destination.latitude || !destination.longitude) return;
      const from = [origin.latitude, origin.longitude]; const to = [destination.latitude, destination.longitude];
      const color = tagFor(flight.primaryTagId)?.color || state.canvas.accent;
      const pointsForRoute = calculateArcPoints(from, to);
      for (let index = 0; index < pointsForRoute.length - 1; index++) {
        const opacity = .98 - index / (pointsForRoute.length - 1) * .82;
        window.L.polyline([pointsForRoute[index], pointsForRoute[index + 1]], { color, weight: 3, opacity, lineCap: 'butt', lineJoin: 'round', interactive: false }).addTo(map);
      }
      if (window.L.polylineDecorator) window.L.polylineDecorator(pointsForRoute, { patterns: [{ offset: '56%', repeat: 0, symbol: window.L.Symbol.arrowHead({ pixelSize: 6, headAngle: 75, polygon: false, pathOptions: { color: isDark ? '#ffffff' : '#222222', weight: .85, opacity: 1, interactive: false } }) }] }).addTo(map);
      points.push(from, to);
      airports.set(flight.originIata, { point: from, city: origin.city });
      airports.set(flight.destinationIata, { point: to, city: destination.city });
    });
    const airportVisibility = ['none', 'partial', 'all'].includes(widget.settings?.airportVisibility) ? widget.settings.airportVisibility : 'all';
    const airportLabelMode = widget.settings?.airportLabelMode || 'both';
    const partialLabels = airportVisibility === 'partial' ? partialRouteAirportLabels(flights, airports) : null;
    [...airports.entries()].forEach(([code, airport]) => {
      const marker = window.L.circleMarker(airport.point, { radius: 4.5, color: isDark ? '#f5f5f7' : '#202124', weight: 1.5, fillColor: isDark ? '#1c1c1e' : '#fff', fillOpacity: 1 });
      const showLabel = airportVisibility === 'all' || (airportVisibility === 'partial' && partialLabels.has(code));
      if (showLabel) marker.bindTooltip(escapeHtml(formatAirportLabel(code, airportLabelMode)), { permanent: true, direction: 'top', offset: [0, -5], className: 'airport-tooltip' });
      marker.addTo(map);
    });
    const savedView = widget.settings?.mapView;
    if (savedView) map.setView(savedView.center, savedView.zoom);
    else if (points.length) map.fitBounds(window.L.latLngBounds(points), { padding: [22, 22], maxZoom: 5.4 });
    else map.setView([35.5, 103], 4.2);
    const syncRouteHighlights = () => {
      try {
        container.querySelector('.route-highlight-overlay')?.remove();
        const markup = renderRouteHighlightOverlay(buildRouteHighlightMetadata(map, flights, widget.settings?.highlightRoutes));
        if (markup) container.insertAdjacentHTML('beforeend', markup);
        if (motionPreviewVisible) applyRouteHighlightFrame(motionPreviewTime);
      } catch {
        container.querySelector('.route-highlight-overlay')?.remove();
      }
    };
    map.on('moveend', () => {
      widget.settings ??= {};
      widget.settings.mapView = { center: [map.getCenter().lat, map.getCenter().lng], zoom: map.getZoom() };
      syncRouteHighlights();
      persistProject();
    });
    map.on('click', () => selectWidget(widget.id));
    leafletMaps.set(widget.id, map);
    setTimeout(() => { map.invalidateSize(); syncRouteHighlights(); }, 0);
  });
  updateMapEditability();
}

function calculateArcPoints(start, end, curvature = .2) {
  const [slat, slng] = [start[0] * Math.PI / 180, start[1] * Math.PI / 180]; const [elat, elng] = [end[0] * Math.PI / 180, end[1] * Math.PI / 180];
  const dLng = elng - slng; const bX = Math.cos(elat) * Math.cos(dLng); const bY = Math.cos(elat) * Math.sin(dLng);
  const midLat = Math.atan2(Math.sin(slat) + Math.sin(elat), Math.sqrt((Math.cos(slat) + bX) ** 2 + bY ** 2)); const midLng = slng + Math.atan2(bY, Math.cos(slat) + bX);
  const distance = Math.hypot(end[0] - start[0], end[1] - start[1]); if (!distance) return [start, end];
  const offset = distance * curvature; const controlLat = midLat * 180 / Math.PI - (end[1] - start[1]) / distance * offset; const controlLng = midLng * 180 / Math.PI + (end[0] - start[0]) / distance * offset;
  return Array.from({ length: 21 }, (_, index) => { const t = index / 20; const u = 1 - t; return [u * u * start[0] + 2 * u * t * controlLat + t * t * end[0], u * u * start[1] + 2 * u * t * controlLng + t * t * end[1]]; });
}

function parseHighlightRoutes(input) {
  const seen = new Set();
  return String(input || '').toUpperCase().split(/[;；\n]+/).map((entry) => {
    const match = entry.trim().match(/^([A-Z]{3})\s*[-–—>→]\s*([A-Z]{3})$/);
    return match ? `${match[1]}-${match[2]}` : '';
  }).filter((route) => {
    if (!route || seen.has(route)) return false;
    seen.add(route);
    return true;
  }).slice(0, 3);
}

function highlightedRouteFlights(flights, routeInput) {
  const requestedRoutes = parseHighlightRoutes(routeInput);
  if (!requestedRoutes.length) return [];
  const flightsByRoute = new Map();
  flights.forEach((flight) => {
    const originCode = String(flight.originIata || '').toUpperCase();
    const destinationCode = String(flight.destinationIata || '').toUpperCase();
    const origin = state.airports[originCode];
    const destination = state.airports[destinationCode];
    if (!origin || !destination || ![origin.latitude, origin.longitude, destination.latitude, destination.longitude].every((value) => Number.isFinite(Number(value)))) return;
    const route = `${originCode}-${destinationCode}`;
    if (!flightsByRoute.has(route)) flightsByRoute.set(route, flight);
  });
  return requestedRoutes.map((route) => flightsByRoute.get(route)).filter(Boolean);
}

function buildRouteHighlightMetadata(map, flights, routeInput) {
  if (!map) return null;
  const size = map.getSize();
  const routes = highlightedRouteFlights(flights, routeInput).map((flight) => {
    const origin = airportFor(flight.originIata);
    const destination = airportFor(flight.destinationIata);
    const points = calculateArcPoints([Number(origin.latitude), Number(origin.longitude)], [Number(destination.latitude), Number(destination.longitude)])
      .map((point) => map.latLngToContainerPoint(point))
      .map((point) => [Number(point.x.toFixed(2)), Number(point.y.toFixed(2))]);
    const route = `${String(flight.originIata || '').toUpperCase()}-${String(flight.destinationIata || '').toUpperCase()}`;
    let hash = 2166136261;
    for (const character of route) { hash ^= character.charCodeAt(0); hash = Math.imul(hash, 16777619); }
    return { id: route, waitRatio: (hash >>> 0) / 4294967296, points };
  });
  return routes.length ? { width: size.x, height: size.y, routes } : null;
}

function renderRouteHighlightOverlay(metadata) {
  const width = Number(metadata?.width);
  const height = Number(metadata?.height);
  // A malformed highlight layer must never obscure the map snapshot.
  if (!(width >= 16) || !(height >= 16) || !Array.isArray(metadata?.routes)) return '';
  const routes = metadata.routes.slice(0, 3).map((route, index) => {
    const points = Array.isArray(route?.points) ? route.points
      .map((point) => [Number(point?.[0]), Number(point?.[1])])
      .filter((point) => point.every(Number.isFinite)) : [];
    if (points.length < 2) return '';
    const path = points.map((point, pointIndex) => `${pointIndex ? 'L' : 'M'}${point[0]} ${point[1]}`).join(' ');
    const segments = Array.from({ length: 6 }, (_, segment) => `<path class="route-highlight-tail" data-route-highlight-segment="${segment}" fill="none" stroke="rgba(255,255,255,.88)" stroke-linecap="round" stroke-linejoin="round" style="filter:blur(1.7px)"/>`).join('');
    const waitRatio = Math.max(0, Math.min(1, Number(route.waitRatio) || 0));
    return `<g class="route-highlight" data-route-highlight="${index}" data-route-highlight-wait="${waitRatio}"><path class="route-highlight-guide" d="${path}" fill="none" stroke="none"/>${segments}<circle class="route-highlight-head" r="3" fill="rgba(255,255,255,.88)" style="filter:blur(2.9px) drop-shadow(0 0 14px rgba(255,255,255,1))"/></g>`;
  }).join('');
  if (!routes) return '';
  return `<svg class="route-highlight-overlay" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-hidden="true">${routes}</svg>`;
}

function updateMapEditability() {
  leafletMaps.forEach((map, id) => {
    const editable = id === state.selectedWidgetId && !state.canvas.locked && !motionPreviewVisible;
    ['dragging', 'scrollWheelZoom', 'touchZoom', 'doubleClickZoom'].forEach((handler) => map[handler][editable ? 'enable' : 'disable']());
  });
}

function selectWidget(id) {
  const target = findWidgetById(id);
  if (!target) return;
  const previousStack = findWidgetById(state.selectedWidgetId)?.type === 'stack' ? findWidgetById(state.selectedWidgetId) : parentStackForChild(state.selectedWidgetId);
  const targetStack = target.type === 'stack' ? target : parentStackForChild(id);
  const selectionChanged = state.selectedWidgetId !== id;
  state.selectedWidgetId = id;
  if (previousStack || targetStack) {
    renderCanvas();
    renderInspector();
    updateInspectorContrast();
    requestAnimationFrame(positionCardInspector);
    if (selectionChanged) persistProject();
    return;
  }
  canvasEl.classList.add('has-selection');
  canvasEl.querySelectorAll('.widget').forEach((item) => {
    const selected = item.dataset.widgetId === id || (item.dataset.stackChildren || '').split(' ').includes(id);
    item.classList.toggle('selected', selected);
    item.setAttribute('aria-selected', String(selected));
  });
  canvasEl.querySelectorAll('[data-stack-child-id]').forEach((item) => {
    const selected = item.dataset.stackChildId === id;
    item.classList.toggle('selected-child', selected);
    item.setAttribute('aria-selected', String(selected));
  });
  if (selectionChanged || !$('#card-inspector').classList.contains('show')) { renderInspector(); updateInspectorContrast(); }
  requestAnimationFrame(positionCardInspector);
  updateMapEditability();
  if (selectionChanged) persistProject();
}

function clearWidgetSelection() {
  if (!state.selectedWidgetId) return;
  const selected = findWidgetById(state.selectedWidgetId);
  const hadStackSelection = selected?.type === 'stack' || Boolean(parentStackForChild(state.selectedWidgetId));
  state.selectedWidgetId = null;
  $('#card-inspector').classList.remove('inspector-inverse-dark', 'inspector-inverse-light');
  if (hadStackSelection) renderCanvas();
  canvasEl.classList.remove('has-selection');
  canvasEl.querySelectorAll('.widget').forEach((item) => { item.classList.remove('selected'); item.setAttribute('aria-selected', 'false'); });
  canvasEl.querySelectorAll('[data-stack-child-id]').forEach((item) => { item.classList.remove('selected-child'); item.setAttribute('aria-selected', 'false'); });
  const inspector = $('#card-inspector');
  inspector.classList.remove('show');
  inspector.innerHTML = '';
  updateMapEditability();
  persistProject();
}

function summaryItemMarkup(key, values) {
  return `<div class="summary-item" data-summary-key="${key}"><span class="summary-number">${escapeHtml(values[key][0])}</span><span class="summary-label">${values[key][1]}</span></div>`;
}

const summaryMetricLengthOrder = { distance: 4, duration: 3, segments: 2, airports: 1 };

function summaryLongestMetric(keys) {
  return keys.reduce((best, key) => !best || summaryMetricLengthOrder[key] > summaryMetricLengthOrder[best] ? key : best, '');
}

function summaryCenterLongest(keys) {
  if (keys.length < 3) return [...keys];
  const ranked = [...keys].sort((a, b) => summaryMetricLengthOrder[b] - summaryMetricLengthOrder[a]);
  const positions = keys.length === 3 ? [1, 0, 2] : [1, 2, 0, 3];
  const result = Array(keys.length);
  ranked.forEach((key, index) => { result[positions[index]] = key; });
  return result;
}

function renderSummary(flights, widget) {
  const distance = Math.round(flights.reduce((sum, flight) => sum + Number(flight.distanceKm || 0), 0)).toLocaleString('zh-CN');
  const values = { segments: [flights.length, '飞行航段'], airports: [new Set(flights.flatMap((flight) => [flight.originIata, flight.destinationIata].filter(Boolean))).size, '机场数量'], distance: [distance, 'km 里程'], duration: [formatSummaryDuration(flights), 'h 时长'] };
  const chosen = new Set(widget.settings?.metrics?.length ? widget.settings.metrics : ['segments', 'airports']);
  const selected = ['segments', 'airports', 'distance', 'duration'].filter((key) => chosen.has(key));
  const w = Math.max(1, Number(widget.w) || 1); const h = Math.max(1, Number(widget.h) || 1);
  const count = selected.length;
  let layout = 'single'; let ordered = [...selected];
  if (count > 1 && w === 1 && h === 1) layout = 'compact-inline';
  else if (count > 1 && w === 1) layout = 'column';
  else if (h === 1 && w === 2 && count === 4) { layout = 'wide-inline-grid'; ordered = ['segments', 'duration', 'airports', 'distance']; }
  else if (count > 1 && (h === 1 || w >= 3)) { layout = 'row'; ordered = summaryCenterLongest(selected); }
  else if (count === 4) { layout = 'quad'; ordered = ['distance', 'segments', 'airports', 'duration']; }
  else if (count === 2) layout = h >= w ? 'pair-column' : 'pair-row';
  else if (count === 3 && w / h >= 2) { layout = 'row'; ordered = summaryCenterLongest(selected); }
  else if (count === 3 && h / w >= 1.5) { const longest = summaryLongestMetric(selected); layout = 'column'; ordered = [...selected.filter((key) => key !== longest), longest]; }
  else if (count === 3) { const longest = summaryLongestMetric(selected); layout = 'triangle'; ordered = [...selected.filter((key) => key !== longest), longest]; }
  let content = ordered.map((key) => summaryItemMarkup(key, values)).join('');
  if (layout === 'compact-inline') content = `<div class="summary-inline-column">${content}</div>`;
  if (layout === 'wide-inline-grid') content = `<div class="summary-inline-column">${['segments', 'airports'].map((key) => summaryItemMarkup(key, values)).join('')}</div><div class="summary-inline-column">${['duration', 'distance'].map((key) => summaryItemMarkup(key, values)).join('')}</div>`;
  const areaScale = w * h > 4 ? Math.min(1.35, 1 + (w * h - 4) * 0.045) : 1;
  return `<div class="summary-widget summary-layout-${layout} summary-count-${count}" style="--summary-scale:${areaScale}"><div class="summary-group" style="--summary-count:${count}">${content}</div></div>`;
}

function renderRanking(items, widget) {
  const max = items[0]?.count || 1;
  const layout = cardLayout(widget);
  const width = Math.max(1, Number(widget.w) || 1); const height = Math.max(1, Number(widget.h) || 1);
  const rankingPadding = layout === 'compact' ? 12 : 18;
  const innerWidth = width * UNIT - 18 - rankingPadding * 2;
  const measure = document.createElement('canvas').getContext('2d');
  if (measure) measure.font = '760 12px "PingFang SC", "Microsoft YaHei", sans-serif';
  const lineCost = (item) => {
    const nameWidth = measure?.measureText(String(item.name)).width || String(item.name).length * 12;
    if (measure) measure.font = '10px "PingFang SC", "Microsoft YaHei", sans-serif';
    const valueWidth = measure?.measureText(`${item.count} 次`).width || String(item.count).length * 6 + 12;
    if (measure) measure.font = '760 12px "PingFang SC", "Microsoft YaHei", sans-serif';
    return Math.max(1, Math.ceil(nameWidth / Math.max(44, innerWidth - 28 - valueWidth)));
  };
  const rowHeight = (lines) => 20 + Math.max(0, lines - 1) * 14.4;
  const availableHeight = Math.max(20, height * UNIT - 18 - rankingPadding * 2);
  const gap = 10; const omissionHeight = 14;
  const visible = [];
  const contentHeight = (entries, withOmission) => {
    const blocks = entries.map((entry) => rowHeight(entry.lines));
    if (withOmission) blocks.push(omissionHeight);
    return blocks.reduce((sum, value) => sum + value, 0) + Math.max(0, blocks.length - 1) * gap;
  };
  for (const item of items) {
    const entry = { ...item, lines: lineCost(item) };
    const trial = [...visible, entry];
    if (contentHeight(trial, trial.length < items.length) > availableHeight) break;
    visible.push(entry);
  }
  const omitted = visible.length < items.length;
  const rows = visible.map((item, index) => `<div class="rank-row" style="--rank-row-height:${rowHeight(item.lines)}px"><span class="rank-index">${String(index + 1).padStart(2, '0')}</span><strong class="rank-name">${escapeHtml(item.name)}</strong><span class="rank-value">${item.count} 次</span><span class="rank-bar"><i style="width:${(item.count / max) * 100}%"></i></span></div>`).join('');
  return `<div class="ranking-widget" data-card-layout="${layout}">${rows}${omitted ? '<div class="rank-row rank-row-more" aria-label="还有更多排名">...</div>' : ''}</div>`;
}

function renderExtremes(items, widget) {
  if (!items.length) return '<div class="empty-widget">没有可用于定位的机场或城市</div>';
  const layout = cardLayout(widget);
  const scope = widget.settings?.extremeScope || 'airport';
  return `<div class="extremes-widget" data-card-layout="${layout}" data-extreme-scope="${scope}"><i class="extremes-x" aria-hidden="true"></i>${items.map((item) => `<div class="extreme-item extreme-${item.label}"><span class="extreme-direction">${item.label}</span><strong class="extreme-code">${escapeHtml(item.place.primary)}</strong>${item.place.secondary ? `<span class="extreme-city">${escapeHtml(item.place.secondary)}</span>` : ''}</div>`).join('')}</div>`;
}

function renderExtremesSettings(widget) {
  const scope = widget.settings?.extremeScope || 'airport';
  return `<div class="inspector-label">统计对象</div><div class="inspector-actions extremes-scope-actions segmented-choice"><button class="${scope === 'city' ? 'active-choice' : ''}" data-extreme-scope="${widget.id}" data-value="city" type="button">四极城市</button><button class="${scope === 'airport' ? 'active-choice' : ''}" data-extreme-scope="${widget.id}" data-value="airport" type="button">四极机场</button></div>`;
}

function renderLongest(flight) {
  return `<div class="longest-widget"><span class="longest-flightno">${escapeHtml(flight.flightNumber || '最长航班')}</span><div class="longest-route">${escapeHtml(flight.originIata)} <b>→</b> ${escapeHtml(flight.destinationIata)}</div><div class="longest-meta"><span>${formatKm(flight.distanceKm)}</span><span>${escapeHtml(flight.aircraftType || '未知机型')}</span><span>${escapeHtml(flight.date || '')}</span></div></div>`;
}

function renderFlightCardSettings(widget) {
  const selected = widget.settings?.flightIds?.[0] || '';
  const selectedFlight = state.flights.find((flight) => flight.id === selected) || state.flights[0];
  const rows = state.flights.map((flight) => `<label class="flight-choice"><input type="radio" name="featured-${widget.id}" data-card-flight="${widget.id}" value="${flight.id}" ${selected === flight.id ? 'checked' : ''}/><span class="flight-choice-main"><time>${escapeHtml(flight.date || '日期未知')}</time><i aria-hidden="true">·</i><b>${escapeHtml(flight.flightNumber || '无航班号')}</b></span><small class="flight-choice-route">${escapeHtml(flight.originIata)} → ${escapeHtml(flight.destinationIata)}</small></label>`).join('');
  const showRemark = widget.settings?.showRemark !== false;
  const titlePlaceholder = selectedFlight?.registration || '注册号';
  return `<div class="featured-title-row"><div><div class="inspector-label">卡片标题</div><input class="inspector-input" data-card-title="${widget.id}" type="text" maxlength="24" value="${escapeHtml(widget.settings?.title || '')}" placeholder="默认：${escapeHtml(titlePlaceholder)}"/></div><button class="inspector-toggle-button ${showRemark ? 'active-choice' : ''}" data-featured-toggle="remark" data-featured-toggle-id="${widget.id}" type="button">显示备注</button></div><div class="inspector-label">选择航班</div><div class="flight-choice-list">${rows || '<p class="inspector-hint">暂无可选择的航班。</p>'}</div>`;
}

function renderAirportLabelSettings(widget) {
  const mode = widget.settings?.airportLabelMode || 'both';
  return `<div class="inspector-label">机场显示</div><div class="inspector-actions segmented-choice"><button class="${mode === 'chinese' ? 'active-choice' : ''}" data-airport-label="${widget.id}" data-value="chinese" type="button">中文</button><button class="${mode === 'iata' ? 'active-choice' : ''}" data-airport-label="${widget.id}" data-value="iata" type="button">三字码</button><button class="${mode === 'both' ? 'active-choice' : ''}" data-airport-label="${widget.id}" data-value="both" type="button">中文 + 三字码</button></div>`;
}

function renderSummarySettings(widget) {
  const metrics = [['segments', '航段数量'], ['airports', '机场数量'], ['distance', '总里程'], ['duration', '总时长']];
  const selected = widget.settings?.metrics?.length ? widget.settings.metrics : ['segments', 'airports'];
  return `<div class="inspector-label">显示指标（至少一项）</div><div class="summary-metric-actions">${metrics.map(([value, label]) => `<button class="${selected.includes(value) ? 'active-choice' : ''}" data-summary-metric-toggle="${widget.id}" data-value="${value}" type="button">${label}</button>`).join('')}</div>`;
}

function renderRankingSettings(widget) {
  const type = widget.settings?.rankingType || 'airline';
  const options = [['airline', '航司'], ['aircraft', '机型'], ['airport', '机场'], ['city', '城市'], ['route', '航线']];
  return `<div class="inspector-label">排名类型</div><div class="inspector-actions ranking-type-actions segmented-choice">${options.map(([value, label]) => `<button class="${type === value ? 'active-choice' : ''}" data-ranking-type="${widget.id}" data-value="${value}" type="button">${label}</button>`).join('')}</div>${['airport', 'route'].includes(type) ? renderAirportLabelSettings(widget) : ''}`;
}

function renderTextSettings(widget) {
  const settings = widget.settings || {}; const align = ['left', 'center', 'right'].includes(settings.textAlign) ? settings.textAlign : 'center'; const font = textFontId(settings); const size = Math.max(-12, Math.min(24, Number(settings.fontSizeOffset) || 0));
  const alignments = [['left', '左'], ['center', '中'], ['right', '右']].map(([value, label]) => `<button class="${align === value ? 'active-choice' : ''}" data-text-align="${widget.id}" data-value="${value}" type="button" aria-label="${label}对齐">${label}</button>`).join('');
  const fonts = textFontOptions.map(([value, label]) => `<option class="text-font-${value}" value="${value}" ${font === value ? 'selected' : ''}>${label}</option>`).join('');
  const rangeProgress = ((size + 12) / 36) * 100;
  const rangeFill = `calc(${rangeProgress}% + ${30 - .38 * rangeProgress}px)`;
  return `<div class="inspector-label">文字内容</div><textarea class="inspector-input text-content-input" data-card-text="${widget.id}" maxlength="2000" placeholder="输入文字">${escapeHtml(settings.text ?? '')}</textarea><div class="text-format-grid"><div><div class="inspector-label">对齐</div><div class="inspector-actions text-align-actions segmented-choice">${alignments}</div></div><label class="text-size-control"><span class="inspector-label">字号</span><span class="text-size-input-row"><span class="text-size-range-shell" style="--range-fill:${rangeFill}"><span class="text-size-progress"></span><input class="inspector-range" data-text-size="${widget.id}" type="range" min="-12" max="24" step="1" value="${size}" aria-label="字号" /></span><output data-text-size-output="${widget.id}">${size > 0 ? `+${size}` : size}</output></span></label></div><label class="text-font-control"><span class="inspector-label">字体</span><select class="inspector-input text-font-select text-font-${font}" data-text-font="${widget.id}">${fonts}</select></label>`;
}

function renderImageSettings(widget) {
  const settings = widget.settings || {}; const hasImage = settings.imageData || settings.imageUrl;
  const position = ['top-left', 'top', 'top-right', 'bottom-left', 'bottom', 'bottom-right'].includes(settings.notePosition) ? settings.notePosition : 'bottom-left';
  const positions = [['top-left', '左上'], ['top', '上'], ['top-right', '右上'], ['bottom-left', '左下'], ['bottom', '下'], ['bottom-right', '右下']].map(([value, label]) => `<button class="${position === value ? 'active-choice' : ''}" data-image-note-position="${widget.id}" data-value="${value}" type="button">${label}</button>`).join('');
  return `<div class="inspector-label">图片</div><label class="image-upload-control"><input data-card-image-file="${widget.id}" type="file" accept="image/png,image/jpeg,image/webp"/><span aria-hidden="true">＋</span><strong>${hasImage ? '更换图片' : '选择图片'}</strong><small>PNG、JPEG、WebP · 最大 50 MB</small></label><div class="image-note-editor"><div><div class="inspector-label">备注位置</div><div class="inspector-actions image-note-position-actions segmented-choice">${positions}</div></div><label><span class="inspector-label">备注</span><textarea class="inspector-input image-note-input" data-image-note="${widget.id}" maxlength="500" placeholder="输入备注，留空则不显示">${escapeHtml(settings.note ?? '')}</textarea></label></div>${hasImage ? '<p class="inspector-hint image-interaction-hint">在卡片上滚动缩放，拖动改变位置。</p>' : ''}`;
}

function cardFlights(widget, flights) {
  if (widget.settings?.mode === 'longest') return [...flights].sort((a, b) => b.distanceKm - a.distanceKm).slice(0, 1);
  const ids = widget.settings?.flightIds || [];
  const selected = ids.length ? flights.filter((flight) => ids.includes(flight.id)) : flights.slice(0, 1);
  return selected.length ? selected : flights.slice(0, 1);
}

function renderFlightCards(widget, flights) {
  const flight = cardFlights(widget, flights)[0]; if (!flight) return '<div class="empty-widget">暂无可展示的航班</div>';
  const title = widget.settings?.title?.trim() || flight.registration || '注册号未知';
  const layout = cardLayout(widget); const tags = (flight.tagIds || []).map(tagFor).filter(Boolean);
  const routeColor = tags[0]?.color || state.canvas.accent;
  const remark = widget.settings?.showRemark !== false && flight.remark ? escapeHtml(flight.remark) : '';
  return `<article class="flight-card-mini" data-card-layout="${layout}"><div class="flight-card-title">${escapeHtml(title)}</div><div class="flight-card-aircraft">${escapeHtml(flight.aircraftType || 'FLY')}</div><div class="flight-card-head"><span>${escapeHtml(flight.flightNumber || '未命名航班')}</span><span>${escapeHtml(flight.date || '日期未知')}</span></div><div class="flight-card-flow"><div><b>${escapeHtml(flight.originIata || '---')}</b><small>${escapeHtml(formatAirportLabel(flight.originIata, 'chinese'))}</small><em>${escapeHtml(flight.departureTime || '--:--')}</em></div><i class="flight-card-arrow" style="--flight-route-color:${routeColor}"><small>${formatKm(flight.distanceKm)}</small><span></span></i><div><b>${escapeHtml(flight.destinationIata || '---')}</b><small>${escapeHtml(formatAirportLabel(flight.destinationIata, 'chinese'))}</small><em>${escapeHtml(flight.arrivalTime || '--:--')}</em></div></div><div class="flight-card-footer"><span>${escapeHtml(flight.aircraftType || '未知机型')}</span><span class="flight-card-remark">${remark}</span><span>${escapeHtml(flight.registration || '注册号未知')}</span></div></article>`;
}

function trendPeriod(flight, period) {
  const normalized = normalizeFlightDate(flight.date);
  if (!normalized) return null;
  const date = new Date(`${normalized}T00:00:00Z`);
  if (period === 'week') {
    date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
    return { key: date.toISOString().slice(0, 10), label: `${date.getUTCMonth() + 1}/${date.getUTCDate()}` };
  }
  return { key: normalized.slice(0, 7), label: `${Number(normalized.slice(5, 7))}月` };
}

function trendSeries(flights, period) {
  const groups = new Map();
  flights.forEach((flight) => {
    const item = trendPeriod(flight, period);
    if (!item) return;
    const current = groups.get(item.key) || { ...item, value: 0 };
    current.value += 1; groups.set(item.key, current);
  });
  return [...groups.values()].sort((a, b) => a.key.localeCompare(b.key));
}

function smoothTrendPath(points) {
  if (points.length < 2) return '';
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let index = 0; index < points.length - 1; index++) {
    const p0 = points[index - 1] || points[index]; const p1 = points[index]; const p2 = points[index + 1]; const p3 = points[index + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6; const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6; const c2y = p2.y - (p3.y - p1.y) / 6;
    path += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return path;
}

function trendChartMarkup(series, options = {}) {
  const width = Math.max(150, Number(options.width) || 420); const height = Math.max(90, Number(options.height) || 220);
  const type = options.type || 'line'; const showValues = Boolean(options.showValues); const showAxes = options.showAxes !== false; const showPoints = options.showPoints !== false;
  const accent = options.accent || 'var(--accent)'; const muted = options.muted || 'var(--widget-muted)'; const text = options.text || 'var(--widget-text)'; const surface = options.surface || 'var(--widget-surface)'; const border = options.border || 'var(--widget-border)';
  const left = 14; const right = 12; const top = showValues ? 22 : 12; const bottom = 24;
  const plotWidth = Math.max(1, width - left - right); const plotHeight = Math.max(1, height - top - bottom); const baseline = top + plotHeight;
  const max = Math.max(2, ...series.map((item) => item.value));
  const points = series.map((item, index) => ({ ...item, x: series.length === 1 ? left + plotWidth / 2 : left + index * plotWidth / (series.length - 1), y: baseline - item.value / max * plotHeight }));
  const pathPoints = points.length === 1 ? [{ ...points[0], x: left }, { ...points[0], x: left + plotWidth }] : points;
  const linePath = type === 'smooth' ? smoothTrendPath(pathPoints) : pathPoints.length ? `M ${pathPoints.map((point) => `${point.x} ${point.y}`).join(' L ')}` : '';
  const areaPath = linePath ? `${linePath} L ${pathPoints[pathPoints.length - 1].x} ${baseline} L ${pathPoints[0].x} ${baseline} Z` : '';
  const guideLines = showAxes ? [0, .5, 1].map((ratio) => `<line class="trend-grid-line" x1="${left}" y1="${top + plotHeight * ratio}" x2="${left + plotWidth}" y2="${top + plotHeight * ratio}" stroke="${border}" stroke-width="1"/>`).join('') : '';
  const maxLabels = Math.max(2, Math.floor(plotWidth / 54)); const stride = Math.max(1, Math.ceil(points.length / maxLabels));
  const xLabels = showAxes ? points.map((point, index) => (index === 0 || index === points.length - 1 || index % stride === 0) ? `<text class="trend-axis-label" x="${point.x}" y="${height - 5}" text-anchor="middle" fill="${muted}" font-size="9" font-weight="700">${escapeHtml(point.label)}</text>` : '').join('') : '';
  const valueLabels = showValues ? points.map((point) => `<text class="trend-value-label" x="${point.x}" y="${Math.max(9, point.y - 7)}" text-anchor="middle" fill="${text}" font-size="9" font-weight="850">${point.value}</text>`).join('') : '';
  if (type === 'bar') {
    const barWidth = Math.max(3, Math.min(34, plotWidth / Math.max(1, points.length) * .56));
    const bars = points.map((point) => `<rect class="trend-bar" x="${point.x - barWidth / 2}" y="${point.y}" width="${barWidth}" height="${Math.max(1, baseline - point.y)}" rx="${Math.min(4, barWidth / 3)}" fill="${accent}" opacity=".78"/>`).join('');
    return `${guideLines}${bars}${valueLabels}${xLabels}`;
  }
  const dots = showPoints ? points.map((point) => `<circle class="trend-point" cx="${point.x}" cy="${point.y}" r="3" fill="${surface}" stroke="${accent}" stroke-width="2"/>`).join('') : '';
  const area = showAxes ? `<path class="trend-area" d="${areaPath}" fill="${accent}" opacity=".16"/>` : '';
  return `${guideLines}${area}<path class="trend-line" d="${linePath}" fill="none" stroke="${accent}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>${dots}${valueLabels}${xLabels}`;
}

function renderTrend(flights, widget) {
  const type = widget.settings?.chartType || 'line'; const period = widget.settings?.period || 'month'; const showValues = widget.settings?.showValues === true; const showAxes = widget.settings?.showAxes !== false; const showPoints = widget.settings?.showPoints !== false;
  const series = trendSeries(flights, period); const layout = cardLayout(widget);
  if (!series.length) return '<div class="empty-widget">没有可用于绘制趋势的日期</div>';
  const chartWidth = Math.max(150, widget.w * UNIT - 36); const chartHeight = Math.max(90, widget.h * UNIT - 74);
  return `<div class="trend-card" data-card-layout="${layout}" data-trend-type="${type}"><header><strong>飞行趋势</strong><span>${period === 'week' ? '按周' : '按月'} · ${series.length} 期</span></header><svg class="trend-chart" viewBox="0 0 ${chartWidth} ${chartHeight}" role="img" aria-label="${period === 'week' ? '每周' : '每月'}飞行次数趋势">${trendChartMarkup(series, { width: chartWidth, height: chartHeight, type, showValues, showAxes, showPoints })}</svg></div>`;
}

function renderTrendSettings(widget) {
  const type = widget.settings?.chartType || 'line'; const period = widget.settings?.period || 'month'; const showValues = widget.settings?.showValues === true; const showAxes = widget.settings?.showAxes !== false; const showPoints = widget.settings?.showPoints !== false;
  const chartTypes = [['bar', '柱状图'], ['line', '折线图'], ['smooth', '平滑折线']];
  return `<div class="inspector-label">图表类型</div><div class="inspector-actions trend-type-actions segmented-choice">${chartTypes.map(([value, label]) => `<button class="${type === value ? 'active-choice' : ''}" data-trend-type="${widget.id}" data-value="${value}" type="button">${label}</button>`).join('')}</div><div class="inspector-label">横坐标</div><div class="inspector-actions trend-period-actions segmented-choice"><button class="${period === 'week' ? 'active-choice' : ''}" data-trend-period="${widget.id}" data-value="week" type="button">按周</button><button class="${period === 'month' ? 'active-choice' : ''}" data-trend-period="${widget.id}" data-value="month" type="button">按月</button></div><div class="inspector-label">图表元素</div><div class="inspector-actions trend-element-actions"><button class="${showValues ? 'active-choice' : ''}" data-trend-values="${widget.id}" type="button">显示数据</button><button class="${showAxes ? 'active-choice' : ''}" data-trend-axes="${widget.id}" type="button">坐标轴</button><button class="${showPoints ? 'active-choice' : ''}" data-trend-points="${widget.id}" type="button">圆点</button></div>`;
}

function calendarLargeEnough(widget) { return Math.max(1, Number(widget.w) || 1) * Math.max(1, Number(widget.h) || 1) >= 4; }
function calendarScaleNeedsLarge(scale) { return scale === '365days' || scale === '365weeks'; }

function calendarFlightCounts(flights) {
  return flights.reduce((counts, flight) => {
    const date = normalizeFlightDate(flight.date);
    if (date) counts.set(date, (counts.get(date) || 0) + 1);
    return counts;
  }, new Map());
}

function calendarLatestDate(flights) {
  const dates = flights.map((flight) => normalizeFlightDate(flight.date)).filter(Boolean).sort();
  return dates.length ? new Date(`${dates[dates.length - 1]}T00:00:00Z`) : null;
}

function calendarItems(flights, scale) {
  const latest = calendarLatestDate(flights); if (!latest) return [];
  const dailyCounts = calendarFlightCounts(flights); const items = [];
  if (scale === '31days') {
    for (let index = 30; index >= 0; index--) {
      const date = new Date(latest); date.setUTCDate(date.getUTCDate() - index); const key = date.toISOString().slice(0, 10);
      items.push({ key, count: dailyCounts.get(key) || 0, title: `${key} · ${dailyCounts.get(key) || 0} 次` });
    }
    return items;
  }
  if (scale === '365days') {
    const year = latest.getUTCFullYear(); const date = new Date(Date.UTC(year, 0, 1));
    while (date.getUTCFullYear() === year) {
      const month = date.getUTCMonth(); const day = date.getUTCDate();
      if (!(month === 1 && day === 29)) {
        const key = date.toISOString().slice(0, 10); const marker = day === 1 ? String(month + 1) : '';
        items.push({ key, count: dailyCounts.get(key) || 0, marker, markerType: 'month', title: `${key} · ${dailyCounts.get(key) || 0} 次` });
      }
      date.setUTCDate(date.getUTCDate() + 1);
    }
    return items.slice(0, 365);
  }
  const weeklyCounts = flights.reduce((counts, flight) => {
    const period = trendPeriod(flight, 'week'); if (period) counts.set(period.key, (counts.get(period.key) || 0) + 1);
    return counts;
  }, new Map());
  const total = scale === '365weeks' ? 365 : 53;
  const start = scale === '365weeks' ? new Date(Date.UTC(latest.getUTCFullYear() - 6, 0, 1)) : new Date(latest);
  if (scale === '365weeks') start.setUTCDate(start.getUTCDate() + ((8 - start.getUTCDay()) % 7));
  else { start.setUTCDate(start.getUTCDate() - ((start.getUTCDay() + 6) % 7) - (total - 1) * 7); }
  let previousYear = null; let previousMonth = null;
  for (let index = 0; index < total; index++) {
    const date = new Date(start); date.setUTCDate(date.getUTCDate() + index * 7); const key = date.toISOString().slice(0, 10); const year = date.getUTCFullYear(); const month = date.getUTCMonth();
    const marker = scale === '365weeks'
      ? year !== previousYear ? `${String(year).slice(0, 2)}|${String(year).slice(-2)}` : ''
      : month !== previousMonth ? String(month + 1) : '';
    const markerType = scale === '365weeks' ? 'year' : 'month';
    items.push({ key, count: weeklyCounts.get(key) || 0, marker, markerType, title: `${key} 起始周 · ${weeklyCounts.get(key) || 0} 次` }); previousYear = year; previousMonth = month;
  }
  return items;
}

function calendarGrid(widget, itemCount) {
  const width = Math.max(80, Math.max(1, Number(widget.w) || 1) * UNIT - 28); const height = Math.max(70, Math.max(1, Number(widget.h) || 1) * UNIT - 58);
  const columns = Math.max(1, Math.min(itemCount, Math.ceil(Math.sqrt(itemCount * width / height))));
  return { columns, rows: Math.ceil(itemCount / columns), flow: 'row' };
}

function renderCalendar(flights, widget) {
  const scale = widget.settings?.calendarScale || '53weeks'; const large = calendarLargeEnough(widget);
  if (calendarScaleNeedsLarge(scale) && !large) return '<div class="summary-too-small"><strong>面积过小</strong><span>请选择 31 天或 53 周，或增大卡片尺寸。</span></div>';
  const items = calendarItems(flights, scale); if (!items.length) return '<div class="empty-widget">没有可用于绘制日历的日期</div>';
  const grid = calendarGrid(widget, items.length); const oneByOne = Number(widget.w) === 1 && Number(widget.h) === 1; const shape = calendarScaleNeedsLarge(scale) || oneByOne ? 'dot' : 'square';
  const contentWidth = Math.max(80, widget.w * UNIT - 28); const contentHeight = Math.max(70, widget.h * UNIT - 58); const rawCell = Math.min(contentWidth / grid.columns, contentHeight / grid.rows); const gap = Math.max(1, Math.min(6, rawCell * .12)); const cellWidth = (contentWidth - gap * (grid.columns - 1)) / grid.columns; const cellHeight = (contentHeight - gap * (grid.rows - 1)) / grid.rows; const cellSize = Math.max(1.5, Math.min(cellWidth, cellHeight) * (shape === 'square' ? .84 : .62));
  const labels = { '31days': '31 天', '53weeks': '53 周', '365days': '365 天', '365weeks': '365 周 · 7 年' };
  const cells = items.map((item) => { const marker = item.marker ? item.markerType === 'year' ? `<small class="calendar-marker calendar-year-marker"><b>${escapeHtml(item.marker.split('|')[0])}</b><b>${escapeHtml(item.marker.split('|')[1])}</b></small>` : `<small class="calendar-marker calendar-month-marker">${escapeHtml(item.marker)}</small>` : ''; return `<span class="calendar-cell${item.marker ? ' has-marker' : ''}" title="${escapeHtml(item.title)}" aria-label="${escapeHtml(item.title)}"><i style="opacity:${item.count ? Math.min(1, .3 + item.count * .18) : .09}"></i>${marker}</span>`; }).join('');
  return `<div class="calendar-card" data-calendar-scale="${scale}" data-calendar-shape="${shape}" data-calendar-flow="${grid.flow}" style="--calendar-columns:${grid.columns};--calendar-rows:${grid.rows};--calendar-gap:${gap}px;--calendar-cell-size:${cellSize}px"><header><strong>飞行日历</strong><span>${labels[scale]}</span></header><div class="calendar-grid">${cells}</div></div>`;
}

function renderCalendarSettings(widget) {
  const scale = widget.settings?.calendarScale || '53weeks'; const large = calendarLargeEnough(widget);
  const options = [['31days', '31 天'], ['53weeks', '53 周'], ['365days', '365 天'], ['365weeks', '365 周']];
  return `<div class="calendar-scale-heading"><div class="inspector-label">日历尺度</div><small>面积 ≥ 4 可选 365</small></div><div class="inspector-actions calendar-scale-actions segmented-choice">${options.map(([value, label]) => { const disabled = calendarScaleNeedsLarge(value) && !large; return `<button class="${scale === value ? 'active-choice' : ''}" data-calendar-scale="${widget.id}" data-value="${value}" type="button" ${disabled ? 'disabled title="需要至少 4 格面积"' : ''}>${label}</button>`; }).join('')}</div>`;
}

function renderRecords(flights) {
  const longest = [...flights].sort((a, b) => b.distanceKm - a.distanceKm)[0]; const airline = aggregateByAirlineCode(flights)[0]; const route = routeRanking(flights)[0];
  return `<div class="records-card"><div><small>最长</small><b>${escapeHtml(longest?.flightNumber || '--')}</b></div><div><small>最多航司</small><b>${escapeHtml(airline?.name || '--')}</b></div><div><small>最多航线</small><b>${escapeHtml(route?.name || '--')}</b></div></div>`;
}

function renderHeatmap(flights, widget) {
  const mode = widget.appearance === 'light' || widget.appearance === 'dark' ? widget.appearance : 'system';
  const resolvedMode = mode === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : mode;
  if (widget.settings?.exportMapSnapshot) return `<div class="heatmap-card heatmap-card-${resolvedMode} heatmap-card-snapshot" data-route-map="${widget.id}" aria-label="飞行热力图"><img src="${widget.settings.exportMapSnapshot}" alt=""/></div>`;
  if (!window.L) return `<div class="heatmap-card heatmap-card-${resolvedMode} route-map-unavailable" data-route-map="${widget.id}" aria-label="飞行热力图"><span>地图资源尚未加载</span></div>`;
  return `<div class="heatmap-card heatmap-card-${resolvedMode}" data-route-map="${widget.id}" aria-label="飞行热力图"><span class="map-caption">${flights.length ? `${flights.length} 条航段` : '等待数据'}</span></div>`;
}

function renderTextCard(widget) {
  const settings = widget.settings || {}; const font = textFontId(settings); const align = ['left', 'center', 'right'].includes(settings.textAlign) ? settings.textAlign : 'center'; const size = Math.max(-12, Math.min(24, Number(settings.fontSizeOffset) || 0));
  return `<div class="text-card text-font-${font}" data-card-layout="${cardLayout(widget)}" data-text-align="${align}" style="--text-font-offset:${size}px">${escapeHtml(settings.text ?? '')}</div>`;
}

function imageTransformValues(settings = {}) {
  const scale = Math.max(1, Math.min(4, Number(settings.imageScale) || 1)); const limit = (scale - 1) * 50 / scale;
  return { scale, x: Math.max(-limit, Math.min(limit, Number(settings.imageOffsetX) || 0)), y: Math.max(-limit, Math.min(limit, Number(settings.imageOffsetY) || 0)) };
}

function applyImageTransform(widget) {
  const values = imageTransformValues(widget.settings); Object.assign(widget.settings, { imageScale: values.scale, imageOffsetX: values.x, imageOffsetY: values.y });
  const media = canvasEl.querySelector(`[data-image-media="${widget.id}"]`); if (media) media.style.transform = `translate(${values.x}%,${values.y}%) scale(${values.scale})`;
}

function renderImageCard(widget) {
  const settings = widget.settings || {}; const original = settings.imageData || settings.imageUrl; const preview = settings.imagePreviewData || original; if (!original) return `<div class="image-card image-card-empty" data-image-widget="${widget.id}"><span aria-hidden="true">＋</span><small>选择图片</small></div>`;
  const { x, y, scale } = imageTransformValues(settings); const position = ['top-left', 'top', 'top-right', 'bottom-left', 'bottom', 'bottom-right'].includes(settings.notePosition) ? settings.notePosition : 'bottom-left'; const note = String(settings.note ?? '');
  return `<div class="image-card has-image" data-image-widget="${widget.id}" data-card-layout="${cardLayout(widget)}"><div class="image-card-media" data-image-media="${widget.id}" style="--image-preview:url('${escapeHtml(preview)}');--image-original:url('${escapeHtml(original)}');transform:translate(${x}%,${y}%) scale(${scale})"></div>${note.trim() ? `<div class="image-card-note" data-note-position="${position}">${escapeHtml(note)}</div>` : ''}</div>`;
}

function syncCanvasBounds() {
  const clampSize = (widget) => {
    widget.w = Math.max(1, Math.min(9, Math.round(Number(widget.w) || 1)));
    widget.h = Math.max(1, Math.min(9, Math.round(Number(widget.h) || 1)));
    stackChildren(widget).forEach((child) => { child.w = widget.w; child.h = widget.h; clampSize(child); });
  };
  state.widgets.forEach(clampSize);
  if (!state.widgets.length) {
    state.canvas.cols = MIN_CANVAS_COLS;
    state.canvas.rows = MIN_CANVAS_ROWS;
    return;
  }
  const bounds = contentBounds();
  const contentWidth = bounds.maxX - bounds.minX;
  const contentHeight = bounds.maxY - bounds.minY;
  const cols = Math.max(1, contentWidth);
  const rows = Math.max(1, contentHeight);
  const offsetX = -bounds.minX;
  const offsetY = -bounds.minY;
  if (offsetX || offsetY) state.widgets.forEach((widget) => { widget.x += offsetX; widget.y += offsetY; });
  state.canvas.cols = cols;
  state.canvas.rows = rows;
}

function ensureCanvasOrigin() {
  if (state.canvas.originReady || !state.widgets.length) return;
  const minX = Math.min(...state.widgets.map((widget) => widget.x)); const minY = Math.min(...state.widgets.map((widget) => widget.y));
  const dx = Math.max(0, -minX); const dy = Math.max(0, -minY);
  state.widgets.forEach((widget) => { widget.x += dx; widget.y += dy; });
  state.canvas.originReady = true;
  persistProject();
}

function findAvailableSpace(w, h, ignoredId) {
  if (!state.widgets.some((widget) => widget.id !== ignoredId)) return { x: 0, y: 0 };
  const bounds = contentBounds();
  for (let y = 0; y <= bounds.maxY; y++) for (let x = 0; x <= bounds.maxX; x++) {
    const candidate = { x, y, w, h };
    if (!hasCollision(candidate, ignoredId) && !layoutHasForbiddenBlank(candidate, ignoredId)) return { x, y };
  }
  return { x: bounds.maxX, y: 0 };
}

function rectanglesOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function hasCollision(candidate, exceptId) {
  return state.widgets.some((widget) => widget.id !== exceptId && rectanglesOverlap(candidate, widget));
}

function maxEmptyRun(items, positionKey, sizeKey) {
  if (items.length < 2) return 0;
  const intervals = items.map((item) => [item[positionKey], item[positionKey] + item[sizeKey]]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  let end = intervals[0][1];
  let largest = 0;
  for (let index = 1; index < intervals.length; index++) {
    largest = Math.max(largest, intervals[index][0] - end);
    end = Math.max(end, intervals[index][1]);
  }
  return largest;
}

function layoutHasForbiddenBlank(candidate, exceptId) {
  const items = state.widgets.filter((widget) => widget.id !== exceptId).concat(candidate);
  return maxEmptyRun(items, 'x', 'w') >= FORBIDDEN_EMPTY_RUN || maxEmptyRun(items, 'y', 'h') >= FORBIDDEN_EMPTY_RUN;
}

function addWidget(type) {
  const definition = widgetDefinitions[type]; const position = findAvailableSpace(definition.default.w, definition.default.h);
  const id = `${type}-${Date.now()}`;
  const settings = type === 'stack' ? { children: [], activeIndex: 0, direction: 'up', duration: 2.5 } : type === 'featured' ? { title: '', flightIds: [], airportLabelMode: 'both', showRemark: true, showTags: true } : type === 'summary' ? { metrics: ['segments', 'airports'] } : type === 'ranking' ? { rankingType: 'airline', airportLabelMode: 'both' } : type === 'extremes' ? { extremeScope: 'airport' } : type === 'trend' ? { chartType: 'line', showValues: false, showAxes: true, showPoints: true, period: 'month' } : type === 'calendar' ? { calendarScale: '53weeks' } : type === 'map' ? { airportLabelMode: 'both', airportVisibility: 'all', highlightRoutes: '' } : type === 'heatmap' ? { heatmapLocationMode: 'airport', airportLabelMode: 'both' } : type === 'text' ? { text: '', fontFamily: 'noto-sans', textAlign: 'center', fontSizeOffset: 0 } : type === 'image' ? { imageData: '', imagePreviewData: '', imageScale: 1, imageOffsetX: 0, imageOffsetY: 0, note: '', notePosition: 'bottom-left' } : {};
  closeCardPicker();
  state.widgets.push({ id, type, ...position, ...definition.default, settings }); state.selectedWidgetId = id; saveHistory(); renderAll(); showToast(`已添加${definition.name}`);
  requestAnimationFrame(() => fitCanvas(true));
}

function openCardPicker() {
  hideCatalogPreview();
  const picker = $('#card-picker');
  if (!picker.open) picker.showModal();
}

function closeCardPicker() {
  hideCatalogPreview();
  const picker = $('#card-picker');
  if (picker?.open) picker.close();
}

function openStackPicker(stackId, slot = 0) {
  const stack = state.widgets.find((widget) => widget.id === stackId && widget.type === 'stack');
  if (!stack || stackChildren(stack).length >= 2) return;
  stackPickerTarget = { stackId, slot: Number(slot) };
  const existing = state.widgets.filter((widget) => widget.id !== stackId && widget.type !== 'stack');
  const existingMarkup = existing.length ? `<div class="stack-picker-grid">${existing.map((widget) => `<button class="stack-picker-card" data-stack-existing="${widget.id}" type="button"><span aria-hidden="true">${widgetDefinitions[widget.type]?.icon || '□'}</span><strong>${escapeHtml(widgetDefinitions[widget.type]?.name || '卡片')}</strong><small>从画布移入</small></button>`).join('')}</div>` : '<div class="stack-picker-empty">画布上没有可移入的独立卡片</div>';
  const newMarkup = Object.entries(widgetDefinitions).filter(([type]) => type !== 'stack').map(([type, definition]) => `<button class="stack-picker-card" data-stack-new="${type}" type="button"><span aria-hidden="true">${definition.icon}</span><strong>${definition.name}</strong><small>新建卡片</small></button>`).join('');
  $('#stack-picker-content').innerHTML = `<section class="stack-picker-section"><h3>画布上的卡片</h3>${existingMarkup}</section><section class="stack-picker-section"><h3>新建卡片</h3><div class="stack-picker-grid">${newMarkup}</div></section>`;
  $('#stack-picker').showModal();
}

function closeStackPicker() {
  stackPickerTarget = null;
  if ($('#stack-picker').open) $('#stack-picker').close();
}

function addExistingWidgetToStack(widgetId) {
  const stack = state.widgets.find((widget) => widget.id === stackPickerTarget?.stackId && widget.type === 'stack');
  const index = state.widgets.findIndex((widget) => widget.id === widgetId && widget.type !== 'stack');
  if (!stack || index < 0 || stackChildren(stack).length >= 2) return;
  const [child] = state.widgets.splice(index, 1);
  child.w = stack.w; child.h = stack.h;
  stack.settings.children.push(child);
  stack.settings.activeIndex = Math.min(Number(stack.settings.activeIndex || 0), stack.settings.children.length - 1);
  state.selectedWidgetId = child.id;
  closeStackPicker();
  saveHistory(); renderAll();
}

function createWidgetInStack(type) {
  const stack = state.widgets.find((widget) => widget.id === stackPickerTarget?.stackId && widget.type === 'stack');
  const definition = widgetDefinitions[type];
  if (!stack || !definition || type === 'stack' || stackChildren(stack).length >= 2) return;
  const settings = type === 'featured' ? { title: '', flightIds: [], airportLabelMode: 'both', showRemark: true, showTags: true } : type === 'summary' ? { metrics: ['segments', 'airports'] } : type === 'ranking' ? { rankingType: 'airline', airportLabelMode: 'both' } : type === 'extremes' ? { extremeScope: 'airport' } : type === 'trend' ? { chartType: 'line', showValues: false, showAxes: true, showPoints: true, period: 'month' } : type === 'calendar' ? { calendarScale: '53weeks' } : type === 'map' ? { airportLabelMode: 'both', airportVisibility: 'all', highlightRoutes: '' } : type === 'heatmap' ? { heatmapLocationMode: 'airport', airportLabelMode: 'both' } : type === 'text' ? { text: '', fontFamily: 'noto-sans', textAlign: 'center', fontSizeOffset: 0 } : type === 'image' ? { imageData: '', imagePreviewData: '', imageScale: 1, imageOffsetX: 0, imageOffsetY: 0, note: '', notePosition: 'bottom-left' } : {};
  const child = { id: `${type}-${Date.now()}`, type, x: 0, y: 0, w: stack.w, h: stack.h, settings };
  stack.settings.children.push(child);
  state.selectedWidgetId = child.id;
  closeStackPicker();
  saveHistory(); renderAll();
}

function removeStackChild(childId) {
  const stack = parentStackForChild(childId); if (!stack) return;
  const childIndex = stack.settings.children.findIndex((child) => child.id === childId);
  const [child] = stack.settings.children.splice(childIndex, 1);
  stack.settings.activeIndex = Math.min(Number(stack.settings.activeIndex || 0), Math.max(0, stack.settings.children.length - 1));
  const next = findClosestOpenSpace(child.w, child.h, { x: stack.x + stack.w, y: stack.y }, child.id) || findAvailableSpace(child.w, child.h);
  child.x = next.x; child.y = next.y;
  state.widgets.push(child);
  state.selectedWidgetId = stack.id;
  saveHistory(); renderAll();
}

function dissolveStack(stackId) {
  const index = state.widgets.findIndex((widget) => widget.id === stackId && widget.type === 'stack');
  if (index < 0) return;
  const [stack] = state.widgets.splice(index, 1);
  const children = stackChildren(stack);
  children.forEach((child) => {
    const position = findAvailableSpace(child.w, child.h);
    child.x = position.x; child.y = position.y;
    state.widgets.push(child);
  });
  state.selectedWidgetId = children[0]?.id || null;
  saveHistory(); renderAll();
}

// Newly added cards always return the view to the current content bounds.
function resizeWidget(id, w, h) {
  const widget = state.widgets.find((item) => item.id === id); if (!widget) return;
  if (!Number.isSafeInteger(w) || !Number.isSafeInteger(h) || w < 1 || h < 1 || w > 9 || h > 9) { showToast('卡片宽高只能输入 1 到 9 的整数。'); renderInspector(); return; }
  const previous = { w: widget.w, h: widget.h, x: widget.x, y: widget.y };
  const positions = new Map(state.widgets.map((item) => [item.id, { x: item.x, y: item.y }]));
  widget.w = w; widget.h = h;
  const displaced = state.widgets.filter((item) => item.id !== widget.id && rectanglesOverlap(widget, item));
  for (const item of displaced) {
    const original = { x: item.x, y: item.y };
    const next = findClosestOpenSpace(item.w, item.h, original, item.id);
    if (!next) { Object.assign(widget, previous); state.widgets.forEach((moved) => Object.assign(moved, positions.get(moved.id))); showToast('没有足够空间为相邻组件腾位。'); return; }
    item.x = next.x; item.y = next.y;
  }
  if (widget.type === 'stack') stackChildren(widget).forEach((child) => { child.w = w; child.h = h; });
  saveHistory(); renderAll();
}

function findClosestOpenSpace(w, h, origin, ignoredId) {
  const bounds = contentBounds();
  const limit = Math.max(Math.abs(origin.x - bounds.minX), Math.abs(origin.x - bounds.maxX), Math.abs(origin.y - bounds.minY), Math.abs(origin.y - bounds.maxY)) + Math.max(w, h) + FORBIDDEN_EMPTY_RUN + 2;
  for (let radius = 0; radius <= limit; radius++) {
    for (let y = origin.y - radius; y <= origin.y + radius; y++) for (let x = origin.x - radius; x <= origin.x + radius; x++) {
      if (x < 0 || y < 0 || Math.max(Math.abs(x - origin.x), Math.abs(y - origin.y)) !== radius) continue;
      const candidate = { x, y, w, h };
      if (!hasCollision(candidate, ignoredId) && !layoutHasForbiddenBlank(candidate, ignoredId)) return { x, y };
    }
  }
  return null;
}

function removeWidget(id) {
  if (parentStackForChild(id)) { removeStackChild(id); return; }
  state.widgets = state.widgets.filter((widget) => widget.id !== id); state.selectedWidgetId = null; saveHistory(); renderAll();
}

function resetMapView(id) {
  const widget = findWidgetById(id);
  if (!['map', 'heatmap'].includes(widget?.type)) return;
  widget.settings ??= {};
  delete widget.settings.mapView;
  saveHistory();
  renderAll();
}

function bindWidgetInteractions(card) {
  card.addEventListener('click', (event) => {
    if (event.target.closest('button')) return;
    const child = event.target.closest('[data-stack-child-id]');
    if (child) { selectWidget(child.dataset.stackChildId); return; }
    if (suppressedCardClickId === card.dataset.widgetId) { suppressedCardClickId = null; return; }
    selectWidget(card.dataset.widgetId);
  });
  card.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    const child = event.target.closest('[data-stack-child-id]');
    selectWidget(child?.dataset.stackChildId || card.dataset.widgetId);
  });
}

function currentCanvasScale() { return Number(canvasEl.dataset.scale || 1); }

function applyCanvasViewport(scale = currentCanvasScale()) {
  $('#canvas-scale').style.transform = `translate(${viewportOffsetX}px, ${viewportOffsetY}px) scale(${scale})`;
}

function contentBounds() {
  if (!state.widgets.length) return { minX: 0, minY: 0, maxX: MIN_CANVAS_COLS, maxY: MIN_CANVAS_ROWS };
  return { minX: Math.min(...state.widgets.map((widget) => widget.x)), minY: Math.min(...state.widgets.map((widget) => widget.y)), maxX: Math.max(...state.widgets.map((widget) => widget.x + widget.w)), maxY: Math.max(...state.widgets.map((widget) => widget.y + widget.h)) };
}

function fitCanvas(resetView = false) {
  if (resetView) { viewportScale = null; viewportOffsetX = 0; viewportOffsetY = 0; }
  const stageStyle = getComputedStyle(stageEl);
  const horizontalPadding = parseFloat(stageStyle.paddingLeft) + parseFloat(stageStyle.paddingRight);
  const verticalPadding = parseFloat(stageStyle.paddingTop) + parseFloat(stageStyle.paddingBottom);
  const availableWidth = Math.max(1, stageEl.clientWidth - horizontalPadding);
  const availableHeight = Math.max(1, stageEl.clientHeight - verticalPadding);
  const canvasWidth = state.canvas.cols * UNIT;
  const canvasHeight = state.canvas.rows * UNIT;
  const fittedScale = Math.min(1, availableWidth / canvasWidth, availableHeight / canvasHeight);
  const scale = viewportScale ?? fittedScale;
  canvasEl.dataset.scale = String(scale); applyCanvasViewport(scale);
  $('#canvas-scale').style.width = `${canvasWidth * scale}px`; $('#canvas-scale').style.height = `${canvasHeight * scale}px`;
  if (resetView) requestAnimationFrame(() => {
    stageEl.scrollLeft = 0;
    stageEl.scrollTop = 0;
    positionCardInspector();
  });
}

function rowsToFlights(rows) {
  if (rows.length < 2) throw new Error('文件中没有可导入的数据行。');
  const headers = rows[0].map((header) => header.trim());
  const aliases = { date: ['date', '日期', '起飞日期'], flightNumber: ['flightnumber', 'flightno', 'no', '航班号'], originIata: ['originiata', 'origin', '出发机场', '出发iata', 'dept'], destinationIata: ['destinationiata', 'destination', '到达机场', '到达iata', 'dst'], airlineName: ['airlinename', 'airline', '航司', '航空公司'], aircraftType: ['aircrafttype', 'aircraft', '机型'], departureTime: ['departuretime', 'departure', '起飞时间', 'depttime'], arrivalTime: ['arrivaltime', 'arrival', '到达时间', 'dsttime'], distanceKm: ['distancekm', 'distance', '距离', '距离km', 'mileage'], registration: ['registration', 'reg', '注册号'], remark: ['remark', '备注', '注释'], tags: ['tags', 'tag', '标签'] };
  const normalHeader = (header) => String(header || '').trim().toLowerCase().replace(/[\s_.-]/g, '');
  const indexFor = (key) => headers.findIndex((header) => aliases[key].map(normalHeader).includes(normalHeader(header)));
  const index = Object.fromEntries(Object.keys(aliases).map((key) => [key, indexFor(key)]));
  if (index.originIata < 0 || index.destinationIata < 0) throw new Error('需要至少包含出发机场和到达机场列。');
  const tagsByName = new Map(state.tags.map((tag) => [tag.name, tag]));
  const record = (row, rowIndex) => {
    const get = (key) => index[key] >= 0 ? row[index[key]]?.trim() : '';
    const tagNames = get('tags').split(/[|,，]/).map((name) => name.trim()).filter(Boolean);
    const tagIds = tagNames.map((name) => { if (!tagsByName.has(name)) { const tag = { id: `tag-${Date.now()}-${tagsByName.size}`, name, color: ['#e9573f', '#1677c8', '#16856d', '#d18919'][tagsByName.size % 4] }; state.tags.push(tag); tagsByName.set(name, tag); } return tagsByName.get(name).id; });
    const origin = get('originIata').toUpperCase(); const destination = get('destinationIata').toUpperCase();
    return { id: `import-${Date.now()}-${rowIndex}`, enabled: true, date: normalizeFlightDate(get('date')), flightNumber: get('flightNumber'), originIata: origin, destinationIata: destination, airlineName: get('airlineName'), aircraftType: get('aircraftType'), departureTime: get('departureTime'), arrivalTime: get('arrivalTime'), registration: get('registration'), remark: get('remark'), distanceKm: Number(get('distanceKm')) || calculateDistance(origin, destination), tagIds, primaryTagId: tagIds[0] || undefined };
  };
  const nonBlankRows = rows.slice(1).filter((row) => row.some((cell) => String(cell || '').trim()));
  const rawValue = (row, key) => index[key] >= 0 ? String(row[index[key]] || '').trim() : '';
  const validDataRow = (row) => normalizeFlightDate(rawValue(row, 'date')) && rawValue(row, 'flightNumber') && /^[A-Z]{3}$/.test(rawValue(row, 'originIata').toUpperCase()) && /^[A-Z]{3}$/.test(rawValue(row, 'destinationIata').toUpperCase());
  const imported = nonBlankRows.filter(validDataRow).map(record);
  lastImportSkippedRows = nonBlankRows.length - imported.length;
  return imported;
}

function validImportedFlight(flight) {
  if (!flight || typeof flight !== 'object') return false;
  const origin = String(flight.originIata || '').trim().toUpperCase();
  const destination = String(flight.destinationIata || '').trim().toUpperCase();
  return Boolean(normalizeFlightDate(flight.date) && String(flight.flightNumber || '').trim() && /^[A-Z]{3}$/.test(origin) && /^[A-Z]{3}$/.test(destination));
}

function csvToFlights(text) { return rowsToFlights(parseCsv(text)); }

function parseCsv(text) {
  const output = []; let row = []; let value = ''; let quoted = false;
  for (let i = 0; i < text.length; i++) { const char = text[i]; const next = text[i + 1]; if (char === '"' && quoted && next === '"') { value += '"'; i++; } else if (char === '"') quoted = !quoted; else if (char === ',' && !quoted) { row.push(value); value = ''; } else if ((char === '\n' || char === '\r') && !quoted) { if (char === '\r' && next === '\n') i++; row.push(value); output.push(row); row = []; value = ''; } else value += char; }
  row.push(value); output.push(row); return output;
}

function calculateDistance(origin, destination) {
  const a = airportFor(origin); const b = airportFor(destination); if (!a.latitude || !b.latitude) return 0;
  const r = 6371; const dLat = (b.latitude - a.latitude) * Math.PI / 180; const dLng = (b.longitude - a.longitude) * Math.PI / 180; const value = Math.sin(dLat / 2) ** 2 + Math.cos(a.latitude * Math.PI / 180) * Math.cos(b.latitude * Math.PI / 180) * Math.sin(dLng / 2) ** 2; return Math.round(r * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value)));
}

async function loadAirportData() {
  try {
    const response = await fetch('./assets/airports.csv'); if (!response.ok) return;
    const rows = parseCsv(await response.text()); const headers = rows[0]; const iataIndex = headers.findIndex((header) => header === 'IATA'); const nameIndex = headers.findIndex((header) => header.includes('简名')); const coordinateIndex = headers.findIndex((header) => header === '坐标');
    rows.slice(1).forEach((row) => { const [latitude, longitude] = (row[coordinateIndex] || '').split(',').map(Number); if (row[iataIndex] && latitude && longitude) state.airports[row[iataIndex]] = { city: row[nameIndex] || row[iataIndex], latitude, longitude }; });
    renderAll();
  } catch { /* 浏览器以 file:// 打开时继续使用内置机场集 */ }
}

function setPanel(panelId) { $$('.stage-button').forEach((button) => { const active = button.dataset.panel === panelId; button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active)); }); $$('.settings-panel').forEach((panel) => panel.classList.toggle('active', panel.id === panelId)); }

function defaultFilters() { return { start: '', end: '', airlines: [], aircraft: [], airlineMode: 'all', aircraftMode: 'all', tags: [] }; }

function toggleFilterValue(filter, value) {
  if (filter !== 'airline' && filter !== 'aircraft') {
    const key = `${filter}s`; const list = state.filters[key]; state.filters[key] = list.includes(value) ? list.filter((item) => item !== value) : [...list, value]; saveHistory(); renderAll(); return;
  }
  const values = filter === 'airline' ? [...new Set(state.flights.map(airlineCode).filter(Boolean))] : [...new Set(state.flights.flatMap(aircraftTypes))];
  const modeKey = `${filter}Mode`; const listKey = `${filter}s`; const selected = state.filters[modeKey] === 'all' ? values : state.filters[listKey];
  const next = selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value];
  state.filters[modeKey] = next.length === values.length ? 'all' : 'custom'; state.filters[listKey] = state.filters[modeKey] === 'all' ? [] : next;
  saveHistory(); renderAll();
}

function setTheme(theme) { state.canvas.theme = theme; saveHistory(); renderAll(); }

function triggerDownload(url, filename) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function serverDownloadUrl(token, filename) {
  return `/api/exact-download/${encodeURIComponent(token)}?filename=${encodeURIComponent(filename)}`;
}

function triggerServerDownload(token, filename) {
  const frame = document.createElement('iframe');
  frame.hidden = true;
  frame.src = serverDownloadUrl(token, filename);
  document.body.appendChild(frame);
  setTimeout(() => frame.remove(), 60000);
}

async function chooseExportDestination(filename, description, type, extension) {
  if (typeof window.showSaveFilePicker !== 'function') return { handle: null, cancelled: false };
  try {
    const handle = await window.showSaveFilePicker({ suggestedName: filename, types: [{ description, accept: { [type]: [extension] } }] });
    return { handle, cancelled: false };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return { handle: null, cancelled: true };
    return { handle: null, cancelled: false };
  }
}

async function saveExportBlob(blob, filename, handle) {
  if (handle) {
    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();
    return;
  }
  if (blob.exactDownloadToken) {
    triggerServerDownload(blob.exactDownloadToken, filename);
    return;
  }
  const url = URL.createObjectURL(blob);
  triggerDownload(url, filename);
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

function projectMercator(latitude, longitude, zoom) {
  const scale = 256 * (2 ** zoom); const latitudeRadians = Math.max(-85, Math.min(85, latitude)) * Math.PI / 180;
  return { x: (longitude + 180) / 360 * scale, y: (1 - Math.asinh(Math.tan(latitudeRadians)) / Math.PI) / 2 * scale };
}

function exportServiceMap(widget, flights, text, dark, includeTiles = true) {
  const insets = { x: 12, y: 14, w: widget.w * UNIT - 24, h: widget.h * UNIT - 28 };
  const view = widget.settings?.mapView || { center: [35.5, 103], zoom: 4.2 };
  const zoom = Math.max(2, Math.min(7, Math.round(view.zoom)));
  const center = projectMercator(view.center[0], view.center[1], zoom); const tileSize = 256; const worldTiles = 2 ** zoom;
  const startX = Math.floor((center.x - insets.w / 2) / tileSize); const endX = Math.floor((center.x + insets.w / 2) / tileSize);
  const startY = Math.floor((center.y - insets.h / 2) / tileSize); const endY = Math.floor((center.y + insets.h / 2) / tileSize);
  const tileSet = dark ? 'dark_nolabels' : 'light_nolabels'; const clipId = `map-clip-${widget.id}`;
  const tiles = []; if (includeTiles) for (let y = startY; y <= endY; y++) for (let x = startX; x <= endX; x++) {
    if (y < 0 || y >= worldTiles) continue;
    const px = x * tileSize - center.x + insets.w / 2; const py = y * tileSize - center.y + insets.h / 2;
    tiles.push(`<image href="https://a.basemaps.cartocdn.com/${tileSet}/${zoom}/${((x % worldTiles) + worldTiles) % worldTiles}/${y}.png" crossorigin="anonymous" x="${px}" y="${py}" width="${tileSize}" height="${tileSize}"/>`);
  }
  const point = (airport) => { const p = projectMercator(airport.latitude, airport.longitude, zoom); return { x: p.x - center.x + insets.w / 2, y: p.y - center.y + insets.h / 2 }; };
  const routes = flights.map((flight) => { const from = airportFor(flight.originIata); const to = airportFor(flight.destinationIata); if (!from.latitude || !to.latitude) return ''; const a = point(from); const b = point(to); const color = tagFor(flight.primaryTagId)?.color || state.canvas.accent; return `<path d="M${a.x} ${a.y} L${b.x} ${b.y}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round"/><circle cx="${a.x}" cy="${a.y}" r="4" fill="${dark ? '#1c1c1e' : '#fff'}" stroke="${text}" stroke-width="1"/><circle cx="${b.x}" cy="${b.y}" r="4" fill="${dark ? '#1c1c1e' : '#fff'}" stroke="${text}" stroke-width="1"/>`; }).join('');
  const mapFill = dark ? '#101617' : '#e7edf1';
  const gridStroke = dark ? '#2c3935' : '#cbd6d1';
  const grid = Array.from({ length: 8 }, (_, index) => `<path d="M${index * insets.w / 7} 0V${insets.h}M0 ${index * insets.h / 7}H${insets.w}" fill="none" stroke="${gridStroke}" stroke-width="1" opacity=".45"/>`).join('');
  return `<defs><clipPath id="${clipId}"><rect width="${insets.w}" height="${insets.h}" rx="24"/></clipPath></defs><g transform="translate(${insets.x},${insets.y})" clip-path="url(#${clipId})"><rect width="${insets.w}" height="${insets.h}" fill="${mapFill}"/>${grid}${tiles.join('')}${routes}</g>`;
}

function staticExportWidgets() {
  return state.widgets.flatMap((widget) => {
    if (widget.type !== 'stack') return [widget];
    const children = stackChildren(widget); if (!children.length) return [];
    const active = children[Math.min(children.length - 1, Math.max(0, Number(widget.settings?.activeIndex || 0)))];
    return [{ ...active, x: widget.x, y: widget.y, w: widget.w, h: widget.h }];
  });
}

function motionEase(value) { return value < .5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2; }
function motionAmount(progress) {
  if (progress <= .18) return 0;
  if (progress >= .78) return 1;
  return motionEase((progress - .18) / .6);
}

function motionStateForStackLegacy(stack, timeSeconds) {
  const duration = Math.max(.1, Number(stack.settings?.duration || 2.5));
  const progress = Math.max(0, Math.min(1, Number(timeSeconds || 0) / duration));
  const amount = motionAmount(progress);
  const direction = state.canvas.stackDirection || 'up';
  const travel = direction === 'left' ? stack.w * UNIT * 1.08 : stack.h * UNIT * 1.08;
  const rearOffset = (1 - amount) * 18;
  return {
    rear: { x: direction === 'left' ? rearOffset : 0, y: direction === 'up' ? rearOffset : 0, scale: .94 + amount * .06, opacity: .78 + amount * .22 },
    front: { x: direction === 'left' ? -travel * amount : 0, y: direction === 'up' ? -travel * amount : 0, scale: 1 - amount * .015, opacity: 1 - Math.max(0, (amount - .7) / .3) },
  };
}

function applyMotionFrameToCanvasLegacy(timeSeconds) {
  completeStacks().forEach((stack) => {
    const card = canvasEl.querySelector(`[data-widget-id="${stack.id}"]`);
    if (!card) return;
    const motion = motionStateForStack(stack, timeSeconds);
    ['rear', 'front'].forEach((role) => {
      const layer = card.querySelector(`[data-stack-motion-layer="${role}"]`);
      if (!layer) return;
      const value = motion[role];
      layer.style.transform = `translate3d(${value.x}px, ${value.y}px, 0) scale(${value.scale})`;
      layer.style.opacity = String(value.opacity);
    });
  });
}

function resolvedMotionBackground() {
  const canvasBackground = getComputedStyle(canvasEl).backgroundColor;
  if (canvasBackground && canvasBackground !== 'rgba(0, 0, 0, 0)') return canvasBackground;
  const stageBackground = getComputedStyle(stageEl).backgroundColor;
  return stageBackground && stageBackground !== 'rgba(0, 0, 0, 0)' ? stageBackground : window.matchMedia('(prefers-color-scheme: dark)').matches ? '#000000' : '#f2f2f7';
}

function exportSvg() {
  const width = state.canvas.cols * UNIT; const height = state.canvas.rows * UNIT; const bg = state.canvas.theme === 'light' ? '#ffffff' : state.canvas.theme === 'dark' ? '#12201e' : 'transparent'; const text = state.canvas.theme === 'dark' ? '#eef6f3' : '#152320';
  const widgetTone = (widget) => {
    if (widget.appearance === 'highlight') { const surface = widgetCustomColor(widget); const foreground = contrastColorForHex(surface); return { dark: isDarkHex(surface), text: foreground, surface, stroke: foreground, accent: foreground }; }
    const dark = widget.appearance === 'dark' || (!widget.appearance || widget.appearance === 'inherit') && state.canvas.theme === 'dark';
    return { dark, text: dark ? '#eef6f3' : '#152320', surface: dark ? '#1a2b28' : '#ffffff', stroke: dark ? '#345047' : '#dbe6e1', accent: state.canvas.accent };
  };
  const card = (widget, content) => {
    const tone = widgetTone(widget); const width = widget.w * UNIT - 14; const height = widget.h * UNIT - 14;
    const motion = widget._motion || { dx: 0, dy: 0, scale: 1, opacity: 1 };
    const originX = widget.x * UNIT + 7; const originY = widget.y * UNIT + 7;
    const transform = `translate(${originX + width / 2 + motion.dx},${originY + height / 2 + motion.dy}) scale(${motion.scale}) translate(${-width / 2},${-height / 2})`;
    return `<g opacity="${motion.opacity}" transform="${transform}"><rect width="${width}" height="${height}" rx="24" fill="${tone.surface}" stroke="${tone.stroke}" stroke-opacity=".18"/>${content}</g>`;
  };
  const exportWidgets = staticExportWidgets();
  const includeMapTiles = false;
  const flights = visibleFlights(); const svgWidgets = exportWidgets.map((widget) => {
    const tone = widgetTone(widget); const title = escapeHtml(widgetDefinitions[widget.type].name); const text = tone.text; const dark = tone.dark; const accent = tone.accent;
    if (widget.type === 'summary') { const airports = new Set(flights.flatMap((flight) => [flight.originIata, flight.destinationIata])); return card(widget, `<text x="14" y="24" fill="${text}" font-size="10" font-weight="700">${title}</text><text x="15" y="74" fill="${accent}" font-size="30" font-weight="800">${flights.length}</text><text x="15" y="93" fill="${text}" opacity=".6" font-size="10">飞行航段</text><text x="${widget.w * UNIT / 2 + 5}" y="74" fill="${accent}" font-size="30" font-weight="800">${airports.size}</text><text x="${widget.w * UNIT / 2 + 5}" y="93" fill="${text}" opacity=".6" font-size="10">抵达机场</text>`); }
    if (widget.type === 'longest') { const flight = [...flights].sort((a,b) => b.distanceKm - a.distanceKm)[0]; const route = flight ? `${flight.originIata}  →  ${flight.destinationIata}` : '暂无航班'; return card(widget, `<text x="14" y="24" fill="${text}" font-size="10" font-weight="700">${title}</text><text x="14" y="52" fill="${accent}" font-size="17" font-weight="800">${route}</text><text x="14" y="76" fill="${text}" opacity=".65" font-size="10">${flight ? `${formatKm(flight.distanceKm)} · ${flight.aircraftType || ''}` : ''}</text>`); }
    if (widget.type === 'featured') { const selected = cardFlights(widget, flights); const cardTitle = escapeHtml(widget.settings?.title?.trim() || selected[0]?.registration || '注册号未知'); const entries = selected.slice(0, 3).map((flight, index) => `<g transform="translate(${14 + index * Math.max(0, (widget.w * UNIT - 28) / Math.max(1, selected.length))},0)"><text x="0" y="25" fill="${accent}" font-size="10" font-weight="800">${cardTitle}</text><text x="0" y="51" fill="${text}" font-size="16" font-weight="800">${escapeHtml(flight.originIata)}  →  ${escapeHtml(flight.destinationIata)}</text><text x="0" y="74" fill="${text}" opacity=".65" font-size="10">${escapeHtml(flight.flightNumber || '')} · ${escapeHtml(airlineCode(flight))}</text><text x="0" y="94" fill="${text}" opacity=".55" font-size="9">${escapeHtml(flight.date || '')} · ${formatKm(flight.distanceKm)}</text></g>`).join(''); return card(widget, entries || `<text x="14" y="54" fill="${text}" opacity=".6" font-size="11">当前没有可展示的航班</text>`); }
    if (widget.type === 'ranking') { const rows = rankingItems(flights, widget.settings?.rankingType, widget.settings?.airportLabelMode).slice(0, 5).map((item, index) => `<text x="17" y="${55 + index * 24}" fill="${text}" font-size="11" font-weight="700">${index + 1}  ${escapeHtml(item.name)}</text><text x="${widget.w * UNIT - 30}" y="${55 + index * 24}" fill="${text}" opacity=".6" font-size="10">${item.count}</text>`).join(''); return card(widget, `<text x="14" y="24" fill="${text}" font-size="10" font-weight="700">${title}</text>${rows}`); }
    if (widget.type === 'extremes') { const scope = widget.settings?.extremeScope || 'airport'; const values = geographicExtremes(flights, scope); const valueSize = widget.w === 1 && widget.h === 1 ? 15 : scope === 'city' ? 16 : 13; const rows = values.map((item, index) => `<text x="${20 + (index % 2) * (widget.w * UNIT / 2)}" y="${58 + Math.floor(index / 2) * 48}" fill="${accent}" font-size="10" font-weight="800">${item.label}</text><text x="${20 + (index % 2) * (widget.w * UNIT / 2)}" y="${76 + Math.floor(index / 2) * 48}" fill="${text}" font-size="${valueSize}" font-weight="800">${escapeHtml(item.place.primary)}</text>`).join(''); return card(widget, `<text x="14" y="24" fill="${text}" font-size="10" font-weight="700">${title}</text>${rows}`); }
    if (widget.type === 'trend') { const period = widget.settings?.period || 'month'; const type = widget.settings?.chartType || 'line'; const values = trendSeries(flights, period); const chartWidth = Math.max(150, widget.w * UNIT - 42); const chartHeight = Math.max(90, widget.h * UNIT - 58); const chart = trendChartMarkup(values, { width: chartWidth, height: chartHeight, type, showValues: widget.settings?.showValues === true, showAxes: widget.settings?.showAxes !== false, showPoints: widget.settings?.showPoints !== false, accent, muted: text, text, surface: tone.surface, border: tone.stroke }); return card(widget, `<text x="14" y="24" fill="${text}" font-size="10" font-weight="700">${title}</text><svg x="14" y="32" width="${chartWidth}" height="${chartHeight}" viewBox="0 0 ${chartWidth} ${chartHeight}">${chart}</svg>`); }
    if (widget.type === 'calendar') {
      const scale = widget.settings?.calendarScale || '53weeks'; const items = calendarItems(flights, scale); if (!items.length) return card(widget, `<text x="14" y="54" fill="${text}" opacity=".6" font-size="11">没有可用于绘制日历的日期</text>`); const grid = calendarGrid(widget, items.length); const oneByOne = Number(widget.w) === 1 && Number(widget.h) === 1; const shape = calendarScaleNeedsLarge(scale) || oneByOne ? 'dot' : 'square';
      const chartWidth = Math.max(120, widget.w * UNIT - 42); const chartHeight = Math.max(80, widget.h * UNIT - 58); const gap = 2;
      const cellWidth = (chartWidth - gap * (grid.columns - 1)) / grid.columns; const cellHeight = (chartHeight - gap * (grid.rows - 1)) / grid.rows;
      const cells = items.map((item, index) => { const column = index % grid.columns; const row = Math.floor(index / grid.columns); const x = column * (cellWidth + gap); const y = row * (cellHeight + gap); const opacity = item.count ? Math.min(1, .3 + item.count * .18) : .09; const size = Math.max(1.5, Math.min(shape === 'square' ? cellWidth * .84 : cellWidth * .62, cellHeight * (shape === 'square' ? .84 : .62))); const monthSize = scale === '53weeks' ? Math.max(6, Math.min(14, size * .22)) : Math.max(3, size * .28); const mark = item.marker ? item.markerType === 'year' ? `<text x="${x + cellWidth / 2}" y="${y + cellHeight / 2}" fill="${text}" font-size="${Math.max(3, size * .26)}" font-weight="800" text-anchor="middle"><tspan x="${x + cellWidth / 2}" dy="-${Math.max(1, size * .12)}">${escapeHtml(item.marker.split('|')[0])}</tspan><tspan x="${x + cellWidth / 2}" dy="${Math.max(2, size * .25)}">${escapeHtml(item.marker.split('|')[1])}</tspan></text>` : `<text x="${x + cellWidth / 2}" y="${y + cellHeight / 2 + 1.5}" fill="${text}" font-size="${monthSize}" font-weight="800" text-anchor="middle">${escapeHtml(item.marker)}</text>` : ''; return shape === 'square' ? `<rect x="${x + (cellWidth - size) / 2}" y="${y + (cellHeight - size) / 2}" width="${size}" height="${size}" rx="2" fill="${accent}" opacity="${opacity}"/>${mark}` : `<circle cx="${x + cellWidth / 2}" cy="${y + cellHeight / 2}" r="${size / 2}" fill="${accent}" opacity="${opacity}"/>${mark}`; }).join('');
      return card(widget, `<text x="14" y="24" fill="${text}" font-size="10" font-weight="700">${title}</text><svg x="14" y="32" width="${chartWidth}" height="${chartHeight}" viewBox="0 0 ${chartWidth} ${chartHeight}">${cells}</svg>`);
    }
    if (widget.type === 'map') return card(widget, exportServiceMap(widget, flights, text, dark, includeMapTiles));
    return card(widget, `<text x="16" y="30" fill="${text}" font-size="13" font-weight="800">${title}</text><text x="16" y="57" fill="${text}" opacity=".55" font-size="10">Flight Canvas</text>`);
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="${bg}"/>${svgWidgets}</svg>`;
}

function updateMotionPreviewControlsLegacy() {
  const duration = motionTimelineDuration();
  motionPreviewTime = Math.max(0, Math.min(duration, motionPreviewTime));
  const progress = duration ? motionPreviewTime / duration : 0;
  $('#stop-motion-preview').disabled = !motionPreviewVisible;
  $('#motion-preview-scrubber').value = String(Math.round(progress * 1000));
  $('#motion-preview-time').textContent = `${motionPreviewTime.toFixed(1)} / ${duration.toFixed(1)} 秒`;
  const icon = motionPreviewPlaying ? 'Ⅱ' : motionPreviewVisible && duration && motionPreviewTime >= duration ? '↻' : '▶';
  const label = motionPreviewPlaying ? '暂停预览' : motionPreviewVisible && duration && motionPreviewTime >= duration ? '重新预览' : '播放预览';
  $('#preview-motion').innerHTML = `<span aria-hidden="true">${icon}</span><span>${label}</span>`;
}

function renderMotionPreviewLegacy(timeSeconds) {
  const duration = motionTimelineDuration();
  if (!duration) { hideMotionPreview(true); updateMotionPreviewControls(); return; }
  const enteringPreview = !motionPreviewVisible;
  motionPreviewVisible = true;
  motionPreviewTime = Math.max(0, Math.min(duration, Number(timeSeconds || 0)));
  document.body.classList.add('motion-preview-visible');
  canvasEl.style.backgroundColor = resolvedMotionBackground();
  if (enteringPreview && canvasEl.querySelector('.widget-stack.stack-expanded')) renderCanvas();
  else if (enteringPreview) updateMapEditability();
  applyMotionFrameToCanvas(motionPreviewTime);
  updateMotionPreviewControls();
}

function hideMotionPreviewLegacy(resetTime = false) {
  const wasVisible = motionPreviewVisible;
  cancelAnimationFrame(motionPreviewFrame);
  motionPreviewFrame = null;
  motionPreviewPlaying = false;
  motionPreviewVisible = false;
  if (resetTime) motionPreviewTime = 0;
  document.body.classList.remove('motion-preview-visible');
  canvasEl.style.removeProperty('background-color');
  if (wasVisible) renderCanvas();
}

function pauseMotionPreviewLegacy() {
  cancelAnimationFrame(motionPreviewFrame);
  motionPreviewFrame = null;
  motionPreviewPlaying = false;
  updateMotionPreviewControls();
}

function motionPreviewLoopLegacy(now) {
  if (!motionPreviewPlaying) return;
  const duration = motionTimelineDuration();
  if (!duration) { hideMotionPreview(true); renderExportControls(); return; }
  motionPreviewTime = Math.min(duration, (now - motionPreviewStartedAt) / 1000);
  renderMotionPreview(motionPreviewTime);
  if (motionPreviewTime >= duration) { pauseMotionPreview(); return; }
  motionPreviewFrame = requestAnimationFrame(motionPreviewLoop);
}

function toggleMotionPreviewLegacy() {
  if (motionPreviewPlaying) { pauseMotionPreview(); return; }
  const duration = motionTimelineDuration();
  if (!duration || motionExporting) return;
  if (!motionPreviewVisible || motionPreviewTime >= duration) motionPreviewTime = 0;
  renderMotionPreview(motionPreviewTime);
  motionPreviewPlaying = true;
  motionPreviewStartedAt = performance.now() - motionPreviewTime * 1000;
  updateMotionPreviewControls();
  motionPreviewFrame = requestAnimationFrame(motionPreviewLoop);
}

async function createPngBlobLegacy() {
  const svg = exportSvg(); const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })); const img = new Image(); await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = url; }); const canvas = document.createElement('canvas'); canvas.width = state.canvas.cols * UNIT * state.canvas.scale; canvas.height = state.canvas.rows * UNIT * state.canvas.scale; const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, canvas.width, canvas.height); URL.revokeObjectURL(url); return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

const MOV_TIMESCALE = 600;

function concatBytes(...parts) {
  const length = parts.reduce((sum, part) => sum + part.byteLength, 0);
  const result = new Uint8Array(length);
  let offset = 0;
  parts.forEach((part) => {
    const bytes = part instanceof Uint8Array ? part : new Uint8Array(part);
    result.set(bytes, offset);
    offset += bytes.byteLength;
  });
  return result;
}

function asciiBytes(value) { return Uint8Array.from([...value].map((character) => character.charCodeAt(0) & 255)); }
function zeroBytes(length) { return new Uint8Array(length); }
function uint16Bytes(value) { const bytes = new Uint8Array(2); new DataView(bytes.buffer).setUint16(0, value, false); return bytes; }
function int16Bytes(value) { const bytes = new Uint8Array(2); new DataView(bytes.buffer).setInt16(0, value, false); return bytes; }
function uint32Bytes(value) { const bytes = new Uint8Array(4); new DataView(bytes.buffer).setUint32(0, value >>> 0, false); return bytes; }

function movAtom(type, ...payload) {
  const body = concatBytes(...payload);
  return concatBytes(uint32Bytes(body.byteLength + 8), asciiBytes(type), body);
}

function movFullAtom(type, version, flags, ...payload) {
  return movAtom(type, Uint8Array.of(version, (flags >>> 16) & 255, (flags >>> 8) & 255, flags & 255), ...payload);
}

function movIdentityMatrix() {
  return concatBytes(
    uint32Bytes(0x00010000), uint32Bytes(0), uint32Bytes(0),
    uint32Bytes(0), uint32Bytes(0x00010000), uint32Bytes(0),
    uint32Bytes(0), uint32Bytes(0), uint32Bytes(0x40000000)
  );
}

function movCompressorName(value) {
  const name = asciiBytes(value.slice(0, 31));
  return concatBytes(Uint8Array.of(name.byteLength), name, zeroBytes(31 - name.byteLength));
}

function createMovSampleTable(frameSizes, chunkOffsets, frameDuration, width, height) {
  const visualEntry = concatBytes(
    uint32Bytes(86), asciiBytes('jpeg'), zeroBytes(6), uint16Bytes(1),
    uint16Bytes(0), uint16Bytes(0), zeroBytes(12), uint16Bytes(width), uint16Bytes(height),
    uint32Bytes(0x00480000), uint32Bytes(0x00480000), uint32Bytes(0), uint16Bytes(1),
    movCompressorName('Motion JPEG'), uint16Bytes(24), int16Bytes(-1)
  );
  const count = frameSizes.length;
  const stsd = movFullAtom('stsd', 0, 0, uint32Bytes(1), visualEntry);
  const stts = movFullAtom('stts', 0, 0, uint32Bytes(1), uint32Bytes(count), uint32Bytes(frameDuration));
  const stsc = movFullAtom('stsc', 0, 0, uint32Bytes(1), uint32Bytes(1), uint32Bytes(1), uint32Bytes(1));
  const stsz = movFullAtom('stsz', 0, 0, uint32Bytes(0), uint32Bytes(count), ...frameSizes.map(uint32Bytes));
  const stco = movFullAtom('stco', 0, 0, uint32Bytes(count), ...chunkOffsets.map(uint32Bytes));
  const stss = movFullAtom('stss', 0, 0, uint32Bytes(count), ...frameSizes.map((_, index) => uint32Bytes(index + 1)));
  return movAtom('stbl', stsd, stts, stsc, stsz, stco, stss);
}

function muxMotionJpegMov(frameBuffers, width, height, frameRate) {
  const frameSizes = frameBuffers.map((buffer) => buffer.byteLength);
  const mediaLength = frameSizes.reduce((sum, size) => sum + size, 0);
  if (mediaLength > 0xffffffff - 8) throw new Error('MOV 超过 4 GB，降低画布尺寸或帧率后重试。');
  const frameDuration = MOV_TIMESCALE / frameRate;
  if (!Number.isInteger(frameDuration)) throw new Error('当前帧率无法写入 MOV 时间基准。');

  const ftyp = movAtom('ftyp', asciiBytes('qt  '), uint32Bytes(0x00000200), asciiBytes('qt  '));
  const mdatHeader = concatBytes(uint32Bytes(mediaLength + 8), asciiBytes('mdat'));
  let offset = ftyp.byteLength + mdatHeader.byteLength;
  const chunkOffsets = frameSizes.map((size) => { const current = offset; offset += size; return current; });
  const duration = frameBuffers.length * frameDuration;
  const sampleTable = createMovSampleTable(frameSizes, chunkOffsets, frameDuration, width, height);
  const identity = movIdentityMatrix();
  const mvhd = movFullAtom('mvhd', 0, 0, uint32Bytes(0), uint32Bytes(0), uint32Bytes(MOV_TIMESCALE), uint32Bytes(duration), uint32Bytes(0x00010000), uint16Bytes(0x0100), zeroBytes(10), identity, zeroBytes(24), uint32Bytes(2));
  const tkhd = movFullAtom('tkhd', 0, 7, uint32Bytes(0), uint32Bytes(0), uint32Bytes(1), uint32Bytes(0), uint32Bytes(duration), zeroBytes(8), uint16Bytes(0), uint16Bytes(0), uint16Bytes(0), uint16Bytes(0), identity, uint32Bytes(width * 65536), uint32Bytes(height * 65536));
  const mdhd = movFullAtom('mdhd', 0, 0, uint32Bytes(0), uint32Bytes(0), uint32Bytes(MOV_TIMESCALE), uint32Bytes(duration), uint16Bytes(0), uint16Bytes(0));
  const hdlr = movFullAtom('hdlr', 0, 0, uint32Bytes(0), asciiBytes('vide'), zeroBytes(12), asciiBytes('VideoHandler\0'));
  const vmhd = movFullAtom('vmhd', 0, 1, uint16Bytes(0), uint16Bytes(0), uint16Bytes(0), uint16Bytes(0));
  const url = movFullAtom('url ', 0, 1);
  const dinf = movAtom('dinf', movFullAtom('dref', 0, 0, uint32Bytes(1), url));
  const minf = movAtom('minf', vmhd, dinf, sampleTable);
  const mdia = movAtom('mdia', mdhd, hdlr, minf);
  const trak = movAtom('trak', tkhd, mdia);
  const moov = movAtom('moov', mvhd, trak);
  return new Blob([ftyp, mdatHeader, ...frameBuffers, moov], { type: 'video/quicktime' });
}

function readMovType(bytes, offset) {
  return String.fromCharCode(bytes[offset], bytes[offset + 1], bytes[offset + 2], bytes[offset + 3]);
}

function parseMovAtoms(bytes, start, end, result = []) {
  let offset = start;
  const containers = new Set(['moov', 'trak', 'mdia', 'minf', 'stbl', 'dinf']);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  while (offset + 8 <= end) {
    const size = view.getUint32(offset, false);
    const type = readMovType(bytes, offset + 4);
    if (size < 8 || offset + size > end) break;
    const entry = { type, offset, size, children: [] };
    result.push(entry);
    if (containers.has(type)) parseMovAtoms(bytes, offset + 8, offset + size, entry.children);
    offset += size;
  }
  return result;
}

function findMovAtom(atoms, type) {
  for (const entry of atoms) {
    if (entry.type === type) return entry;
    const nested = findMovAtom(entry.children, type);
    if (nested) return nested;
  }
  return null;
}

async function validateMovBlob(blob, expectedFrames, expectedSeconds) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const atoms = parseMovAtoms(bytes, 0, bytes.byteLength);
  const topLevel = atoms.map((entry) => entry.type);
  const mdat = atoms.find((entry) => entry.type === 'mdat');
  const stsz = findMovAtom(atoms, 'stsz');
  const stco = findMovAtom(atoms, 'stco');
  const mvhd = findMovAtom(atoms, 'mvhd');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const sampleCount = stsz ? view.getUint32(stsz.offset + 16, false) : 0;
  const chunkCount = stco ? view.getUint32(stco.offset + 12, false) : 0;
  let offsetsValid = Boolean(mdat && stco && chunkCount === expectedFrames);
  if (offsetsValid) {
    for (let index = 0; index < chunkCount; index++) {
      const chunkOffset = view.getUint32(stco.offset + 16 + index * 4, false);
      if (chunkOffset < mdat.offset + 8 || chunkOffset >= mdat.offset + mdat.size) { offsetsValid = false; break; }
    }
  }
  const timescale = mvhd ? view.getUint32(mvhd.offset + 20, false) : 0;
  const durationTicks = mvhd ? view.getUint32(mvhd.offset + 24, false) : 0;
  const durationSeconds = timescale ? durationTicks / timescale : 0;
  return {
    container: topLevel.join(',') === 'ftyp,mdat,moov',
    frames: sampleCount === expectedFrames && offsetsValid,
    duration: Math.abs(durationSeconds - expectedSeconds) <= 1 / motionFps + .001,
    sampleCount,
  };
}

function canvasToJpeg(canvas, quality = .9) {
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('浏览器未能生成视频帧。')), 'image/jpeg', quality));
}

async function waitForMotionSurfaceReady() {
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const deadline = performance.now() + 6000;
  while (performance.now() < deadline) {
    const maps = [...canvasEl.querySelectorAll('[data-route-map]')];
    const tiles = [...canvasEl.querySelectorAll('.leaflet-tile')];
    const loadedTiles = tiles.filter((image) => image.complete && image.naturalWidth);
    const mapsReady = !maps.length || maps.every((map) => map.classList.contains('route-map-snapshot') || map.classList.contains('heatmap-card-snapshot') || map.querySelector('.leaflet-tile'));
    if (mapsReady && loadedTiles.length === tiles.length) break;
    await new Promise((resolve) => setTimeout(resolve, 80));
  }
  await new Promise((resolve) => requestAnimationFrame(resolve));
}

async function renderMotionFrame(timeSeconds, fontEmbedCSS = null) {
  if (!window.htmlToImage?.toCanvas) throw new Error('真实画布捕获组件未加载，请检查网络后刷新页面。');
  renderMotionPreview(timeSeconds);
  await new Promise((resolve) => requestAnimationFrame(resolve));
  const width = state.canvas.cols * UNIT;
  const height = state.canvas.rows * UNIT;
  const scale = Math.max(1, Math.min(3, Number(state.canvas.scale) || 1));
  return window.htmlToImage.toCanvas(canvasEl, {
    width,
    height,
    canvasWidth: Math.round(width * scale),
    canvasHeight: Math.round(height * scale),
    pixelRatio: 1,
    backgroundColor: resolvedMotionBackground(),
    cacheBust: false,
    skipAutoScale: true,
    ...(fontEmbedCSS ? { fontEmbedCSS } : {}),
  });
}

function setMotionExportProgress(value, message) {
  const progress = Math.max(0, Math.min(1, value));
  $('#download-mov').setAttribute('aria-valuenow', String(Math.round(progress * 100)));
  $('#download-mov').setAttribute('aria-valuetext', message);
  $('#motion-export-note').textContent = message;
}

async function createMovBlobLegacy() {
  if (!window.htmlToImage?.toCanvas) throw new Error('真实画布捕获组件未加载，请检查网络后刷新页面。');
  const duration = motionTimelineDuration();
  const frameCount = Math.max(2, Math.round(duration * motionFps));
  const logicalWidth = state.canvas.cols * UNIT;
  const logicalHeight = state.canvas.rows * UNIT;
  const scale = Math.max(1, Math.min(3, Number(state.canvas.scale) || 1));
  const width = Math.round(logicalWidth * scale);
  const height = Math.round(logicalHeight * scale);
  if (width > 65535 || height > 65535) throw new Error('画布边长超过 MOV 格式上限，请缩小画布后重试。');
  if (width * height * frameCount > 3000000000) throw new Error('动态画面过大，请降低画布尺寸、帧率或动画时长。');
  const frames = [];
  document.body.classList.add('exact-export-capture');
  try {
    renderMotionPreview(0);
    if (document.fonts?.ready) await document.fonts.ready;
    await waitForOriginalImages();
    await waitForMotionSurfaceReady();
    let fontEmbedCSS = null;
    try { fontEmbedCSS = await window.htmlToImage.getFontEmbedCSS(canvasEl); } catch { /* 使用当前已加载字体继续捕获 */ }

    for (let index = 0; index < frameCount; index++) {
      const canvas = await renderMotionFrame(duration * index / frameCount, fontEmbedCSS);
      if (canvas.width !== width || canvas.height !== height) throw new Error('画布捕获尺寸不一致，请刷新页面后重试。');
      const frame = await canvasToJpeg(canvas);
      frames.push(new Uint8Array(await frame.arrayBuffer()));
      if (index % 2 === 0 || index === frameCount - 1) {
        setMotionExportProgress((index + 1) / frameCount * .86, `正在生成画面 ${index + 1} / ${frameCount}`);
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }
    }
  } finally {
    document.body.classList.remove('exact-export-capture');
  }

  setMotionExportProgress(.93, '正在封装 MOV…');
  const blob = muxMotionJpegMov(frames, width, height, motionFps);
  setMotionExportProgress(.97, '正在校验 MOV…');
  const validation = await validateMovBlob(blob, frameCount, frameCount / motionFps);
  if (!validation.container || !validation.frames || !validation.duration) throw new Error('MOV 文件结构校验失败，请重试。');
  return blob;
}

function mapSnapshotBox(element, mapBox, canvasScale) {
  const box = element.getBoundingClientRect();
  return { x: (box.left - mapBox.left) / canvasScale, y: (box.top - mapBox.top) / canvasScale, width: box.width / canvasScale, height: box.height / canvasScale };
}

async function drawMapSvgLayer(context, svg, mapBox, canvasScale) {
  const clone = svg.cloneNode(true);
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  // getBoundingClientRect() already includes Leaflet's root translation.
  // Keeping that transform on the standalone SVG applies the pan twice and
  // makes the exported routes diverge from the highlight overlay.
  clone.style.removeProperty('transform');
  clone.style.removeProperty('transform-origin');
  [...clone.querySelectorAll('*')].forEach((copy, index) => {
    const source = svg.querySelectorAll('*')[index];
    if (!source) return;
    const style = getComputedStyle(source);
    ['fill', 'stroke', 'stroke-width', 'stroke-opacity', 'fill-opacity', 'stroke-linecap', 'stroke-linejoin', 'opacity', 'stroke-dasharray', 'stroke-dashoffset'].forEach((property) => copy.style.setProperty(property, style.getPropertyValue(property)));
  });
  const image = new Image();
  const ready = new Promise((resolve, reject) => { image.onload = resolve; image.onerror = reject; });
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(clone))}`;
  await ready;
  const box = mapSnapshotBox(svg, mapBox, canvasScale);
  context.drawImage(image, box.x, box.y, box.width, box.height);
}

function drawMapTooltip(context, tooltip, mapBox, canvasScale) {
  const box = mapSnapshotBox(tooltip, mapBox, canvasScale);
  const style = getComputedStyle(tooltip);
  const heatmapLabel = tooltip.classList.contains('heatmap-airport');
  const radius = Math.min(8, box.height / 2);
  if (!heatmapLabel) {
    context.fillStyle = style.backgroundColor || 'rgba(255,255,255,.86)';
    context.beginPath();
    context.roundRect(box.x, box.y, box.width, box.height, radius);
    context.fill();
  }
  context.font = `${style.fontWeight} ${parseFloat(style.fontSize) / canvasScale}px ${style.fontFamily}`;
  context.fillStyle = style.color;
  context.textBaseline = 'middle';
  context.textAlign = heatmapLabel ? 'center' : 'left';
  context.fillText(tooltip.textContent.trim(), heatmapLabel ? box.x + box.width / 2 : box.x + 5 / canvasScale, box.y + box.height / 2);
  context.textAlign = 'start';
}

function loadMapSnapshotImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = source;
  });
}

async function mapTileForExport(tile, pixelRatio) {
  if (pixelRatio <= 1) return tile;
  const source = tile.currentSrc || tile.src;
  const retinaSource = source.replace(/(?:@2x)?\.png(?=\?|$)/, '@2x.png');
  if (retinaSource === source) return tile;
  try { return await loadMapSnapshotImage(retinaSource); } catch { return tile; }
}

async function captureOnlineMapSnapshots() {
  const maps = [...canvasEl.querySelectorAll('[data-route-map].leaflet-container')];
  if (!maps.length) return {};
  const snapshots = await Promise.all(maps.map(async (map) => {
    const widgetId = map.dataset.routeMap;
    const tiles = [...map.querySelectorAll('.leaflet-tile')];
    if (!widgetId || !tiles.length || tiles.some((tile) => !tile.complete || !tile.naturalWidth)) throw new Error('在线地图仍在加载，请稍后再导出。');
    try {
      const mapBox = map.getBoundingClientRect();
      const canvasScale = Math.max(.01, currentCanvasScale());
      const pixelRatio = Math.max(1, Math.min(3, Number(state.canvas.scale) || 1));
      const logicalWidth = mapBox.width / canvasScale;
      const logicalHeight = mapBox.height / canvasScale;
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(logicalWidth * pixelRatio);
      canvas.height = Math.round(logicalHeight * pixelRatio);
      const context = canvas.getContext('2d');
      context.scale(pixelRatio, pixelRatio);
      context.fillStyle = getComputedStyle(map).backgroundColor;
      context.fillRect(0, 0, logicalWidth, logicalHeight);
      for (const tile of tiles) {
        const box = mapSnapshotBox(tile, mapBox, canvasScale);
        const source = await mapTileForExport(tile, pixelRatio);
        context.drawImage(source, box.x, box.y, box.width, box.height);
      }
      for (const density of map.querySelectorAll('.heatmap-density-canvas')) {
        const box = mapSnapshotBox(density, mapBox, canvasScale);
        context.drawImage(density, box.x, box.y, box.width, box.height);
      }
      for (const svg of map.querySelectorAll('.leaflet-pane svg')) await drawMapSvgLayer(context, svg, mapBox, canvasScale);
      map.querySelectorAll('.leaflet-tooltip').forEach((tooltip) => drawMapTooltip(context, tooltip, mapBox, canvasScale));
      const leafletMap = leafletMaps.get(widgetId);
      const widget = findWidgetById(widgetId);
      return [widgetId, {
        image: canvas.toDataURL('image/png'),
        highlights: widget?.type === 'map' ? buildRouteHighlightMetadata(leafletMap, visibleFlights(), widget.settings?.highlightRoutes) : null,
      }];
    } catch (error) {
      throw new Error(`无法读取已显示的在线地图：${error instanceof Error ? error.message : '请稍后再试。'}`);
    }
  }));
  return Object.fromEntries(snapshots);
}

function attachMapSnapshots(widgets, snapshots) {
  widgets.forEach((widget) => {
    if ((widget.type === 'map' || widget.type === 'heatmap') && snapshots[widget.id]) {
      const snapshot = snapshots[widget.id];
      widget.settings = {
        ...(widget.settings || {}),
        exportMapSnapshot: snapshot.image,
        ...(snapshot.highlights ? { exportRouteHighlights: snapshot.highlights } : {}),
      };
    }
    if (widget.type === 'stack') attachMapSnapshots(widget.settings?.children || [], snapshots);
  });
}

async function exactProjectSnapshot() {
  // Snapshot only after the live Leaflet instance has its tiles and Canvas
  // route layer in place.  A missing snapshot must stop the export rather
  // than silently producing the export-only "地图资源尚未加载" card.
  await waitForMotionSurfaceReady();
  const snapshot = structuredClone(projectSnapshot());
  const snapshots = await captureOnlineMapSnapshots();
  const expectedMapIds = new Set(renderedMapWidgets().map((widget) => widget.id));
  const missingMapIds = [...expectedMapIds].filter((id) => !snapshots[id]);
  if (missingMapIds.length) throw new Error('在线地图尚未准备完成，请等待地图与航线显示后重新导出。');
  attachMapSnapshots(snapshot.widgets, snapshots);
  return snapshot;
}

async function requestExactExport(format) {
  const exactProject = await exactProjectSnapshot();
  let response;
  try {
    response = await fetch('/api/exact-export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      format,
      project: exactProject,
      scale: state.canvas.scale,
      fps: motionFps,
      systemColorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
    }),
    });
  } catch (error) {
    // Static servers do not expose the FFmpeg export endpoint.
    if (error && typeof error === 'object') {
      error.code = 'EXACT_EXPORT_UNAVAILABLE';
      throw error;
    }
    const unavailable = new Error(String(error));
    unavailable.code = 'EXACT_EXPORT_UNAVAILABLE';
    throw unavailable;
  }
  if (!response.ok) {
    let message = '精确导出服务未启动，请使用 start.cmd 启动项目。';
    try { message = (await response.json()).error || message; } catch { /* A static server has no export API. */ }
    const error = new Error(message);
    if ([404, 405, 501].includes(response.status)) error.code = 'EXACT_EXPORT_UNAVAILABLE';
    throw error;
  }
  const blob = await response.blob();
  blob.exactDownloadToken = response.headers.get('X-Flight-Canvas-Download') || '';
  return blob;
}

async function createPngBlob() {
  if (!window.htmlToImage?.toCanvas) throw new Error('真实画布捕获组件未加载，请检查网络后刷新页面。');
  const logicalWidth = state.canvas.cols * UNIT;
  const logicalHeight = state.canvas.rows * UNIT;
  const scale = Math.max(1, Math.min(3, Number(state.canvas.scale) || 1));
  document.body.classList.add('exact-export-capture');
  try {
    if (document.fonts?.ready) await document.fonts.ready;
    await waitForOriginalImages();
    await waitForMotionSurfaceReady();
    let fontEmbedCSS = null;
    try { fontEmbedCSS = await window.htmlToImage.getFontEmbedCSS(canvasEl); } catch { /* 使用当前已加载字体继续捕获 */ }
    const canvas = await window.htmlToImage.toCanvas(canvasEl, {
      width: logicalWidth,
      height: logicalHeight,
      canvasWidth: Math.round(logicalWidth * scale),
      canvasHeight: Math.round(logicalHeight * scale),
      pixelRatio: 1,
      backgroundColor: resolvedMotionBackground(),
      cacheBust: false,
      skipAutoScale: true,
      ...(fontEmbedCSS ? { fontEmbedCSS } : {}),
    });
    return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('浏览器未能生成 PNG。')), 'image/png'));
  } finally {
    document.body.classList.remove('exact-export-capture');
  }
}

async function createMovBlobPrevious() {
  if (!completeStacks().length) throw new Error('至少需要一个放满两张卡片的叠放。');
  setMotionExportProgress(.12, 'Chromium 正在逐帧截取真实画布…');
  return requestExactExport('mov');
}

function exportTimestamp() {
  const now = new Date();
  const date = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('');
  const time = [String(now.getHours()).padStart(2, '0'), String(now.getMinutes()).padStart(2, '0'), String(now.getSeconds()).padStart(2, '0')].join('');
  return `${date}-${time}`;
}

function motionFilename() { return `flight-canvas-${exportTimestamp()}.mov`; }
function pngFilename() { return `flight-canvas-${exportTimestamp()}.png`; }

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(blob); });
}

function loadImageSource(source) {
  const image = new Image();
  return new Promise((resolve, reject) => { image.onload = () => resolve(image); image.onerror = reject; image.src = source; });
}

function canvasToWebpBlob(canvas, quality) {
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('浏览器未能生成图片预览。')), 'image/webp', quality));
}

async function createImagePreviewData(source) {
  const image = await loadImageSource(source);
  const largest = Math.max(image.naturalWidth, image.naturalHeight); let scale = Math.min(1, 1600 / Math.max(1, largest));
  const targetBytes = 720 * 1024; let preview = null;
  for (let sizeAttempt = 0; sizeAttempt < 5; sizeAttempt++) {
    const canvas = document.createElement('canvas'); canvas.width = Math.max(1, Math.round(image.naturalWidth * scale)); canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
    let quality = .84;
    for (let qualityAttempt = 0; qualityAttempt < 5; qualityAttempt++) {
      preview = await canvasToWebpBlob(canvas, quality);
      if (preview.size <= targetBytes) break;
      quality -= .09;
    }
    if (preview.size <= targetBytes || Math.min(canvas.width, canvas.height) <= 320) break;
    scale *= Math.max(.58, Math.min(.88, Math.sqrt(targetBytes / preview.size) * .92));
  }
  return { data: await blobToDataUrl(preview), bytes: preview.size };
}

function allImageWidgets() {
  return state.widgets.flatMap((widget) => widget.type === 'stack' ? stackChildren(widget) : [widget]).filter((widget) => widget.type === 'image');
}

function scheduleMissingImagePreviews() {
  allImageWidgets().forEach((widget) => {
    const source = widget.settings?.imageData;
    if (!source?.startsWith('data:image/') || widget.settings?.imagePreviewData || imagePreviewJobs.has(widget.id)) return;
    imagePreviewJobs.add(widget.id);
    createImagePreviewData(source).then((preview) => {
      if (widget.settings?.imageData !== source) return;
      widget.settings.imagePreviewData = preview.data;
      renderCanvas(); persistProject();
    }).catch(() => { /* 旧图片仍可直接显示，不阻塞项目加载 */ }).finally(() => imagePreviewJobs.delete(widget.id));
  });
}

async function waitForOriginalImages() {
  const sources = [...new Set(allImageWidgets().map((widget) => widget.settings?.imageData || widget.settings?.imageUrl).filter(Boolean))];
  await Promise.all(sources.map((source) => loadImageSource(source).catch(() => null)));
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}

async function imageFileToSources(file) {
  if (!file || !['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) throw new Error('请选择 PNG、JPEG 或 WebP 图片。');
  if (file.size > 50 * 1024 * 1024) throw new Error('图片不能超过 50 MB。');
  const original = await blobToDataUrl(file); const objectUrl = URL.createObjectURL(file);
  try {
    const preview = await createImagePreviewData(objectUrl);
    return { original, preview: preview.data, previewBytes: preview.bytes };
  } finally { URL.revokeObjectURL(objectUrl); }
}

function bindEvents() {
  $$('.stage-button').forEach((button) => button.addEventListener('click', () => setPanel(button.dataset.panel)));
  $('#file-input').addEventListener('change', (event) => { const file = event.target.files[0]; event.target.value = ''; importFile(file); });
  $('#clear-flights').addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!state.flights.length || !window.confirm('确认清空所有航班数据吗？此操作可通过 Ctrl + Z 恢复。')) return;
    state.flights = [];
    state.isDemo = true;
    state.filters = defaultFilters();
    saveHistory();
    renderAll();
    showToast('已清空所有航班数据。');
  });
  $('#download-project').addEventListener('click', async () => {
    const filename = 'flight-canvas-project.flightcanvas.json';
    const destination = await chooseExportDestination(filename, 'Flight Canvas 项目', 'application/json', '.json');
    if (destination.cancelled) return;
    try {
      const blob = new Blob([JSON.stringify({ version: 1, ...projectSnapshot() }, null, 2)], { type: 'application/json' });
      await saveExportBlob(blob, filename, destination.handle);
      showToast('本地项目已导出。');
    } catch { showToast('本地项目导出失败。'); }
  });
  $('#open-card-picker').addEventListener('click', openCardPicker);
  ['dragenter','dragover'].forEach((name) => $('#drop-zone').addEventListener(name, (event) => { event.preventDefault(); $('#drop-zone').classList.add('dragging'); }));
  ['dragleave','drop'].forEach((name) => $('#drop-zone').addEventListener(name, (event) => { event.preventDefault(); $('#drop-zone').classList.remove('dragging'); }));
  $('#drop-zone').addEventListener('drop', (event) => importFile(event.dataTransfer.files[0]));
  document.addEventListener('click', (event) => {
    const closePicker = event.target.closest('[data-close-stack-picker]'); if (closePicker) { closeStackPicker(); return; }
    const closeCardPickerButton = event.target.closest('[data-close-card-picker]'); if (closeCardPickerButton) { closeCardPicker(); return; }
    const openCardPickerButton = event.target.closest('[data-open-card-picker]'); if (openCardPickerButton) { openCardPicker(); return; }
    const openPicker = event.target.closest('[data-open-stack-picker]'); if (openPicker) { openStackPicker(openPicker.dataset.openStackPicker, openPicker.dataset.stackSlot); return; }
    const existingForStack = event.target.closest('[data-stack-existing]'); if (existingForStack) { addExistingWidgetToStack(existingForStack.dataset.stackExisting); return; }
    const newForStack = event.target.closest('[data-stack-new]'); if (newForStack) { createWidgetInStack(newForStack.dataset.stackNew); return; }
    const select = event.target.closest('[data-select-widget]'); if (select) { selectWidget(select.dataset.selectWidget); return; }
    const removeChild = event.target.closest('[data-remove-stack-child]'); if (removeChild) { removeStackChild(removeChild.dataset.removeStackChild); return; }
    const dissolve = event.target.closest('[data-dissolve-stack]'); if (dissolve) { dissolveStack(dissolve.dataset.dissolveStack); return; }
    const stackActive = event.target.closest('[data-stack-active]'); if (stackActive) { const stack = findWidgetById(stackActive.dataset.stackActive); if (stack?.type === 'stack') { stack.settings.activeIndex = Number(stackActive.dataset.value); saveHistory(); renderAll(); } return; }
    const stackDirection = event.target.closest('[data-stack-direction]'); if (stackDirection) { state.canvas.stackDirection = stackDirection.dataset.value === 'left' ? 'left' : 'up'; saveHistory(); renderAll(); return; }
    const chip = event.target.closest('[data-filter]'); if (chip) { toggleFilterValue(chip.dataset.filter, chip.dataset.value); return; }
    const add = event.target.closest('[data-add-widget]'); if (add) { addWidget(add.dataset.addWidget); return; }
    const summaryMetricToggle = event.target.closest('[data-summary-metric-toggle]');
    if (summaryMetricToggle) {
      const widget = findWidgetById(summaryMetricToggle.dataset.summaryMetricToggle);
      if (widget) {
        widget.settings ??= {};
        const metrics = new Set(widget.settings.metrics?.length ? widget.settings.metrics : ['segments', 'airports']);
        const value = summaryMetricToggle.dataset.value;
        if (metrics.has(value)) { if (metrics.size > 1) metrics.delete(value); }
        else metrics.add(value);
        widget.settings.metrics = [...metrics]; saveHistory(); renderAll();
      }
      return;
    }
    const featuredToggle = event.target.closest('[data-featured-toggle]'); if (featuredToggle) { const widget = findWidgetById(featuredToggle.dataset.featuredToggleId); if (widget) { widget.settings ??= {}; const key = featuredToggle.dataset.featuredToggle === 'remark' ? 'showRemark' : 'showTags'; widget.settings[key] = widget.settings[key] === false; saveHistory(); renderAll(); } return; }
    const extremeScope = event.target.closest('[data-extreme-scope]'); if (extremeScope) { const widget = findWidgetById(extremeScope.dataset.extremeScope); if (widget) { widget.settings ??= {}; widget.settings.extremeScope = extremeScope.dataset.value; saveHistory(); renderAll(); } return; }
    const trendType = event.target.closest('[data-trend-type]'); if (trendType) { const widget = findWidgetById(trendType.dataset.trendType); if (widget) { widget.settings ??= {}; widget.settings.chartType = trendType.dataset.value; saveHistory(); renderAll(); } return; }
    const trendPeriod = event.target.closest('[data-trend-period]'); if (trendPeriod) { const widget = findWidgetById(trendPeriod.dataset.trendPeriod); if (widget) { widget.settings ??= {}; widget.settings.period = trendPeriod.dataset.value; saveHistory(); renderAll(); } return; }
    const trendValues = event.target.closest('[data-trend-values]'); if (trendValues) { const widget = findWidgetById(trendValues.dataset.trendValues); if (widget) { widget.settings ??= {}; widget.settings.showValues = widget.settings.showValues !== true; saveHistory(); renderAll(); } return; }
    const trendAxes = event.target.closest('[data-trend-axes]'); if (trendAxes) { const widget = findWidgetById(trendAxes.dataset.trendAxes); if (widget) { widget.settings ??= {}; widget.settings.showAxes = widget.settings.showAxes === false; saveHistory(); renderAll(); } return; }
    const trendPoints = event.target.closest('[data-trend-points]'); if (trendPoints) { const widget = findWidgetById(trendPoints.dataset.trendPoints); if (widget) { widget.settings ??= {}; widget.settings.showPoints = widget.settings.showPoints === false; saveHistory(); renderAll(); } return; }
    const calendarScale = event.target.closest('[data-calendar-scale]'); if (calendarScale) { const widget = findWidgetById(calendarScale.dataset.calendarScale); if (widget) { if (calendarScaleNeedsLarge(calendarScale.dataset.value) && !calendarLargeEnough(widget)) { showToast('面积过小，请修改尺寸。'); return; } widget.settings ??= {}; widget.settings.calendarScale = calendarScale.dataset.value; saveHistory(); renderAll(); } return; }
    const airportLabel = event.target.closest('[data-airport-label]'); if (airportLabel) { const widget = findWidgetById(airportLabel.dataset.airportLabel); if (widget) { widget.settings ??= {}; widget.settings.airportLabelMode = airportLabel.dataset.value; saveHistory(); renderAll(); } return; }
    const heatmapLocation = event.target.closest('[data-heatmap-location]'); if (heatmapLocation) { const widget = findWidgetById(heatmapLocation.dataset.heatmapLocation); if (widget) { widget.settings ??= {}; widget.settings.heatmapLocationMode = heatmapLocation.dataset.value === 'city' ? 'city' : 'airport'; saveHistory(); renderAll(); } return; }
    const mapAirportVisibility = event.target.closest('[data-map-airport-visibility]'); if (mapAirportVisibility) { const widget = findWidgetById(mapAirportVisibility.dataset.mapAirportVisibility); if (widget) { widget.settings ??= {}; widget.settings.airportVisibility = mapAirportVisibility.dataset.value; saveHistory(); renderAll(); } return; }
    const rankingType = event.target.closest('[data-ranking-type]'); if (rankingType) { const widget = findWidgetById(rankingType.dataset.rankingType); if (widget) { widget.settings ??= {}; widget.settings.rankingType = rankingType.dataset.value; saveHistory(); renderAll(); } return; }
    const textAlign = event.target.closest('[data-text-align]'); if (textAlign) { const widget = findWidgetById(textAlign.dataset.textAlign); if (widget) { widget.settings ??= {}; widget.settings.textAlign = textAlign.dataset.value; saveHistory(); renderAll(); } return; }
    const imageNotePosition = event.target.closest('[data-image-note-position]'); if (imageNotePosition) { const widget = findWidgetById(imageNotePosition.dataset.imageNotePosition); if (widget) { widget.settings ??= {}; widget.settings.notePosition = imageNotePosition.dataset.value; saveHistory(); renderAll(); } return; }
    const appearance = event.target.closest('[data-widget-appearance]'); if (appearance) { const widget = findWidgetById(appearance.dataset.widgetAppearance); if (widget) { widget.appearance = appearance.dataset.value; saveHistory(); renderAll(); } return; }
    const highlightColor = event.target.closest('[data-widget-highlight-color]'); if (highlightColor) { const widget = findWidgetById(highlightColor.dataset.widgetHighlightColor); if (widget) { widget.settings ??= {}; widget.settings.highlightColor = highlightColor.dataset.color; if (widget.type !== 'heatmap') widget.appearance = 'highlight'; else if (widget.appearance === 'highlight') widget.appearance = 'inherit'; saveHistory(); renderAll(); } return; }
    const resetMap = event.target.closest('[data-reset-map-view]'); if (resetMap) { resetMapView(resetMap.dataset.resetMapView); return; }
    const remove = event.target.closest('[data-remove-widget]'); if (remove) { removeWidget(remove.dataset.removeWidget); return; }
    const clear = event.target.closest('[data-clear-filter]'); if (clear) { const group = clear.dataset.clearFilter; if (group === 'date') { state.filters.start = ''; state.filters.end = ''; } else if (group === 'airline' || group === 'aircraft') { state.filters[`${group}Mode`] = 'all'; state.filters[`${group}s`] = []; } else state.filters[`${group}s`] = []; saveHistory(); renderAll(); }
  });
  $('#flight-table').addEventListener('change', (event) => { if (event.target.matches('input[type="checkbox"]')) { const row = event.target.closest('[data-flight-id]'); const flight = state.flights.find((item) => item.id === row.dataset.flightId); flight.enabled = event.target.checked; saveHistory(); renderAll(); } });
  $('#flight-table').addEventListener('change', (event) => { if (!event.target.matches('.flight-tag-select')) return; const row = event.target.closest('[data-flight-id]'); const flight = state.flights.find((item) => item.id === row.dataset.flightId); flight.primaryTagId = event.target.value || undefined; flight.tagIds = event.target.value ? [...new Set([...(flight.tagIds || []), event.target.value])] : (flight.tagIds || []); saveHistory(); renderAll(); });
  $('#card-inspector').addEventListener('change', (event) => {
    const imageFile = event.target.dataset.cardImageFile;
    if (imageFile) { const widget = findWidgetById(imageFile); const file = event.target.files?.[0]; if (!widget || !file) return; imageFileToSources(file).then((sources) => { widget.settings ??= {}; widget.settings.imageData = sources.original; widget.settings.imagePreviewData = sources.preview; widget.settings.imageScale = 1; widget.settings.imageOffsetX = 0; widget.settings.imageOffsetY = 0; saveHistory(); renderAll(); showToast(`预览图已优化至 ${(sources.previewBytes / 1024).toFixed(0)} KB。`); }).catch((error) => showToast(error.message || '图片读取失败。')); return; }
    const cardTitle = event.target.dataset.cardTitle; const cardFlight = event.target.dataset.cardFlight; const cardText = event.target.dataset.cardText; const cardImage = event.target.dataset.cardImage; const textFont = event.target.dataset.textFont; const textSize = event.target.dataset.textSize; const mapHighlightRoutes = event.target.dataset.mapHighlightRoutes; const cardSize = event.target.dataset.cardWidth || event.target.dataset.cardHeight; const stackDuration = event.target.dataset.stackDuration; const highlightCustom = event.target.dataset.widgetHighlightCustom;
    if (cardTitle) { const widget = findWidgetById(cardTitle); if (!widget) return; widget.settings ??= {}; widget.settings.title = event.target.value.trim(); saveHistory(); renderAll(); }
    if (cardFlight) { const widget = findWidgetById(cardFlight); if (!widget) return; widget.settings ??= {}; widget.settings.flightIds = event.target.checked ? [event.target.value] : []; saveHistory(); renderAll(); }
    const summaryMetric = event.target.dataset.summaryMetric; if (summaryMetric) { const widget = findWidgetById(summaryMetric); if (!widget) return; widget.settings ??= {}; const metrics = new Set(widget.settings.metrics || ['segments', 'airports']); if (event.target.checked) metrics.add(event.target.value); else metrics.delete(event.target.value); if (!metrics.size) metrics.add(event.target.value); widget.settings.metrics = [...metrics]; saveHistory(); renderAll(); return; }
    const featuredRemark = event.target.dataset.featuredRemark; const featuredTags = event.target.dataset.featuredTags; if (featuredRemark || featuredTags) { const widget = findWidgetById(featuredRemark || featuredTags); if (!widget) return; widget.settings ??= {}; if (featuredRemark) widget.settings.showRemark = event.target.checked; if (featuredTags) widget.settings.showTags = event.target.checked; saveHistory(); renderAll(); return; }
    if (textFont) { const widget = findWidgetById(textFont); if (!widget) return; widget.settings ??= {}; widget.settings.fontFamily = event.target.value; saveHistory(); renderAll(); return; }
    if (textSize) { const widget = findWidgetById(textSize); if (!widget) return; saveHistory(); return; }
    if (cardText || cardImage) { const widget = findWidgetById(cardText || cardImage); if (!widget) return; widget.settings ??= {}; if (cardText) widget.settings.text = event.target.value; if (cardImage) widget.settings.imageUrl = event.target.value.trim(); saveHistory(); renderAll(); }
    if (mapHighlightRoutes) { const widget = findWidgetById(mapHighlightRoutes); if (!widget) return; widget.settings ??= {}; widget.settings.highlightRoutes = event.target.value; saveHistory(); renderAll(); }
    if (cardSize) resizeWidget(cardSize, Number($('[data-card-width]').value), Number($('[data-card-height]').value));
    if (stackDuration) { const stack = findWidgetById(stackDuration); if (stack?.type === 'stack') { stack.settings.duration = Number(event.target.value); saveHistory(); renderAll(); } }
    if (highlightCustom) { const widget = findWidgetById(highlightCustom); if (widget) { widget.settings ??= {}; widget.settings.highlightColor = event.target.value; if (widget.type !== 'heatmap') widget.appearance = 'highlight'; else if (widget.appearance === 'highlight') widget.appearance = 'inherit'; saveHistory(); renderAll(); } }
  });
  $('#card-inspector').addEventListener('input', (event) => {
    if (event.target.matches('[data-card-width], [data-card-height]')) {
      if (event.target.value === '') return;
      const value = Math.round(Number(event.target.value));
      event.target.value = String(Number.isFinite(value) ? Math.max(1, Math.min(9, value)) : 1);
      return;
    }
    const highlightCustom = event.target.dataset.widgetHighlightCustom;
    if (highlightCustom) { const widget = findWidgetById(highlightCustom); if (!widget) return; widget.settings ??= {}; widget.settings.highlightColor = event.target.value; if (widget.type !== 'heatmap') widget.appearance = 'highlight'; else if (widget.appearance === 'highlight') widget.appearance = 'inherit'; event.target.closest('.color-ring-picker')?.style.setProperty('--picker-color', event.target.value); renderCanvas(); updateInspectorContrast(); persistProject(); return; }
    const stackDuration = event.target.dataset.stackDuration;
    if (stackDuration) { const stack = findWidgetById(stackDuration); if (!stack || stack.type !== 'stack') return; stack.settings.duration = Number(event.target.value); event.target.nextElementSibling.textContent = `${Number(event.target.value).toFixed(1)} 秒`; renderExportControls(); persistProject(); return; }
    const mapHighlightRoutes = event.target.dataset.mapHighlightRoutes;
    if (mapHighlightRoutes) { const widget = findWidgetById(mapHighlightRoutes); if (!widget) return; widget.settings ??= {}; widget.settings.highlightRoutes = event.target.value; updateMapHighlightInputValidation(event.target); renderCanvas(); persistProject(); return; }
    const textSize = event.target.dataset.textSize;
    if (textSize) { const widget = findWidgetById(textSize); if (!widget) return; widget.settings ??= {}; widget.settings.fontSizeOffset = Number(event.target.value); const control = event.target.closest('.text-size-control'); const output = control?.querySelector('output'); if (output) output.textContent = Number(event.target.value) > 0 ? `+${event.target.value}` : event.target.value; const progress = ((Number(event.target.value) + 12) / 36) * 100; control?.querySelector('.text-size-range-shell')?.style.setProperty('--range-fill', `calc(${progress}% + ${30 - .38 * progress}px)`); renderCanvas(); persistProject(); return; }
    const imageNote = event.target.dataset.imageNote;
    if (imageNote) { const widget = findWidgetById(imageNote); if (!widget) return; widget.settings ??= {}; widget.settings.note = event.target.value; renderCanvas(); persistProject(); return; }
    const id = event.target.dataset.cardTitle || event.target.dataset.cardText || event.target.dataset.cardImage; if (!id) return;
    const widget = findWidgetById(id); if (!widget) return; widget.settings ??= {};
    if (event.target.dataset.cardTitle) widget.settings.title = event.target.value.trim();
    if (event.target.dataset.cardText) widget.settings.text = event.target.value;
    if (event.target.dataset.cardImage) widget.settings.imageUrl = event.target.value.trim();
    renderCanvas(); persistProject();
  });
  $('#tag-manager').addEventListener('input', (event) => { if (event.target.id === 'new-tag-color') { event.target.closest('.color-ring-picker')?.style.setProperty('--picker-color', event.target.value); return; } const id = event.target.dataset.tagColor; if (!id) return; const tag = state.tags.find((item) => item.id === id); if (!tag) return; tag.color = event.target.value; event.target.closest('.color-ring-picker')?.style.setProperty('--picker-color', event.target.value); renderCanvas(); });
  $('#tag-manager').addEventListener('change', (event) => { const id = event.target.dataset.tagColor || event.target.dataset.tagName; if (!id) return; const tag = state.tags.find((item) => item.id === id); if (!tag) return; if (event.target.dataset.tagColor) tag.color = event.target.value; if (event.target.dataset.tagName) tag.name = event.target.value.trim() || tag.name; saveHistory(); renderAll(); });
  $('#tag-manager').addEventListener('click', (event) => { const button = event.target.closest('[data-remove-tag]'); if (!button) return; const id = button.dataset.removeTag; state.tags = state.tags.filter((tag) => tag.id !== id); state.flights.forEach((flight) => { flight.tagIds = (flight.tagIds || []).filter((tagId) => tagId !== id); if (flight.primaryTagId === id) flight.primaryTagId = flight.tagIds[0]; }); state.filters.tags = state.filters.tags.filter((tagId) => tagId !== id); saveHistory(); renderAll(); });
  const addTagFromInput = () => { const input = $('#new-tag-name'); const name = input?.value.trim(); if (!name) return; if (state.tags.some((tag) => tag.name === name)) { showToast('已经存在同名标签。'); input.value = ''; return; } const color = $('#new-tag-color')?.value || '#e9573f'; state.tags.push({ id: `tag-${Date.now()}`, name, color }); saveHistory(); renderAll(); };
  $('#tag-manager').addEventListener('submit', (event) => { event.preventDefault(); addTagFromInput(); });
  $('#tag-manager').addEventListener('keydown', (event) => { if (event.target.id !== 'new-tag-name' || event.key !== 'Enter') return; event.preventDefault(); addTagFromInput(); });
  $('#tag-manager').addEventListener('focusout', (event) => { if (event.target.id === 'new-tag-name') addTagFromInput(); });
  $('#select-visible').addEventListener('click', () => { const matching = new Set(visibleFlights().map((flight) => flight.id)); state.flights.forEach((flight) => { if (matching.has(flight.id)) flight.enabled = true; }); saveHistory(); renderAll(); });
  $('#filter-date-start').addEventListener('change', (event) => { state.filters.start = event.target.value; if (state.filters.end && state.filters.start > state.filters.end) state.filters.end = state.filters.start; saveHistory(); renderAll(); }); $('#filter-date-end').addEventListener('change', (event) => { state.filters.end = event.target.value; if (state.filters.start && state.filters.end < state.filters.start) state.filters.start = state.filters.end; saveHistory(); renderAll(); });
  $$('#theme-mode button').forEach((button) => button.addEventListener('click', () => setTheme(button.dataset.value))); $$('#font-mode button').forEach((button) => button.addEventListener('click', () => { state.canvas.font = button.dataset.value; saveHistory(); renderAll(); }));
  $$('#accent-swatches button').forEach((button) => button.addEventListener('click', () => { state.canvas.accent = button.dataset.color; saveHistory(); renderAll(); })); $('#accent-custom').addEventListener('input', (event) => { state.canvas.accent = event.target.value; renderAll(); }); $('#accent-custom').addEventListener('change', saveHistory);
  $$('#export-scale button').forEach((button) => button.addEventListener('click', () => { state.canvas.scale = Number(button.dataset.value); saveHistory(); renderAll(); }));
  $$('[data-global-stack-direction]').forEach((button) => button.addEventListener('click', () => { state.canvas.stackDirection = button.dataset.globalStackDirection === 'left' ? 'left' : 'up'; saveHistory(); renderAll(); }));
  $$('[data-export-mode]').forEach((button) => button.addEventListener('click', () => {
    exportMode = button.dataset.exportMode;
    if (exportMode !== 'motion') hideMotionPreview(true);
    renderExportControls();
  }));
  $$('[data-motion-fps]').forEach((button) => button.addEventListener('click', () => { if (motionExporting) return; motionFps = Number(button.dataset.motionFps); renderExportControls(); }));
  $('#preview-motion').addEventListener('click', toggleMotionPreview);
  $('#stop-motion-preview')?.addEventListener('click', () => { hideMotionPreview(true); renderExportControls(); });
  $('#motion-preview-scrubber')?.addEventListener('input', (event) => {
    const duration = motionTimelineDuration();
    if (!duration || motionExporting) return;
    pauseMotionPreview();
    renderMotionPreview(duration * Number(event.target.value) / 1000);
  });
  $('#undo-button').addEventListener('click', () => restoreHistory(-1)); $('#redo-button').addEventListener('click', () => restoreHistory(1)); $('#fit-button').addEventListener('click', () => fitCanvas(true)); $('#lock-button').addEventListener('click', () => { state.canvas.locked = !state.canvas.locked; $('#lock-button').textContent = state.canvas.locked ? '▣' : '⌑'; saveHistory(); renderAll(); showToast(state.canvas.locked ? '画布已锁定。' : '画布已解锁。'); });
  $('#download-png').addEventListener('click', async () => {
    if (motionExporting) return;
    if (state.widgets.some((widget) => widget.type === 'stack') && !window.confirm('画布中包含叠放。静态 PNG 只保存周期起始时刻的卡片状态，是否继续？')) return;
    const filename = pngFilename();
    const destination = await chooseExportDestination(filename, 'PNG 图片', 'image/png', '.png');
    if (destination.cancelled) return;
    hideMotionPreview(true);
    motionExporting = true;
    activeExportFormat = 'png';
    document.body.classList.add('motion-exporting');
    $('#export-panel').setAttribute('aria-busy', 'true');
    setMotionExportProgress(.04, '正在读取当前显示的地图…');
    renderExportControls();
    try {
      const blob = await createPngBlob();
      await saveExportBlob(blob, filename, destination.handle);
      setMotionExportProgress(1, 'PNG 已保存。');
      showToast('PNG 已保存。');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'PNG 导出失败。';
      $('#export-note').textContent = message;
      setMotionExportProgress(0, message);
      showToast('PNG 导出失败。');
    } finally {
      motionExporting = false;
      activeExportFormat = '';
      document.body.classList.remove('motion-exporting');
      $('#export-panel').setAttribute('aria-busy', 'false');
      renderExportControls();
    }
  });
  $('#copy-png')?.addEventListener('click', async () => { try { const blob = await createPngBlob(); await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]); showToast('PNG 已复制到剪贴板。'); } catch { $('#export-note').textContent = '当前浏览器未授予图片剪贴板权限，请改用“保存 PNG”。'; showToast('无法直接复制图片。'); } });
  $('#download-mov').addEventListener('click', async () => {
    if (motionExporting) return;
    if (!completeStacks().length && !window.confirm('画布中没有放满两张卡片的叠放。导出的 MOV 将在整个周期内保持静止，是否继续？')) return;
    const filename = motionFilename();
    const destination = await chooseExportDestination(filename, 'MOV 视频', 'video/quicktime', '.mov');
    if (destination.cancelled) return;
    hideMotionPreview(true);
    motionExporting = true;
    activeExportFormat = 'mov';
    document.body.classList.add('motion-exporting');
    $('#export-panel').setAttribute('aria-busy', 'true');
    setMotionExportProgress(0, '准备动态画面…');
    $('#motion-download-link').classList.remove('show');
    renderExportControls();
    try {
      const blob = await createMovBlob();
      if (motionDownloadUrl) URL.revokeObjectURL(motionDownloadUrl);
      motionDownloadUrl = URL.createObjectURL(blob);
      $('#motion-download-link').href = blob.exactDownloadToken ? serverDownloadUrl(blob.exactDownloadToken, filename) : motionDownloadUrl;
      $('#motion-download-link').download = filename;
      $('#motion-download-link').textContent = `再次下载 MOV · ${(blob.size / 1024 / 1024).toFixed(1)} MB`;
      $('#motion-download-link').classList.add('show');
      await saveExportBlob(blob, filename, destination.handle);
      setMotionExportProgress(1, `MOV 已生成 · ${(blob.size / 1024 / 1024).toFixed(1)} MB`);
      showToast('MOV 已保存。');
    } catch (error) {
      setMotionExportProgress(0, error instanceof Error ? error.message : 'MOV 导出失败。');
      showToast('MOV 导出失败。');
    } finally {
      motionExporting = false;
      activeExportFormat = '';
      document.body.classList.remove('motion-exporting');
      $('#export-panel').setAttribute('aria-busy', 'false');
      renderExportControls();
    }
  });
  $('#stack-picker').addEventListener('click', (event) => { if (event.target === $('#stack-picker')) closeStackPicker(); });
  $('#stack-picker').addEventListener('cancel', () => { stackPickerTarget = null; });
  canvasEl.addEventListener('contextmenu', (event) => {
    const card = event.target.closest('.widget');
    if (!card || !canvasEl.contains(card)) return;
    event.preventDefault();
    selectWidget(card.dataset.widgetId);
  });
  canvasEl.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    const imageCard = event.target.closest('.widget-image');
    const imageId = imageCard?.dataset.widgetId || imageCard?.dataset.stackChildId;
    const selectedImage = imageId && imageId === state.selectedWidgetId ? findWidgetById(imageId) : null;
    if (selectedImage?.type === 'image' && (selectedImage.settings?.imageData || selectedImage.settings?.imageUrl) && !event.target.closest('button, input, select, textarea')) {
      const values = imageTransformValues(selectedImage.settings);
      imagePanState = { id: selectedImage.id, startX: event.clientX, startY: event.clientY, x: values.x, y: values.y, scale: values.scale, moved: false };
      imageCard.classList.add('image-panning');
      canvasEl.setPointerCapture?.(event.pointerId);
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    const resizeHandle = event.target.closest('[data-stack-resize]');
    if (resizeHandle && !state.canvas.locked) {
      const widget = state.widgets.find((item) => item.id === resizeHandle.dataset.stackResize && item.type === 'stack');
      if (!widget) return;
      stackResizeState = { id: widget.id, startX: event.clientX, startY: event.clientY, w: widget.w, h: widget.h, changed: false };
      canvasEl.setPointerCapture?.(event.pointerId);
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    const card = event.target.closest('.widget');
    if (!card || !canvasEl.contains(card)) return;
    const widget = state.widgets.find((item) => item.id === card.dataset.widgetId);
    if (!widget) return;
    if (state.canvas.locked || state.selectedWidgetId || event.target.closest('button, input, select, textarea')) return;
    dragState = { id: widget.id, startX: event.clientX, startY: event.clientY, x: widget.x, y: widget.y, active: false, moved: false };
    canvasEl.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  }, true);
  stageEl.addEventListener('pointerdown', (event) => {
    if (findWidgetById(state.selectedWidgetId)?.type === 'image') { event.preventDefault(); return; }
    if (event.target.closest('.widget')) return;
    stagePanState = { startX: event.clientX, startY: event.clientY, offsetX: viewportOffsetX, offsetY: viewportOffsetY };
    stageEl.classList.add('panning');
    event.preventDefault();
  });
  stageEl.addEventListener('wheel', (event) => {
    const activeImage = findWidgetById(state.selectedWidgetId);
    if (activeImage?.type === 'image') {
      event.preventDefault();
      const imageCard = event.target.closest('.widget-image'); const imageId = imageCard?.dataset.widgetId || imageCard?.dataset.stackChildId;
      if (imageId !== activeImage.id || !(activeImage.settings?.imageData || activeImage.settings?.imageUrl)) return;
      activeImage.settings ??= {};
      const current = imageTransformValues(activeImage.settings); const factor = event.deltaY < 0 ? 1.1 : 1 / 1.1;
      activeImage.settings.imageScale = Math.max(1, Math.min(4, current.scale * factor));
      applyImageTransform(activeImage);
      clearTimeout(imageWheelSaveTimer);
      imageWheelSaveTimer = setTimeout(() => saveHistory(), 180);
      return;
    }
    const mapCard = event.target.closest('.widget-map');
    if (mapCard?.dataset.widgetId === state.selectedWidgetId) return;
    event.preventDefault();
    const baseScale = currentCanvasScale(); const factor = event.deltaY < 0 ? 1.12 : 1 / 1.12;
    viewportScale = Math.max(.22, Math.min(2.4, baseScale * factor));
    fitCanvas();
    positionCardInspector();
  }, { passive: false });
  stageEl.addEventListener('scroll', positionCardInspector, { passive: true });
  $('#canvas-scale').addEventListener('transitionend', (event) => {
    if (event.propertyName === 'transform') positionCardInspector();
  });
  document.addEventListener('pointerdown', (event) => {
    if (!state.selectedWidgetId || event.target.closest('.widget, .card-inspector, [data-add-widget], .stack-picker')) return;
    clearWidgetSelection();
  });
  document.addEventListener('pointermove', (event) => {
    if (imagePanState) {
      const widget = findWidgetById(imagePanState.id); const imageCard = canvasEl.querySelector(`[data-widget-id="${imagePanState.id}"], [data-stack-child-id="${imagePanState.id}"]`);
      if (!widget || !imageCard) return;
      const rect = imageCard.getBoundingClientRect(); const dx = (event.clientX - imagePanState.startX) / Math.max(1, rect.width) * 100 / imagePanState.scale; const dy = (event.clientY - imagePanState.startY) / Math.max(1, rect.height) * 100 / imagePanState.scale;
      widget.settings.imageOffsetX = imagePanState.x + dx; widget.settings.imageOffsetY = imagePanState.y + dy;
      imagePanState.moved ||= Math.hypot(event.clientX - imagePanState.startX, event.clientY - imagePanState.startY) > 2;
      applyImageTransform(widget);
      return;
    }
    if (stackResizeState) {
      const widget = state.widgets.find((item) => item.id === stackResizeState.id);
      if (!widget) return;
      const scale = UNIT * currentCanvasScale();
      const w = Math.max(1, Math.min(9, stackResizeState.w + Math.round((event.clientX - stackResizeState.startX) / scale)));
      const direction = 1;
      const h = Math.max(1, Math.min(9, stackResizeState.h + direction * Math.round((event.clientY - stackResizeState.startY) / (scale * 2))));
      if (w !== widget.w || h !== widget.h) {
        widget.w = w; widget.h = h;
        stackChildren(widget).forEach((child) => { child.w = w; child.h = h; });
        stackResizeState.changed = true;
        syncCanvasBounds();
        renderCanvas();
        renderInspector();
      }
      return;
    }
    if (stagePanState) {
      viewportOffsetX = stagePanState.offsetX + event.clientX - stagePanState.startX;
      viewportOffsetY = stagePanState.offsetY + event.clientY - stagePanState.startY;
      applyCanvasViewport();
      positionCardInspector();
      return;
    }
    if (touchState) {
      const moved = Math.hypot(event.clientX - touchState.startX, event.clientY - touchState.startY);
      if (moved > 8) {
        clearTimeout(touchHoldTimer);
        dragState = { ...touchState, moved: true };
        touchState = null;
      } else return;
    }
    if (!dragState) return;
    const widget = state.widgets.find((item) => item.id === dragState.id); if (!widget) return;
    if (!dragState.active) {
      if (Math.hypot(event.clientX - dragState.startX, event.clientY - dragState.startY) < 6) return;
      dragState.active = true;
      viewportScale = currentCanvasScale();
      canvasEl.querySelector(`[data-widget-id="${widget.id}"]`)?.classList.add('dragging');
    }
    const dx = Math.round((event.clientX - dragState.startX) / (UNIT * currentCanvasScale())); const dy = Math.round((event.clientY - dragState.startY) / (UNIT * currentCanvasScale()));
    if (dx || dy) dragState.moved = true;
    let x = dragState.x + dx; let y = dragState.y + dy;
    const candidate = { ...widget, x, y };
    if (!hasCollision(candidate, widget.id) && !layoutHasForbiddenBlank(candidate, widget.id) && (x !== widget.x || y !== widget.y)) {
      const shiftX = Math.max(0, -x); const shiftY = Math.max(0, -y);
      if (shiftX || shiftY) {
        state.widgets.forEach((item) => { item.x += shiftX; item.y += shiftY; });
        dragState.x += shiftX; dragState.y += shiftY;
        x += shiftX; y += shiftY;
      }
      widget.x = x;
      widget.y = y;
      const bounds = contentBounds();
      state.canvas.cols = Math.max(MIN_CANVAS_COLS, bounds.maxX);
      state.canvas.rows = Math.max(MIN_CANVAS_ROWS, bounds.maxY);
      updateCanvasDimensions();
      canvasEl.querySelectorAll('.widget').forEach((card) => {
        const item = state.widgets.find((entry) => entry.id === card.dataset.widgetId);
        if (!item) return;
        card.style.gridColumn = `${item.x + 1} / span ${item.w}`;
        card.style.gridRow = `${item.y + 1} / span ${item.h}`;
        card.classList.toggle('dragging', item.id === widget.id);
      });
      positionCardInspector();
    }
  }, true);
  document.addEventListener('pointerup', () => {
    if (imagePanState) {
      const finished = imagePanState; imagePanState = null;
      canvasEl.querySelector(`[data-widget-id="${finished.id}"], [data-stack-child-id="${finished.id}"]`)?.classList.remove('image-panning');
      if (finished.moved) saveHistory(); else persistProject();
      return;
    }
    if (stackResizeState) {
      const finished = stackResizeState;
      stackResizeState = null;
      const widget = state.widgets.find((item) => item.id === finished.id);
      if (widget && finished.changed) {
        const target = { w: widget.w, h: widget.h };
        widget.w = finished.w; widget.h = finished.h;
        stackChildren(widget).forEach((child) => { child.w = finished.w; child.h = finished.h; });
        resizeWidget(widget.id, target.w, target.h);
      } else renderAll();
      return;
    }
    if (stagePanState) { stagePanState = null; stageEl.classList.remove('panning'); return; }
    clearTimeout(touchHoldTimer);
    if (touchState) { touchState = null; return; }
    if (!dragState) return;
    const finished = dragState;
    dragState = null;
    if (!finished.active) { selectWidget(finished.id); return; }
    suppressedCardClickId = finished.id;
    setTimeout(() => { if (suppressedCardClickId === finished.id) suppressedCardClickId = null; }, 0);
    if (finished.moved) saveHistory();
    renderAll();
  }, true);
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => { fitCanvas(); positionCardInspector(); });
  });
  document.addEventListener('keydown', (event) => {
    const target = event.target;
    const isEditing = target instanceof HTMLElement && (target.matches('input, textarea, select') || target.isContentEditable || Boolean(target.closest('[contenteditable="true"]')));
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z' && !isEditing) {
      event.preventDefault();
      restoreHistory(event.shiftKey ? 1 : -1);
    }
    if ((event.key === 'Delete' || event.key === 'Backspace') && state.selectedWidgetId && !isEditing) {
      const selected = findWidgetById(state.selectedWidgetId);
      selected?.type === 'stack' ? dissolveStack(selected.id) : removeWidget(state.selectedWidgetId);
    }
  });
  window.addEventListener('beforeunload', () => { cancelAnimationFrame(motionPreviewFrame); if (motionDownloadUrl) URL.revokeObjectURL(motionDownloadUrl); });
}

async function importFile(file) {
  if (!file) return;
  const replacingDemo = state.isDemo;
  const previousTags = replacingDemo ? structuredClone(state.tags) : null;
  if (replacingDemo) state.tags = [];
  try {
    const filename = file.name.toLowerCase();
    if (filename.endsWith('.xls') || filename.endsWith('.xlsx')) {
      if (!window.XLSX) throw new Error('表格解析组件尚未加载，请检查网络后重试。');
      const workbook = window.XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: false });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = window.XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: '' }).map((row) => row.map((cell) => String(cell ?? '').trim()));
      var imported = rowsToFlights(rows);
    } else {
      const text = await file.text();
      if (filename.endsWith('.json') || filename.endsWith('.flightcanvas')) {
        const data = JSON.parse(text);
        if (data?.canvas && Array.isArray(data.widgets) && Array.isArray(data.flights)) {
          applyProjectState(data); saveHistory(); renderAll(); showToast('本地项目已导入。'); return;
        }
        imported = Array.isArray(data) ? data : data.flights;
        if (!Array.isArray(imported)) throw new Error('JSON 需要是航班数组，或是完整的本地项目文件。');
        const nonBlankFlights = imported.filter((flight) => flight && typeof flight === 'object' && Object.values(flight).some((value) => String(value ?? '').trim()));
        imported = nonBlankFlights.filter(validImportedFlight).map((flight, index) => ({ id: `json-${Date.now()}-${index}`, enabled: true, tagIds: [], ...flight, date: normalizeFlightDate(flight.date), originIata: String(flight.originIata || '').trim().toUpperCase(), destinationIata: String(flight.destinationIata || '').trim().toUpperCase(), distanceKm: Number(flight.distanceKm) || calculateDistance(flight.originIata, flight.destinationIata) }));
        lastImportSkippedRows = nonBlankFlights.length - imported.length;
      } else imported = csvToFlights(text);
    }
    if (!imported.length) throw new Error('没有识别到有效航班。');
    const existingFlights = state.isDemo ? [] : state.flights;
    const usedIds = new Set(existingFlights.map((flight) => flight.id));
    const importedFlights = imported.map((flight, index) => {
      let id = flight.id || `import-${Date.now()}-${index}`;
      if (usedIds.has(id)) id = `${id}-${Date.now()}-${index}`;
      usedIds.add(id);
      return { ...flight, id };
    });
    state.flights = [...existingFlights, ...importedFlights]; state.isDemo = false; state.filters = defaultFilters(); saveHistory(); renderAll(); showToast(`已追加 ${importedFlights.length} 条航班，当前共 ${state.flights.length} 条${lastImportSkippedRows ? `，已跳过 ${lastImportSkippedRows} 条不完整记录` : ''}。`);
  } catch (error) { if (replacingDemo) state.tags = previousTags; showToast(error.message || '导入失败。'); }
}

async function loadProjectLogos() {
  try {
    const response = await fetch('assets/sillage-du-ciel.svg', { cache: 'no-store' });
    if (!response.ok) throw new Error(`Logo ${response.status}`);
    const markup = await response.text();
    $$('[data-project-logo]').forEach((logo, index) => {
      const suffix = `-${index + 1}`;
      logo.innerHTML = markup
        .replaceAll('id="title"', `id="title${suffix}"`)
        .replaceAll('id="desc"', `id="desc${suffix}"`)
        .replaceAll('id="colorFlow"', `id="colorFlow${suffix}"`)
        .replaceAll('id="wordmarkShadow"', `id="wordmarkShadow${suffix}"`)
        .replaceAll('aria-labelledby="title desc"', `aria-labelledby="title${suffix} desc${suffix}"`)
        .replaceAll('url(#wordmarkShadow)', `url(#wordmarkShadow${suffix})`);
    });
  } catch (error) {
    console.warn('Project logo could not be loaded.', error);
  }
}

async function initializeApp() {
  await loadProjectLogos();
  await restoreProject();
  persistenceReady = true;
  document.documentElement.dataset.browserCapture = window.htmlToImage?.toCanvas ? 'ready' : 'missing';
  saveHistory();
  bindEvents();
  renderAll();
  loadAirportData();
  window.__flightCanvasReady = true;
}

function widgetSurfaceIsDark(widget) {
  if (widget?.appearance === 'dark') return true;
  if (widget?.appearance === 'light') return false;
  if (widget?.type === 'map' && widget?.appearance === 'highlight') return window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (widget?.appearance === 'highlight') return isDarkHex(widgetCustomColor(widget));
  if (state.canvas.theme === 'dark') return true;
  if (state.canvas.theme === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function updateInspectorContrast() {
  const inspector = $('#card-inspector');
  let widget = findWidgetById(state.selectedWidgetId);
  if (widget?.type === 'stack') {
    const children = stackChildren(widget);
    widget = children[Math.min(children.length - 1, Math.max(0, Number(widget.settings?.activeIndex || 0)))] || widget;
  }
  inspector.classList.remove('inspector-inverse-dark', 'inspector-inverse-light');
  if (!widget) return;
  inspector.classList.add(widgetSurfaceIsDark(widget) ? 'inspector-inverse-light' : 'inspector-inverse-dark');
}

function renderStackInspector(stack) {
  const children = stackChildren(stack);
  const activeIndex = Math.min(children.length - 1, Math.max(0, Number(stack.settings?.activeIndex || 0)));
  const slots = [0, 1].map((index) => {
    const child = children[index];
    if (!child) return `<div class="stack-inspector-slot"><span>${String(index + 1).padStart(2, '0')}</span><strong>空位</strong><button data-open-stack-picker="${stack.id}" data-stack-slot="${index}" type="button">添加</button></div>`;
    const isActive = activeIndex === index;
    return `<div class="stack-inspector-slot${isActive ? ' is-default' : ''}"><button class="stack-default-choice" data-stack-active="${stack.id}" data-value="${index}" type="button" aria-label="设为默认显示" aria-pressed="${isActive}" title="设为默认显示"><i></i></button><button class="stack-inspector-select" data-select-widget="${child.id}" type="button">${escapeHtml(widgetDefinitions[child.type]?.name || '卡片')}</button><button data-remove-stack-child="${child.id}" type="button">移出</button></div>`;
  }).join('');
  const customSize = `<div class="custom-size-row stack-custom-size"><input data-card-width="${stack.id}" type="number" min="1" max="9" value="${stack.w}" aria-label="叠放宽度" title="宽度" /><span aria-hidden="true">×</span><input data-card-height="${stack.id}" type="number" min="1" max="9" value="${stack.h}" aria-label="叠放高度" title="高度" /></div>`;
  $('#card-inspector').innerHTML = `<div class="inspector-card"><div class="inspector-watermark">卡片叠放</div><div class="stack-common-grid"><div class="inspector-label stack-size-label">尺寸</div><div class="inspector-label stack-content-label"><span>内容</span><small>圆点表示默认显示</small></div><div class="stack-size-cells">${customSize}<button class="stack-dissolve-button" data-dissolve-stack="${stack.id}" type="button">解散叠放</button></div><div class="stack-inspector-slots">${slots}</div></div></div>`;
  $('#card-inspector').classList.add('show');
}

function motionTimelineDuration() {
  return Math.max(1, Math.min(9, Number(motionCycleSeconds) || 8));
}

function interpolateMotion(from, to, progress) {
  const eased = motionEase(Math.max(0, Math.min(1, progress)));
  return {
    x: from.x + (to.x - from.x) * eased,
    y: from.y + (to.y - from.y) * eased,
    scale: from.scale + (to.scale - from.scale) * eased,
    opacity: from.opacity + (to.opacity - from.opacity) * eased,
  };
}

function motionStateForStack(stack, timeSeconds) {
  const cycle = motionTimelineDuration();
  const unit = cycle / 3;
  const firstHold = stackRandomOffset(stack) * unit;
  const forwardEnd = firstHold + .5 * unit;
  const secondHoldEnd = forwardEnd + unit;
  const reverseEnd = secondHoldEnd + .5 * unit;
  const time = ((Number(timeSeconds) || 0) % cycle + cycle) % cycle;
  const direction = state.canvas.stackDirection || 'up';
  const travel = direction === 'left' ? stack.w * UNIT * 1.08 : stack.h * UNIT * 1.08;
  const normal = { x: 0, y: 0, scale: 1, opacity: 1, visible: true };
  // The two cards cross-fade throughout the whole 0.5T transition.  This
  // keeps the switch continuous instead of sliding one card away, hiding it,
  // and then abruptly revealing the other.
  const entering = { x: direction === 'left' ? travel * .48 : 0, y: direction === 'up' ? travel * .48 : 0, scale: .985, opacity: 0, visible: true };
  const leaving = { x: direction === 'left' ? -travel * .48 : 0, y: direction === 'up' ? -travel * .48 : 0, scale: .985, opacity: 0, visible: true };
  const hidden = { x: 0, y: 0, scale: 1, opacity: 0, visible: false };

  if (time < firstHold || time >= reverseEnd) return { front: { ...normal, zIndex: 2 }, rear: { ...hidden, zIndex: 1 } };
  if (time < forwardEnd) {
    const progress = (time - firstHold) / (.5 * unit);
    return { front: { ...interpolateMotion(normal, leaving, progress), visible: true, zIndex: 2 }, rear: { ...interpolateMotion(entering, normal, progress), visible: true, zIndex: 1 } };
  }
  if (time < secondHoldEnd) return { front: { ...hidden, zIndex: 1 }, rear: { ...normal, zIndex: 2 } };
  const progress = (time - secondHoldEnd) / (.5 * unit);
  return { front: { ...interpolateMotion(entering, normal, progress), visible: true, zIndex: 1 }, rear: { ...interpolateMotion(normal, leaving, progress), visible: true, zIndex: 2 } };
}

function applyMotionFrameToCanvas(timeSeconds) {
  completeStacks().forEach((stack) => {
    const card = canvasEl.querySelector(`[data-widget-id="${stack.id}"]`);
    if (!card) return;
    const motion = motionStateForStack(stack, timeSeconds);
    ['rear', 'front'].forEach((role) => {
      const layer = card.querySelector(`[data-stack-motion-layer="${role}"]`);
      if (!layer) return;
      const value = motion[role];
      layer.style.transform = `translate3d(${value.x}px, ${value.y}px, 0) scale(${value.scale})`;
      layer.style.opacity = String(value.opacity);
      layer.style.zIndex = String(value.zIndex);
      layer.style.visibility = value.visible ? 'visible' : 'hidden';
    });
    const badge = card.querySelector('.stack-motion-badge');
    if (badge) {
      const pulse = .5 + .5 * Math.sin(((Number(timeSeconds) || 0) / motionTimelineDuration()) * Math.PI * 4 + stackRandomOffset(stack) * Math.PI * 2);
      badge.style.setProperty('--stack-glow-scale', String(.82 + pulse * .32));
      badge.style.setProperty('--stack-glow-alpha', String(.62 + pulse * .38));
    }
  });
  applyRouteHighlightFrame(timeSeconds);
}

function applyRouteHighlightFrame(timeSeconds) {
  const cycleDuration = motionTimelineDuration();
  const travelDuration = cycleDuration / 3;
  if (!(travelDuration > 0)) return;
  canvasEl.querySelectorAll('.route-highlight-overlay').forEach((overlay) => {
    const groups = [...overlay.querySelectorAll('[data-route-highlight]')];
    groups.forEach((group) => {
      try {
        const guide = group.querySelector('.route-highlight-guide');
        const segments = [...group.querySelectorAll('[data-route-highlight-segment]')];
        const head = group.querySelector('.route-highlight-head');
        const length = guide.getTotalLength();
        if (!(length > 0)) throw new Error('Empty route');
        const cycleTime = (((Number(timeSeconds) || 0) % cycleDuration) + cycleDuration) % cycleDuration;
        const initialWait = Math.max(0, Math.min(1, Number(group.dataset.routeHighlightWait) || 0)) * travelDuration / 3;
        const firstStart = initialWait;
        const secondStart = firstStart + travelDuration;
        let local = -1;
        if (cycleTime >= firstStart && cycleTime < secondStart) local = (cycleTime - firstStart) / travelDuration;
        else if (cycleTime >= secondStart && cycleTime < secondStart + travelDuration) local = (cycleTime - secondStart) / travelDuration;
        if (local < 0) { group.style.opacity = '0'; return; }
        const progress = local ** 2.2;
        const tailStart = Math.max(0, progress - .065);
        const samples = 7;
        const tail = Array.from({ length: samples }, (_, sampleIndex) => {
          const sampleProgress = tailStart + (progress - tailStart) * sampleIndex / (samples - 1);
          return guide.getPointAtLength(length * sampleProgress);
        });
        const point = tail[tail.length - 1];
        const opacity = Math.max(0, Math.min(1, local / .08, (1 - local) / .06));
        segments.forEach((segment, segmentIndex) => {
          const from = tail[segmentIndex];
          const to = tail[segmentIndex + 1];
          if (!from || !to) { segment.removeAttribute('d'); return; }
          const strength = (segmentIndex + 1) / segments.length;
          segment.setAttribute('d', `M${from.x.toFixed(2)} ${from.y.toFixed(2)}L${to.x.toFixed(2)} ${to.y.toFixed(2)}`);
          segment.style.strokeWidth = String(.65 + strength * 4.1);
          segment.style.opacity = String(.1 + strength * .72);
        });
        head.setAttribute('cx', point.x.toFixed(2));
        head.setAttribute('cy', point.y.toFixed(2));
        group.style.opacity = String(opacity);
      } catch {
        group.style.opacity = '0';
      }
    });
  });
}

function updateMotionPreviewControls() {
  const button = $('#preview-motion');
  if (!button) return;
  const icon = motionPreviewPlaying ? '■' : '▶';
  const label = motionPreviewPlaying ? '停止预览' : '播放动态预览';
  button.innerHTML = `<span aria-hidden="true">${icon}</span><span>${label}</span>`;
}

function renderExportControls() {
  const stacks = completeStacks();
  const duration = motionTimelineDuration();
  if (!stacks.length && motionPreviewVisible) hideMotionPreview(true);
  $$('[data-motion-fps]').forEach((button) => { button.classList.toggle('selected', Number(button.dataset.motionFps) === motionFps); button.disabled = motionExporting; });
  $('#preview-motion').disabled = !stacks.length || motionExporting;
  $('#download-mov').disabled = motionExporting;
  $('#download-png').disabled = motionExporting;
  const exportingMov = motionExporting && activeExportFormat === 'mov';
  $('#download-mov').classList.toggle('exporting', exportingMov);
  $('#download-mov-label').textContent = exportingMov ? '正在生成 MOV…' : '导出动态 MOV';
  if (!exportingMov) {
    $('#download-mov').removeAttribute('aria-valuenow');
    $('#download-mov').removeAttribute('aria-valuetext');
  }
  if ($('#motion-cycle-seconds') && document.activeElement !== $('#motion-cycle-seconds')) $('#motion-cycle-seconds').value = String(duration);
  updateMotionPreviewControls();
}

function renderMotionPreview(timeSeconds) {
  if (!completeStacks().length) { hideMotionPreview(true); updateMotionPreviewControls(); return; }
  const duration = motionTimelineDuration();
  const enteringPreview = !motionPreviewVisible;
  motionPreviewVisible = true;
  motionPreviewTime = Math.max(0, Math.min(duration, Number(timeSeconds || 0)));
  document.body.classList.add('motion-preview-visible');
  canvasEl.style.backgroundColor = resolvedMotionBackground();
  if (enteringPreview && canvasEl.querySelector('.widget-stack.stack-expanded')) renderCanvas();
  else if (enteringPreview) updateMapEditability();
  applyMotionFrameToCanvas(motionPreviewTime);
  updateMotionPreviewControls();
}

function hideMotionPreview(resetTime = false) {
  const wasVisible = motionPreviewVisible;
  cancelAnimationFrame(motionPreviewFrame);
  motionPreviewFrame = null;
  motionPreviewPlaying = false;
  motionPreviewVisible = false;
  if (resetTime) motionPreviewTime = 0;
  document.body.classList.remove('motion-preview-visible');
  canvasEl.style.removeProperty('background-color');
  if (wasVisible) renderCanvas();
  updateMotionPreviewControls();
}

function pauseMotionPreview() { hideMotionPreview(true); }

function motionPreviewLoop(now) {
  if (!motionPreviewPlaying) return;
  const duration = motionTimelineDuration();
  const elapsed = (now - motionPreviewStartedAt) / 1000;
  if (elapsed >= duration) { hideMotionPreview(true); renderExportControls(); return; }
  motionPreviewTime = elapsed % duration;
  renderMotionPreview(motionPreviewTime);
  motionPreviewFrame = requestAnimationFrame(motionPreviewLoop);
}

function toggleMotionPreview() {
  if (motionPreviewPlaying) { hideMotionPreview(true); renderExportControls(); return; }
  if (!completeStacks().length || motionExporting) return;
  renderMotionPreview(0);
  motionPreviewPlaying = true;
  motionPreviewStartedAt = performance.now();
  updateMotionPreviewControls();
  motionPreviewFrame = requestAnimationFrame(motionPreviewLoop);
}

async function createMovBlob() {
  setMotionExportProgress(.08, '正在准备浏览器端画布捕获…');
  try {
    // The local service sends each captured frame directly to FFmpeg, so the
    // browser never accumulates a complete JPEG frame array in this path.
    return await requestExactExport('mov');
  } catch (error) {
    if (error?.code !== 'EXACT_EXPORT_UNAVAILABLE') throw error;
    setMotionExportProgress(.08, '正在使用浏览器兼容方案…');
    return createMovBlobLegacy();
  }
}

function projectSnapshot() {
  return { schemaVersion: 3, isDemo: state.isDemo, flights: state.flights, tags: state.tags, filters: state.filters, canvas: { ...state.canvas, motionCycleSeconds }, widgets: state.widgets, selectedWidgetId: state.selectedWidgetId };
}

window.__flightCanvasExactExport = {
  async loadProject(project) {
    hideMotionPreview(true);
    applyProjectState(structuredClone(project), { keepExportMapSnapshots: true });
    motionCycleSeconds = Math.max(1, Math.min(9, Number(project.canvas?.motionCycleSeconds) || 8));
    state.selectedWidgetId = null;
    document.body.classList.add('exact-export-capture');
    renderAll();
    const captureWidth = state.canvas.cols * UNIT;
    const captureHeight = state.canvas.rows * UNIT;
    const captureScale = $('#canvas-scale');
    captureScale.style.setProperty('transform', 'none', 'important');
    captureScale.style.setProperty('width', `${captureWidth}px`, 'important');
    captureScale.style.setProperty('height', `${captureHeight}px`, 'important');
    canvasEl.dataset.scale = '1';
    if (document.fonts?.ready) await document.fonts.ready;
    await waitForOriginalImages();
    await waitForMotionSurfaceReady();
    return {
      width: captureWidth,
      height: captureHeight,
      duration: motionTimelineDuration(),
    };
  },
  async setMotionTime(timeSeconds) {
    const duration = motionTimelineDuration();
    if (duration) renderMotionPreview(Math.max(0, Math.min(duration, Number(timeSeconds || 0))));
    document.body.classList.add('exact-export-capture');
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  },
};

initializeApp().then(() => {
  motionCycleSeconds = Math.max(1, Math.min(9, Number(state.canvas.motionCycleSeconds) || 8));
  const cycleInput = $('#motion-cycle-seconds');
  if (cycleInput) {
    cycleInput.value = String(motionCycleSeconds);
    const updateCycle = () => {
      const value = Number(cycleInput.value);
      if (!Number.isFinite(value)) return;
      motionCycleSeconds = Math.max(1, Math.min(9, value));
      state.canvas.motionCycleSeconds = motionCycleSeconds;
      cycleInput.value = String(motionCycleSeconds);
      renderExportControls();
      persistProject();
    };
    cycleInput.addEventListener('change', updateCycle);
    cycleInput.addEventListener('input', updateCycle);
  }
  renderExportControls();
});
