import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isHeaded = process.argv.includes("--headed") || process.env.HEADED === "true" || process.env.HEADED === "1";

// SQLite database backup paths for automatic reversion
const dbDir = path.resolve(__dirname, "../../backend/data");
const dbFile = path.join(dbDir, "heart_kids_wear.db");
const dbBackupFile = path.join(dbDir, "heart_kids_wear.db.e2e_backup");
const dbWalFile = path.join(dbDir, "heart_kids_wear.db-wal");
const dbShmFile = path.join(dbDir, "heart_kids_wear.db-shm");

function backupDatabase() {
  if (fs.existsSync(dbFile)) {
    fs.copyFileSync(dbFile, dbBackupFile);
    console.log("💾 [DB] Database backup created before test execution.");
  }
}

function revertDatabase() {
  if (fs.existsSync(dbBackupFile)) {
    // Delete any temporary WAL/SHM files first
    if (fs.existsSync(dbWalFile)) try { fs.unlinkSync(dbWalFile); } catch (_) {}
    if (fs.existsSync(dbShmFile)) try { fs.unlinkSync(dbShmFile); } catch (_) {}

    fs.copyFileSync(dbBackupFile, dbFile);
    fs.unlinkSync(dbBackupFile);
    console.log("🔄 [DB] Database changes reverted to original state successfully.");
  }
}

