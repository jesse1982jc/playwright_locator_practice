import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:4200/");
});

test.describe("Forms Layout Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.getByText("Forms").click();
    await page.getByText("Form Layouts").click();
  });

  test("Input Fields", async ({ page }) => {
    const usingTheGridEmailInput = page
      .locator("nb-card")
      .filter({ hasText: "Using the Grid" })
      .getByRole("textbox", { name: "Email" });

    await usingTheGridEmailInput.fill("test@test.com");
    await usingTheGridEmailInput.clear();
    await usingTheGridEmailInput.pressSequentially("test2@test.com", {
      delay: 100,
    });
    // await usingTheGridEmailInput.clear();
    // await usingTheGridEmailInput.fill("test3@test.com");

    // gernric assertion
    const emailInputValue = await usingTheGridEmailInput.inputValue();
    expect(emailInputValue).toEqual("test2@test.com");

    // locator assertion
    await expect(usingTheGridEmailInput).toHaveValue("test2@test.com");
  });

  test("Radio buttons", async ({ page }) => {
    const usingTheGridForm = page
      .locator("nb-card")
      .filter({ hasText: "Using the Grid" });

    // await usingTheGridForm.getByLabel("Option 1").check({ force: true });

    await usingTheGridForm
      .getByRole("radio", { name: "Option 1" })
      .check({ force: true });

    const op1checkStatus = await usingTheGridForm
      .getByRole("radio", { name: "Option 1" })
      .isChecked(); // 回傳 trure or false

    // gereric assertion
    expect(op1checkStatus).toBeTruthy();

    // locator assertion
    await expect(
      usingTheGridForm.getByRole("radio", { name: "Option 1" })
    ).toBeChecked();

    // 改選擇 Option 2
    await usingTheGridForm
      .getByRole("radio", { name: "Option 2" })
      .check({ force: true });

    expect(
      await usingTheGridForm
        .getByRole("radio", { name: "Option 1" })
        .isChecked()
    ).toBeFalsy();

    expect(
      await usingTheGridForm
        .getByRole("radio", { name: "Option 2" })
        .isChecked()
    ).toBeTruthy();

    await expect(
      usingTheGridForm.getByRole("radio", { name: "Option 1" })
    ).not.toBeChecked();

    await expect(
      usingTheGridForm.getByRole("radio", { name: "Option 2" })
    ).toBeChecked();
  });
});

test("checkboxes", async ({ page }) => {
  await page.getByText("Modal & Overlays").click();
  await page.getByText("Toastr").click();

  await page
    .getByRole("checkbox", { name: "Hide on click" })
    .uncheck({ force: true });

  await page
    .getByRole("checkbox", { name: "Prevent arising of duplicate toast" })
    .check({ force: true });

  // 對全部的checkbox 都打勾 OR 都不打勾
  const allCheckboxes = page.getByRole("checkbox");
  // 上面是定位器，不是陣列
  // for of 遍歷
  for (const box of await allCheckboxes.all()) {
    await box.uncheck({ force: true });
    // gernic assertion
    expect(await box.isChecked()).toBeFalsy();
    // locator assertion
    await expect(box).not.toBeChecked();
  }
});

test("lists and dropdowns", async ({ page }) => {
  const dropdownMenu = page.locator("ngx-header nb-select");
  await dropdownMenu.click();

  page.getByRole("list"); // when the list has a UL tag
  page.getByRole("listitem"); // when the list has a LI tag

  // const optionList = page.getByRole("list").locator("nb-option");
  const optionList = page.locator("nb-option-list nb-option");
  // 斷言所有顏色選項
  await expect(optionList).toHaveText(["Light", "Dark", "Cosmic", "Corporate"]); // 是一個陣列
  // 點擊 cosmic 顏色
  await optionList.filter({ hasText: "Cosmic" }).click();
  // 取色 cosmic 的背景紫色
  const header = page.locator("nb-layout-header");
  // 斷言是紫色
  await expect(header).toHaveCSS("background-color", "rgb(50, 50, 89)");

  // 先設定好 所以顏色所對應的 RGB號碼
  const colors = {
    Light: "rgb(255, 255, 255)",
    Dark: "rgb(34, 43, 69)",
    Cosmic: "rgb(50, 50, 89)",
    Corporate: "rgb(255, 255, 255)",
  };

  // 先打開 dropdownMenu
  await dropdownMenu.click();

  //用 for in 遍歷 (for...in 是針對物件， for...of 是針對陣列……)
  for (const color in colors) {
    await optionList.filter({ hasText: color }).click();
    await expect(header).toHaveCSS("background-color", colors[color]);
    // 記得，重要，再次打開 dropdownMenu
    if (color != "Corporate") {
      await dropdownMenu.click();
    }
  }
});

