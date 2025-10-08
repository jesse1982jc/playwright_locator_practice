import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("https://www.taitiansenyi.com/?lang=zh-TW");

  await expect(page.locator(".jbbqpH")).toBeVisible();
  await page.getByText("我知道了").click();

  await page.waitForTimeout(1000);

  // await expect(page.locator(".hmOiLo .gaTcAE .eTvER")).toBeVisible();

  // await page.waitForTimeout(1000);

  // await page.locator(".hmOiLo .gaTcAE .eTvER").click({ force: true });

  await page
    .locator(".sc-lnAgIa gaTcAE .sc-iKGpAt eTvER .sc-gjTGSA eSguy")
    .click();

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

  await page
    .locator(".ChangeInputTypeIcon-sc-1sf4tct", { hasText: "顯示" })
    .dblclick();

  await page.waitForTimeout(1000);

  await page
    .locator(".ChangeInputTypeIcon-sc-1sf4tct", { hasText: "顯示" })
    .click();

  await page.waitForTimeout(2000);

  await page.getByRole("button", { name: "登入" }).click();

  await page.waitForTimeout(2000);
});

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

  await page
    .locator(".ChangeInputTypeIcon-sc-1sf4tct", { hasText: "顯示" })
    .dblclick();

  await page.waitForTimeout(1000);

  await page
    .locator(".ChangeInputTypeIcon-sc-1sf4tct", { hasText: "顯示" })
    .click();

  await page.waitForTimeout(2000);

  await page.getByRole("button", { name: "登入" }).click();

  await page.waitForTimeout(2000);

  //   await page.locator(".recaptcha-checkbox-border").check();
});

test("add to cart", async ({ page }) => {
  await page.getByText("商品分類").click();
  await page.getByText("全站商品").click();

  // 找到指定商品，先確定該商品元素在畫面上看得見
  await expect(
    page.locator(
      'img[alt="【官網生日慶】太田森一抗唐盾EX素食膠囊增量版x6盒(150顆/盒)"]'
    )
  ).toBeVisible();
  await expect(
    page.locator(
      'img[alt="【官網生日慶】太田森一抗唐盾EX素食膠囊增量版x6盒(150顆/盒)"]'
    )
  ).toBeEnabled();
  // await page
  //   .locator(
  //     'img[alt="【官網生日慶】太田森一抗唐盾EX素食膠囊增量版x6盒(150顆/盒)"]'
  //   )
  //   .waitFor({ state: "visible" });
  // 點擊指定的商品
  await page
    .locator(
      'img[alt="【官網生日慶】太田森一抗唐盾EX素食膠囊增量版x6盒(150顆/盒)"]'
    )
    .click();

  // 加入收藏
  await expect(page.locator("a.fav-btn")).toBeVisible();
  await expect(page.locator("a.fav-btn")).toBeEnabled();
  // await page.locator("a.fav-btn").waitFor({ state: "visible" });

  await page.locator("a.fav-btn").click({ force: true });

  // 確認「加入購物車」按鈕在畫面上
  await expect(
    page.locator('button[data-qe-id="body-add-to-cart-btn"]')
  ).toBeVisible();
  await expect(
    page.locator('button[data-qe-id="body-add-to-cart-btn"]')
  ).toBeEnabled();
  // await page
  //   .locator('button[data-qe-id="body-add-to-cart-btn"]')
  //   .waitFor({ state: "visible" });
  // 點擊「加入購物車」按鈕
  await page
    .locator('button[data-qe-id="body-add-to-cart-btn"]')
    .click({ force: true });

  //確認小彈窗 "點擊商品數量"的 + 按鈕已顯示出來
  await expect(
    page.locator('[data-qe-id="modal-add-icon"].increase-btn-normal')
  ).toBeVisible();
  await expect(
    page.locator('[data-qe-id="modal-add-icon"].increase-btn-normal')
  ).toBeEnabled();
  // await page
  //   .locator('[data-qe-id="modal-add-icon"].increase-btn-normal')
  //   .waitFor({ state: "visible" });

  // 點擊小彈窗 + 兩下，使數量變 3
  await page
    .locator('[data-qe-id="modal-add-icon"].increase-btn-normal')
    .dblclick({ force: true });

  // 確認小彈窗的「加入購物車」按鈕已看得見
  await expect(page.locator("button.add-to-cart-btn-single")).toBeVisible();
  await expect(page.locator("button.add-to-cart-btn-single")).toBeEnabled();
  // await page
  //   .locator("button.add-to-cart-btn-single")
  //   .waitFor({ state: "visible" });
  // 點擊小彈窗「加入購物車」按鈕
  await page.locator("button.add-to-cart-btn-single").click({ force: true });
});
