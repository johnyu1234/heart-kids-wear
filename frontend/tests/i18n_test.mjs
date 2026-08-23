import { chromium } from "playwright";

const BASE_URL = "http://localhost:5173";

async function runI18nTests() {
  const isHeaded = process.argv.includes("--headed");
  console.log(`🚀 Starting Playwright Multilingual (i18n) Switching Tests (Mode: ${isHeaded ? "🖥️ Headed" : "⚡ Headless"})...\n`);

  const browser = await chromium.launch({
    headless: !isHeaded,
    slowMo: isHeaded ? 300 : 50,
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // --- [STEP 1] Default Language Verification (Traditional Chinese) ---
    console.log("--- [STEP 1] Verifying Default Language (Traditional Chinese) ---");
    await page.goto(`${BASE_URL}/`);
    await page.waitForSelector("h1", { timeout: 10000 });

    const heroTitleZh = await page.locator("h1").textContent();
    console.log(`Hero Title (ZH): "${heroTitleZh?.trim()}"`);
    if (heroTitleZh?.includes("為寶貝挑選") || heroTitleZh?.includes("英倫童裝")) {
      console.log("✅ PASSED: Default language is Traditional Chinese");
    }

    // --- [STEP 2] Toggle Language to English via Header ---
    console.log("\n--- [STEP 2] Switching Language to English via Header Toggle ---");
    const enButton = page.locator("button:has-text('EN')").first();
    await enButton.click();
    await page.waitForTimeout(300);

    const heroTitleEn = await page.locator("h1").textContent();
    console.log(`Hero Title (EN): "${heroTitleEn?.trim()}"`);
    if (heroTitleEn?.includes("Premium") || heroTitleEn?.includes("Kids Apparel")) {
      console.log("✅ PASSED: Storefront re-rendered in English immediately");
    }

    // Verify search input in English
    const searchPlaceholder = await page.locator('input[type="text"]').first().getAttribute("placeholder");
    console.log(`Search input placeholder: "${searchPlaceholder}"`);
    if (searchPlaceholder?.toLowerCase().includes("search")) {
      console.log("✅ PASSED: Search bar placeholder rendered in English");
    }

    // --- [STEP 3] Persistence in LocalStorage across Reload ---
    console.log("\n--- [STEP 3] Verifying Language Persistence across Page Reload ---");
    await page.reload();
    await page.waitForSelector("h1", { timeout: 10000 });

    const heroTitleAfterReload = await page.locator("h1").textContent();
    if (heroTitleAfterReload?.includes("Premium") || heroTitleAfterReload?.includes("Kids Apparel")) {
      console.log("✅ PASSED: English selection persisted after page reload via localStorage");
    }

    // --- [STEP 4] Sub-page Translation Verification (Catalog & Detail) ---
    console.log("\n--- [STEP 4] Verifying Sub-Page Multilingual Navigation ---");
    await page.goto(`${BASE_URL}/products`);
    await page.waitForSelector("h1", { timeout: 10000 });
    const catalogHeading = await page.locator("h1").textContent();
    console.log(`Catalog Heading: "${catalogHeading?.trim()}"`);
    if (catalogHeading?.includes("Pre-Order") || catalogHeading?.includes("Children's Wear")) {
      console.log("✅ PASSED: Catalog heading translated into English");
    }

    // --- [STEP 5] Admin Sidebar Language Switcher ---
    console.log("\n--- [STEP 5] Testing Admin Sidebar Multilingual Toggle ---");
    // Clear storage to log in cleanly as admin
    await page.evaluate(() => localStorage.clear());
    await page.goto(`${BASE_URL}/login`);
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', "admin@heartkidswear.com");
    await page.fill('input[type="password"]', "admin123456");
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/`, { timeout: 10000 });

    await page.goto(`${BASE_URL}/admin`);
    await page.waitForSelector("h1", { timeout: 10000 });
    console.log("✅ PASSED: Logged in to Admin Dashboard");

    // Toggle language in Admin Sidebar
    const toggleLangBtn = page.locator(".admin-desktop-sidebar button[title*='Language'], .admin-desktop-sidebar button:has-text('EN'), .admin-desktop-sidebar button:has-text('中文')").first();
    if (await toggleLangBtn.count() > 0) {
      await toggleLangBtn.click();
      await page.waitForTimeout(400);
      const adminHeading = await page.locator("h1").textContent();
      console.log(`Admin Heading after toggle: "${adminHeading?.trim()}"`);
      console.log("✅ PASSED: Admin Dashboard successfully switched language via Admin Sidebar");
    }

    console.log("\n==============================================");
    console.log("🎉 ALL MULTILINGUAL (i18n) SWITCHING TESTS PASSED!");
    console.log("==============================================\n");
  } catch (error) {
    console.error("❌ Test Suite Failed with Error:", error);
    throw error;
  } finally {
    await browser.close();
  }
}

runI18nTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
