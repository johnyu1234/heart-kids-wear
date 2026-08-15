import { chromium } from "playwright";

const isHeaded = process.argv.includes("--headed") || process.env.HEADED === "true" || process.env.HEADED === "1";

async function runAdminAuthTests() {
  console.log(`🚀 Starting Playwright E2E Admin Auth & Navigation Tests (Mode: ${isHeaded ? "🖥️ HEADED (Visible Browser)" : "⚡ Headless"})...`);
  
  const browser = await chromium.launch({
    headless: !isHeaded,
    slowMo: isHeaded ? 500 : 0,
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  const adminCredentials = {
    email: "admin@heartkidswear.com",
    password: "admin123456",
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
    // TEST 1: Unauthorized Guest Access to /admin is Blocked
    // ----------------------------------------------------
    console.log("\n--- [TEST 1] Admin Route Guard: Guest Access Blocked ---");
    // Clear storage to ensure guest state
    await page.goto("http://localhost:5173/");
    await page.evaluate(() => localStorage.clear());

    await page.goto("http://localhost:5173/admin");
    await page.waitForURL("**/login", { timeout: 8000 });
    assert(page.url().includes("/login"), "Unauthenticated user attempting to access /admin is redirected to /login");

    // ----------------------------------------------------
    // TEST 2: Regular Member Access to /admin is Blocked
    // ----------------------------------------------------
    console.log("\n--- [TEST 2] Admin Route Guard: Regular Member Blocked ---");
    // Register or login a normal non-admin member
    const timestamp = Date.now();
    const regularUser = {
      fullName: `一般會員_${timestamp.toString().slice(-4)}`,
      email: `regular_user_${timestamp}@example.com`,
      password: "Password123!",
      phone: "0911222333",
    };

    await page.goto("http://localhost:5173/register");
    await page.waitForLoadState("networkidle");

    page.once("dialog", async (dialog) => await dialog.accept());

    await page.fill('input[name="full_name"]', regularUser.fullName);
    await page.fill('input[name="email"]', regularUser.email);
    await page.fill('input[name="phone"]', regularUser.phone);
    await page.fill('input[name="password"]', regularUser.password);
    await page.fill('input[name="confirmPassword"]', regularUser.password);
    await page.check('input[name="agree_terms"]');
    await page.click('button[type="submit"]');

    // Handle in-app UI modal
    const okModalBtn = page.locator('.modal-content button.btn-primary');
    await okModalBtn.waitFor({ state: "visible", timeout: 8000 });
    await okModalBtn.click();

    await page.waitForURL("**/products", { timeout: 10000 });

    // Try accessing /admin with regular member token
    await page.goto("http://localhost:5173/admin");
    await page.waitForURL("**/login", { timeout: 8000 });
    assert(page.url().includes("/login"), "Regular non-admin member accessing /admin is redirected to /login");

    // ----------------------------------------------------
    // TEST 3: Admin Login Flow & Admin Badge
    // ----------------------------------------------------
    console.log("\n--- [TEST 3] Admin Authentication Flow ---");
    await page.goto("http://localhost:5173/login");
    await page.waitForLoadState("networkidle");

    await page.fill('input[type="email"]', adminCredentials.email);
    await page.fill('input[type="password"]', adminCredentials.password);
    await page.check('input#remember');
    await page.click('button[type="submit"]');

    await page.waitForURL("http://localhost:5173/", { timeout: 10000 });
    assert(page.url() === "http://localhost:5173/" || page.url().includes("5173"), "Admin successfully logged in");

    // Check localStorage auth state
    const authState = await page.evaluate(() => ({
      token: localStorage.getItem("token"),
      user: JSON.parse(localStorage.getItem("user") || "{}")
    }));
    assert(!!authState.token, "Admin JWT token saved in localStorage");
    assert(authState.user.is_admin === true, "User is recognized as is_admin: true");

    // Verify Admin Badge in Header Navigation
    const headerAdminBadge = await page.locator('header a[href="/admin"]').isVisible();
    assert(headerAdminBadge, "Admin Panel button with badge visible in top navigation header");

    // ----------------------------------------------------
    // TEST 4: Access Admin Dashboard & Sidebar Verification
    // ----------------------------------------------------
    console.log("\n--- [TEST 4] Admin Dashboard & Navigation Verification ---");
    await page.click('header a[href="/admin"]');
    await page.waitForURL("**/admin", { timeout: 8000 });
    assert(page.url().includes("/admin"), "Successfully entered Admin Dashboard");

    const sidebarText = await page.textContent("div");
    assert(sidebarText.includes("Heart Admin") || sidebarText.includes("管理後台"), "Heart Admin Sidebar is rendered");

    // ----------------------------------------------------
    // TEST 5: Verify Key Admin Sub-Pages
    // ----------------------------------------------------
    console.log("\n--- [TEST 5] Navigate Admin Sub-Pages ---");
    
    // 1. Products Management
    await page.goto("http://localhost:5173/admin/products");
    await page.waitForLoadState("networkidle");
    const productsPageContent = await page.textContent("main");
    assert(productsPageContent.length > 0, "Admin Products page loads correctly");

    // 2. Orders Management
    await page.goto("http://localhost:5173/admin/orders");
    await page.waitForLoadState("networkidle");
    const ordersPageContent = await page.textContent("main");
    assert(ordersPageContent.length > 0, "Admin Orders page loads correctly");

    // 3. Members Management
    await page.goto("http://localhost:5173/admin/members");
    await page.waitForLoadState("networkidle");
    const membersPageContent = await page.textContent("main");
    assert(membersPageContent.length > 0, "Admin Members page loads correctly");

    // 4. Finance Ledger
    await page.goto("http://localhost:5173/admin/finance");
    await page.waitForLoadState("networkidle");
    const financePageContent = await page.textContent("main");
    assert(financePageContent.length > 0, "Admin Finance page loads correctly");

    // 5. Reports & Analytics
    await page.goto("http://localhost:5173/admin/reports");
    await page.waitForLoadState("networkidle");
    const reportsPageContent = await page.textContent("main");
    assert(reportsPageContent.length > 0, "Admin Reports & Analytics page loads correctly");

    // ----------------------------------------------------
    // TEST 6: Admin Logout Flow
    // ----------------------------------------------------
    console.log("\n--- [TEST 6] Admin Logout Flow ---");
    // Find logout button in sidebar
    await page.click('button:has-text("登出"), button:has-text("Logout")');
    await page.waitForURL("**/login", { timeout: 8000 });
    assert(page.url().includes("/login"), "Admin logged out and redirected to /login");

    const loggedOutState = await page.evaluate(() => localStorage.getItem("token"));
    assert(!loggedOutState, "Auth token cleared from localStorage after logout");

    // Verify /admin is blocked once more
    await page.goto("http://localhost:5173/admin");
    await page.waitForURL("**/login", { timeout: 8000 });
    assert(page.url().includes("/login"), "Subsequent /admin access is blocked after logout");

    console.log(`\n==============================================`);
    console.log(`🎉 ALL 6/6 TEST SUITES (${passedSteps}/${totalSteps} ASSERTIONS) PASSED SUCCESSFULLY!`);
    console.log(`==============================================\n`);

  } catch (error) {
    console.error("\n❌ Test execution failed with error:", error);
    await page.screenshot({ path: "admin_auth_test_failure.png" });
    throw error;
  } finally {
    if (isHeaded) {
      console.log("⏱️ Pausing 2 seconds before closing browser window...");
      await page.waitForTimeout(2000);
    }
    await browser.close();
  }
}

runAdminAuthTests();
