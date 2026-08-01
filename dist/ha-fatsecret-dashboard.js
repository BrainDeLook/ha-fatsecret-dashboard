const CARD_VERSION = "1.0.0";

const DEFAULT_CONFIG = Object.freeze({
  title: "Питание сегодня",
  calories_entity: "sensor.calories",
  protein_entity: "sensor.protein",
  carbohydrate_entity: "sensor.carbohydrates",
  fat_entity: "sensor.fat",
  fiber_entity: "sensor.fiber",
  sugar_entity: "sensor.sugar",
  sodium_entity: "sensor.sodium",
  potassium_entity: "sensor.potassium",
  cholesterol_entity: "sensor.cholesterol",
  calorie_goal: 2200,
  protein_goal: 160,
  carbohydrate_goal: 250,
  fat_goal: 70,
  show_graph: true,
  show_details: true,
});

const LABELS = Object.freeze({
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
  calorie_goal: "Цель калорий, ккал",
  protein_goal: "Цель белка, г",
  carbohydrate_goal: "Цель углеводов, г",
  fat_goal: "Цель жиров, г",
  show_graph: "Показывать график",
  show_details: "Показывать нутриенты",
});

const ENTITY_FIELDS = [
  "calories_entity",
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
          name: "details",
          title: "Дополнительные нутриенты",
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
      computeLabel: (schema) => LABELS[schema.name] ?? schema.name,
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
    return this._config?.show_graph === false ? 5 : 7;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6, rows: 7, min_rows: 5 };
  }

  _state(entityId) {
    return this._hass?.states?.[entityId];
  }

  _format(entityId, fallbackUnit = "") {
    const state = this._state(entityId);
    const value = numberValue(state);
    if (value === null) return "—";
    const unit = state.attributes?.unit_of_measurement ?? fallbackUnit;
    const digits = Math.abs(value) >= 100 ? 0 : 1;
    return `${value.toLocaleString(this._hass?.locale?.language, {
      maximumFractionDigits: digits,
    })}${unit ? ` ${unit}` : ""}`;
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
    });
  }

  _render() {
    if (!this._config || !this._hass) return;
    const signature = this._signature();
    if (signature === this._renderSignature) return;
    this._renderSignature = signature;

    const calories = numberValue(this._state(this._config.calories_entity));
    const goal = Number(this._config.calorie_goal) || 1;
    const remaining = goal - (calories ?? 0);
    const calorieProgress = ((calories ?? 0) / goal) * 100;
    const status =
      calories === null
        ? "Нет данных от FatSecret"
        : remaining >= 0
          ? `Осталось ${Math.round(remaining)} ккал`
          : `Превышение на ${Math.round(Math.abs(remaining))} ккал`;

    const macros = [
      {
        label: "Белок",
        entity: this._config.protein_entity,
        goal: Number(this._config.protein_goal),
        color: "#39b86b",
      },
      {
        label: "Углеводы",
        entity: this._config.carbohydrate_entity,
        goal: Number(this._config.carbohydrate_goal),
        color: "#3a8dde",
      },
      {
        label: "Жиры",
        entity: this._config.fat_entity,
        goal: Number(this._config.fat_goal),
        color: "#e95d8f",
      },
    ];

    const details = [
      ["Клетчатка", this._config.fiber_entity],
      ["Сахар", this._config.sugar_entity],
      ["Натрий", this._config.sodium_entity],
      ["Калий", this._config.potassium_entity],
      ["Холестерин", this._config.cholesterol_entity],
    ];

    this.shadowRoot.innerHTML = `
      <style>${this._styles()}</style>
      <ha-card>
        <div class="card-content">
          <header>
            <div>
              <div class="eyebrow">FATSECRET</div>
              <h2>${escapeHtml(this._config.title)}</h2>
              <p>${escapeHtml(status)}</p>
            </div>
            <button class="calorie-ring" data-entity="${escapeHtml(this._config.calories_entity)}"
              style="--progress:${clamp(calorieProgress, 0, 100)}%"
              aria-label="Открыть сведения о калориях">
              <strong>${calories === null ? "—" : Math.round(calories)}</strong>
              <span>из ${Math.round(goal)} ккал</span>
            </button>
          </header>

          <section class="macros" aria-label="Макронутриенты">
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
    const value = numberValue(this._state(entity));
    const progress = value === null || !goal ? 0 : (value / goal) * 100;
    return `
      <button class="macro" data-entity="${escapeHtml(entity)}" style="--macro-color:${color}">
        <div class="macro-top">
          <span>${escapeHtml(label)}</span>
          <strong>${value === null ? "—" : `${Math.round(value)} / ${Math.round(goal)} г`}</strong>
        </div>
        <div class="track"><i style="width:${clamp(progress, 0, 100)}%"></i></div>
        <small>${value === null ? "нет данных" : `${Math.round(progress)}% цели`}</small>
      </button>`;
  }

  _graphTemplate(currentValue, goal) {
    const width = 640;
    const height = 150;
    const left = 8;
    const top = 8;
    const bottom = 132;
    const now = Date.now();
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const points = [...this._history];
    if (currentValue !== null) points.push({ time: now, value: currentValue });
    const maxValue = Math.max(goal, currentValue ?? 0, ...points.map((p) => p.value), 1) * 1.08;
    const x = (time) => left + ((time - start.getTime()) / Math.max(now - start.getTime(), 1)) * (width - left * 2);
    const y = (value) => bottom - (value / maxValue) * (bottom - top);
    const coords = points
      .filter((point) => point.time >= start.getTime() && point.time <= now)
      .map((point) => `${x(point.time).toFixed(1)},${y(point.value).toFixed(1)}`);
    const line = coords.length > 1 ? coords.join(" ") : `${left},${bottom} ${width - left},${bottom}`;
    const area = `${left},${bottom} ${line} ${width - left},${bottom}`;
    const goalY = y(goal).toFixed(1);

    return `
      <section class="graph">
        <div class="section-title">
          <span>Калории за сегодня</span>
          <small>${this._historyLoading ? "загрузка…" : "00:00 — сейчас"}</small>
        </div>
        <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="График калорий за сегодня">
          <defs>
            <linearGradient id="fatsecret-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#ff9f43" stop-opacity=".36" />
              <stop offset="1" stop-color="#ff9f43" stop-opacity="0" />
            </linearGradient>
          </defs>
          <line class="goal-line" x1="${left}" x2="${width - left}" y1="${goalY}" y2="${goalY}" />
          <polygon points="${area}" fill="url(#fatsecret-area)" />
          <polyline points="${line}" fill="none" stroke="#ff9f43" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
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
      :host { display:block; --accent:#ff9f43; }
      * { box-sizing:border-box; }
      ha-card { display:block; overflow:hidden; background:var(--ha-card-background, var(--card-background-color, #fff)); border-radius:18px; box-shadow:0 3px 18px rgba(20,25,34,.10); }
      .card-content { padding:22px; color:var(--primary-text-color); font-family:var(--paper-font-body1_-_font-family, sans-serif); }
      header { display:flex; justify-content:space-between; align-items:center; gap:18px; }
      .eyebrow { color:var(--accent); font-size:11px; font-weight:800; letter-spacing:.18em; }
      h2 { margin:4px 0 3px; font-size:24px; line-height:1.2; }
      p { margin:0; color:var(--secondary-text-color); font-size:13px; }
      button { font:inherit; color:inherit; }
      .calorie-ring { width:118px; height:118px; flex:0 0 118px; border:0; border-radius:50%; cursor:pointer; display:flex; flex-direction:column; align-items:center; justify-content:center; position:relative; background:conic-gradient(var(--accent) var(--progress), color-mix(in srgb, var(--divider-color) 45%, transparent) 0); }
      .calorie-ring::before { content:""; position:absolute; inset:9px; border-radius:50%; background:var(--ha-card-background, var(--card-background-color, #fff)); }
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
      .details { display:grid; grid-template-columns:repeat(5, 1fr); gap:8px; margin-top:12px; }
      .detail { padding:11px; min-width:0; }
      .detail span,.detail strong { display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .detail span { color:var(--secondary-text-color); font-size:10px; }
      .detail strong { margin-top:4px; font-size:13px; }
      button:hover { filter:brightness(.98); }
      button:focus-visible { outline:2px solid var(--primary-color); outline-offset:2px; }
      @media (max-width:600px) {
        .card-content { padding:16px; }
        h2 { font-size:20px; }
        .calorie-ring { width:100px; height:100px; flex-basis:100px; }
        .calorie-ring strong { font-size:21px; }
        .macros { grid-template-columns:1fr; }
        .details { grid-template-columns:repeat(2, 1fr); }
      }
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
  description: "Калории, БЖУ, нутриенты и график FatSecret за текущий день.",
  documentationURL: "https://github.com/BrainDeLook/ha-fatsecret-dashboard",
});

console.info(
  `%c FATSECRET-DASHBOARD %c v${CARD_VERSION} `,
  "background:#ff9f43;color:#111;font-weight:700;padding:3px 6px;border-radius:4px 0 0 4px",
  "background:#272727;color:#fff;padding:3px 6px;border-radius:0 4px 4px 0",
);
