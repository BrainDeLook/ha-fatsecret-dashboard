# FatSecret Dashboard for Home Assistant

Информативная Lovelace-карточка для интеграции
[`xplanes/ha-fatsecret`](https://github.com/xplanes/ha-fatsecret): дневные цели,
прогресс калорий и БЖУ, подробные нутриенты и график накопления за день.

Готовый комплект состоит из двух файлов:

- [`packages/fatsecret.yaml`](packages/fatsecret.yaml) — редактируемые цели и четыре сенсора прогресса.
- [`dashboards/fatsecret-card.yaml`](dashboards/fatsecret-card.yaml) — Lovelace-карточка с калориями, БЖУ, нутриентами и суточным графиком.

## Установка

1. Установите через HACS frontend-карточки **Mushroom** и **ApexCharts Card**.
2. Скопируйте `packages/fatsecret.yaml` в `/config/packages/fatsecret.yaml`.
3. Если packages ещё не включены, добавьте в `configuration.yaml`:

   ```yaml
   homeassistant:
     packages: !include_dir_named packages
   ```

4. Выполните **Developer Tools → YAML → Check configuration**, затем перезапустите Home Assistant.
5. Добавьте Manual card и вставьте содержимое `dashboards/fatsecret-card.yaml`.

## Перед вставкой карточки

Проверьте в **Developer Tools → States**, что интеграция создала сущности
`sensor.calories`, `sensor.protein`, `sensor.carbohydrates` и `sensor.fat`.
Home Assistant иногда добавляет суффикс (`_2`) при конфликте имён. В таком случае
замените соответствующие entity ID в обоих YAML-файлах.

График использует краткосрочную историю Recorder, потому что текущая версия
`ha-fatsecret` не задаёт исходным сенсорам `state_class`. Убедитесь, что эти
сущности не исключены из Recorder.

## Значения целей по умолчанию

- 2200 ккал
- 160 г белка
- 250 г углеводов
- 70 г жиров

Все значения можно менять прямо на дашборде.

## Лицензия

[MIT](LICENSE)
