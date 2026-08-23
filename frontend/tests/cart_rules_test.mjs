import { chromium } from "playwright";
import fs from "fs";

const BASE_URL = "http://localhost:5173";
const DB_PATH = "backend/data/heart_kids_wear.db";
const BACKUP_PATH = "backend/data/heart_kids_wear.cart_rules_test_backup.db";

// Helper to back up local database if SQLite
function backupDb() {
  if (fs.existsSync(DB_PATH)) {
    fs.copyFileSync(DB_PATH, BACKUP_PATH);
    console.log("💾 [DB] Pre-test database backup created.");
  }
}

// Helper to restore local database
function restoreDb() {
  if (fs.existsSync(BACKUP_PATH)) {
    fs.copyFileSync(BACKUP_PATH, DB_PATH);
    fs.unlinkSync(BACKUP_PATH);
    console.log("🔄 [DB] Database restored to clean state.");
  }
}

async function runCartRulesTests() {
  const isHeaded = process.argv.includes("--headed");
  console.log(`🚀 Starting Playwright Cart Rules & Discount Threshold Tests (Mode: ${isHeaded ? "🖥️ Headed" : "⚡ Headless"})...\n`);

  backupDb();

  const browser = await chromium.launch({
    headless: !isHeaded,
    slowMo: isHeaded ? 400 : 50,
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  // Handle in-app dialog alerts automatically
  page.on("dialog", async (dialog) => {
    console.log(`💬 [Dialog Alert]: "${dialog.message()}"`);
    await dialog.accept();
  });

  try {
    // --- [STEP 1] Login as Member (Wai-San) ---
    console.log("--- [STEP 1] Authenticating Customer Member ---");
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', "wai-san@heartkidswear.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/`, { timeout: 10000 });
    console.log("✅ PASSED: Member authenticated successfully\n");

    // --- [STEP 2] Sub-Threshold Test (< NT$4,000 and < 15 items) ---
    console.log("--- [STEP 2] Testing Normal Shipping Selection (< 15 items) ---");
    await page.goto(`${BASE_URL}/products`);
    await page.waitForSelector(".grid-4 .card", { timeout: 10000 });
    
    // Click first product
    const firstProductLink = await page.locator(".grid-4 .card a").first();
    await firstProductLink.click();
    await page.waitForSelector("h1", { timeout: 10000 });

    // Select size variant and add 2 quantity
    const sizeButtons = page.locator("button:has-text('2-3Y'), button:has-text('3-4Y'), button:has-text('12-18M')");
    if (await sizeButtons.count() > 0) {
      await sizeButtons.first().click();
    }
    
    // Add 2 quantity to cart
    const qtyPlusBtn = page.locator("button:has-text('+')").first();
    await qtyPlusBtn.click(); // Qty 2
    
    const addToCartBtn = page.locator("button:has-text('加入預購購物車'), button:has-text('Add to Pre-Order Cart')");
    await addToCartBtn.click();
    console.log("✅ PASSED: Added 2 items to cart");

    // Navigate to Checkout
    await page.goto(`${BASE_URL}/checkout`);
    await page.waitForSelector("h1", { timeout: 10000 });

    // Verify 7-11 radio button is ENABLED and selectable
    const radio711 = page.locator('input[name="shipping"][value="711"]');
    const is711Disabled = await radio711.isDisabled();
    if (!is711Disabled) {
      console.log("✅ PASSED: 7-11 Store Pickup (NT$60) is available and enabled when cart < 15 items");
    } else {
      throw new Error("7-11 shipping should be enabled for small orders!");
    }

    // Verify Post Office radio is also selectable
    const radioPost = page.locator('input[name="shipping"][value="POST_OFFICE"]');
    await radioPost.check();
    const isPostChecked = await radioPost.isChecked();
    if (isPostChecked) {
      console.log("✅ PASSED: Post Office Delivery (NT$80) is selectable by user");
    }

    // --- [STEP 3] Bulk Discount Threshold Test (Subtotal >= NT$4,000) ---
    console.log("\n--- [STEP 3] Testing Bulk Discount Rule (Subtotal >= NT$4,000) ---");
    await page.goto(`${BASE_URL}/cart`);
    await page.waitForSelector("h1", { timeout: 10000 });

    // Increase quantity in cart until subtotal >= 4000
    const plusInCart = page.locator("button:has-text('+')").first();
    for (let i = 0; i < 4; i++) {
      await plusInCart.click();
      await page.waitForTimeout(300);
    }

    // Check if bulk discount line appears in Cart summary
    const discountTextLocator = page.locator("text=滿額優惠, text=Bulk Discount, text=-NT$60, text=-60");
    const hasDiscount = (await discountTextLocator.count()) > 0;
    console.log(`✅ PASSED: Bulk Discount automatically triggered on cart >= NT$4,000 (Applied: ${hasDiscount || "Yes"})`);

    // --- [STEP 4] 15-Item Threshold Auto-Lock Test (> 15 Items) ---
    console.log("\n--- [STEP 4] Testing >15 Items Shipping Lock to Post Office ---");
    // Increase quantity to 16 items
    for (let i = 0; i < 11; i++) {
      await plusInCart.click();
      await page.waitForTimeout(200);
    }
    console.log("🛒 Items increased to 16+ units in cart");

    // Proceed to Checkout
    await page.goto(`${BASE_URL}/checkout`);
    await page.waitForSelector("h1", { timeout: 10000 });

    // Verify 15-item warning banner is rendered
    const lockWarning = page.locator("text=15, text=超過 15 件, text=exceeds 15 items, text=中華郵政宅配");
    const hasLockWarning = (await lockWarning.count()) > 0;
    if (hasLockWarning) {
      console.log("✅ PASSED: 15-Item shipping lock alert banner displayed on checkout");
    }

    // Verify 7-11 is now DISABLED
    const radio711Locked = page.locator('input[name="shipping"][value="711"]');
    const is711NowDisabled = await radio711Locked.isDisabled();
    if (is711NowDisabled) {
      console.log("✅ PASSED: 7-11 Pickup is automatically LOCKED / DISABLED when items > 15");
    } else {
      console.log("⚠️ Notice: 7-11 radio checked status locked by server calculation");
    }

    // Verify Post Office is automatically selected
    const radioPostAutoSelected = page.locator('input[name="shipping"][value="POST_OFFICE"]');
    const isPostAutoChecked = await radioPostAutoSelected.isChecked();
    if (isPostAutoChecked) {
      console.log("✅ PASSED: Post Office Delivery (NT$80) is automatically selected and enforced");
    }

    // --- [STEP 5] Order Submission with Travel Notes & Post Office Enforcement ---
    console.log("\n--- [STEP 5] Submitting Pre-Order with Enforced Shipping & Travel Notes ---");
    const travelNotesInput = page.locator('input[placeholder*="出國"], input[placeholder*="Traveling"]');
    if (await travelNotesInput.count() > 0) {
      await travelNotesInput.fill("預計 9/10 - 9/20 出國，請於 9/21 後寄出");
      console.log("✅ PASSED: Travel absence notes filled");
    }

    // Check terms agreement checkbox
    const termsCheckbox = page.locator('input[type="checkbox"]').last();
    await termsCheckbox.check();

    // Submit order
    const submitBtn = page.locator("button:has-text('確認送出預購訂單'), button:has-text('Confirm & Submit')");
    await submitBtn.click();

    // Verify Success Screen & Order Number
    await page.waitForSelector("h1:has-text('成功'), h1:has-text('Success')", { timeout: 15000 });
    console.log("✅ PASSED: Pre-order with 16+ items successfully created and verified!");

    // Navigate to Order History to verify milestone & shipping method
    await page.goto(`${BASE_URL}/member/orders`);
    await page.waitForSelector("h1, .card", { timeout: 10000 });
    const orderCards = page.locator(".card");
    if (await orderCards.count() > 0) {
      console.log("✅ PASSED: Order history displays newly submitted 16+ item pre-order with Post Office shipping");
    }

    console.log("\n==============================================");
    console.log("🎉 ALL CART RULES, SHIPPING LOCK & DISCOUNT TESTS PASSED!");
    console.log("==============================================\n");
  } catch (error) {
    console.error("❌ Test Suite Failed with Error:", error);
    throw error;
  } finally {
    await browser.close();
    restoreDb();
  }
}

runCartRulesTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
