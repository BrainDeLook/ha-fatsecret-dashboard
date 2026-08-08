import assert from "node:assert/strict";

const registry = new Map();

globalThis.HTMLElement = class {
  attachShadow() {
    this.shadowRoot = {
      addEventListener() {},
      innerHTML: "",
    };
  }

  dispatchEvent() {}
};
globalThis.customElements = {
  define(name, constructor) {
    registry.set(name, constructor);
  },
  get(name) {
    return registry.get(name);
  },
};
globalThis.document = { documentElement: { lang: "en" } };
globalThis.window = {};

await import(`../src/ha-fatsecret-dashboard.js?test=${Date.now()}`);

const Card = registry.get("fatsecret-dashboard-card");
const card = new Card();
card._config = {
  calorie_goal: 2200,
  use_active_calories: true,
  active_calories_entity: "sensor.active_calories",
  active_calories_credit_percent: 50,
};
card._hass = {
  states: {
    "sensor.active_calories": { state: "640", attributes: { unit_of_measurement: "kcal" } },
  },
};

assert.deepEqual(card._calorieBudget(), {
  enabled: true,
  activeCalories: 640,
  percent: 50,
  credit: 320,
  baseGoal: 2200,
  effectiveGoal: 2520,
});

card._config.active_calories_credit_percent = 150;
assert.equal(card._calorieBudget().percent, 100);
assert.equal(card._calorieBudget().effectiveGoal, 2840);

card._hass.states["sensor.active_calories"].state = "-200";
assert.equal(card._calorieBudget().credit, 0);
assert.equal(card._calorieBudget().effectiveGoal, 2200);

card._config.use_active_calories = false;
assert.equal(card._calorieBudget().effectiveGoal, 2200);

console.log("Active calorie budget calculations are valid");