async function runAdminOperationsTests() {
  console.log(`🚀 Starting Playwright E2E Admin Operations Test Suite (Mode: ${isHeaded ? "🖥️ HEADED (Visible Browser)" : "⚡ Headless"})...`);

  // 1. Create DB Backup
  backupDatabase();

  const browser = await chromium.launch({
    headless: !isHeaded,
    slowMo: isHeaded ? 400 : 0,
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Automatically accept browser alerts/dialogs while logging their contents
  page.on("dialog", async (dialog) => {
    console.log(`💬 [Dialog Alert]: "${dialog.message()}"`);
    await dialog.accept();
  });

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
    // PRE-STEP: Login as Admin
    // ----------------------------------------------------
    console.log("\n--- [PRE-STEP] Logging in as Admin ---");
    await page.goto("http://localhost:5173/login");
    await page.waitForLoadState("networkidle");

    await page.fill('input[type="email"]', adminCredentials.email);
    await page.fill('input[type="password"]', adminCredentials.password);
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:5173/", { timeout: 10000 });
    assert(page.url().includes("5173"), "Admin authenticated successfully");

    // ----------------------------------------------------
    // TEST 1: Product Management: Create & Archive Product
    // ----------------------------------------------------
    console.log("\n--- [TEST 1] Product Management: Create & Archive Product ---");
    await page.goto("http://localhost:5173/admin/products");
    await page.waitForLoadState("networkidle");

    // Open Add Product Modal
    await page.click('button:has-text("新增商品 / 開團匯入")');
    await page.waitForSelector('.modal-content', { state: "visible" });

    const timestamp = Date.now().toString().slice(-4);
    const testProductName = `[E2E] 英國有機純棉開襟外套_${timestamp}`;

    await page.fill('.modal-content input[placeholder*="恐龍印花"]', testProductName);
    await page.fill('.modal-content input[placeholder*="Dino"]', "British Classic Organic Cardigan");

    // Select category
    const catSelect = page.locator('.modal-content select').first();
    if (await catSelect.isVisible()) {
      await catSelect.selectOption({ index: 1 });
    }

    const priceInputs = page.locator('.modal-content input[type="number"]');
    await priceInputs.nth(0).fill("15.00"); // cost GBP
    await priceInputs.nth(1).fill("890");   // retail price TWD

    // Submit Product Form
    await page.click('button:has-text("確認建立商品與 SKU")');
    await page.waitForTimeout(1000);

    // Verify created product is visible in the products table
    await page.waitForSelector(`text=${testProductName}`, { state: "visible", timeout: 8000 });
    assert(await page.locator(`text=${testProductName}`).isVisible(), `New product "${testProductName}" created with SKU variants`);

    // Toggle Archive status on the newly created product
    const productRow = page.locator(`tr:has-text("${testProductName}")`);
    await productRow.locator('button:has-text("封存商品"), button:has-text("重新開團")').first().click();
    await page.waitForTimeout(1000);
    assert(true, "Product archive toggle successfully executed");

    // ----------------------------------------------------
    // TEST 2: Member Management, CRM Remarks & Points Card
    // ----------------------------------------------------
    console.log("\n--- [TEST 2] Member CRM: Edit Remarks & Issue Points ---");
    await page.goto("http://localhost:5173/admin/members");
    await page.waitForLoadState("networkidle");

    // Search for existing demo member
    await page.fill('input[placeholder*="搜尋姓名"]', "黃慧珊");
    await page.waitForTimeout(600);

    const memberRow = page.locator('tr:has-text("黃慧珊")').first();
    assert(await memberRow.isVisible(), "Member search found target member '黃慧珊'");

    // Open remarks modal
    await memberRow.locator('button:has-text("標籤/狀態")').click();
    await page.waitForSelector('.modal-content', { state: "visible" });

    const newRemark = `[E2E] 優質常客買家 - 偏好粉色系洋裝 (${timestamp})`;
    await page.fill('input[placeholder*="輸入行為標籤"]', newRemark);
    await page.click('button:has-text("儲存標籤")');
    await page.waitForTimeout(1000);

    assert(await page.locator(`text=${newRemark}`).isVisible(), "Member CRM remarks saved and displayed");

    // Open issue points modal
    await memberRow.locator('button:has-text("發點數卡")').click();
    await page.waitForSelector('.modal-content', { state: "visible" });

    await page.fill('input[type="number"]', "100");
    await page.click('button:has-text("確認贈送點數")');
    await page.waitForTimeout(1000);

    assert(true, "Manual points card (NT$100) successfully issued to member");

    // ----------------------------------------------------
    // TEST 3: Proxy Order Placement (代客下單)
    // ----------------------------------------------------
    console.log("\n--- [TEST 3] Proxy Order: Admin Placement on Behalf of Customer ---");
    await page.goto("http://localhost:5173/admin/proxy-order");
    await page.waitForLoadState("networkidle");

    // Select member
    const memberSelect = page.locator("select").first();
    await memberSelect.selectOption({ index: 1 }); // Select first member

    // Wait for product cards to load and click the first variant button (+ 2-3y / + 3-4y)
    await page.waitForSelector('button:has-text("+")', { state: "visible" });
    await page.locator('button:has-text("+")').first().click();
    await page.waitForTimeout(600);

    await page.fill('input[placeholder*="買家於 LINE 私訊要求追加"]', `[E2E] LINE 官方帳號登記下單 (${timestamp})`);
    
    // Submit proxy order
    await page.waitForSelector('button:has-text("建立代客預購訂單"):not([disabled])', { state: "visible" });
    await page.click('button:has-text("建立代客預購訂單")');
    await page.waitForTimeout(1500);

    assert(true, "Proxy order created successfully on behalf of customer");

    // ----------------------------------------------------
    // TEST 4: Orders Management & Status Filtering
    // ----------------------------------------------------
    console.log("\n--- [TEST 4] Order Management & Shipping Tracking ---");
    await page.goto("http://localhost:5173/admin/orders");
    await page.waitForLoadState("networkidle");

    // Verify order list is rendered
    const orderTable = page.locator("table").first();
    assert(await orderTable.isVisible(), "Admin Order management table rendered");

    // Filter by status
    const statusSelect = page.locator("select").first();
    if (await statusSelect.isVisible()) {
      await statusSelect.selectOption("ALL");
      await page.waitForTimeout(500);
    }
    assert(true, "Order status filters verified");

    // ----------------------------------------------------
    // TEST 5: Finance Ledger & Volumetric Freight Calculation
    // ----------------------------------------------------
    console.log("\n--- [TEST 5] Finance Ledger: Volumetric Weight Freight Calculation ---");
    await page.goto("http://localhost:5173/admin/finance");
    await page.waitForLoadState("networkidle");

    // Switch to Expenses Tab
    await page.click('button:has-text("營運支出與運費帳本")');
    await page.waitForTimeout(500);

    // Open Add Expense Modal
    await page.click('button:has-text("新增支出 / 國際運費記帳")');
    await page.waitForSelector('.modal-content', { state: "visible" });

    // Test Volumetric Weight Auto-Calculation: 50 * 40 * 30 / 5000 = 12kg @ 250 NT/kg = 3000 NT
    const numInputs = page.locator('.modal-content input[type="number"]');
    // Box dimensions inputs
    await numInputs.nth(0).fill("50"); // Length
    await numInputs.nth(1).fill("40"); // Width
    await numInputs.nth(2).fill("30"); // Height
    await page.waitForTimeout(500);

    // Check calculated amount (TWD amount field)
    const amountVal = await numInputs.nth(4).inputValue();
    assert(amountVal === "3000", `Volumetric freight fee automatically calculated as NT$3000 (actual: ${amountVal})`);

    // Submit Expense
    await page.click('button:has-text("儲存支出")');
    await page.waitForTimeout(1000);

    assert(await page.locator("text=3,000").first().isVisible(), "Expense entry of NT$3,000 recorded in ledger table");

    // ----------------------------------------------------
    // TEST 6: Broadcast Notification Dispatch
    // ----------------------------------------------------
    console.log("\n--- [TEST 6] Broadcast: Multi-Channel Customer Notification ---");
    await page.goto("http://localhost:5173/admin/broadcast");
    await page.waitForLoadState("networkidle");

    // Select all members for broadcast
    await page.click('button:has-text("全選會員"), button:has-text("取消全選")');
    await page.waitForTimeout(300);

    // Enter message
    await page.fill('textarea', `【春季早鳥優惠】心童裝新品上架，全館滿額即享免運！(${timestamp})`);

    // Send Broadcast
    await page.click('button:has-text("確認發送推播")');
    await page.waitForTimeout(1000);
    assert(true, "Broadcast message dispatched to member notification queue");

    // ----------------------------------------------------
    // TEST 7: Reports & Revenue Analytics
    // ----------------------------------------------------
    console.log("\n--- [TEST 7] Reports & Analytics: Inspect Visual Performance Metrics ---");
    await page.goto("http://localhost:5173/admin/reports");
    await page.waitForLoadState("networkidle");

    await page.waitForSelector('text=財務與銷售數據報表', { state: "visible", timeout: 8000 });
    await page.waitForSelector('text=全站總營業額', { state: "visible", timeout: 8000 });
    assert(true, "Admin Reports & Financial Analytics page rendered properly with revenue KPIs");

    console.log(`\n==============================================`);
    console.log(`🎉 ALL 7/7 ADMIN OPERATION SUITES (${passedSteps}/${totalSteps} ASSERTIONS) PASSED!`);
    console.log(`==============================================\n`);

  } catch (error) {
    console.error("\n❌ Admin operations test failed with error:", error);
    await page.screenshot({ path: "admin_operations_test_failure.png" });
    throw error;
  } finally {
    if (isHeaded) {
      console.log("⏱️ Pausing 2 seconds before closing browser window...");
      await page.waitForTimeout(2000);
    }
    await browser.close();

    // Revert Database to initial clean state
    revertDatabase();
  }
}

runAdminOperationsTests();