test("tooltips", async ({ page }) => {
  // tooltip 懸停時，游標移到 tooptip 裡， tooptip 隨即消失
  // Mac: 按 command + \(backslash) 進入凍結狀態
  // Windows: 按 F8 進入凍結狀態

  // 先導航到指定頁面
  await page.getByText("Modal & Overlays").click();
  await page.getByText("Tooltip").click();

  const tooltipPlacements = page.locator("nb-card", {
    hasText: "Tooltip Placements",
  });

  await tooltipPlacements.getByRole("button", { name: "Top" }).hover();

  // 正常的網頁元素在 role = "tooltip"，但本測試頁面沒有 role="tooltip"
  page.getByRole("tooltip"); // if you have a role tooltip created

  // 斷言
  const tooltip = await page
    .locator(".cdk-overlay-pane nb-tooltip")
    .textContent();
  expect(tooltip).toEqual("This is a tooltip");
});

test("dialog box", async ({ page }) => {
  // 導航到測試頁面
  await page.getByText("Tables & Data").click();
  await page.getByText("Smart Table").click();

  // 監聽 dialog 事件
  page.on("dialog", async (dialog) => {
    // 驗證 dialog 裡的文字是否正確?
    expect(dialog.message()).toBe("Are you sure you want to delete?");
    // 點擊"確定"，關閉 dialog
    await dialog.accept();
  });

  // 找出 trash 定位器
  const trash = page
    .getByRole("table")
    .locator("tbody tr", { hasText: "mdo@gmail.com" })
    .locator("td .nb-trash");
  // 點擊 trash icon
  await trash.click();
  await expect(page.locator("table tbody tr").first()).not.toHaveText(
    "mdo@gmail.com"
  );
});

