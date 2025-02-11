const axios = require('axios');
const readline = require('readline');
require('colors');

const API_LOGIN = 'https://app.heyelsa.ai/login'; // Endpoint login
const API_CHECKIN = 'https://app.heyelsa.ai/api/points'; // Endpoint check-in
const API_TASKS = 'https://app.heyelsa.ai/api/points_history'; // Endpoint klaim poin
const WAIT_TIME = 24 * 60 * 60 * 1000; // 24 jam dalam milidetik

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const login = async () => {
    console.log(`\n⏳ [${getFormattedTime()}] Starting login process...`);

    try {
        const response = await axios.get(loginUrl, {
            headers: {
                'Cookie': cookie,
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json, text/html',
            }
        });

        if (response.status === 200) {
            console.log(`✅ [${getFormattedTime()}] Login successful!!!`);
        } else {
            console.error(`⚠️ [${getFormattedTime()}] Login berhasil tetapi status bukan 200: ${response.status}`);
        }
    } catch (error) {
        console.error(`❌ [${getFormattedTime()}] Login Failed!!!: ${error.message}`);
    }
};

async function checkIn(cookies) {
  console.log('🚀 Memulai check-in harian...\n'.blue);

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
      console.log(`✅ Check-in berhasil! 🎉 Poin diperoleh: ${response.data.points}`.green.bold);
    } else {
      console.log('❌ Check-in gagal! Coba lagi nanti.'.red);
    }
  } catch (error) {
    console.error('⚠️ Error saat check-in:', error.response?.data || error.message);
  }
}

async function claimTasks(cookies) {
  console.log('🎯 Mengklaim poin dari tugas...\n'.blue);

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
      console.log(`🏆 Poin tambahan berhasil diklaim! 🎉 Total: ${response.data.points}`.green.bold);
    } else {
      console.log('❌ Gagal mengklaim poin dari tugas.'.red);
    }
  } catch (error) {
    console.error('⚠️ Error saat klaim poin:', error.response?.data || error.message);
  }
}

async function startDailyRoutine(walletAddress) {
  while (true) {
    const cookies = await login(walletAddress);
    if (!cookies) {
      console.log('❌ Gagal mendapatkan cookies. Coba lagi nanti.'.red);
      return;
    }

    await checkIn(cookies);
    await claimTasks(cookies);

    console.log('\n⏳ Menunggu 24 jam sebelum check-in dan klaim poin berikutnya...\n'.yellow);
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
