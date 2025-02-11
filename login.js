require('dotenv').config();
const axios = require('axios');
const readline = require('readline');
require('colors');
const { displayHeader } = require('./helpers'); // Import fungsi dari helpers.js

const loginUrl = 'https://app.heyelsa.ai/login';
const pointsUrl = 'https://app.heyelsa.ai/api/points'; // API total poin
const historyUrl = 'https://app.heyelsa.ai/api/points_history'; // API history poin

const cookie = process.env.COOKIE;
const evm_address = process.env.EVM_ADDRESS; // Pastikan ada di .env

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

// Fungsi untuk mengambil total poin dari API `/points`
const getTotalPoints = async () => {
    console.log(`\n💰 [${getFormattedTime()}] Points your address: ${evm_address}...`);

    try {
        const response = await axios.post(pointsUrl, 
            { evm_address }, // Payload dengan evm_address
            {
                headers: {
                    'Cookie': cookie,
                    'User-Agent': 'Mozilla/5.0',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            }
        );

        console.log("🔍 Debug Response:", response.data); // Debug untuk melihat isi response API

        if (response.status === 200) {
            const totalPoints = response.data.points; // FIX: Mengambil dari 'points' bukan 'total_points'
            console.log(`🎯 Current Points Total: ${totalPoints}`);
        } else {
            console.error(`⚠️ Gagal mengambil total poin, status: ${response.status}`);
        }
    } catch (error) {
        console.error(`❌ Terjadi kesalahan saat mengambil total poin:`, error.response?.data || error.message);
    }
};

// Fungsi untuk mengambil history poin
const getPointHistory = async () => {
    console.log(`\n📌 [${getFormattedTime()}] History your address: ${evm_address}...`);

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
                data.points_details.forEach((entry, index) => {
                    console.log(`   ${index + 1}. ${entry.activity_type} - ${entry.points} poin pada ${entry.created_at_utc}`);
                });
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

// Fungsi utama untuk menjalankan semua proses
const run = async () => {
    displayHeader(); // Menampilkan header sebelum eksekusi lainnya
    console.log(`\n🚀 [${getFormattedTime()}] Starting automatic execution...\n`);
    await login();
    await getTotalPoints(); // Ambil total poin lebih dulu
    await getPointHistory(); // Lalu tampilkan history poin

    const nextRun = new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    console.log(`\n⏳ Script will run again on: ${nextRun} (WIB)\n`);
};

// Jalankan pertama kali
run();

// Jalankan setiap 24 jam sekali
const intervalTime = 24 * 60 * 60 * 1000; // 24 jam dalam milidetik
setInterval(run, intervalTime);
