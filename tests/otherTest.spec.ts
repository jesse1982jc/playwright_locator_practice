import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  await page.goto("https://practice.sdetunicorns.com/");
  await expect(page.locator("img.custom-logo")).toBeVisible();

  // 登入
  // await page.goto("https://practice.sdetunicorns.com/my-account/");
  // await page.locator("#username").fill("jcjchuhu2@gmail.com");
  // await page.locator("#password").fill("abcd1234");
  // await page.getByRole("checkbox", { name: "Remember me" }).check();
  // await page.getByRole("button", { name: "Log in" }).click();
  // await page.locator("#menu-item-489").click();
});
test("select option", async ({ page }) => {
  // await page.goto("https://practice.sdetunicorns.com/shop/");
  await page.locator("nav ul li#menu-item-567", { hasText: "Shop" }).click();

  // 等待元素出現
  // await page.locator("select.orderby").waitFor({ state: "visible" });
  await expect(page.locator("select.orderby")).toBeVisible();

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

  // checkout page item count assertion
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
  let runCount1 = 0;

  // 用迴圈遍歷 row 的特定 column 單元格
  for (const row of await allRows.all()) {
    // 記得加 await 還有 all()
    // 找出 文字價格(含 $ 字號)
    const perRowPriceText = await row
      .locator("td.product-price span.woocommerce-Price-amount")
      .innerText(); // 因為 $ 跟 400 有斷行，$ 包在 span 裡面，所以用 innerText()

    // 把字串的數字的 $ 拿掉，並切頭尾空白，記得轉成數值
    const perRowPrice = parseFloat(perRowPriceText.replace("$", "").trim());

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

    runCount1++;
    console.log(`執行次數: ${runCount1}`);
  }

  console.log(totalPrice);

  // 右邊的粗體字 Total 數字
  const totalBoldText = await page
    .locator('tr.order-total td[data-title="Total"] .woocommerce-Price-amount')
    .innerText(); // 因為 $ 包在 span 裡面，下面斷行 400，所以要用 innerText()

  //把 $ 去，再去頭尾，再轉數字
  const totalBold = parseFloat(totalBoldText.replace("$", "").trim());

  // 斷言
  expect(totalPrice).toEqual(totalBold);

  // 刪除一個購物清單的選項
  const removeItem = await page
    .locator('td.product-remove [aria-label="Remove Converse from cart"]')
    .click();

  //斷言剩下幾個 Item
  await expect(
    page.locator('[class="woocommerce-cart-form__cart-item cart_item"]')
  ).toHaveCount(2);

  // 商品數量點多件，再按 Cart update， 使總金額 更新
  let updatePrice = 0;
  let updateTotalPrice = 0;
  let runCount = 0;

  console.log(allRows);

  for (const row of await allRows.all()) {
    // 先把 item 數量加 1
    await row
      .locator('td[data-title="Quantity"] button.zak-qty-plus')
      .dblclick();

    await page.waitForTimeout(500);

    //單價
    const perPriceText = await row.locator("td.product-price").innerText();
    const perPrice = parseFloat(perPriceText.replace("$", "").trim());

    await page.waitForTimeout(500);

    // 數量
    const quantityText = await row
      .locator('td.product-quantity input[type="number"]')
      .getAttribute("value");
    const quantity = parseInt(quantityText);
    console.log(quantity);

    await page.waitForTimeout(500);

    // 單個商品金額 = 單價*數量
    updatePrice = perPrice * quantity;
    // 所有商品總金額
    updateTotalPrice += updatePrice;

    runCount++;

    console.log(updatePrice);
    console.log(updateTotalPrice);
    console.log(`執行幾次: ${runCount}`);
  }

  // 點擊 update cart 更新 subtotal
  await page.locator('td button[name="update_cart"]').click({ force: true });

  const totalBoldPriceUpdateText = await page
    .locator('table tbody td[data-title="Total"]')
    .innerText();
  const totalBoldPriceUpdate = parseFloat(
    totalBoldPriceUpdateText.replace("$", "").trim()
  );
  expect(updateTotalPrice).toEqual(totalBoldPriceUpdate);
});

