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

test("test", async ({ page }) => {
  await page.goto("https://gimytv.ai/");

  const tvDrama = page.locator("#example-navbar-collapse ul li", {
    hasText: "電視劇",
  });

  await tvDrama.click();

  const twDrama = page.locator(".content-menu .item").getByText("台劇");
  await twDrama.click();

  const theOutLawOfDoctor = page.getByText("化外之醫");
  await theOutLawOfDoctor.click();

  await page.locator("ul#con_playlist_7 li").getByText("第01集").click();
});