test("web tables", async ({ page }) => {
  // 導航到測試頁面
  await page.getByText("Tables & Data").click();
  await page.getByText("Smart Table").click();

  // 1 get the row by any test in this row
  // 先找到要編輯的那一 row
  const targetRow = page.getByRole("row", { name: "twitter@outlook.com" });
  // 再從那一row 找到"編輯"按鈕，點一下
  await targetRow.locator(".nb-edit").click();

  // 編輯模式下的 HTML 結構不一樣，要重新抓取定位器
  // 清除年齡欄位的數字，再改填入 35
  await page.locator("tbody tr").getByPlaceholder("Age").clear();
  await page.locator("tbody tr").getByPlaceholder("Age").fill("35");

  // 點 V 結束編輯模式
  await page.locator("tr td .nb-checkmark").click();
  // 斷言年齡被改了
  await expect(targetRow.locator("td").last()).toHaveText("35");

  // 2 get the row based on the value in the specific column
  // 點擊第2頁
  await page
    .locator("ng2-smart-table-pager .ng2-smart-pagination-nav")
    .getByText("2")
    .click();

  // 找出單元格第二列有11的row
  const targetRowById = page
    .getByRole("row", { name: "11" }) // 剩 兩 row 的 td 有 "11"
    .filter({ has: page.locator("td").nth(1).getByText("11") }); //過濾保留 td 的第二列是"11"的 tr

  // 點編輯鍵進入編輯模式
  await targetRowById.locator(".nb-edit").click();
  // 編輯模式修改Email
  await page.locator("tbody tr").getByPlaceholder("E-mail").clear();
  await page
    .locator("tbody tr")
    .getByPlaceholder("E-mail")
    .fill("test@test.com");
  // 關閉編輯模式
  await page.locator(".nb-checkmark").click();
  // 斷言 E-mail 被改了
  await expect(targetRowById.locator("td").nth(5)).toHaveText("test@test.com");

  // 3 test filter of the table
  // 先準備測試年紀的資料
  const ages = ["20", "30", "40", "200"];

  // 找到 Age 輸入框，並輸入年紀
  // 使用 for...of 來遍歷
  for (const age of ages) {
    //清除年紀
    await page.locator("input-filter").getByPlaceholder("Age").clear();
    // 把陣列的值輸入該年紀框
    await page.locator("input-filter").getByPlaceholder("Age").fill(age);
    // 因為 playwright 跑太快，導致畫面來不及顯示，所以讓它time out 500毫秒
    await page.waitForTimeout(500);

    // 找出搜尋結果的所有 row 裡的最後一個 td(年紀欄位) 是否是我指定上面陣列的值
    const allRows = page.locator("tbody tr");
    // 遍歷整個 allRows，並找到每一row 的最後一個 td 的值
    for (const row of await allRows.all()) {
      // 遍歷每一 row 的 最後一個 td 的值
      const tdText = await row.locator("td").last().textContent();
      // 斷言
      // 如果年紀是 200，則顯示 No data found
      if (age === "200") {
        expect(await page.getByRole("table").textContent()).toContain(
          "No data found"
        );
      } else {
        expect(tdText).toEqual(age);
      }
    }
  }
});

test("web tables2", async ({ page }) => {
  await page.getByText("Tables & Data").click();
  await page.getByText("Smart Table").click();

  // 第一部分
  // 找目標列 tr
  const targetRow = page.getByRole("row", { name: "twitter@outlook.com" });
  // 按鉛筆進編輯模式
  await targetRow.locator(".nb-edit").click();
  // 編輯模式的DOM不一樣，要 重新定位
  // 清空年紀，填上新年紀
  await page.locator("input-editor").getByPlaceholder("Age").clear();
  await page.locator("input-editor").getByPlaceholder("Age").fill("35");
  // 點 V 結束編輯模式
  await page.locator(".nb-checkmark").click();
  // assertion
  await expect(targetRow.locator("td").last()).toHaveText("35");

  // 第二部分
  // 先點到第2頁
  await page
    .locator("ng2-smart-table-pager .ng2-smart-pagination-nav")
    .getByText("2")
    .click();
  // 找 ID = 11 的那一列 tr
  const targetRowById = page
    .getByRole("row", { name: "11" })
    .filter({ has: page.locator("td").nth(1).getByText("11") });
  // 點擊鉛筆進編輯模式
  await targetRowById.locator(".nb-edit").click();
  // 點擊 Email 欄位
  // 修改Ｅmail 為 test@test.com
  // 先 clear 再 fill
  await page.locator("input-editor").getByPlaceholder("E-mail").clear();
  await page
    .locator("input-editor")
    .getByPlaceholder("E-mail")
    .fill("test@test.com");
  // 點擊 V 關閉編輯模式
  await page.locator(".nb-checkmark").click();
  // assertion
  await expect(targetRowById.locator("td").nth(5)).toHaveText("test@test.com");

  // 第三部分
  // 在年紀的篩選框裡，輸入年紀，會篩選出同年紀的資料出來，驗證篩選的資料是不是都是同一年紀的
  // 先建立要篩選的年紀資料，陣列
  const ages = ["20", "30", "40", "200"];

  // 用陣列 for...of 去遍歷 ages
  for (const age of ages) {
    // 在年紀欄位輸入 age (遍歷)
    await page.locator("input-filter").getByPlaceholder("Age").clear(); // 先清除欄位資料
    await page.locator("input-filter").getByPlaceholder("Age").fill(age); // 輸入 age 資料
    // 讓畫面跑慢一點
    await page.waitForTimeout(500);

    // 資料結果顯示出來了
    // 去遍歷每一 ROW
    const allRows = page.locator("tbody tr"); // 排除 thead 的 tr，所以從 tbody 開始定位
    // 用 for...of 遍歷整個 rows，並找到 td 的最後一個儲存格資料
    for (const row of await allRows.all()) {
      // 假如 row 數量 = 0
      if (age === "200") {
        // 要顯示 No data found
        expect(await page.getByRole("table").textContent()).toContain(
          "No data found"
        );
      } else {
        //找出每一row 的 所有 td 的 最後一個 td
        const tdLastText = await row.locator("td").last().textContent();
        // 斷言 tdLastText = age
        expect(tdLastText).toEqual(age);
      }
    }
  }
});

