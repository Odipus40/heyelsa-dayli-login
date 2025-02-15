const puppeteer = require("puppeteer"); 
const fs = require("fs");

const HEYELSA_URL = "https://app.heyelsa.ai/login";
const DEFAULT_SLEEP_TIME = 24 * 60 * 60 * 1000; // 24 jam
const RANDOM_EXTRA_DELAY = () => Math.floor(Math.random() * (10 - 5 + 1) + 5) * 60 * 1000; // 5-10 menit delay acak

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function loadData(file) {
  try {
    const datas = fs.readFileSync(file, "utf8").split("\n").filter(Boolean);
    return datas;
  } catch (error) {
    console.log(`⚠️ Tidak dapat menemukan file ${file}`);
    return [];
  }
}

async function runAccount(cookie) {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    await page.setCookie({
      name: "session-token",
      value: cookie,
      domain: "app.heyelsa.ai",
      path: "/",
      secure: true,
      httpOnly: true,
    });

    await page.goto(HEYELSA_URL, { waitUntil: "networkidle2", timeout: 60000 });

    console.log("✅ Login berhasil.");

    await browser.close();
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

(async () => {
  console.log("🚀 Memulai bot HeyElsa...");
  const data = loadData("cookies.txt");

  while (true) {
    try {
      console.log("🔄 Memulai siklus baru...");
      for (let i = 0; i < data.length; i++) {
        const cookie = data[i];
        await runAccount(cookie);
      }
    } catch (error) {
      console.error("❌ Terjadi kesalahan:", error);
    }

    const extraDelay = RANDOM_EXTRA_DELAY();
    console.log(`🛌 Tidur selama 24 jam + delay ${extraDelay / 60000} menit...`);
    await delay(DEFAULT_SLEEP_TIME + extraDelay);
  }
})();
