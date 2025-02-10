require('dotenv').config();
const axios = require('axios');

const loginUrl = 'https://app.heyelsa.ai/login';
const historyUrl = 'https://app.heyelsa.ai/api/points_history';
const leaderboardUrl = 'https://app.heyelsa.ai/api/leaderboard';

const cookie = process.env.COOKIE;
const evm_address = process.env.EVM_ADDRESS; // Pastikan address ada di .env

if (!cookie || !evm_address) {
    console.error("❌ Cookie atau EVM Address tidak ditemukan. Pastikan file .env telah diisi.");
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
    console.log(`\n📌 [${getFormattedTime()}] Mengambil history poin untuk address: ${evm_address}...`);

    try {
        const response = await axios.post(historyUrl, 
            { params: { evm_address } }, // Menggunakan payload dengan params
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
                console.log("🔹 Riwayat Poin:");
                let totalPoints = 0;
                data.points_details.forEach((entry, index) => {
                    console.log(`   ${index + 1}. ${entry.activity_type} - ${entry.points} poin pada ${entry.created_at_utc}`);
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
        console.error(`❌ Terjadi kesalahan saat mengambil history poin:`, error.response?.data || error.message);
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

// Fungsi utama untuk menjalankan semua proses
const run = async () => {
    console.log(`\n🚀 [${getFormattedTime()}] Memulai eksekusi otomatis...\n`);
    await login();
    await getPointHistory();
    await getLeaderboard();

    const nextRun = new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    console.log(`\n⏳ Skrip akan berjalan lagi pada: ${nextRun} (WIB)\n`);
};

// Jalankan pertama kali
run();

// Jalankan setiap 24 jam sekali
const intervalTime = 24 * 60 * 60 * 1000; // 24 jam dalam milidetik
setInterval(run, intervalTime);
