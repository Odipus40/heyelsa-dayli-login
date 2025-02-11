const axios = require('axios');
const readline = require('readline');
require('colors');
require('dotenv').config(); // Load variabel dari .env

const API_LOGIN = 'https://app.heyelsa.ai/login';
const API_POINTS = 'https://app.heyelsa.ai/api/points';
const API_HISTORY = 'https://app.heyelsa.ai/api/points_history';
const WAIT_TIME = 24 * 60 * 60 * 1000; // 24 jam dalam milidetik

// Fungsi untuk mendapatkan waktu dalam format yang lebih rapi
function getFormattedTime() {
  return new Date().toLocaleString('id-ID', { hour12: false });
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const login = async () => {
    console.log(`\n⏳ [${getFormattedTime()}] Starting login process...`);

    const cookie = process.env.COOKIE; // Mengambil cookies dari .env
    if (!cookie) {
        console.error(`⚠️ [${getFormattedTime()}] Tidak ada cookies yang diterima.`);
        return null;
    }

    try {
        const response = await axios.get(API_LOGIN, {
            headers: {
                'Cookie': cookie,
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json, text/html',
            }
        });

        if (response.status === 200) {
            console.log(`✅ [${getFormattedTime()}] Login successful!!!`);
            return cookie; // Mengembalikan cookies untuk digunakan
        } else {
            console.error(`⚠️ [${getFormattedTime()}] Login berhasil tetapi status bukan 200: ${response.status}`);
            return null;
        }
    } catch (error) {
        console.error(`❌ [${getFormattedTime()}] Login Failed!!!: ${error.message}`);
        return null;
    }
};

async function checkPoints(cookie) {
  console.log(`📊 [${getFormattedTime()}] Mengecek jumlah poin...\n`.blue);

  try {
    if (!cookie) {
      console.log('⚠️ Tidak ada cookies, tidak bisa mengecek poin.'.red);
      return;
    }

    const response = await axios.post(API_POINTS, {
      headers: {
        'Cookie': cookie,
      },
    });

    if (response.data?.points) {
      console.log(`✅ [${getFormattedTime()}] Jumlah Poin: ${response.data.points}`.green.bold);
    } else {
      console.log('❌ Gagal mendapatkan jumlah poin.'.red);
    }
  } catch (error) {
    console.error(`⚠️ [${getFormattedTime()}] Error saat mengecek poin:`, error.response?.data || error.message);
  }
}

async function checkHistory(cookie) {
  console.log(`📜 [${getFormattedTime()}] Mengecek riwayat poin...\n`.blue);

  try {
    if (!cookie) {
      console.log('⚠️ Tidak ada cookies, tidak bisa mengecek riwayat poin.'.red);
      return;
    }

    const response = await axios.post(API_HISTORY, {
      headers: {
        'Cookie': cookie,
      },
    });

    if (response.data?.history) {
      console.log(`✅ [${getFormattedTime()}] Riwayat Poin:`.green.bold);
      response.data.history.forEach((entry, index) => {
        console.log(`${index + 1}. ${entry.description} - ${entry.points} poin`);
      });
    } else {
      console.log('❌ Gagal mendapatkan riwayat poin.'.red);
    }
  } catch (error) {
    console.error(`⚠️ [${getFormattedTime()}] Error saat mengecek riwayat poin:`, error.response?.data || error.message);
  }
}

async function startRoutine() {
  const cookie = await login();
  if (!cookie) return;

  await checkPoints(cookie);
  await checkHistory(cookie);

  console.log(`\n⏳ [${getFormattedTime()}] Menunggu 24 jam sebelum mengecek kembali...\n`.yellow);
  await new Promise((resolve) => setTimeout(resolve, WAIT_TIME));
}

startRoutine();
