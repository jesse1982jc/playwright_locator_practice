import { test, Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:4200/");
});

async function navigateTo(page: Page, menu: string, subMenu: string) {
  if (menu == "Charts") {
    await page.getByText(menu).first().click();
    await page.getByText(subMenu).click();
  } else {
    await page.getByText(menu).click();
    await page.getByText(subMenu).click();
  }
}

// 執行程式
test("navigate to", async ({ page }) => {
  await navigateTo(page, "Forms", "Form Layouts");
  await navigateTo(page, "Forms", "Datepicker");

  await navigateTo(page, "Modal & Overlays", "Dialog");
  await navigateTo(page, "Modal & Overlays", "Window");
  await navigateTo(page, "Modal & Overlays", "Popover");
  await navigateTo(page, "Modal & Overlays", "Toastr");
  await navigateTo(page, "Modal & Overlays", "Tooltip");

  await navigateTo(page, "Extra Components", "Calendar");

  await navigateTo(page, "Charts", "Echarts");

  await navigateTo(page, "Tables & Data", "Smart Table");
  await navigateTo(page, "Tables & Data", "Tree Grid");
});
