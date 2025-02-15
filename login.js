const puppeteer = require("puppeteer"); 
const fs = require("fs");
const axios = require("axios");
const readline = require("readline");
require("colors");
const { displayHeader } = require("./helpers"); // Import fungsi dari helpers.js

const HEYELSA_URL = "https://app.heyelsa.ai/login";
const pointsUrl = "https://app.heyelsa.ai/api/points"; // API total poin
const DEFAULT_SLEEP_TIME = 24 * 60 * 60 * 1000; // 24 jam
const RANDOM_EXTRA_DELAY = () => Math.floor(Math.random() * (10 - 5 + 1) + 5) * 60 * 1000; // 5-10 menit delay acak

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getCurrentTimestamp() {
  return new Date().toLocaleString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
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

async function getTotalPoints(cookie, evm_address) {
  console.log(`\n💰 [${getCurrentTimestamp()}] Points your address: ${evm_address}...`);
  
  try {
    const response = await axios.post(pointsUrl, 
      { evm_address }, // Payload dengan evm_address
      {
        headers: {
          'Cookie': cookie,
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      }
    );

    if (response.status === 200) {
      const totalPoints = response.data.points; // FIX: Mengambil dari 'points' bukan 'total_points'
      console.log(`🎯 Current Points Total: ${totalPoints}`);
    } else {
      console.error(`⚠️ Gagal mengambil total poin, status: ${response.status}`);
    }
  } catch (error) {
    console.error(`❌ Terjadi kesalahan saat mengambil total poin:`, error.response?.data || error.message);
  }
}

(async () => {
  displayHeader(); // Menampilkan header dari helpers.js
  console.log(`🚀 [${getCurrentTimestamp()}] Memulai bot HeyElsa...`);
  const data = loadData("data.txt");
  
  while (true) {
    try {
      console.log(`🔄 [${getCurrentTimestamp()}] Memulai siklus baru...`);
      for (let i = 0; i < data.length; i += 2) {
        const cookie = data[i];
        const evm_address = data[i + 1] || ""; // Pastikan evm_address ada
        await runAccount(cookie, evm_address);
      }
    } catch (error) {
      console.error(`❌ [${getCurrentTimestamp()}] Terjadi kesalahan:`, error);
    }

    const extraDelay = RANDOM_EXTRA_DELAY();
    console.log(`🛌 [${getCurrentTimestamp()}] Tidur selama 24 jam + delay ${extraDelay / 60000} menit...`);
    await delay(DEFAULT_SLEEP_TIME + extraDelay);
  }
})();

async function runAccount(cookie, evm_address) {
  try {
    console.log(`⏳ [${getCurrentTimestamp()}] Memulai login...`);
    
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

    console.log(`✅ [${getCurrentTimestamp()}] Login berhasil.`);
    
    // Ambil total poin setelah login
    await getTotalPoints(cookie, evm_address);

    await browser.close();
  } catch (error) {
    console.error(`❌ [${getCurrentTimestamp()}] Error:`, error);
  }
}
