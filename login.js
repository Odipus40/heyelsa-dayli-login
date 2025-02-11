const axios = require('axios');
const readline = require('readline');
require('colors');

const API_LOGIN = 'https://app.heyelsa.ai/login'; // Ubah sesuai endpoint login
const API_CHECKIN = 'https://app.heyelsa.ai/api/points'; // Endpoint untuk check-in
const API_TASKS = 'https://app.heyelsa.ai/api/points_history'; // Endpoint klaim poin dari tugas
const WAIT_TIME = 24 * 60 * 60 * 1000; // 24 jam dalam milidetik

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function login(walletAddress) {
  console.log('\n🔑 Melakukan login ke HeyElsa...'.blue);

  try {
    const payload = { walletAddress };
    const response = await axios.post(API_LOGIN, payload, {
      headers: { 'Content-Type': 'application/json' },
    });

    console.log('📢 Response Headers:', response.headers); // Debugging
    console.log('📢 Response Data:', response.data); // Debugging

    const cookies = response.headers['set-cookie']; // Ambil cookies dari header
    if (!cookies) {
      console.log('❌ Tidak ada cookies yang dikembalikan.'.red);
      return null;
    }

    console.log('✅ Login berhasil! Cookies diterima.'.green);
    return cookies;
  } 
    
    catch (error) {
    console.error('⚠️ Error saat login:', error.response?.data || error.message);
    return null;
  }
}
 
    if (response.data.success) {
      console.log('✅ Login berhasil!'.green.bold);
      console.log(`🎟️ Token: ${response.data.token.substring(0, 50)}...`);
      return response.headers['set-cookie'];
    } else {
      console.log('❌ Login gagal!'.red);
      return null;
    }
  } catch (error) {
    console.error('⚠️ Error saat login:', error.response?.data || error.message);
    return null;
  }
}

async function checkIn(cookies) {
  console.log('🚀 Memulai check-in harian...\n'.blue);

  try {
    const cookieHeader = cookies.join('; ');

    const response = await axios.post(API_CHECKIN, {}, {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
      },
    });

    if (response.data.success) {
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
    const cookieHeader = cookies.join('; ');

    const response = await axios.post(API_TASKS, {}, {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
      },
    });

    if (response.data.success) {
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
  
