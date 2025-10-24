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

test("gimyTV", async ({ page }) => {
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

test("loop nav Bar", async ({ page }) => {
  await page.goto("https://gimytv.ai/");

  const allGimyNavList = page.locator("#example-navbar-collapse ul li");
  // const liArray = [
  //   "首頁",
  //   "電視劇",
  //   "電影",
  //   "動漫",
  //   "綜藝",
  //   "短劇",
  //   "排行",
  //   "成人",
  // ];

  for (const li of await allGimyNavList.all()) {
    await li.click();

    if ((await li.textContent()) == "成人") {
      break;
    }
  }
});
