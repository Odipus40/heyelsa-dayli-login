const puppeteer = require("puppeteer"); 
const fs = require("fs");
const axios = require("axios");

const HEYELSA_URL = "https://app.heyelsa.ai/login";
const DEFAULT_SLEEP_TIME = 24 * 60 * 60 * 1000; // 24 jam
const RANDOM_EXTRA_DELAY = () => Math.floor(Math.random() * (10 - 5 + 1) + 5) * 60 * 1000; // 5-10 menit delay acak

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getCurrentTimestamp() {
  const now = new Date();
  return now.toISOString().replace("T", " ").substring(0, 19); // Format YYYY-MM-DD HH:MM:SS
}

function logMessage(message) {
  const timestamp = getCurrentTimestamp();
  console.log(`[${timestamp}] ${message}`);
  fs.appendFileSync("points_log.txt", `[${timestamp}] ${message}\n`);
}

function loadData(file) {
  try {
    const datas = fs.readFileSync(file, "utf8").split("\n").filter(Boolean);
    return datas;
  } catch (error) {
    logMessage(`⚠️ Tidak dapat menemukan file ${file}`);
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

    logMessage("✅ Login berhasil.");
    await browser.close();
  } catch (error) {
    logMessage("❌ Error: " + error);
  }
}

const getTotalPoints = async () => {
    logMessage(`\n💰 Points your address: ${evm_address}...`);

    try {
        const response = await axios.post(pointsUrl, 
            { evm_address },
            {
                headers: {
                    'Cookie': cookie,
                    'User-Agent': 'Mozilla/5.0',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            }
        );

        logMessage("🔍 Debug Response: " + JSON.stringify(response.data));

        if (response.status === 200) {
            const totalPoints = response.data.points;
            logMessage(`🎯 Current Points Total: ${totalPoints}`);
        } else {
            logMessage(`⚠️ Gagal mengambil total poin, status: ${response.status}`);
        }
    } catch (error) {
        logMessage(`❌ Terjadi kesalahan saat mengambil total poin: ${error.response?.data || error.message}`);
    }
};

const getPointHistory = async () => {
    logMessage(`\n📌 History your address: ${evm_address}...`);

    try {
        const response = await axios.post(historyUrl, 
            { params: { evm_address } },
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
            const data = response.data;

            if (data.points_details && Array.isArray(data.points_details)) {
                logMessage("🔹 Riwayat Poin:");
                data.points_details.forEach((entry, index) => {
                    logMessage(`   ${index + 1}. ${entry.activity_type} - ${entry.points} poin pada ${entry.created_at_utc}`);
                });
            } else {
                logMessage(`⚠️ History poin tidak ditemukan atau tidak dalam format yang diharapkan.`);
            }
        } else {
            logMessage(`⚠️ Gagal mengambil history poin, status: ${response.status}`);
        }
    } catch (error) {
        logMessage(`❌ Terjadi kesalahan saat mengambil history poin: ${error.response?.data || error.message}`);
    }
};

(async () => {
  logMessage("🚀 Memulai bot HeyElsa...");
  const data = loadData("cookies.txt");

  while (true) {
    try {
      logMessage("🔄 Memulai siklus baru...");
      for (let i = 0; i < data.length; i++) {
        const cookie = data[i];
        logMessage(`🔹 Memproses akun ke-${i + 1}`);
        await runAccount(cookie);
      }
    } catch (error) {
      logMessage("❌ Terjadi kesalahan: " + error);
    }

    const extraDelay = RANDOM_EXTRA_DELAY();
    logMessage(`🛌 Tidur selama 24 jam + delay ${extraDelay / 60000} menit...`);
    await delay(DEFAULT_SLEEP_TIME + extraDelay);
  }
})();
