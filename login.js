require('dotenv').config();
const axios = require('axios');

const loginUrl = 'https://app.heyelsa.ai/login';
const historyUrl = 'https://app.heyelsa.ai/api/points_history';
const leaderboardUrl = 'https://app.heyelsa.ai/api/leaderboard';

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
        const response = await axios.post(historyUrl, {}, {
            headers: {
                'Cookie': cookie,
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        });

        if (response.status === 200) {
            const data = response.data;

            if (data.points_details && Array.isArray(data.points_details)) {
                console.log("🔹 Riwayat Poin:");

                let totalPoints = 0;
                data.points_details.forEach((entry, index) => {
                    const date = new Date(entry.created_at_utc).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
                    console.log(`   ${index + 1}. [${date}] - ${entry.activity_type.toUpperCase()} - ${entry.points} poin`);
                    totalPoints += entry.points;
                });

                console.log(`\n💰 Total Poin: ${totalPoints}`);
            } else {
                console.error(`⚠️ History poin tidak ditemukan atau tidak dalam format yang diharapkan.`);
            }
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
        const response = await axios.post(leaderboardUrl, {}, {
            headers: {
                'Cookie': cookie,
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        });

        if (response.status === 200) {
            const data = response.data;

            if (data.leaderboard && Array.isArray(data.leaderboard)) {
                console.log("🔹 Leaderboard:");

                data.leaderboard.forEach((user, index) => {
                    console.log(`   ${index + 1}. ${user.username} - ${user.points} poin`);
                });
            } else {
                console.error(`⚠️ Leaderboard tidak ditemukan atau tidak dalam format yang diharapkan.`);
            }
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
