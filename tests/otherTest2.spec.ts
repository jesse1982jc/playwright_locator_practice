import { test, expect } from "@playwright/test";
import { timeout } from "rxjs-compat/operator/timeout";

test.beforeEach(async ({ page }) => {
  await page.goto("https://www.myanlife.com.mm/", { timeout: 10000 });
  const languageBtn = page.locator("header .lang_select").first();

  // 選語系 繁中
  await languageBtn.click();
  await page
    .locator(".lang_list .lang_list_item", { hasText: "繁體中文" })
    .first()
    .click();

  const loginRegisterBtn = page.locator("header .login_btn").first();
  await loginRegisterBtn.click();

  // await page.waitForSelector(".two-part-flexrow-style");
  await page.waitForTimeout(1000);

  await expect(page.locator(".two-part-flexrow-style").first()).toBeVisible();

  const emailLogin = page.locator('.login-form-area [data-logintype="email"]', {
    hasText: "信箱",
  });
  await emailLogin.click();

  await page.locator("#login_email").fill("jcjchuhu2@gmail.com");
  await page.locator("#login_password").fill("nmbooks4801");
  await page.locator("input#keep_login").check();
  await page.getByRole("button", { name: "登入" }).click();
});

test("login caca taxi", async ({ page }) => {
  await page.goto("https://www.cacataxi.com/", { timeout: 10000 });

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

  await page.getByPlaceholder("手機號碼").fill("972356167");
  await page.getByRole("button", { name: "下一步" }).click();
});

test("login in myan life", async ({ page }) => {
  await page.goto("https://www.myanlife.com.mm/", { timeout: 10000 });
  const languageBtn = page.locator("header .lang_select").first();

  // 選語系 繁中
  await languageBtn.click();
  await page
    .locator(".lang_list .lang_list_item", { hasText: "繁體中文" })
    .first()
    .click();

  const loginRegisterBtn = page.locator("header .login_btn").first();
  await loginRegisterBtn.click();

  // await page.waitForSelector(".two-part-flexrow-style");
  await page.waitForTimeout(1000);

  await expect(page.locator(".two-part-flexrow-style").first()).toBeVisible();

  const emailLogin = page.locator('.login-form-area [data-logintype="email"]', {
    hasText: "信箱",
  });
  await emailLogin.click();

  await page.locator("#login_email").fill("jcjchuhu2@gmail.com");
  await page.locator("#login_password").fill("nmbooks4801");
  await page.locator("input#keep_login").check();
  await page.getByRole("button", { name: "登入" }).click();
});

test("myan life add to cart and checkout", async ({ page }) => {
  await page.waitForTimeout(2000);

  await page
    .locator(
      "#myanLife_sales .items .owl-stage-outer .owl-stage .owl-item .item"
    )
    .nth(3)
    .click({ force: true });

  await page.waitForTimeout(1000);

  await expect(page.locator(".prod_overview")).toBeVisible();

  await page.locator(".purchase_option_btn").click();

  await page.waitForTimeout(1000);

  //增加數量
  await page.locator(".qty button.qty_add_btn").first().click();
  await page.locator(".qty button.qty_add_btn").nth(1).dblclick();

  //加入購物車
  await page.locator("button.add_to_cart_btn").click();

  await expect(page.locator(".windows_content .confirm").nth(2)).toBeVisible();
  await expect(page.locator(".windows_content .refuse").nth(2)).toBeVisible();

  await page.waitForTimeout(1000);

  //去購物車
  await page.locator(".btn_group .confirm", { hasText: "去購物車" }).click();

  await page.waitForTimeout(1000);

  // 勾選購物車選項
  await page.locator(".product_option .label--checkbox").last().check();

  // await expect(page.getByRole("button", { name: "前往結帳" })).toBeEnabled();

  // 前往結帳
  await page.getByRole("button", { name: "前往結帳" }).click({ force: true });

  // 返回購物
  // await page.locator(".btn_group .refuse", { hasText: "返回購物" }).click();

  // -------------------------------------------------------
  // 直接購買
  // await page
  //   .locator("button.buy_now_btn", { hasText: "直接購買" })
  //   .nth(1)
  //   .click();
});

