const axios = require('axios');
const readline = require('readline');
require('colors');

const API_LOGIN = 'https://app.heyelsa.ai/login'; // Endpoint login
const API_POINTS = 'https://app.heyelsa.ai/api/points'; // Endpoint cek jumlah poin
const API_POINTS_HISTORY = 'https://app.heyelsa.ai/api/points_history'; // Endpoint cek riwayat poin

// Fungsi untuk mendapatkan waktu dalam format yang lebih rapi
function getFormattedTime() {
  const now = new Date();
  return now.toLocaleString('id-ID', { hour12: false });
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const login = async () => {
    console.log(`\n⏳ [${getFormattedTime()}] Starting login process...`);

    try {
        const response = await axios.get(API_LOGIN, {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json, text/html',
            }
        });

        if (response.status === 200) {
            console.log(`✅ [${getFormattedTime()}] Login successful!!!`);
            
            // Ambil cookies dari response header
            const cookies = response.headers['set-cookie'];
            if (cookies) {
                console.log(`🍪 [${getFormattedTime()}] Cookies diterima!`);
                return cookies; // Kembalikan cookies ke fungsi pemanggil
            } else {
                console.log(`⚠️ [${getFormattedTime()}] Tidak ada cookies yang diterima.`);
            }
        } else {
            console.error(`⚠️ [${getFormattedTime()}] Login berhasil tetapi status bukan 200: ${response.status}`);
        }
    } catch (error) {
        console.error(`❌ [${getFormattedTime()}] Login Failed!!!: ${error.message}`);
    }
    return null; // Jika gagal, tetap lanjut tanpa menghentikan proses
};

// Fungsi untuk mengecek jumlah poin
async function checkPoints(cookies) {
  console.log(`📊 [${getFormattedTime()}] Mengecek jumlah poin...\n`.blue);

  try {
    if (!cookies) {
      console.log('⚠️ Tidak ada cookies, tidak bisa mengecek poin.'.yellow);
      return;
    }

    const cookieHeader = cookies.join('; ');

    const response = await axios.get(API_POINTS, {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
      },
    });

    if (response.data?.points !== undefined) {
      console.log(`🎯 [${getFormattedTime()}] Total Poin: ${response.data.points}`.green.bold);
    } else {
      console.log('❌ Gagal mendapatkan jumlah poin.'.red);
    }
  } catch (error) {
    console.error(`⚠️ [${getFormattedTime()}] Error saat mengecek poin:`, error.response?.data || error.message);
  }
}

// Fungsi untuk mengecek riwayat poin
async function checkPointsHistory(cookies) {
  console.log(`📜 [${getFormattedTime()}] Mengecek riwayat poin...\n`.blue);

  try {
    if (!cookies) {
      console.log('⚠️ Tidak ada cookies, tidak bisa mengecek riwayat poin.'.yellow);
      return;
    }

    const cookieHeader = cookies.join('; ');

    const response = await axios.get(API_POINTS_HISTORY, {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
      },
    });

    if (response.data?.history) {
      console.log(`📌 [${getFormattedTime()}] Riwayat Poin:`);
      response.data.history.forEach((entry, index) => {
        console.log(`${index + 1}. ${entry.description}: ${entry.points} poin`);
      });
    } else {
      console.log('❌ Gagal mendapatkan riwayat poin.'.red);
    }
  } catch (error) {
    console.error(`⚠️ [${getFormattedTime()}] Error saat mengecek riwayat poin:`, error.response?.data || error.message);
  }
}

// Fungsi utama untuk menjalankan proses
async function startProcess(walletAddress) {
  const cookies = await login(walletAddress);

  await checkPoints(cookies);
  await checkPointsHistory(cookies);
}

rl.question('💳 Masukkan alamat wallet HeyElsa: '.cyan, (walletAddress) => {
  if (!walletAddress) {
    console.log('⚠️ Alamat wallet tidak boleh kosong!'.red.bold);
    rl.close();
    return;
  }

  rl.close();
  startProcess(walletAddress);
});
