require('dotenv').config();
const axios = require('axios');

const loginUrl = 'https://app.heyelsa.ai/login';
const historyUrl = 'https://app.heyelsa.ai/api/points/history';
const leaderboardUrl = 'https://app.heyelsa.ai/api/points/leaderboard';

const cookie = process.env.COOKIE;

if (!cookie) {
    console.error("❌ Cookie tidak ditemukan. Pastikan file .env telah diisi.");
    process.exit(1);
}

// Fungsi untuk mendapatkan waktu sekarang (WIB)
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
        console.error(`❌ [${getFormattedTime()}] Login gagal: ${error.message}`);
    }
};

// Fungsi untuk mengambil history poin
const getPointHistory = async () => {
    console.log(`\n📌 [${getFormattedTime()}] Mengambil history poin...`);

    try {
        const response = await axios.post(historyUrl, {}, { // Gunakan POST dengan body kosong
            headers: {
                'Cookie': cookie,
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json',
                'Content-Type': 'application/json',
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

// Fungsi untuk mengambil leaderboard
const getLeaderboard = async () => {
    console.log(`\n🏆 [${getFormattedTime()}] Mengambil leaderboard...`);

    try {
        const response = await axios.post(leaderboardUrl, {}, { // Gunakan POST dengan body kosong
            headers: {
                'Cookie': cookie,
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json',
                'Content-Type': 'application/json',
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

// Jalankan pertama kali
run();