test("datepicker", async ({ page }) => {
  // 先導航到測試頁
  await page.getByText("Forms").click();
  await page.getByText("Datepicker").click();

  // 抓取 Common Datepicker 的日期框
  const datepickerInputField = page.getByPlaceholder("Form Picker");
  await datepickerInputField.click();

  // 創建一個 Date物件及實例
  let date = new Date();

  //設定要從今天起 加 OR 減幾天?
  date.setDate(date.getDate() + 1000);
  // 新增預期的日、月(長、短)、年
  const expectedDate = date.getDate().toString(); // 取得剛剛設定的日期
  const expectedMonthShort = date.toLocaleString("en-US", { month: "short" });
  const expectedMonthLong = date.toLocaleString("en-US", { month: "long" });
  const expectedYear = date.getFullYear().toString();
  const expectedMonthDateYear = `${expectedMonthShort} ${expectedDate}, ${expectedYear}`;

  // 預期的 月年
  const expectedMonthAndYear = ` ${expectedMonthLong} ${expectedYear} `;

  // 抓取日曆左上角的月年文字
  let calendarMonthAndYear = await page
    .locator("nb-calendar-view-mode")
    .textContent();

  // 比較左上角日曆的月年跟預期的月年大小，如果預期的月年>左上角的月年，則點擊 >，反之點擊 <，直到兩者相等為止
  // 設一個 while 迴圈
  while (!expectedMonthAndYear.includes(calendarMonthAndYear)) {
    // 下面要比較日期大小，因為字串無法比日期大小，所以轉成日期格式
    let compareExpectedMonthAndYear = new Date(expectedMonthAndYear);
    let compareCalendarMonthAndYear = new Date(calendarMonthAndYear);
    // 條件式
    if (compareExpectedMonthAndYear > compareCalendarMonthAndYear) {
      // 點日曆的 >
      await page
        .locator('nb-calendar-pageable-navigation [data-name="chevron-right"]')
        .click();

      // 更新畫面上左上角顯示的 月 年
      calendarMonthAndYear = await page
        .locator("nb-calendar-view-mode")
        .textContent();
    } else {
      // 點日曆的 <
      await page
        .locator('nb-calendar-pageable-navigation [data-name="chevron-left"]')
        .click();
      // 更新畫面左上角顯示的 月年
      calendarMonthAndYear = await page
        .locator("nb-calendar-view-mode")
        .textContent();
    }
  }

  //展開日曆後，選擇某一天
  await page
    .locator('nb-calendar-picker [class="day-cell ng-star-inserted"]')
    .getByText(expectedDate, { exact: true }) // 記得用嚴謹模式，因為只輸入 1 會抓 11, 12, 13, 14, 15.....的數字
    .click();
  // 斷言出現在日期框的日期是我所選的日期
  await expect(datepickerInputField).toHaveValue(expectedMonthDateYear);
});

