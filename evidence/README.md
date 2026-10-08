# Материалы проверки

## Результаты

8 октября 2026 года я проверил установку и запуск проекта из чистой копии репозитория `avtotor-clean-check`: создал новое виртуальное окружение Python, установил зависимости клиента и сервера, выполнил автоматические проверки.

Среда проверки:

| Компонент | Версия |
| --- | --- |
| ОС | Windows |
| Node.js | 24.18.1 |
| Yarn | 1.22.22 |
| Python | 3.14.6 |

Результаты:

| Проверка | Результат |
| --- | --- |
| `python -m pytest -v` | 49 passed in 0.71s |
| `yarn test:e2e` | 8 passed (8.0s) |
| `yarn lint` | Успешно, без ошибок ESLint |
| `yarn build` | Успешно; TypeScript + Vite 8.2.2, 168 модулей |

Проверки запускал локально. Время выполнения приведено для конкретного прогона и не является требованием производительности.

Базовый коммит приложения перед добавлением документации и материалов проверки: `803d272dc7bc0f2a6e23103a1b452726dd9c480c`.

Репозиторий: https://github.com/Martin6175903/avtotor.

## Состав материалов

Для логов и скриншотов использую каталог `evidence` в корне проекта:

| Путь от корня | Содержание |
| --- | --- |
| `evidence/backend-tests.txt` | Полный вывод серверных тестов pytest |
| `evidence/frontend-lint.txt` | Вывод ESLint |
| `evidence/frontend-build.txt` | Вывод проверки TypeScript и сборки Vite |
| `evidence/frontend-e2e.txt` | Вывод браузерных тестов Playwright |
| `evidence/screenshots/answer-with-source.png` | Ответ на вопрос и ссылка на использованный источник |
| `evidence/screenshots/opened-document.png` | Открытый разрешённый документ |
| `evidence/screenshots/document-access-denied.png` | Отказ при прямом открытии HR-документа обычным сотрудником |
| `evidence/screenshots/service-error.png` | Отображение ошибки сервиса в браузерном тесте |

Скриншоты создаются функцией `saveScreenshot` в `frontend/e2e/rag.spec.ts`. Исходные снимки каждого прогона Playwright сохраняет в подпапках `frontend/test-results`.

## Что проверяют тесты

Серверные тесты проверяют:

- вход, выход, истечение сессии и отклонение поддельного токена;
- определение роли на сервере;
- доступ сотрудника, HR и администратора к документам;
- повторную проверку прав при прямом открытии источника;
- отсутствие закрытых источников в ответе, ссылках и контексте mock-модели;
- отклонение дополнительных полей в запросе;
- отсутствие расширения доступа при подмене роли через заголовки и query-параметры;
- ответ «Недостаточно данных» без вызова модели;
- детерминированность ответа и безопасную обработку ошибки модели.

Браузерные тесты проверяют вход, получение ответа, переход к источнику, восстановление сессии после перезагрузки, ограничения доступа, очищение предыдущего ответа при смене пользователя и повторную отправку вопроса после ошибки.

Основные E2E-сценарии работают с запущенным FastAPI. В сценарии ошибки сервиса Playwright подменяет ответ `/api/ask` на HTTP 503. Этот сценарий проверяет поведение интерфейса; обработку исключения самой модели проверяет отдельный серверный тест.

## Сохранение логов в Windows PowerShell

При первоначальном сохранении вывода через `Tee-Object` столкнулся с искажением кириллицы и оформлением обычных сообщений Uvicorn из stderr как `NativeCommandError`.

Для читаемых текстовых логов использую перенаправление через `cmd` и чтение файла в UTF-8. В текущем терминале задаю:

```powershell
$env:FORCE_COLOR = "0"
$env:PYTHONIOENCODING = "utf-8"
```

### Браузерные тесты

Из папки `frontend`:

```powershell
cmd.exe /d /c "yarn.cmd test:e2e > ..\evidence\frontend-e2e.txt 2>&1"

$e2eExitCode = $LASTEXITCODE

Get-Content -LiteralPath "../evidence/frontend-e2e.txt" -Encoding UTF8

Write-Host "Exit code: $e2eExitCode"
```

### Линтер

Из папки `frontend`:

```powershell
cmd.exe /d /c "yarn.cmd lint > ..\evidence\frontend-lint.txt 2>&1"

$lintExitCode = $LASTEXITCODE

Get-Content -LiteralPath "../evidence/frontend-lint.txt" -Encoding UTF8

Write-Host "Exit code: $lintExitCode"
```

### Сборка

Из папки `frontend`:

```powershell
cmd.exe /d /c "yarn.cmd build > ..\evidence\frontend-build.txt 2>&1"

$buildExitCode = $LASTEXITCODE

Get-Content -LiteralPath "../evidence/frontend-build.txt" -Encoding UTF8

Write-Host "Exit code: $buildExitCode"
```

### Серверные тесты

Из папки `backend`, с установленными выше переменными окружения:

```powershell
cmd.exe /d /c ".venv\Scripts\python.exe -m pytest -v > ..\evidence\backend-tests.txt 2>&1"

$backendExitCode = $LASTEXITCODE

Get-Content -LiteralPath "../evidence/backend-tests.txt" -Encoding UTF8

Write-Host "Exit code: $backendExitCode"
```

Код завершения `0` означает успешное выполнение команды. Сохраняю его сразу после запуска, чтобы следующая команда не перезаписала значение.

Во время выполнения вывод записывается в файл, после завершения отображается в терминале. Последовательности вида `\u041f...` в названиях параметризованных тестов — экранирование Unicode в pytest, а не повреждение кодировки.

## Границы проверки

Результаты относятся к указанному локальному прогону. Браузерные сценарии выполнены в Chromium; проверку других браузеров и операционных систем не проводил.

Автоматические тесты покрывают основные сценарии задания, но не заменяют нагрузочные испытания и полноценный аудит безопасности.