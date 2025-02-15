const puppeteer = require("puppeteer"); 
const fs = require("fs");
const axios = require("axios");
const { getCurrentTimestamp } = require("./helpers");

const HEYELSA_URL = "https://app.heyelsa.ai/login";
const POINTS_API_URL = "https://app.heyelsa.ai/api/points";

const DEFAULT_SLEEP_TIME = 24 * 60 * 60 * 1000; // 24 jam
const RANDOM_EXTRA_DELAY = () => Math.floor(Math.random() * (10 - 5 + 1) + 5) * 60 * 1000; // 5-10 menit delay acak

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function loadData(file) {
  try {
    const lines = fs.readFileSync(file, "utf8").split("\n").map(line => line.trim()).filter(Boolean);
    
    if (lines.length % 2 !== 0) {
      console.log("⚠️ Format data.txt salah! Pastikan setiap akun memiliki 2 baris (cookie & evm_address).");
      return [];
    }
    
    const accounts = [];
    for (let i = 0; i < lines.length; i += 2) {
      accounts.push({ cookie: lines[i], evm_address: lines[i + 1] });
    }
    return accounts;
  } catch (error) {
    console.log(`⚠️ Tidak dapat menemukan file ${file}`);
    return [];
  }
}

async function runAccount({ cookie, evm_address }) {
  try {
    console.log(`⏳ [${getCurrentTimestamp()}] Memulai login...`);

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    await page.setCookie({
      name: "session-token",
      value: cookie.trim(),
      domain: "app.heyelsa.ai",
      path: "/",
      secure: true,
      httpOnly: true,
    });

    await page.goto(HEYELSA_URL, { waitUntil: "networkidle2", timeout: 60000 });

    const loginFailed = await page.$("input[name='email'], input[type='password'], .error-message");
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

const getTotalPoints = async (cookie, evm_address) => {
  console.log(`💰 [${getCurrentTimestamp()}] Points your address: ${evm_address}...`);

  try {
    const response = await axios.post(POINTS_API_URL, { evm_address }, {
      headers: {
        'Cookie': `session-token=${cookie.trim()}`,
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    
    try {
      const data = response.data;
      if (!data || typeof data !== "object") {
        throw new Error("Respon bukan JSON valid.");
      }
      if ("points" in data) {
        console.log(`🎯 Current Points Total: ${data.points}`);
      } else {
        console.error("⚠️ Data API tidak memiliki 'points', cek respons server.");
      }
    } catch (err) {
      console.error(`❌ Gagal parsing JSON:`, err.message);
    }
  } catch (error) {
    if (error.response) {
      console.error(`❌ Terjadi kesalahan saat mengambil total poin:`, error.response.data);
    } else {
      console.error(`❌ Request gagal:`, error.message);
    }
  }
};

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
