import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:4200/");
  await page.getByTitle("Modal & Overlays").click();
  await page.getByTitle("Toastr").click();
});

test("select option and checkbox extracting value", async ({ page }) => {
  // select option extract value
  await page
    .locator('nb-select[ng-reflect-selected="primary"] .select-button')
    .click({ force: true });
  await page
    .locator('nb-option-list nb-option[ng-reflect-value="info"]')
    .click({ force: true });

  const selectValue = await page
    .locator("label")
    .filter({ hasText: "Toast type:" })
    .locator("xpath=..")
    .locator("nb-select")
    .getAttribute("ng-reflect-selected");

  expect(selectValue).toEqual("info");

  // checkbox extract value
  // await page
  //   .locator("nb-checkbox")
  //   .filter({ hasText: "Hide on click" })
  //   .click();
  // await page
  //   .locator("nb-checkbox")
  //   .filter({ hasText: "Prevent arising of duplicate toast" })
  //   .click();
  // await page
  //   .locator("nb-checkbox")
  //   .filter({ hasText: "Show toast with icon" })
  //   .click();

  // 把上面點擊三次 checkbox 改成 for...loop
  const checkboxLabelsTexts = [
    "Hide on click",
    "Prevent arising of duplicate toast",
    "Show toast with icon",
  ];

  for (const labelText of checkboxLabelsTexts) {
    await page.locator("nb-checkbox").filter({ hasText: labelText }).click();
  }

  const checkedValue = await page
    .locator("nb-checkbox .checked")
    .locator("..")
    .textContent();

  expect(checkedValue).toEqual("Prevent arising of duplicate toast");
});
