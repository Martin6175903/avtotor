# Клиент базы знаний

React + TypeScript + Vite. Клиент использует Axios для API, React Router для страниц входа, вопросов и документов, React Hook Form / Yup для форм и SCSS Modules для стилей.

Полные инструкции: [README в корне](../README.md). Архитектура: [схемы интеграции](../docs/INTEGRATION.md).

Из этой папки:

```powershell
yarn install --frozen-lockfile
yarn dev --host 127.0.0.1
```

Сервер FastAPI должен работать на `127.0.0.1:8000`. Vite обслуживает UI на порту `5173` и проксирует `/api` на сервер.

```powershell
yarn lint
yarn build
yarn playwright install chromium
yarn test:e2e
yarn test:e2e:report
```

Перед E2E остановите вручную запущенные серверы: Playwright поднимает их сам, используя окружение `../backend/.venv`. Результаты и снимки находятся в `test-results`, HTML-отчёт — в `playwright-report`. Эти временные каталоги не коммитятся; выбранные материалы сдачи копируются в корневой `evidence`.

`yarn build` проверяет TypeScript и создаёт `dist`. Production-инфраструктура раздачи SPA и маршрутизации API в прототипе не настроена.
