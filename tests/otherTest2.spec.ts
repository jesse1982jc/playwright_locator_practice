import { test, expect } from "@playwright/test";

test("login", async ({ page }) => {
  await page.goto("https://www.cacataxi.com/");

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
});
