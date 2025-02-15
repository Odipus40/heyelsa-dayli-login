const puppeteer = require("puppeteer"); 
const fs = require("fs");
const axios = require("axios");

// Fungsi untuk mendapatkan timestamp
function getCurrentTimestamp() {
  return new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
}

const HEYELSA_URL = "https://app.heyelsa.ai/login";
const POINTS_API_URL = "https://app.heyelsa.ai/api/points";
const DEFAULT_SLEEP_TIME = 24 * 60 * 60 * 1000; // 24 jam
const RANDOM_EXTRA_DELAY = () => Math.floor(Math.random() * (10 - 5 + 1) + 5) * 60 * 1000; // 5-10 menit delay acak

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Fungsi untuk membaca file data.txt dan mengambil cookie & evm_address
function loadData(file) {
  try {
    const lines = fs.readFileSync(file, "utf8").split("\n").map(line => line.trim()).filter(Boolean);
    if (lines.length % 2 !== 0) {
      console.log("⚠️ Format data.txt salah! Pastikan setiap akun memiliki 2 baris (cookie & evm_address).");
      return [];
    }
    return lines.reduce((acc, val, i) => {
      if (i % 2 === 0) acc.push({ cookie: val, evm_address: lines[i + 1] });
      return acc;
    }, []);
  } catch (error) {
    console.log(`⚠️ Tidak dapat menemukan file ${file}`);
    return [];
  }
}

// Fungsi untuk login dan mendapatkan total poin
async function runAccount({ cookie, evm_address }) {
  try {
    console.log(`⏳ [${getCurrentTimestamp()}] Memulai login...`);
    const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();

    await page.setCookie({ name: "session-token", value: cookie.trim(), domain: "app.heyelsa.ai", path: "/", secure: true, httpOnly: true });
    await page.goto(HEYELSA_URL, { waitUntil: "networkidle2", timeout: 60000 });

    const loginFailed = await page.$("input[name='email'], input[type='password']");
    if (loginFailed) {
      console.error(`❌ [${getCurrentTimestamp()}] Login gagal, kemungkinan cookie expired!`);
      await browser.close();
      return;
    }

    console.log(`✅ [${getCurrentTimestamp()}] Login berhasil.`);
    await getTotalPoints(cookie, evm_address);
    await browser.close();
  } catch (error) {
    console.error(`❌ [${getCurrentTimestamp()}] Error:`, error);
  }
}

// Fungsi untuk mengambil total poin dari API
const getTotalPoints = async (cookie, evm_address) => {
  console.log(`💰 [${getCurrentTimestamp()}] Points your address: ${evm_address}...`);
  try {
    const response = await axios.post(POINTS_API_URL, { evm_address }, {
      headers: { 'Cookie': `session-token=${cookie.trim()}`, 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json', 'Content-Type': 'application/json' }
    });

    if (response.headers["content-type"] && !response.headers["content-type"].includes("application/json")) {
      console.error("⚠️ Respon API bukan JSON. Mungkin token expired.");
      return;
    }

    if (response.status === 200 && response.data && typeof response.data === "object" && "points" in response.data) {
      console.log(`🎯 Current Points Total: ${response.data.points}`);
    } else {
      console.error(`⚠️ Gagal mengambil total poin, status: ${response.status}`);
    }
  } catch (error) {
    console.error(`❌ Terjadi kesalahan saat mengambil total poin:`, error.response?.data || error.message);
  }
};

// Loop utama untuk menjalankan bot
(async () => {
  console.log(`🚀 [${getCurrentTimestamp()}] Memulai bot HeyElsa...`);
  const accounts = loadData("data.txt");

  while (true) {
    try {
      console.log(`🔄 [${getCurrentTimestamp()}] Memulai siklus baru...`);
      for (let account of accounts) {
        await runAccount(account);
      }
    } catch (error) {
      console.error(`❌ [${getCurrentTimestamp()}] Terjadi kesalahan:`, error);
    }

    const extraDelay = RANDOM_EXTRA_DELAY();
    console.log(`🛌 [${getCurrentTimestamp()}] Tidur selama 24 jam + delay ${extraDelay / 60000} menit...`);
    await delay(DEFAULT_SLEEP_TIME + extraDelay);
  }
})();
