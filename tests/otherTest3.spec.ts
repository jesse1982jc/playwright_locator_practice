import { test, expect } from "@playwright/test";

// test.beforeEach(async ({ page }) => {
//   await page.goto("https://www.taitiansenyi.com/?lang=zh-TW");
//   await page.locator(".headerA__nav-menu-sub .sub-nav-li").nth(1).hover();
//   await page
//     .locator(
//       ".nav-my-account .nav-my-account-ul .nav-my-account-li .nav-my-account-link",
//       { hasText: "會員登入/註冊" }
//     )
//     .click();
// });

test("login", async ({ page }) => {
  await page.goto("https://www.taitiansenyi.com/?lang=zh-TW");

  await expect(page.locator(".jbbqpH")).toBeVisible();
  await page.getByText("我知道了").click();

  await page.waitForTimeout(1000);

  await expect(page.locator(".hmOiLo .gaTcAE .eTvER")).toBeVisible();

  await page.waitForTimeout(1000);

  await page.locator(".hmOiLo .gaTcAE .eTvER").click({ force: true });

  await page.waitForTimeout(1000);

  await page.locator(".headerA__nav-menu-sub .sub-nav-li").nth(1).hover();
  await page
    .locator(
      ".nav-my-account .nav-my-account-ul .nav-my-account-li .nav-my-account-link",
      { hasText: "會員登入/註冊" }
    )
    .click();

  await page.waitForTimeout(1000);

  await page
    .getByPlaceholder("輸入手機號碼")
    .pressSequentially("972356167", { delay: 300 });

  await page.waitForTimeout(2000);

  await page.getByRole("button", { name: "登入/註冊" }).click();

  await page.waitForTimeout(2000);

  await page
    .getByPlaceholder("請輸入密碼")
    .pressSequentially("nmbooks4801", { delay: 300 });

  await page.waitForTimeout(2000);

  await page.getByRole("button", { name: "登入" }).click();

  await page.waitForTimeout(2000);

  //   await page.locator(".recaptcha-checkbox-border").check();
});
