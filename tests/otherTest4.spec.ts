import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto(
    "https://www.lambdatest.com/selenium-playground/jquery-dropdown-search-demo"
  );
});

test("drop down test", async ({ page }) => {
  await page.locator("select#country").selectOption("Netherlands");

  await page
    .locator("select[multiple]")
    .selectOption(["Colorado", "Hawaii", "Kansas"]);

  await page
    .locator(
      'select[class="js-example-disabled-results select2-hidden-accessible"]'
    )
    .selectOption("VI");

  await page.locator("select#files").selectOption({ label: "Python" });
});
