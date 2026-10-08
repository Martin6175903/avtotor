import type { Page, TestInfo } from '@playwright/test';
import { expect, test } from '@playwright/test';

const login = async (page: Page, username = 'employee', password = 'demo-user') => {
  await page.goto('/login');

  await page.getByRole('textbox', { name: 'Логин', exact: true }).fill(username);
  await page.getByLabel('Пароль', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Войти', exact: true }).click();

  await expect(page.getByRole('button', { name: 'Выйти', exact: true })).toBeVisible();
  await expect(page).toHaveURL('http://127.0.0.1:5173/');
};

const ask = async (page: Page, question: string) => {
  await page.getByRole('textbox', { name: 'Ваш вопрос', exact: true }).fill(question);

  await page.getByRole('button', { name: 'Получить ответ', exact: true }).click();
};

const saveScreenshot = async (page: Page, testInfo: TestInfo, name: string) => {
  const path = testInfo.outputPath(`${name}.png`);

  await page.screenshot({ path, fullPage: true });

  await testInfo.attach(name, {
    path,
    contentType: 'image/png',
  });
};

test('сотрудник получает ответ и открывает источник', async ({ page }, testInfo) => {
  await login(page);
  await ask(page, 'Отпуск');

  await expect(page.getByTestId('ask-result')).toContainText('14 календарных дней');

  const source = page.getByRole('link', {
    name: 'Оформление отпуска',
    exact: true,
  });

  await expect(source).toBeVisible();
  await saveScreenshot(page, testInfo, 'answer-with-source');

  await source.click();

  await expect(
    page.getByRole('heading', { name: 'Оформление отпуска', exact: true }),
  ).toBeVisible();

  await saveScreenshot(page, testInfo, 'opened-document');

  await page.reload();

  await expect(
    page.getByRole('heading', { name: 'Оформление отпуска', exact: true }),
  ).toBeVisible();

  await expect(page.getByRole('button', { name: 'Выйти', exact: true })).toBeVisible();
});

test('закрытый источник недоступен сотруднику', async ({ page }, testInfo) => {
  await login(page);
  await ask(page, 'Премирование');

  await expect(page.getByTestId('ask-result')).toContainText('Недостаточно данных');

  await expect(page.getByRole('link', { name: 'Правила премирования', exact: true })).toHaveCount(
    0,
  );

  await expect(page.locator('body')).not.toContainText('120000');

  const response = await page.request.get('/api/documents/hr-2');

  expect(response.status()).toBe(404);
  expect(await response.json()).toEqual({
    detail: 'Документ не найден или недоступен.',
  });

  await page.goto('/documents/hr-2');

  await expect(page.getByRole('alert')).toContainText('Запрошенный ресурс не найден.');

  await expect(page.locator('body')).not.toContainText('120000');

  await saveScreenshot(page, testInfo, 'document-access-denied');
});

const roleScenarios = [
  {
    username: 'hr',
    password: 'demo-hr',
    question: 'Премирование',
    title: 'Правила премирования',
    expectedText: '120000',
  },
  {
    username: 'admin',
    password: 'demo-admin',
    question: 'Резервирование',
    title: 'Резервирование данных',
    expectedText: '02:30',
  },
];

for (const scenario of roleScenarios) {
  test(`${scenario.username} открывает свой закрытый источник`, async ({ page }) => {
    await login(page, scenario.username, scenario.password);
    await ask(page, scenario.question);

    await expect(page.getByTestId('ask-result')).toContainText(scenario.expectedText);

    await page.getByRole('link', { name: scenario.title, exact: true }).click();

    await expect(page.getByRole('heading', { name: scenario.title, exact: true })).toBeVisible();
  });
}

test('при смене пользователя предыдущий ответ очищается', async ({ page }) => {
  await login(page, 'hr', 'demo-hr');
  await ask(page, 'Премирование');

  await expect(page.getByTestId('ask-result')).toContainText('120000');

  await page.getByRole('button', { name: 'Выйти', exact: true }).click();

  await expect(page).toHaveURL('http://127.0.0.1:5173/login');

  await login(page);

  await expect(page.locator('body')).not.toContainText('120000');

  await expect(page.getByRole('link', { name: 'Правила премирования', exact: true })).toHaveCount(
    0,
  );
});

test('запрос без сессии отклоняется', async ({ page }) => {
  const response = await page.request.post('/api/ask', {
    data: { question: 'Отпуск' },
  });

  expect(response.status()).toBe(401);

  await page.goto('/');

  await expect(page).toHaveURL('http://127.0.0.1:5173/login');
});

test('переданная клиентом роль не расширяет доступ', async ({ page }) => {
  await login(page);

  const invalidBodyResponse = await page.request.post('/api/ask', {
    data: {
      question: 'Резервирование',
      role: 'admin',
    },
  });

  expect(invalidBodyResponse.status()).toBe(422);

  const spoofedRoleResponse = await page.request.post('/api/ask?role=admin', {
    headers: {
      'X-Role': 'admin',
    },
    data: {
      question: 'Резервирование',
    },
  });

  expect(spoofedRoleResponse.status()).toBe(200);
  expect(await spoofedRoleResponse.json()).toEqual({
    answer: 'Недостаточно данных',
    sources: [],
  });
});

test('ошибка сервиса отображается и позволяет повторить запрос', async ({ page }, testInfo) => {
  await login(page);

  await page.route('**/api/ask', async (route) => {
    await route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({
        detail: 'Сервис ответов временно недоступен.',
      }),
    });
  });

  await ask(page, 'Отпуск');

  await expect(page.getByRole('alert')).toContainText(
    'Сервис временно недоступен. Попробуйте позже.',
  );

  await saveScreenshot(page, testInfo, 'service-error');

  await page.unroute('**/api/ask');

  await ask(page, 'Отпуск');

  await expect(page.getByTestId('ask-result')).toContainText('14 календарных дней');

  await expect(page.getByRole('alert')).toHaveCount(0);
});