test("datepicker2", async ({ page }) => {
  // 先導航到測試頁
  await page.getByText("Forms").click();
  await page.getByText("Datepicker").click();

  // 抓取 Common Datepicker 的日期框
  const datepickerInputField = page.getByPlaceholder("Form Picker");
  await datepickerInputField.click();

  // 創建 Date() 物件的實例
  const date = new Date();
  // 設定你要今天的前、後的加、減幾天?
  date.setDate(date.getDate() + -1000);

  // 新增預期的 日、月(短)、年 及 "月 日, 年" 的集合字串
  const expectDate = date.getDate().toString();
  const expectMonthShot = date.toLocaleString("en-US", { month: "short" });
  const expectMonthLong = date.toLocaleString("en-US", { month: "long" });
  const expectYear = date.getFullYear().toString();
  const expectDayMonthYear = `${expectMonthShot} ${expectDate}, ${expectYear}`;
  const expectCalendarMonthYear = ` ${expectMonthLong} ${expectYear} `;
  // 新增日曆左上方 實際 的 "月 年"
  let calendarMonthYear = await page
    .locator("nb-calendar-view-mode")
    .textContent();

  // 判斷預期的日期 與 現實的日期，是前幾天 還是 後幾天?
  while (!expectCalendarMonthYear.includes(calendarMonthYear)) {
    // 把日期字串轉成實際的日期模式，這樣才能比較日期大小
    let compareExpectCalendarMonthYear = new Date(expectCalendarMonthYear);
    let compareCalendarMonthYear = new Date(calendarMonthYear);

    if (compareExpectCalendarMonthYear > compareCalendarMonthYear) {
      await page
        .locator(
          'nb-calendar-pageable-navigation nb-icon [data-name="chevron-right"]'
        )
        .click();

      // 更新一下左上角 月 年 的顯示
      calendarMonthYear = await page
        .locator("nb-calendar-view-mode")
        .textContent();
    } else if (compareExpectCalendarMonthYear < compareCalendarMonthYear) {
      await page
        .locator(
          'nb-calendar-pageable-navigation nb-icon [data-name="chevron-left"]'
        )
        .click();

      // 更新一下左上角 月 年 的顯示
      calendarMonthYear = await page
        .locator("nb-calendar-view-mode")
        .textContent();
    }
  }

  //展開日曆後，選擇某一天
  await page
    .locator('nb-calendar-picker [class="day-cell ng-star-inserted"]')
    .getByText(expectDate, { exact: true }) // 記得用嚴謹模式，因為只輸入 1 會抓 11, 12, 13, 14, 15.....的數字
    .click();
  // 斷言出現在日期框的日期是我所選的日期
  await expect(datepickerInputField).toHaveValue(expectDayMonthYear);
});

test("sliders", async ({ page }) => {
  // 1. Update attribute
  // 找出 circle 的定位器
  // const tempGauge = page.locator(
  //   '[tabtitle="Temperature"] ngx-temperature-dragger circle'
  // );
  // // 使用 JavaScript 的 evaluate
  // await tempGauge.evaluate((node) => {
  //   // 用 node 來設定屬性 setAttribute
  //   node.setAttribute("cx", "232.630");
  //   node.setAttribute("cy", "232.630");
  // });
  // // 記得點擊一下
  // await tempGauge.click();

  // 2. Mouse movement
  // 設定溫度計滑軌的區塊
  const tempBox = page.locator(
    '[tabtitle="Temperature"] ngx-temperature-dragger'
  );
  // 在適當下可以滑動軌跡
  await tempBox.scrollIntoViewIfNeeded();
  // 定義一個邊界框
  const box = await tempBox.boundingBox();
  // 設定這個 box 的中心點座標 (原本座標在左上角 (0,0))
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  // 模擬 滑鼠 移動
  await page.mouse.move(x, y);
  // 模擬 滑鼠 按下
  await page.mouse.down();
  // 模擬 滑鼠 水平移動 (x 座標)
  await page.mouse.move(x + 100, y);
  // 模擬 滑鼠 垂直移動 (y 座標)
  await page.mouse.move(x + 100, y + 100);
  // 模擬 滑鼠 放開
  await page.mouse.up();
  // 斷言
  await expect(tempBox).toContainText("30");
});

