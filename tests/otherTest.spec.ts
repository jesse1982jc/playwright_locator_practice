import { test, expect } from "@playwright/test";

test("select option", async ({ page }) => {
  await page.goto("https://practice.sdetunicorns.com/shop/");
  await page.waitForTimeout(3000);

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

  // checkout page item assertion
  const cartItems = page.locator("form table tbody tr.cart_item");
  await expect(cartItems).toHaveCount(3);
  await expect(cartItems).toContainText([
    "Zurich Watch",
    "Converse",
    "Canon Antique Camera",
  ]);

  // 找出所有有 Item 的 row
  const allRows = page.locator("table tbody tr.cart_item");
  // console.log(allRows);

  let totalPrice = 0;
  let price = 0;

  // 用迴圈遍歷 row 的特定 column 單元格
  for (const row of await allRows.all()) {
    // 記得加 await 還有 all()
    // 找出 文字價格(含 $ 字號)
    const perRowPriceText = await row
      .locator("td.product-price span.woocommerce-Price-amount")
      .innerText(); // 因為 $ 跟 400 有斷行，$ 包在 span 裡面，所以用 innerText()

    // 把字串的數字的 $ 拿掉，並切頭尾空白，記得轉成數值
    const perRowPrice = parseInt(perRowPriceText.replace("$", "").trim());

    // 拿到數量，因為是屬性，用 getAttribute()，但也要轉成數字
    const perRowQuantity = parseInt(
      await row
        .locator('td.product-quantity input[type="number"]')
        .getAttribute("value")
    );
    console.log(perRowPrice);
    console.log(perRowQuantity);
    // 計算 單價 * 數量
    price = perRowPrice * perRowQuantity;

    // 計算總價(因為遍歷，要疊加)
    totalPrice += price;
  }

  console.log(totalPrice);

  // 右邊的粗體字 Total 數字
  const totalBoldText = await page
    .locator('tr.order-total td[data-title="Total"] .woocommerce-Price-amount')
    .innerText(); // 因為 $ 包在 span 裡面，下面斷行 400，所以要用 innerText()

  //把 $ 去，再去頭尾，再轉數字
  const totalBold = parseInt(totalBoldText.replace("$", "").trim());

  // 斷言
  expect(totalPrice).toEqual(totalBold);
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