test("add the tickets", async ({ page }) => {
  // 找到免費的 酷碰券，點一下進該卷的商品頁
  await page
    .locator("header h2.notranslate", {
      hasText:
        "Hi Spicy Hotpot ( 29% Discount For 3 Person Set & 2 Person Set)",
    })
    .click();

  // 等待 "加入票夾" 大按鈕出現
  await page.waitForSelector(".download_bar .coupon_download", {
    state: "visible",
  });

  // 點擊 加入票夾 (大按鈕)
  await page.locator(".download_bar .coupon_download").click();

  // 等待小彈窗出現
  // await page.waitForSelector(".coupon_content", { state: "visible" });

  await page.waitForTimeout(2000);

  console.log(await page.locator(".coupon_content").count());
  console.log(await page.locator("a#download_btn_id").count());
  console.log(await page.locator("#canvas").count());

  // const popupWindow = page.locator(".coupon_content");
  // await popupWindow.evaluate((el) => el.setAttribute("aria-hidden", "false"));

  // await expect(page.locator(".coupon_content")).toBeVisible();

  // 等待小彈窗的"加入票夾"的按鈕出現
  // await page.waitForSelector("a#download_btn_id", {
  //   state: "visible",
  // });

  // 小彈窗 點擊 加入票夾
  // await page
  //   .locator("a#download_btn_id", { hasText: "加入票夾" })
  //   .click({ force: true });

  // await page.locator("a#download_btn_id").evaluate((el) => el.click());

  // 小彈窗 點擊 加入票夾
  const addTicketBtn = page.locator("a#download_btn_id");
  if (await addTicketBtn.isVisible()) {
    await addTicketBtn.click();
  } else {
    await addTicketBtn.evaluate((el) => {
      el.dispatchEvent(new Event("click", { bubbles: true }));
    });
  }

  // await page.locator("a#download_btn_id").evaluate((el) => {
  //   el.dispatchEvent(new Event("click", { bubbles: true }));
  // });
});

test("add to ticker2", async ({ page }) => {
  await page.waitForTimeout(1000);

  // 點擊左側的 < 箭頭
  await page.locator(".owl-nav .owl-prev").nth(3).click();

  await page.waitForTimeout(1000);

  // 等待要加入票夾的商品券顯示完全
  await page.waitForSelector(
    '.coupon_download[data-title="Aurica Aesthetic Center"]',
    { state: "visible" }
  );

  // 點擊該商品進入商品詳細頁
  await page
    .locator("header h2", { hasText: "Aurica Aesthetic Center" })
    .click();

  // await page.locator(".download_bar .coupon_download").click({ timeout: 2000 });

  // await page.waitForSelector(".coupon_content", { state: "visible" });

  // 加入票夾 大按鈕
  const addTicketLargeBtn = page.locator("a.coupon_download");
  // 確定 加入票夾 大按鈕 是否顯示在畫面上
  await addTicketLargeBtn.isVisible();
  // 讓該元素顯示在畫面上
  await addTicketLargeBtn.scrollIntoViewIfNeeded();
  // 點擊「加入票夾」大按鈕
  await addTicketLargeBtn.click();

  // 確認小彈窗全部 是否顯示在畫面上
  await page.locator(".coupon_content").isVisible();

  // 確認小彈窗上面的「加入票夾」小按鈕是否在畫面上
  await page.locator("a#download_btn_id").isVisible();

  // await page.locator("a#download_btn_id").click();

  // 點擊 加入票夾小按鈕
  await page
    .locator("a#download_btn_id")
    .evaluate((el: HTMLElement) => el.click());

  // await page.waitForSelector("a#download_btn_id", { state: "visible" });
});
