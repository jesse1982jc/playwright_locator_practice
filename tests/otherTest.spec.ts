import { test, expect } from "@playwright/test";

test("select option", async ({ page }) => {
  await page.goto("https://practice.sdetunicorns.com/shop/");
  await page.waitForTimeout(500);

  //select option 練習
  const select = page.locator("select.orderby");
  // 選某個值
  await select.selectOption("date");
  // await select.selectOption({ label: "Sort by popularity" });

  await page
    .getByLabel("Add to cart: “Zurich Watch”")
    .getByText("Add to cart")
    .click();
  await page.waitForTimeout(500);
  await page
    .getByLabel("Add to cart: “Converse”")
    .getByText("Add to cart")
    .click();
  await page.waitForTimeout(500);
  await page
    .getByLabel("Add to cart: “Canon Antique Camera”")
    .getByText("Add to cart")
    .click();

  await page.waitForTimeout(1000);

  // view cart
  await page
    .locator('.post-374 [class="added_to_cart wc-forward"]', {
      hasText: "View cart",
    })
    .click({ force: true });

  await page.waitForTimeout(1000);

  // await page.waitForSelector("span");

  await expect(
    page.locator(".zak-header-action .cart-page-link .count").first()
  ).toHaveText("3");
});

test("register account", async ({ page }) => {
  await page.goto("https://practice.sdetunicorns.com/my-account/");
  await page.locator("#reg_username").fill("Ray");
  await page.locator("#reg_email").fill("jcjcjhuhu2@gmail.com");
  await page.locator("#reg_password").fill("abcd1234");
  await page.getByRole("button", { name: "Register" }).click();
  await page.locator("#menu-item-489").click();
});

test("login account", async ({ page }) => {
  await page.goto("https://practice.sdetunicorns.com/my-account/");
  await page.locator("#username").fill("jcjchuhu2@gmail.com");
  await page.locator("#password").fill("abcd1234");
  await page.getByRole("checkbox", { name: "Remember me" }).check();
  await page.getByRole("button", { name: "Log in" }).click();
  await page.locator("#menu-item-489").click();
});
