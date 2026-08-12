const CARD_VERSION = "1.3.1";
const BRAND_GREEN = "#69be45";
const OVER_LIMIT_ORANGE = "#ff8a4c";

const DEFAULT_CONFIG = Object.freeze({
  title: "",
  calories_entity: "sensor.calories",
  protein_entity: "sensor.protein",
  carbohydrate_entity: "sensor.carbohydrates",
  fat_entity: "sensor.fat",
  fiber_entity: "sensor.fiber",
  sugar_entity: "sensor.sugar",
  sodium_entity: "sensor.sodium",
  potassium_entity: "sensor.potassium",
  cholesterol_entity: "sensor.cholesterol",
  use_active_calories: false,
  active_calories_entity: "",
  active_calories_credit_percent: 50,
  calorie_goal: 2200,
  protein_goal: 160,
  carbohydrate_goal: 250,
  fat_goal: 70,
  show_graph: true,
  show_details: true,
});

const TRANSLATIONS = Object.freeze({
  en: Object.freeze({
    title: "Nutrition today",
    config: Object.freeze({
      title: "Title",
      calories_entity: "Calories",
      protein_entity: "Protein",
      carbohydrate_entity: "Carbohydrates",
      fat_entity: "Fat",
      fiber_entity: "Fiber",
      sugar_entity: "Sugar",
      sodium_entity: "Sodium",
      potassium_entity: "Potassium",
      cholesterol_entity: "Cholesterol",
      active_calories: "Active calorie credit",
      use_active_calories: "Add active calories to the daily goal",
      active_calories_entity: "Active calories sensor",
      active_calories_credit_percent: "Calories credited, %",
      calorie_goal: "Calorie goal, kcal",
      protein_goal: "Protein goal, g",
      carbohydrate_goal: "Carbohydrate goal, g",
      fat_goal: "Fat goal, g",
      show_graph: "Show graph",
      show_details: "Show nutrients",
      details: "Additional nutrients",
    }),
    macros: Object.freeze({
      protein: "Protein",
      carbohydrates: "Carbohydrates",
      fat: "Fat",
    }),
    nutrients: Object.freeze({
      fiber: "Fiber",
      sugar: "Sugar",
      sodium: "Sodium",
      potassium: "Potassium",
      cholesterol: "Cholesterol",
    }),
    units: Object.freeze({ kcal: "kcal", g: "g", mg: "mg", ug: "µg" }),
    noData: "No FatSecret data",
    remaining: (value) => `${value} kcal remaining`,
    exceeded: (value) => `Exceeded by ${value} kcal`,
    goalValue: (goal) => `of ${goal} kcal`,
    goalProgress: (progress) => `${progress}% of goal`,
    activeCalorieCredit: (credit, active, percent) =>
      `+${credit} kcal available from ${active} active kcal (${percent}%)`,
    activeCaloriesUnavailable: "Active calorie sensor has no data",
    noValue: "No data",
    caloriesAria: "Open calorie details",
    macrosAria: "Macronutrients",
    graphTitle: "Calories today",
    graphRange: "00:00 — now",
    graphLoading: "Loading…",
    graphAria: "Calories graph for today",
    graphPoint: (time, value) => `${time} · ${value} kcal`,
    cardDescription: "FatSecret calories, macros, nutrients, and daily graph.",
  }),
  ru: Object.freeze({
    title: "Питание сегодня",
    config: Object.freeze({
      title: "Заголовок",
      calories_entity: "Калории",
      protein_entity: "Белок",
      carbohydrate_entity: "Углеводы",
      fat_entity: "Жиры",
      fiber_entity: "Клетчатка",
      sugar_entity: "Сахар",
      sodium_entity: "Натрий",
      potassium_entity: "Калий",
      cholesterol_entity: "Холестерин",
      active_calories: "Учёт активных калорий",
      use_active_calories: "Добавлять активные калории к дневной цели",
      active_calories_entity: "Сенсор активных калорий",
      active_calories_credit_percent: "Зачислять активных калорий, %",
      calorie_goal: "Цель калорий, ккал",
      protein_goal: "Цель белка, г",
      carbohydrate_goal: "Цель углеводов, г",
      fat_goal: "Цель жиров, г",
      show_graph: "Показывать график",
      show_details: "Показывать нутриенты",
      details: "Дополнительные нутриенты",
    }),
    macros: Object.freeze({
      protein: "Белок",
      carbohydrates: "Углеводы",
      fat: "Жиры",
    }),
    nutrients: Object.freeze({
      fiber: "Клетчатка",
      sugar: "Сахар",
      sodium: "Натрий",
      potassium: "Калий",
      cholesterol: "Холестерин",
    }),
    units: Object.freeze({ kcal: "ккал", g: "г", mg: "мг", ug: "мкг" }),
    noData: "Нет данных от FatSecret",
    remaining: (value) => `Осталось ${value} ккал`,
    exceeded: (value) => `Превышение на ${value} ккал`,
    goalValue: (goal) => `из ${goal} ккал`,
    goalProgress: (progress) => `${progress}% цели`,
    activeCalorieCredit: (credit, active, percent) =>
      `+${credit} ккал доступно из ${active} активных ккал (${percent}%)`,
    activeCaloriesUnavailable: "Нет данных сенсора активных калорий",
    noValue: "Нет данных",
    caloriesAria: "Открыть сведения о калориях",
    macrosAria: "Макронутриенты",
    graphTitle: "Калории за сегодня",
    graphRange: "00:00 — сейчас",
    graphLoading: "Загрузка…",
    graphAria: "График калорий за сегодня",
    graphPoint: (time, value) => `${time} · ${value} ккал`,
    cardDescription: "Калории, БЖУ, нутриенты и график FatSecret за текущий день.",
  }),
});

