const axios = require('axios');
const readline = require('readline');
require('colors');

const API_LOGIN = 'https://app.heyelsa.ai/login'; // Pastikan endpoint benar
const API_CHECKIN = 'https://app.heyelsa.ai/api/points'; // Endpoint check-in
const API_TASKS = 'https://app.heyelsa.ai/api/points_history'; // Endpoint klaim poin
const WAIT_TIME = 24 * 60 * 60 * 1000; // 24 jam dalam milidetik

// Fungsi untuk mendapatkan waktu dalam format yang lebih rapi
function getFormattedTime() {
  const now = new Date();
  return now.toLocaleString('id-ID', { hour12: false });
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const login = async (walletAddress) => {
    console.log(`\n⏳ [${getFormattedTime()}] Starting login process...`.yellow);

    try {
        const response = await axios.post(API_LOGIN, { wallet: walletAddress }, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json',
            }
        });

        console.log('📢 Response Headers:', response.headers); // Debugging
        console.log('📢 Response Data:', response.data); // Debugging

        // Mencoba mendapatkan cookies
        let cookies = response.headers['set-cookie'];
        if (!cookies) {
            console.log(`⚠️ [${getFormattedTime()}] Tidak ada cookies yang dikembalikan, mencoba token...`.red);
            
            // Coba ambil token dari response body jika tersedia
            if (response.data?.token) {
                cookies = [`token=${response.data.token}`];
                console.log(`✅ [${getFormattedTime()}] Token ditemukan dan digunakan sebagai cookies!`.green);
            }
        }

        if (!cookies) {
            console.log(`❌ [${getFormattedTime()}] Gagal mendapatkan cookies/token.`.red);
            return null;
        }

        console.log(`✅ [${getFormattedTime()}] Login berhasil!`.green);
        return cookies;
    } catch (error) {
        console.error(`❌ [${getFormattedTime()}] Login gagal!`, error.response?.data || error.message);
        return null;
    }
};

async function checkIn(cookies) {
  console.log(`🚀 [${getFormattedTime()}] Memulai check-in harian...\n`.blue);

  try {
    if (!cookies) {
      console.log('❌ Tidak ada cookies. Tidak bisa check-in.'.red);
      return;
    }

    const cookieHeader = cookies.join('; ');

    const response = await axios.post(API_CHECKIN, {}, {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
      },
    });

    if (response.data?.success) {
      console.log(`✅ [${getFormattedTime()}] Check-in berhasil! 🎉 Poin diperoleh: ${response.data.points}`.green.bold);
    } else {
      console.log('❌ Check-in gagal! Coba lagi nanti.'.red);
    }
  } catch (error) {
    console.error(`⚠️ [${getFormattedTime()}] Error saat check-in:`, error.response?.data || error.message);
  }
}

async function claimTasks(cookies) {
  console.log(`🎯 [${getFormattedTime()}] Mengklaim poin dari tugas...\n`.blue);

  try {
    if (!cookies) {
      console.log('❌ Tidak ada cookies. Tidak bisa klaim tugas.'.red);
      return;
    }

    const cookieHeader = cookies.join('; ');

    const response = await axios.post(API_TASKS, {}, {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
      },
    });

    if (response.data?.success) {
      console.log(`🏆 [${getFormattedTime()}] Poin tambahan berhasil diklaim! 🎉 Total: ${response.data.points}`.green.bold);
    } else {
      console.log('❌ Gagal mengklaim poin dari tugas.'.red);
    }
  } catch (error) {
    console.error(`⚠️ [${getFormattedTime()}] Error saat klaim poin:`, error.response?.data || error.message);
  }
}

async function startDailyRoutine(walletAddress) {
  while (true) {
    const cookies = await login(walletAddress);
    if (!cookies) {
      console.log(`❌ [${getFormattedTime()}] Gagal mendapatkan cookies/token. Coba lagi nanti.`.red);
      return;
    }

    await checkIn(cookies);
    await claimTasks(cookies);

    console.log(`\n⏳ [${getFormattedTime()}] Menunggu 24 jam sebelum check-in dan klaim poin berikutnya...\n`.yellow);
    await new Promise((resolve) => setTimeout(resolve, WAIT_TIME));
  }
}

rl.question('💳 Masukkan alamat wallet HeyElsa: '.cyan, (walletAddress) => {
  if (!walletAddress) {
    console.log('⚠️ Alamat wallet tidak boleh kosong!'.red.bold);
    rl.close();
    return;
  }

  rl.close();
  startDailyRoutine(walletAddress);
});
