const puppeteer = require("puppeteer"); 
const fs = require("fs");

const HEYELSA_URL = "https://app.heyelsa.ai/";
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
  async function getPoints(page) {
    try {
      const response = await page.evaluate(async () => {
        const res = await fetch("https://app.heyelsa.ai/api/points", {
          credentials: "include"
        });
        return res.ok ? await res.json() : null;
      });
      return response ? response.points : "Unknown";
    } catch (error) {
      console.error("❌ Gagal mengambil points:", error);
      return "Unknown";
    }
  }
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

    console.log(`✅ [${new Date().toLocaleString()}] Login berhasil.`);
    const points = await getPoints(page);
    console.log(`⭐ [${new Date().toLocaleString()}] Current Points: ${points}`);

    await browser.close();
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

(async () => {
  console.log(`🚀 [${new Date().toLocaleString()}] Memulai bot HeyElsa...`);
  const data = loadData("cookies.txt");

  while (true) {
    try {
      console.log(`🔄 [${new Date().toLocaleString()}] Memulai siklus baru...`);
      for (let i = 0; i < data.length; i++) {
        const cookie = data[i];
        await runAccount(cookie);
      }
    } catch (error) {
      console.error("❌ Terjadi kesalahan:", error);
    }

    const extraDelay = RANDOM_EXTRA_DELAY();
    console.log(`🛌 [${new Date().toLocaleString()}] Tidur selama 24 jam + delay ${extraDelay / 60000} menit...`);
    await delay(DEFAULT_SLEEP_TIME + extraDelay);
  }
})();