test("register account", async ({ page }) => {
  await page.goto("https://practice.sdetunicorns.com/my-account/");
  // 等待元素出現
  await expect(page.locator("form.register")).toBeVisible();

  await page.locator("#reg_username").fill("Ray");
  await page.locator("#reg_email").fill("jcjcjhuhu2@gmail.com");
  await page.locator("#reg_password").fill("abcd1234");
  await page.getByRole("button", { name: "Register" }).click();
  await page.locator("#menu-item-489").click();
});

test("login account", async ({ page }) => {
  await page.goto("https://practice.sdetunicorns.com/my-account/");
  // 等待元素出現
  await expect(page.locator("form.login")).toBeVisible();

  await page.locator("#username").fill("jcjchuhu2@gmail.com");
  await page.locator("#password").fill("abcd1234");
  await page.getByRole("checkbox", { name: "Remember me" }).check();
  await page.getByRole("button", { name: "Log in" }).click();
  await page.locator("#menu-item-489").click();
});

test("blog test", async ({ page }) => {
  await page.locator("#zak-primary-nav li", { hasText: "Blog" }).click();

  await expect(page.locator("h1.zak-page-title")).toBeVisible();

  await page
    .locator("#recent-posts-3 ul li", {
      hasText: "Let’s Building Your Business from Scratch",
    })
    .click();
  await expect(page.locator("h1.zak-page-title")).toHaveText(
    "Let’s Building Your Business from Scratch"
  );

  await page.locator(".post-navigation .nav-next").click();

  await expect(
    page.locator(".zak-page-header__title h1.zak-page-title")
  ).toHaveText("Successful Marketing Ads for Your Business");
});

test("my account test", async ({ page }) => {
  await page
    .locator("#zak-primary-nav ul li", { hasText: "My account" })
    .click();

  await expect(
    page.locator(".zak-page-header__title .zak-page-title")
  ).toHaveText("My account");

  await page
    .locator(".woocommerce-MyAccount-navigation ul li", {
      hasText: "Addresses",
    })
    .click();

  await page.getByText("Edit Billing address").click();

  await page.locator("#billing_company").fill("ABC co.");
  await page.locator("select#billing_country").selectOption("TW");
  await page
    .getByPlaceholder("House number and street name")
    .fill("WenXin Rd. No. 186, 20 F");

  // await page
  //   .locator("input#billing_address_1")
  //   .fill("WenXin Rd. No. 186, 20 F");

  await page.locator("input#billing_city").fill("Taichung City");
  await page.locator("input#billing_state").fill("Nantun");
  // await page.locator("select#billing_state").selectOption("QC");
  await page.locator("input#billing_postcode").fill("11335");
  await page.locator("input#billing_phone").fill("0912345678");
  await page.getByRole("button", { name: "Save address" }).click();
});

test("contack page", async ({ page }) => {
  await page.locator("#zak-primary-nav ul li", { hasText: "Contact" }).click();

  // 填寫表單
  await page.locator("#evf-277-field_ys0GeZISRs-1").fill("testName");
  await page.locator("#evf-277-field_LbH5NxasXM-2").fill("test@test.com");
  await page
    .locator("#evf-277-field_66FR384cge-3")
    .pressSequentially("+886912345678", { delay: 200 });
  await page
    .locator("#evf-277-field_yhGx3FOwr2-4")
    .pressSequentially("this is a test message for playwright test.", {
      delay: 150,
    });

  await page.getByRole("button", { name: "Submit" }).click();

  await expect(page.locator(".everest-forms .everest-forms-notice")).toHaveText(
    "Thanks for contacting us! We will be in touch with you shortly"
  );
});