test("sliders 2", async ({ page }) => {
  // 1. 改 x, y 座標屬性
  // 定位圓圈的定位器
  const tempGauge = page.locator(
    '[tabtitle="Temperature"] ngx-temperature-dragger circle'
  );
  // 使用 evaluate 來改屬性
  await tempGauge.evaluate((node) => {
    node.setAttribute("cx", "232.630");
    node.setAttribute("cy", "232.630");
  });
  // 記得 click()
  await tempGauge.click();

  // 2. 模擬滑鼠操作 點擊、拖曳、放開
  // 設定溫度器的圓框
  const tempBox = page.locator(
    '[tabtitle="Temperature"] ngx-temperature-dragger'
  );
  // 設定溫度器的 scroll
  await tempBox.scrollIntoViewIfNeeded();
  // 設定溫度器的邊界框
  const box = await tempBox.boundingBox();
  // 把中心點從左上角移到中心
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;

  await page.mouse.move(x, y); // 先移到中心點座標
  await page.mouse.down(); // 滑鼠按下
  await page.mouse.move(x + 100, y); // x 座標，往右移，y 座標不動(水平移動)
  await page.mouse.down(); // 滑鼠按下
  await page.mouse.move(x + 100, y + 100); // x 座標不動，y 座標往下移 (垂直移動)
  await page.mouse.up(); // 滑鼠放開

  // 斷言
  await expect(tempBox).toContainText("30");
});

test("chatGPT", async ({ page }) => {
  await page.getByPlaceholder("Email").click();
  await page.getByLabel("性別").getByRole("radio").check();
  await page.locator("#accept").check();
});

test("chatGPT2", async ({ page }) => {
  await page.getByPlaceholder("請輸入姓名").fill("寶貝");
  await page.getByRole("radio", { name: "女" }).check();
  await page.getByRole("checkbox", { name: "我同意使用條款" }).check();
  await page.getByRole("button", { name: "送出" }).click();
});

test("chatGPT3", async ({ page }) => {
  await page.getByPlaceholder("請輸入帳號").fill("tester");
  await page.getByPlaceholder("請輸入密碼").fill("123456");
  await page.getByRole("button", { name: "註冊" }).click();
  // 驗證 alert 及 alert 文字訊息
  const alert = page.getByRole("alert");
  await expect(alert).toBeVisible();
  await expect(alert).toHaveText("請勾選服務條款");
});

test("chatGPT4", async ({ page }) => {
  await page.getByRole("tab", { name: "隱私政策" }).click();

  const terms = page
    .locator('div[role="tabpanel"] p')
    .filter({ hasText: "這是服務條款內容。" });
  const privacy = page
    .locator('div[role="tabpanel"] p')
    .filter({ hasText: "這是隱私政策內容。" });

  await expect(terms).toBeHidden();
  await expect(privacy).toBeVisible();
  await expect(privacy).not.toHaveAttribute("hidden", "");
  await expect(privacy).toHaveText("這是隱私政策內容。");
});

// const products = [
//   { name: "滑鼠", price: 80 },
//   { name: "鍵盤", price: 120 },
//   { name: "顯示器", price: 300 },
//   { name: "耳機", price: 90 },
// ];

// const expensiveProducts = [];
// let totalPrice = 0;

// for (const product of products) {
//   if (product.price >= 100) {
//     totalPrice += product.price;
//     expensiveProducts.push(product.name);
//   }
// }

// console.log(`價格大於等於 100 的商品有: ${expensiveProducts.join(", ")}`);
// console.log(`總價是: ${totalPrice}`);

// let totalPrice = 0;

// for (const product of products) {
//   if (product["price"] >= 100) {
//     totalPrice += product["price"];
//   }
// }
// console.log(`Total Price is: ${totalPrice}`);

test("chgpt5", async ({ page }) => {
  // 找出所有 <tr>，對每一列處理
  const rows = await page.locator("tbody tr").all();

  for (const row of rows) {
    const priceText = await row.locator("td").nth(1).textContent(); // 第2欄（從0開始）
    console.log(priceText);
  }
});
