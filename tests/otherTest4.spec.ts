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
  const liArray = [
    "首頁",
    "電視劇",
    "電影",
    "動漫",
    "綜藝",
    "短劇",
    "排行",
    "成人",
  ];

  let counter = 0;

  for (const li of await allGimyNavList.all()) {
    console.log(`counter = ${counter}`);

    await li.click();

    expect(await li.textContent()).toEqual(liArray[counter]);

    if (counter != 8) {
      counter++;
    }

    if ((await li.textContent()) == "成人") {
      break;
    }
  }
});

test("search a drama name", async ({ page }) => {
  await page.goto("https://gimytv.ai/");

  await page.locator("ul li", { hasText: "電視劇" }).click();
  await page.locator('ul li [title="台灣"]').click();
  await page.locator('ul li [title="2025"]').click();

  await page.getByPlaceholder("輸入影片關鍵字...").fill("我們與惡的距離2");
  await page
    .locator(
      'div[class="nav-search visible-md visible-lg"] form[id="formsearch"] button.btn-search'
    )
    .click();

  await expect(page.locator("ul li").getByTitle("我們與惡的距離2")).toHaveText(
    "我們與惡的距離2"
  );
});
