import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("https://testautomationpractice.blogspot.com/");
});

test("Pagination Web Table", async ({ page }) => {
  const pageTable = page.locator("#HTML8");
  const checkRowLatop = page
    .locator("#productTable tbody tr", { hasText: "Laptop" })
    .locator("td")
    .last()
    .locator("input");
  await checkRowLatop.check();

  const checkSmartwatch = page
    .locator("#productTable tbody tr", { hasText: "Smartwatch" })
    .locator("td")
    .last()
    .locator("input");
  await checkSmartwatch.check();

  // 選第3頁
  await page.locator("ul#pagination li", { hasText: "3" }).click();
  const checkRouter = page
    .locator("#productTable tbody tr", { hasText: "Router" })
    .locator("td")
    .last()
    .locator("input");
  await checkRouter.check();
});

test("select", async ({ page }) => {
  await page.locator("#country").selectOption("australia");
  await page.locator("#colors").selectOption(["blue", "white", "yellow"]);
  await page.locator("#animals").selectOption(["cat", "dog", "lion", "zebra"]);
});

test("textarea", async ({ page }) => {
  await page
    .getByRole("textbox", { name: "Address:" })
    .fill("Taiwan, New Taiper City");

  await page.getByRole("textbox", { name: "Enter Phone" }).fill("0912345678");

  await page
    .getByRole("textbox", { name: "Enter EMail" })
    .fill("test@test.com");

  await page.getByPlaceholder("Enter Name").fill("Ray Hao");
});

test("radio", async ({ page }) => {
  await page.getByRole("radio", { name: "Female" }).check();
  await page.locator(".form-check #male").check();
});

test("checkbox", async ({ page }) => {
  await page.getByRole("checkbox", { name: "Wednesday" }).check();

  await page
    .locator(".form-group .form-check .form-check-input#thursday")
    .check();
  await page.getByRole("checkbox", { name: "Friday" }).check();
  await page
    .locator('.form-group .form-check .form-check-input[value="tuesday"]')
    .check();
});

test("dattepicker", async ({ page }) => {
  await page.locator("#datepicker").click();
  await page
    .locator("table.ui-datepicker-calendar tbody tr")
    .nth(2)
    .locator("td", { hasText: "13" })
    .click();

  //   await page.locator("div.date-picker-box #start-date").click();
  //   await page.locator("div.date-picker-box #end-date").click();
  await page.locator("#comboBox").click();
  await page
    .locator("#dropdown .option")
    .getByText("Item 18", { exact: true })
    .click();
});

test("label", async ({ page }) => {
  await page.locator("#laptops #apple").click();
});
