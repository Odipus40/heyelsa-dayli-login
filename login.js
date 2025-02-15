const puppeteer = require("puppeteer"); 
const fs = require("fs");
const axios = require("axios");

const HEYELSA_URL = "https://app.heyelsa.ai/login";
const pointsUrl = "https://app.heyelsa.ai/api/points"; // API total poin
const DEFAULT_SLEEP_TIME = 24 * 60 * 60 * 1000; // 24 jam
const RANDOM_EXTRA_DELAY = () => Math.floor(Math.random() * (10 - 5 + 1) + 5) * 60 * 1000; // 5-10 menit delay acak

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getCurrentTimestamp() {
  const now = new Date();
  return now.toLocaleString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
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
          "Cookie": cookie,
          "User-Agent": "Mozilla/5.0",
          "Accept": "application/json",
          "Content-Type": "application/json",
        }
      }
    );

    console.log("🔍 Debug Response:", response.data); // Debug untuk melihat isi response API

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

async function runAccount(cookie) {
  try {
    console.log(`[${getCurrentTimestamp()}] ⏳ Memulai login...`);
    
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

    console.log(`[${getCurrentTimestamp()}] ✅ Login berhasil.`);

    // Tunggu sebelum mencoba mengambil evm_address
    await page.waitForTimeout(5000);
    
    // Coba ambil evm_address dari localStorage atau cookie
    const evm_address = await page.evaluate(() => {
      return window.localStorage.getItem("evm_address") || document.cookie.match(/evm_address=([^;]+)/)?.[1] || null;
    });

    if (evm_address) {
      await getTotalPoints(cookie, evm_address);
    } else {
      console.log(`⚠️ Tidak dapat menemukan evm_address.`);
    }

    await browser.close();
  } catch (error) {
    console.error(`[${getCurrentTimestamp()}] ❌ Error:`, error);
  }
}

(async () => {
  console.log(`[${getCurrentTimestamp()}] 🚀 Memulai bot HeyElsa...`);
  const data = loadData("data.txt");

  if (data.length > 0) {
    await runAccount(data[0]);
  } else {
    console.log(`[${getCurrentTimestamp()}] ⚠️ Tidak ada data untuk login.`);
  }

  const extraDelay = RANDOM_EXTRA_DELAY();
  console.log(`[${getCurrentTimestamp()}] 🛌 Tidur selama 24 jam + delay ${extraDelay / 60000} menit...`);
  await delay(DEFAULT_SLEEP_TIME + extraDelay);
})();
