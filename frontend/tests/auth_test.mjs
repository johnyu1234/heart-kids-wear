import { chromium } from "playwright";

const isHeaded = process.argv.includes("--headed") || process.env.HEADED === "true" || process.env.HEADED === "1";

async function runAuthTests() {
  console.log(`🚀 Starting Playwright E2E Auth Tests (Mode: ${isHeaded ? "🖥️ HEADED (Visible Browser)" : "⚡ Headless"})...`);
  
  const browser = await chromium.launch({
    headless: !isHeaded,
    slowMo: isHeaded ? 500 : 0, // Slow down operations by 500ms in headed mode for visual observation
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  const timestamp = Date.now();
  const testUser = {
    fullName: `測試用戶_${timestamp.toString().slice(-4)}`,
    email: `playwright_test_${timestamp}@example.com`,
    password: "Password123!",
    phone: "0912345678",
    birthDate: "1995-06-15",
    storeName: "信義門市",
    storeNumber: "991234",
    address: "台北市信義區信義路五段7號",
    marketingSource: "Instagram"
  };

  let passedSteps = 0;
  let totalSteps = 0;

  function assert(condition, message) {
    totalSteps++;
    if (!condition) {
      console.error(`❌ FAILED: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    } else {
      passedSteps++;
      console.log(`✅ PASSED: ${message}`);
    }
  }

  try {
    // ----------------------------------------------------
    // TEST 1: Password Mismatch Validation
    // ----------------------------------------------------
    console.log("\n--- [TEST 1] Sign Up: Password Mismatch Validation ---");
    await page.goto("http://localhost:5173/register");
    await page.waitForLoadState("networkidle");

    await page.fill('input[name="full_name"]', testUser.fullName);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="phone"]', testUser.phone);
    await page.fill('input[name="password"]', "Password123!");
    await page.fill('input[name="confirmPassword"]', "WrongPassword456!");
    await page.check('input[name="agree_terms"]');
    await page.click('button[type="submit"]');

    await page.locator("text=兩次輸入的密碼不相符").waitFor({ state: "visible", timeout: 5000 });
    const mismatchError = await page.locator("text=兩次輸入的密碼不相符").isVisible();
    assert(mismatchError, "Registration correctly catches password mismatch and displays alert");

    // ----------------------------------------------------
    // TEST 2: Successful Registration & 60-Points Welcome Bonus
    // ----------------------------------------------------
    console.log("\n--- [TEST 2] Sign Up: Successful Registration Flow ---");
    await page.goto("http://localhost:5173/register");
    await page.waitForLoadState("networkidle");

    // Listen to the registration success alert dialog
    let alertMessage = "";
    page.once("dialog", async (dialog) => {
      alertMessage = dialog.message();
      console.log(`💬 Dialog captured: "${alertMessage}"`);
      await dialog.accept();
    });

    await page.fill('input[name="full_name"]', testUser.fullName);
    await page.fill('input[name="birth_date"]', testUser.birthDate);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="phone"]', testUser.phone);
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="confirmPassword"]', testUser.password);
    await page.fill('input[name="store_name_711"]', testUser.storeName);
    await page.fill('input[name="store_number_711"]', testUser.storeNumber);
    await page.fill('input[name="postal_address"]', testUser.address);
    await page.selectOption('select[name="marketing_source"]', testUser.marketingSource);
    await page.check('input[name="agree_terms"]');

    await page.click('button[type="submit"]');

    // Wait for redirect to /products
    await page.waitForURL("**/products", { timeout: 10000 });
    assert(page.url().includes("/products"), "Navigated to /products after registration");
    assert(alertMessage.includes("60 點"), "Registration bonus alert message confirmed");

    // Check token and user in localStorage
    const authState = await page.evaluate(() => ({
      token: localStorage.getItem("token"),
      user: JSON.parse(localStorage.getItem("user") || "{}")
    }));
    assert(!!authState.token, "JWT access_token is saved in localStorage");
    assert(authState.user.email === testUser.email, "Saved user email matches registered email");
    assert(authState.user.full_name === testUser.fullName, "Saved user full name matches registered name");

    // ----------------------------------------------------
    // TEST 3: Verify Profile, Member ID & 60 Points Card
    // ----------------------------------------------------
    console.log("\n--- [TEST 3] Verify Member Profile & 60-pt Bonus Card ---");
    await page.goto("http://localhost:5173/member/account");
    await page.waitForLoadState("networkidle");

    const profileContent = await page.textContent("body");
    assert(profileContent.includes("專屬會員編號") || profileContent.includes("帳號與收件門市管理"), "Profile page loaded successfully");
    assert(profileContent.includes("60.00") || profileContent.includes("60 點") || profileContent.includes("註冊首次贈送60點"), "60 points registration gift card visible on profile");

    // ----------------------------------------------------
    // TEST 4: Duplicate Email Registration Error
    // ----------------------------------------------------
    console.log("\n--- [TEST 4] Sign Up: Duplicate Email Registration ---");
    // Clear localStorage to act as guest
    await page.evaluate(() => localStorage.clear());
    await page.goto("http://localhost:5173/register");
    await page.waitForLoadState("networkidle");

    await page.fill('input[name="full_name"]', "重複註冊者");
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="phone"]', "0987654321");
    await page.fill('input[name="password"]', "Password123!");
    await page.fill('input[name="confirmPassword"]', "Password123!");
    await page.check('input[name="agree_terms"]');
    await page.click('button[type="submit"]');

    await page.locator("text=已被註冊").waitFor({ state: "visible", timeout: 5000 });
    const duplicateVisible = await page.locator("text=已被註冊").isVisible();
    assert(duplicateVisible, "Duplicate email registration rejected with '已被註冊' error");

    // ----------------------------------------------------
    // TEST 5: Login with Wrong Password
    // ----------------------------------------------------
    console.log("\n--- [TEST 5] Login: Invalid Password Handling ---");
    await page.goto("http://localhost:5173/login");
    await page.waitForLoadState("networkidle");

    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', "WrongPassword999!");
    await page.click('button[type="submit"]');

    await page.locator("text=登入錯誤請再嘗試一次").waitFor({ state: "visible", timeout: 5000 });
    const loginErrorVisible = await page.locator("text=登入錯誤請再嘗試一次").isVisible();
    assert(loginErrorVisible, "Invalid credentials show '登入錯誤請再嘗試一次' error notification");

    // ----------------------------------------------------
    // TEST 6: Successful Login Flow
    // ----------------------------------------------------
    console.log("\n--- [TEST 6] Login: Successful Authentication Flow ---");
    await page.goto("http://localhost:5173/login");
    await page.waitForLoadState("networkidle");

    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    await page.check('input#remember');
    await page.click('button[type="submit"]');

    await page.waitForURL("http://localhost:5173/", { timeout: 10000 });
    assert(page.url() === "http://localhost:5173/" || page.url().includes("5173"), "Redirected to home after successful login");

    const headerText = await page.textContent("header");
    assert(headerText.includes(testUser.fullName), "User full name displayed in header navigation");

    console.log(`\n==============================================`);
    console.log(`🎉 ALL 6/6 TEST SUITES (${passedSteps}/${totalSteps} ASSERTIONS) PASSED SUCCESSFULLY!`);
    console.log(`==============================================\n`);

  } catch (error) {
    console.error("\n❌ Test execution failed with error:", error);
    await page.screenshot({ path: "auth_test_failure.png" });
    throw error;
  } finally {
    if (isHeaded) {
      console.log("⏱️ Pausing 2 seconds before closing browser window...");
      await page.waitForTimeout(2000);
    }
    await browser.close();
  }
}

runAuthTests();
