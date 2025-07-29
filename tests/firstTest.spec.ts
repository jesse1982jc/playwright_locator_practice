import { test, expect } from "@playwright/test";
import { filter } from "rxjs-compat/operator/filter";

// test hooks
test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:4200");
  await page.getByText("Forms").click();
  await page.getByText("Form Layouts").click();
});

test("Locator syntax rules", async ({ page }) => {
  // by Tag name
  await page.locator("input").first().click();

  // by ID
  page.locator("#inputEmail1");

  // by Class value
  page.locator(".shape-rectangle");

  // by Attribute
  page.locator('[placeholder="Email"]');

  // by Class value (full)
  page.locator(
    "[input-full-width size-medium status-basic shape-rectangle nb-transition]"
  );

  // combine different selectors (中間不要有空白)
  page.locator('input[placeholder="Email"].shape-rectangle[nbinput]');

  // by XPath (NOT RECOMMENDED)
  page.locator('//*[id="inputEmail1"]');

  // by partial text match
  page.locator(':text("Using")');

  // by exact text match
  page.locator(':text-is("Using the Grid")');
});

// 使用者面向的定位器
test("Using facing locators", async ({ page }) => {
  await page.getByRole("textbox", { name: "Email" }).nth(1).click();
  await page.getByRole("button", { name: "Sign in" }).first().click();

  await page.getByLabel("Password").first().click();

  await page.getByPlaceholder("Jane Doe").click();

  await page.getByText("Basic form").click();

  await page.getByTestId("SignIn").click();

  await page.getByTitle("IoT Dashboard").click();
});

test("locating child elements", async ({ page }) => {
  await page.locator('nb-card nb-radio :text-is("Option 1")').check();
  // 用 chain 方法
  await page
    .locator("nb-card")
    .locator("nb-radio")
    .getByText("Option 2")
    .click();

  // await page
  //   .locator("nb-card")
  //   .locator("nb-radio")
  //   .locator(':text-is("Option 1")')
  //   .click();

  // await page
  //   .locator("nb-card")
  //   .nth(5)
  //   .getByRole("button", { name: "Sign in" })
  //   .click();

  // nth() 的 index 從 0 開始
  await page.locator("nb-card").nth(3).getByRole("button").click();

  await page
    .locator('nb-card nb-radio label input[type="radio"]')
    .first()
    .check({ force: true });

  await page.locator('nb-card nb-radio :text-is("Option 2")').check();
});

test("locating parent elements", async ({ page }) => {
  await page
    .locator("nb-card", { hasText: "Using the Grid" })
    .getByPlaceholder("Email")
    .click();

  await page
    .locator("nb-card", {
      has: page.locator('nb-card-header:text-is("Using the Grid")'),
    })
    .getByPlaceholder("Password")
    .click();

  await page
    .locator("nb-card")
    .filter({ hasText: "Basic form" })
    .getByPlaceholder("Email")
    .click();

  await page
    .locator("nb-card")
    .filter({ has: page.locator('[status="danger"]') })
    .getByPlaceholder("Password")
    .click();

  await page
    .locator("nb-card")
    .filter({ has: page.locator("nb-checkbox", { hasText: "Remember me" }) })
    .filter({ has: page.locator('[status="warning"]') })
    .getByPlaceholder("Email")
    .click();

  await page
    .locator(':text-is("Using the Grid")')
    .locator("xpath=..")
    .getByPlaceholder("Email")
    .click();
});

test("Reusing the locators", async ({ page }) => {
  const basicForm = page.locator("nb-card").filter({ hasText: "Basic form" });
  const emailField = basicForm.getByRole("textbox", { name: "Email" });
  const passwordField = basicForm.getByRole("textbox", { name: "Password" });

  await emailField.fill("test@test.com");

  await passwordField.fill("Welcome123");

  await basicForm
    .locator('nb-checkbox input[type="checkbox"]')
    .check({ force: true });

  await basicForm.getByRole("button", { name: "Submit" }).click();

  await expect(emailField).toHaveValue("test@test.com");
  await expect(passwordField).toHaveValue("Welcome123");
});

test("extracting values", async ({ page }) => {
  // single test value
  const basicForm = page.locator("nb-card", { hasText: "Basic form" });
  const buttonText = await basicForm.getByRole("button").textContent();
  // 斷言
  expect(buttonText).toEqual("Submit");

  // all text values
  const allRadioButtonsLabels = await page
    .locator("nb-radio")
    .allTextContents();

  expect(allRadioButtonsLabels).toContain("Option 2");

  // input value
  const emailField = basicForm.getByRole("textbox", { name: "Email" });
  await emailField.fill("test@test.com");

  const emailValue = await emailField.inputValue();
  expect(emailValue).toEqual("test@test.com");

  const emailFieldPlaceholder = await emailField.getAttribute("placeholder");
  expect(emailFieldPlaceholder).toEqual("Email");
});

test("assertions", async ({ page }) => {
  // General assertions
  const value = 5;
  expect(value).toEqual(5);

  const basicForm = page.locator("nb-card").filter({ hasText: "Basic form" });
  const buttonText = await basicForm.getByRole("button").textContent();
  expect(buttonText).toEqual("Submit");

  // Locator assertion
  const basicFormButton = page
    .locator("nb-card")
    .filter({ hasText: "Basic form" })
    .locator("button");
  await expect(basicFormButton).toHaveText("Submit");
  await expect(basicFormButton).toHaveAttribute("status", "danger");
  await expect(basicForm).toContainText("Check me out");

  // Soft assertion (執行失敗會繼續往下測試，最後再告訴你錯的地方)
  // await expect.soft(basicFormButton).toHaveText("Submit5");
  // await basicFormButton.click();

  // Hard assertion (執行失敗不會繼續往下測試，下面的測試就不會繼續執行了)
  // await expect(basicFormButton).toHaveText("Submit5");
  // await basicFormButton.click();
});
