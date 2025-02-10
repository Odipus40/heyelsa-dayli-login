require('dotenv').config();
const axios = require('axios');

const loginUrl = 'https://app.heyelsa.ai/login'; // Pastikan URL benar
const historyUrl = 'https://app.heyelsa.ai/api/points/'; // Cek di Network DevTools jika berbeda
const leaderboardUrl = 'https://app.heyelsa.ai/api/leaderboard'; // Cek di Network DevTools jika berbeda

const cookie = process.env.COOKIE;

if (!cookie) {
    console.error("❌ Cookie tidak ditemukan. Pastikan file .env telah diisi.");
    process.exit(1);
}

// Fungsi untuk mendapatkan waktu saat ini (WIB)
const getFormattedTime = () => {
    return new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
};

// Fungsi login
const login = async () => {
    console.log(`\n⏳ [${getFormattedTime()}] Memulai proses login...`);

    try {
        const response = await axios.get(loginUrl, {
            headers: {
                'Cookie': cookie,
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json, text/html',
            }
        });

        if (response.status === 200) {
            console.log(`✅ [${getFormattedTime()}] Login berhasil!`);
        } else {
            console.error(`⚠️ [${getFormattedTime()}] Login berhasil tetapi status bukan 200: ${response.status}`);
        }
    } catch (error) {
        if (error.response) {
            console.error(`❌ [${getFormattedTime()}] Login gagal: ${error.response.status}`, error.response.data);
        } else {
            console.error(`❌ [${getFormattedTime()}] Terjadi kesalahan:`, error.message);
        }
    }
};

// Fungsi untuk mendapatkan history poin
const getPointHistory = async () => {
    console.log(`\n📌 [${getFormattedTime()}] Mengambil history poin...`);

    try {
        const response = await axios.get(historyUrl, {
            headers: {
                'Cookie': cookie,
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json',
            }
        });

        if (response.status === 200) {
            console.log("🔹 History Poin:");
            response.data.history.forEach((entry, index) => {
                console.log(`   ${index + 1}. ${entry.date} - ${entry.points} poin`);
            });

            console.log(`\n💰 Total Poin: ${response.data.totalPoints}`);
        } else {
            console.error(`⚠️ Gagal mengambil history poin, status: ${response.status}`);
        }
    } catch (error) {
        console.error(`❌ Terjadi kesalahan saat mengambil history poin:`, error.message);
    }
};

// Fungsi untuk mendapatkan leaderboard
const getLeaderboard = async () => {
    console.log(`\n🏆 [${getFormattedTime()}] Mengambil leaderboard...`);

    try {
        const response = await axios.get(leaderboardUrl, {
            headers: {
                'Cookie': cookie,
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json',
            }
        });

        if (response.status === 200) {
            console.log("🔹 Leaderboard:");
            response.data.leaderboard.forEach((user, index) => {
                console.log(`   ${index + 1}. ${user.username} - ${user.points} poin`);
            });
        } else {
            console.error(`⚠️ Gagal mengambil leaderboard, status: ${response.status}`);
        }
    } catch (error) {
        console.error(`❌ Terjadi kesalahan saat mengambil leaderboard:`, error.message);
    }
};

// Jalankan login dan fetch data poin + leaderboard
const run = async () => {
    await login();
    await getPointHistory();
    await getLeaderboard();
};

// Atur jadwal otomatis setiap hari pada jam tertentu
const scheduleLogin = () => {
    const hour = 7;  // Ganti dengan jam yang diinginkan (24 jam format)
    const minute = 0; // Ganti dengan menit yang diinginkan

    setInterval(() => {
        const now = new Date();
        if (now.getHours() === hour && now.getMinutes() === minute) {
            run();
        }
    }, 60 * 1000); // Cek setiap menit
};

// Jalankan pertama kali
run();

// Jalankan otomatis setiap hari
scheduleLogin();
