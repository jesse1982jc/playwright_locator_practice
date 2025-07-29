import { test, expect } from "@playwright/test";
import { timeout } from "rxjs-compat/operator/timeout";

test.beforeEach(async ({ page }, testInfo) => {
  await page.goto("http://uitestingplayground.com/ajax");
  await page
    .getByRole("button", { name: "Button Triggering AJAX Request" })
    .click();
  testInfo.setTimeout(testInfo.timeout + 2000);
});

test("auto waiting", async ({ page }) => {
  const successButton = page.locator(".bg-success");

  // await successButton.click();

  // const text = await successButton.textContent();
  // await successButton.waitFor({ state: "attached" });
  // const allText = await successButton.allTextContents();

  // expect(allText).toContain("Data loaded with AJAX get request.");

  await expect(successButton).toHaveText("Data loaded with AJAX get request.", {
    timeout: 20000,
  });
});

test("alternative waits", async ({ page }) => {
  const successButton = page.locator(".bg-success");
  // __ wait for element
  // await page.waitForSelector(".bg-success");

  // __ wait for particlular response
  // await page.waitForResponse("http://uitestingplayground.com/ajaxdata");

  // __ wait for network calls to be completed ('NOT RECOMMENDED')
  await page.waitForLoadState("networkidle");

  const allText = await successButton.allTextContents();

  expect(allText).toContain("Data loaded with AJAX get request.");
});

test("timeouts", async ({ page }) => {
  // test.setTimeout(10000);
  test.slow();

  const successButton = page.locator(".bg-success");

  await successButton.click();
});