const normalizeLanguage = (language) => String(language ?? "en").toLowerCase().split(/[-_]/)[0];

const translationFor = (language) => TRANSLATIONS[normalizeLanguage(language)] ?? TRANSLATIONS.en;

const browserTranslation = () =>
  translationFor(document.documentElement.lang || navigator.language || "en");

const ENTITY_FIELDS = [
  "calories_entity",
  "active_calories_entity",
  "protein_entity",
  "carbohydrate_entity",
  "fat_entity",
  "fiber_entity",
  "sugar_entity",
  "sodium_entity",
  "potassium_entity",
  "cholesterol_entity",
];

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const numberValue = (stateObject) => {
  const value = Number.parseFloat(stateObject?.state);
  return Number.isFinite(value) ? value : null;
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

class FatSecretDashboardCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = null;
    this._hass = null;
    this._history = [];
    this._historyLoading = false;
    this._historyLoadedAt = 0;
    this._renderSignature = "";
    this.shadowRoot.addEventListener("click", (event) => {
      const target = event.target.closest("[data-entity]");
      if (target?.dataset.entity) this._showMoreInfo(target.dataset.entity);
    });
  }

  static getStubConfig() {
    return { ...DEFAULT_CONFIG };
  }

  static getConfigForm() {
    const strings = browserTranslation();
    const entitySelector = (name) => ({
      name,
      selector: { entity: { domain: "sensor" } },
    });
    const goalSelector = (name, max) => ({
      name,
      selector: { number: { min: 1, max, step: 1, mode: "box" } },
    });

    return {
      schema: [
        { name: "title", selector: { text: {} } },
        {
          type: "grid",
          name: "",
          flatten: true,
          schema: [
            entitySelector("calories_entity"),
            goalSelector("calorie_goal", 10000),
            entitySelector("protein_entity"),
            goalSelector("protein_goal", 1000),
            entitySelector("carbohydrate_entity"),
            goalSelector("carbohydrate_goal", 1000),
            entitySelector("fat_entity"),
            goalSelector("fat_goal", 500),
          ],
        },
        {
          type: "expandable",
          name: "active_calories",
          title: strings.config.active_calories,
          flatten: true,
          schema: [
            { name: "use_active_calories", selector: { boolean: {} } },
            entitySelector("active_calories_entity"),
            {
              name: "active_calories_credit_percent",
              selector: { number: { min: 0, max: 100, step: 1, mode: "slider" } },
            },
          ],
        },
        {
          type: "expandable",
          name: "details",
          title: strings.config.details,
          flatten: true,
          schema: [
            entitySelector("fiber_entity"),
            entitySelector("sugar_entity"),
            entitySelector("sodium_entity"),
            entitySelector("potassium_entity"),
            entitySelector("cholesterol_entity"),
          ],
        },
        { name: "show_graph", selector: { boolean: {} } },
        { name: "show_details", selector: { boolean: {} } },
      ],
      computeLabel: (schema) => strings.config[schema.name] ?? schema.name,
    };
  }

  setConfig(config) {
    if (!config || typeof config !== "object") {
      throw new Error("Configuration is required");
    }
    this._config = { ...DEFAULT_CONFIG, ...config };
    for (const field of ENTITY_FIELDS) {
      if (typeof this._config[field] !== "string") {
        throw new Error(`${field} must contain an entity ID`);
      }
    }
    this._history = [];
    this._historyLoadedAt = 0;
    this._renderSignature = "";
    this._render();
    this._maybeLoadHistory();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
    this._maybeLoadHistory();
  }

  getCardSize() {
    let size = 5;
    if (this._config?.show_graph !== false) size += 4;
    if (this._config?.show_details !== false) size += 2;
    if (this._config?.use_active_calories === true) size += 1;
    return size;
  }

  getGridOptions() {
    return {
      columns: 12,
      min_columns: 6,
      rows: this.getCardSize(),
      min_rows: 6,
    };
  }

  _state(entityId) {
    return this._hass?.states?.[entityId];
  }

  _language() {
    return this._hass?.locale?.language ?? this._hass?.language ?? navigator.language ?? "en";
  }

  _t() {
    return translationFor(this._language());
  }

  _localizeUnit(unit) {
    const normalized = String(unit ?? "")
      .trim()
      .toLowerCase()
      .replace("µ", "u")
      .replace("μ", "u");
    return this._t().units[normalized] ?? unit;
  }

  _format(entityId, fallbackUnit = "") {
    const state = this._state(entityId);
    const value = numberValue(state);
    if (value === null) return "—";
    const unit = this._localizeUnit(state.attributes?.unit_of_measurement ?? fallbackUnit);
    const digits = Math.abs(value) >= 100 ? 0 : 1;
    return `${value.toLocaleString(this._language(), {
      maximumFractionDigits: digits,
    })}${unit ? ` ${unit}` : ""}`;
  }

  _calorieBudget() {
    const baseGoalValue = Number(this._config?.calorie_goal);
    const baseGoal = Number.isFinite(baseGoalValue) && baseGoalValue > 0 ? baseGoalValue : 1;
    const enabled = this._config?.use_active_calories === true;
    const percentValue = Number(this._config?.active_calories_credit_percent);
    const percent = clamp(Number.isFinite(percentValue) ? percentValue : 0, 0, 100);
    const sensorValue = enabled
      ? numberValue(this._state(this._config.active_calories_entity))
      : null;
    const activeCalories = sensorValue === null ? null : Math.max(sensorValue, 0);
    const credit = activeCalories === null ? 0 : (activeCalories * percent) / 100;

    return {
      enabled,
      activeCalories,
      percent,
      credit,
      baseGoal,
      effectiveGoal: baseGoal + credit,
    };
  }

  _calorieRingProgress(calories, goal) {
    const consumed = Math.max(Number.isFinite(calories) ? calories : 0, 0);
    const limit = Number.isFinite(goal) && goal > 0 ? goal : 1;

    return {
      progress: clamp((consumed / limit) * 100, 0, 100),
      overLimit: clamp(((consumed - limit) / limit) * 100, 0, 100),
    };
  }

  _showMoreInfo(entityId) {
    this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        bubbles: true,
        composed: true,
        detail: { entityId },
      }),
    );
  }

  _signature() {
    if (!this._config || !this._hass) return "";
    return JSON.stringify({
      states: ENTITY_FIELDS.map((field) => this._state(this._config[field])?.state),
      config: this._config,
      history: this._history.length,
      lastHistory: this._history.at(-1)?.value,
      loading: this._historyLoading,
      language: normalizeLanguage(this._language()),
    });
  }

  _render() {
    if (!this._config || !this._hass) return;
    const signature = this._signature();
    if (signature === this._renderSignature) return;
    this._renderSignature = signature;
    const t = this._t();

    const calories = numberValue(this._state(this._config.calories_entity));
    const budget = this._calorieBudget();
    const goal = budget.effectiveGoal;
    const remaining = goal - (calories ?? 0);
    const ringProgress = this._calorieRingProgress(calories, goal);
    const status =
      calories === null
        ? t.noData
        : remaining >= 0
          ? t.remaining(Math.round(remaining))
          : t.exceeded(Math.round(Math.abs(remaining)));

    const macros = [
      {
        label: t.macros.protein,
        entity: this._config.protein_entity,
        goal: Number(this._config.protein_goal),
        color: "#39b86b",
      },
      {
        label: t.macros.carbohydrates,
        entity: this._config.carbohydrate_entity,
        goal: Number(this._config.carbohydrate_goal),
        color: "#3a8dde",
      },
      {
        label: t.macros.fat,
        entity: this._config.fat_entity,
        goal: Number(this._config.fat_goal),
        color: "#e95d8f",
      },
    ];

    const details = [
      [t.nutrients.fiber, this._config.fiber_entity],
      [t.nutrients.sugar, this._config.sugar_entity],
      [t.nutrients.sodium, this._config.sodium_entity],
      [t.nutrients.potassium, this._config.potassium_entity],
      [t.nutrients.cholesterol, this._config.cholesterol_entity],
    ];

    this.shadowRoot.innerHTML = `
      <style>${this._styles()}</style>
      <ha-card>
        <div class="card-content">
          <header>
            <div>
              <div class="eyebrow">FATSECRET</div>
              <h2>${escapeHtml(this._config.title?.trim() || t.title)}</h2>
              <p>${escapeHtml(status)}</p>
              ${
                budget.enabled
                  ? `<p class="active-credit"${this._config.active_calories_entity ? ` data-entity="${escapeHtml(this._config.active_calories_entity)}"` : ""}>${escapeHtml(
                      budget.activeCalories === null
                        ? t.activeCaloriesUnavailable
                        : t.activeCalorieCredit(
                            Math.round(budget.credit),
                            Math.round(budget.activeCalories),
                            Math.round(budget.percent),
                          ),
                    )}</p>`
                  : ""
              }
            </div>
            <button class="calorie-ring" data-entity="${escapeHtml(this._config.calories_entity)}"
              aria-label="${escapeHtml(t.caloriesAria)}">
              <svg class="ring-visual" viewBox="0 0 118 118" aria-hidden="true">
                <circle class="ring-track" cx="59" cy="59" r="54.5" pathLength="100" />
                ${
                  ringProgress.progress > 0
                    ? `<circle class="ring-progress" cx="59" cy="59" r="54.5" pathLength="100"
                        stroke-dasharray="${ringProgress.progress} ${100 - ringProgress.progress}" />`
                    : ""
                }
                ${
                  ringProgress.overLimit > 0
                    ? `<circle class="ring-over-limit" cx="59" cy="59" r="54.5" pathLength="100"
                        stroke-dasharray="${ringProgress.overLimit} ${100 - ringProgress.overLimit}" />`
                    : ""
                }
              </svg>
              <strong>${calories === null ? "—" : Math.round(calories)}</strong>
              <span>${escapeHtml(t.goalValue(Math.round(goal)))}</span>
            </button>
          </header>

          <section class="macros" aria-label="${escapeHtml(t.macrosAria)}">
            ${macros.map((macro) => this._macroTemplate(macro)).join("")}
          </section>

          ${this._config.show_graph ? this._graphTemplate(calories, goal) : ""}

          ${
            this._config.show_details
              ? `<section class="details">
                  ${details
                    .map(
                      ([label, entity]) => `
                        <button class="detail" data-entity="${escapeHtml(entity)}">
                          <span>${escapeHtml(label)}</span>
                          <strong>${escapeHtml(this._format(entity))}</strong>
                        </button>`,
                    )
                    .join("")}
                </section>`
              : ""
          }
        </div>
      </ha-card>`;
  }

  _macroTemplate({ label, entity, goal, color }) {
    const t = this._t();
    const value = numberValue(this._state(entity));
    const progress = value === null || !goal ? 0 : (value / goal) * 100;
    return `
      <button class="macro" data-entity="${escapeHtml(entity)}" style="--macro-color:${color}">
        <div class="macro-top">
          <span>${escapeHtml(label)}</span>
          <strong>${value === null ? "—" : `${Math.round(value)} / ${Math.round(goal)} ${t.units.g}`}</strong>
        </div>
        <div class="track"><i style="width:${clamp(progress, 0, 100)}%"></i></div>
        <small>${value === null ? escapeHtml(t.noValue) : escapeHtml(t.goalProgress(Math.round(progress)))}</small>
      </button>`;
  }

  _graphTemplate(currentValue, goal) {
    const t = this._t();
    const width = 640;
    const height = 150;
    const left = 8;
    const top = 8;
    const bottom = 132;
    const now = Date.now();
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const historyPoints = this._history.filter(
      (point) => point.time >= start.getTime() && point.time <= now,
    );
    const currentState = this._state(this._config.calories_entity);
    const rawCurrentChangeTime = Date.parse(
      currentState?.last_updated ?? currentState?.last_changed ?? "",
    );
    const currentChangeTime =
      Number.isFinite(rawCurrentChangeTime) &&
      rawCurrentChangeTime >= start.getTime() &&
      rawCurrentChangeTime <= now
        ? rawCurrentChangeTime
        : now;
    const points = [...historyPoints];
    if (currentValue !== null) points.push({ time: now, value: currentValue });
    const changePoints = historyPoints.filter(
      (point, index) => index === 0 || point.value !== historyPoints[index - 1].value,
    );
    if (
      currentValue !== null &&
      (!changePoints.length || changePoints.at(-1).value !== currentValue)
    ) {
      changePoints.push({ time: currentChangeTime, value: currentValue });
    }
    const maxValue = Math.max(goal, currentValue ?? 0, ...points.map((p) => p.value), 1) * 1.08;
    const x = (time) => left + ((time - start.getTime()) / Math.max(now - start.getTime(), 1)) * (width - left * 2);
    const y = (value) => bottom - (value / maxValue) * (bottom - top);
    const coords = points.map((point) => `${x(point.time).toFixed(1)},${y(point.value).toFixed(1)}`);
    const line = coords.length > 1 ? coords.join(" ") : `${left},${bottom} ${width - left},${bottom}`;
    const area = `${left},${bottom} ${line} ${width - left},${bottom}`;
    const goalY = y(goal).toFixed(1);
    const tooltipWidth = 248;
    const tooltipHeight = 46;
    const pointTemplates = changePoints
      .map((point) => {
        const pointX = x(point.time);
        const pointY = y(point.value);
        const tooltipX = clamp(pointX - tooltipWidth / 2, 2, width - tooltipWidth - 2);
        const preferredY =
          pointY > tooltipHeight + 12
            ? pointY - tooltipHeight - 9
            : pointY + 10;
        const tooltipY = clamp(preferredY, 2, height - tooltipHeight - 2);
        const time = new Date(point.time).toLocaleTimeString(this._language(), {
          hour: "2-digit",
          minute: "2-digit",
        });
        const label = t.graphPoint(time, Math.round(point.value));

        return `
          <g class="graph-point" tabindex="0" aria-label="${escapeHtml(label)}"
            data-time="${escapeHtml(time)}" data-value="${Math.round(point.value)}">
            <circle class="point-hit" cx="${pointX.toFixed(1)}" cy="${pointY.toFixed(1)}" r="16" />
            <g class="point-tooltip" transform="translate(${tooltipX.toFixed(1)} ${tooltipY.toFixed(1)})">
              <rect width="${tooltipWidth}" height="${tooltipHeight}" rx="11" />
              <text x="${tooltipWidth / 2}" y="30" text-anchor="middle">${escapeHtml(label)}</text>
            </g>
          </g>`;
      })
      .join("");

    return `
      <section class="graph">
        <div class="section-title">
          <span>${escapeHtml(t.graphTitle)}</span>
          <small>${escapeHtml(this._historyLoading ? t.graphLoading : t.graphRange)}</small>
        </div>
        <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(t.graphAria)}">
          <defs>
            <linearGradient id="fatsecret-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="${BRAND_GREEN}" stop-opacity=".36" />
              <stop offset="1" stop-color="${BRAND_GREEN}" stop-opacity="0" />
            </linearGradient>
          </defs>
          <line class="goal-line" x1="${left}" x2="${width - left}" y1="${goalY}" y2="${goalY}" />
          <polygon points="${area}" fill="url(#fatsecret-area)" />
          <polyline points="${line}" fill="none" stroke="${BRAND_GREEN}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
          ${pointTemplates}
        </svg>
      </section>`;
  }

  async _maybeLoadHistory() {
    if (
      !this._hass?.callWS ||
      !this._config?.show_graph ||
      this._historyLoading ||
      Date.now() - this._historyLoadedAt < 5 * 60 * 1000
    ) {
      return;
    }

    this._historyLoading = true;
    this._renderSignature = "";
    this._render();
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const entityId = this._config.calories_entity;

    try {
      const response = await this._hass.callWS({
        type: "history/history_during_period",
        start_time: start.toISOString(),
        end_time: new Date().toISOString(),
        entity_ids: [entityId],
        minimal_response: false,
        no_attributes: true,
      });
      const records = Array.isArray(response)
        ? Array.isArray(response[0])
          ? response[0]
          : response
        : response?.[entityId] ?? [];
      this._history = records
        .map((record) => {
          const value = Number.parseFloat(record.state ?? record.s);
          const rawTime = record.last_updated ?? record.last_changed ?? record.lu ?? record.lc;
          const time = typeof rawTime === "number" ? rawTime * 1000 : Date.parse(rawTime);
          return { value, time };
        })
        .filter((point) => Number.isFinite(point.value) && Number.isFinite(point.time))
        .sort((a, b) => a.time - b.time);
      this._historyLoadedAt = Date.now();
    } catch (error) {
      console.warn("FatSecret Dashboard: unable to load Recorder history", error);
      this._historyLoadedAt = Date.now();
    } finally {
      this._historyLoading = false;
      this._renderSignature = "";
      this._render();
    }
  }

  _styles() {
    return `
      :host { display:block; --accent:${BRAND_GREEN}; }
      * { box-sizing:border-box; }
      ha-card { display:block; overflow:hidden; background:var(--ha-card-background, var(--card-background-color, #fff)); border-radius:18px; box-shadow:0 3px 18px rgba(20,25,34,.10); }
      .card-content { padding:22px; color:var(--primary-text-color); font-family:var(--paper-font-body1_-_font-family, sans-serif); }
      header { display:flex; justify-content:space-between; align-items:center; gap:18px; }
      .eyebrow { color:var(--accent); font-size:11px; font-weight:800; letter-spacing:.18em; }
      h2 { margin:4px 0 3px; font-size:24px; line-height:1.2; }
      p { margin:0; color:var(--secondary-text-color); font-size:13px; }
      .active-credit { margin-top:4px; color:var(--accent); font-size:11px; font-weight:600; }
      .active-credit[data-entity] { cursor:pointer; }
      button { font:inherit; color:inherit; }
      .calorie-ring { width:118px; height:118px; flex:0 0 118px; padding:0; border:0; border-radius:50%; cursor:pointer; display:flex; flex-direction:column; align-items:center; justify-content:center; position:relative; background:transparent; }
      .ring-visual { position:absolute; inset:0; width:100%; height:100%; margin:0; overflow:visible; transform:rotate(-90deg); }
      .ring-visual circle { fill:none; stroke-width:9; }
      .ring-track { stroke:color-mix(in srgb, var(--divider-color) 45%, transparent); }
      .ring-progress,.ring-over-limit { stroke-linecap:round; }
      .ring-progress { stroke:var(--accent); }
      .ring-over-limit { stroke:${OVER_LIMIT_ORANGE}; }
      .calorie-ring strong,.calorie-ring span { position:relative; z-index:1; }
      .calorie-ring strong { font-size:25px; line-height:1; }
      .calorie-ring span { margin-top:6px; color:var(--secondary-text-color); font-size:10px; }
      .macros { display:grid; grid-template-columns:repeat(3, 1fr); gap:10px; margin-top:20px; }
      .macro,.detail { border:0; background:color-mix(in srgb, var(--secondary-background-color) 74%, transparent); cursor:pointer; text-align:left; border-radius:14px; }
      .macro { padding:13px; }
      .macro-top { display:flex; justify-content:space-between; gap:8px; font-size:12px; }
      .macro-top span { color:var(--secondary-text-color); }
      .track { height:6px; margin:10px 0 7px; overflow:hidden; border-radius:99px; background:color-mix(in srgb, var(--divider-color) 55%, transparent); }
      .track i { display:block; height:100%; border-radius:inherit; background:var(--macro-color); }
      .macro small { color:var(--secondary-text-color); font-size:10px; }
      .graph { margin-top:20px; padding:15px 15px 5px; border:1px solid var(--divider-color); border-radius:16px; }
      .section-title { display:flex; justify-content:space-between; align-items:center; font-size:13px; font-weight:700; }
      .section-title small { color:var(--secondary-text-color); font-weight:400; }
      svg { display:block; width:100%; height:150px; margin-top:4px; overflow:visible; }
      .goal-line { stroke:var(--divider-color); stroke-width:2; stroke-dasharray:7 7; }
      .graph-point { outline:none; cursor:help; }
      .point-hit { fill:transparent; }
      .point-tooltip { opacity:0; pointer-events:none; transition:opacity .14s ease; }
      .point-tooltip rect { fill:var(--primary-text-color, #20242c); filter:drop-shadow(0 2px 4px rgba(0,0,0,.22)); }
      .point-tooltip text { fill:var(--ha-card-background, var(--card-background-color, #fff)); font-size:20px; font-weight:700; }
      .graph-point:hover .point-tooltip,.graph-point:focus .point-tooltip { opacity:1; }
      .details { display:grid; grid-template-columns:repeat(5, 1fr); gap:8px; margin-top:12px; }
      .detail { padding:11px; min-width:0; }
      .detail span,.detail strong { display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .detail span { color:var(--secondary-text-color); font-size:10px; }
      .detail strong { margin-top:4px; font-size:13px; }
      button:hover { filter:brightness(.98); }
      button:focus-visible { outline:2px solid var(--primary-color); outline-offset:2px; }
    `;
  }
}

if (!customElements.get("fatsecret-dashboard-card")) {
  customElements.define("fatsecret-dashboard-card", FatSecretDashboardCard);
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: "fatsecret-dashboard-card",
  name: "FatSecret Dashboard",
  preview: true,
  description: browserTranslation().cardDescription,
  documentationURL: "https://github.com/BrainDeLook/ha-fatsecret-dashboard",
});

console.info(
  `%c FATSECRET-DASHBOARD %c v${CARD_VERSION} `,
  `background:${BRAND_GREEN};color:#111;font-weight:700;padding:3px 6px;border-radius:4px 0 0 4px`,
  "background:#272727;color:#fff;padding:3px 6px;border-radius:0 4px 4px 0",
);
