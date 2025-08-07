import { test, expect } from "@playwright/test";

test("select option", async ({ page }) => {
  await page.goto("https://practice.sdetunicorns.com/shop/");

  //select option 練習
  const select = page.locator("select.orderby");
  // 選某個值
  await select.selectOption("date");
  // await select.selectOption({ label: "Sort by popularity" });
});
