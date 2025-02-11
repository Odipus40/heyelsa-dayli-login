const puppeteer = require('puppeteer');
const axios = require('axios');
const readline = require('readline');
require('colors');

const API_CHECKIN = 'https://app.heyelsa.ai/'; // Gantilah jika endpoint berbeda
const WAIT_TIME = 24 * 60 * 60 * 1000; // 24 jam dalam milidetik

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function loginAndGetCookies(walletAddress) {
  console.log('\n🔑 Membuka browser untuk login ke HeyElsa...\n'.blue);

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://app.heyelsa.ai/login', { waitUntil: 'networkidle2' });

  console.log('📝 Memasukkan alamat wallet...'.yellow);
  await page.type('input[name="wallet"]', walletAddress, { delay: 50 });

  console.log('🔘 Mengklik tombol login...'.yellow);
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle2' }),
  ]);

  console.log('✅ Login sukses! Mengambil cookies...'.green.bold);
  const cookies = await page.cookies();

  await browser.close();

  if (cookies.length > 0) {
    console.log(`🍪 Cookies berhasil diambil: ${JSON.stringify(cookies).substring(0, 50)}...`);
    return cookies;
  } else {
    console.log('❌ Gagal mendapatkan cookies!'.red);
    return null;
  }
}

async function checkIn(cookies) {
  console.log('🚀 Memulai proses check-in harian...\n'.blue);

  try {
    // Mengonversi cookies ke format yang bisa digunakan oleh Axios
    const cookieHeader = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');

    const response = await axios.post(API_CHECKIN, {}, {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader, // Menggunakan cookies untuk autentikasi
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

async function startDailyCheckIn(walletAddress) {
  while (true) {
    const cookies = await loginAndGetCookies(walletAddress);
    if (!cookies) {
      console.log('❌ Gagal mendapatkan cookies. Coba lagi nanti.'.red);
      return;
    }

    await checkIn(cookies);

    console.log('\n⏳ Menunggu 24 jam sebelum check-in berikutnya...\n'.yellow);
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
  startDailyCheckIn(walletAddress);
});
