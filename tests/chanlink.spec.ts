import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("https://v4.chanlink.co/login");
  // await expect(page.locator("h3")).toBeVisible();
  await expect(page.locator("form#login-form")).toBeVisible();
  await expect(page.locator('[src="/logo_white.png"]').first()).toBeVisible();

  await page.waitForTimeout(1000);

  await page.getByPlaceholder("請輸入帳號").fill("admin");
  await page.getByPlaceholder("請輸入密碼").fill("12345678");
  await page.getByRole("button", { name: "登入" }).click();

  await expect(
    page.locator('img[src="/logo_white.png"]').first()
  ).toBeVisible();
});

test.skip("login", async ({ page }) => {
  await page.goto("https://v4.chanlink.co/login");
  // await expect(page.locator("h3")).toBeVisible();
  await expect(page.locator("form#login-form")).toBeVisible();
  await expect(page.locator('[src="/logo_white.png"]').first()).toBeVisible();

  await page.waitForTimeout(1000);

  await page.getByPlaceholder("請輸入帳號").fill("admin");
  await page.getByPlaceholder("請輸入密碼").fill("12345678");
  await page.getByRole("button", { name: "登入" }).click();
});

test("navigation page", async ({ page }) => {
  const buttons = ["監控中心", "戰情中心", "系統設定", "維修中心"];

  // 用 for of 遍歷
  for (const button of buttons) {
    await page.getByRole("button", { name: button }).click();

    const leftButton = await page
      .locator("ul.ant-menu-root li.ant-menu-submenu .ant-menu-title-content")
      .first()
      .textContent();
    if (!leftButton.includes("基本設定")) {
      await expect(
        page
          .locator(
            "ul.ant-menu-root li.ant-menu-submenu .ant-menu-title-content"
          )
          .first()
      ).toContainText(button);
    } else {
      await expect(
        page
          .locator(
            "ul.ant-menu-root li.ant-menu-submenu .ant-menu-title-content"
          )
          .first()
      ).toContainText("基本設定");
    }

    await page.goBack();
  }
});
