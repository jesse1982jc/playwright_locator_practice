import { test, expect } from "@playwright/test";

test("drag and drop with iframe", async ({ page }) => {
  // 導航到該測試 iframe 頁面
  await page.goto("https://www.globalsqa.com/demo-site/draganddrop/");
  // 先建立 frameLocator，從 frame 元素找起
  const frame = page.frameLocator('[rel-title="Photo Manager"] iframe');
  // 1. 從 frame 裡面找要拖曳的元素，拖曳到哪去?
  await frame
    .locator("li h5", { hasText: "High Tatras 2" })
    .dragTo(frame.locator("#trash"));

  // 2. 模擬滑鼠拖曳、放開
  // more precise control
  await frame.locator("li h5").getByText("High Tatras 4").hover();
  await page.mouse.down();
  await frame.locator("#trash").hover();
  await page.mouse.up();

  // 斷言
  await expect(frame.locator("#trash li h5")).toHaveText([
    "High Tatras 2",
    "High Tatras 4",
  ]);
});

test("drag and drop with iframe 2", async ({ page }) => {
  await page.goto("https://www.globalsqa.com/demo-site/draganddrop/");
  // 找出 iframe 定位器
  const frame = page.frameLocator('[rel-title="Photo Manager"] iframe');

  // 讓 frame 去做事
  // 1. 使用 drag to 方法
  await frame
    .locator("li h5", { hasText: "High Tatras 2" })
    .dragTo(frame.locator("#trash"));

  // 2. 模擬滑鼠行為
  await frame.locator("li h5", { hasText: "High Tatras 4" }).hover();
  await page.mouse.down();
  await frame.locator("#trash").hover();
  await page.mouse.up();

  // 斷言
  await expect(frame.locator("#trash li h5")).toHaveText([
    "High Tatras 2",
    "High Tatras 4",
  ]);
});
