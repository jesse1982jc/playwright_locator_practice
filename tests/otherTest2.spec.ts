import { test, expect } from "@playwright/test";
import { timeout } from "rxjs-compat/operator/timeout";

test("login caca taxi", async ({ page }) => {
  await page.goto("https://www.cacataxi.com/", { timeout: 10000 });

  const languateBtn = page.locator("nav ul").nth(1).locator("li").nth(0);
  await languateBtn.click();
  await page.locator(".dropdown-menu").getByText("繁中").last().click();

  await page.getByText("登入").click();

  const countryTelCode = page.locator('.relative button img[alt="ArrowDown"]');
  await countryTelCode.click();

  // await page
  //   .locator("div.absolute div.cursor-pointer", {
  //     hasText: " +886 Taiwan (台灣) ",
  //   })
  //   .click();

  await page.getByPlaceholder("搜尋國家").fill("886");
  await page.getByText(" +886 Taiwan (台灣) ").click();

  await page.getByPlaceholder("手機號碼").fill("972356167");
  await page.getByRole("button", { name: "下一步" }).click();
});

test("login in myan life", async ({ page }) => {
  await page.goto("https://www.myanlife.com.mm/", { timeout: 10000 });
  const languageBtn = page.locator("header .lang_select").first();

  // 選語系 繁中
  await languageBtn.click();
  await page
    .locator(".lang_list .lang_list_item", { hasText: "繁體中文" })
    .first()
    .click();

  const loginRegisterBtn = page.locator("header .login_btn").first();
  await loginRegisterBtn.click();

  // await page.waitForSelector(".two-part-flexrow-style");
  await page.waitForTimeout(1000);

  await expect(page.locator(".two-part-flexrow-style").first()).toBeVisible();

  const emailLogin = page.locator('.login-form-area [data-logintype="email"]', {
    hasText: "信箱",
  });
  await emailLogin.click();

  await page.locator("#login_email").fill("jcjchuhu2@gmail.com");
  await page.locator("#login_password").fill("nmbooks4801");
  await page.locator("input#keep_login").check();
  await page.getByRole("button", { name: "登入" }).click();
});
