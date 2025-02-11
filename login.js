const axios = require('axios');
const readline = require('readline');
require('colors');
require('dotenv').config(); // Load variabel dari .env

const API_LOGIN = 'https://app.heyelsa.ai/login';
const API_POINTS = 'https://app.heyelsa.ai/api/points';
const API_HISTORY = 'https://app.heyelsa.ai/api/points_history';
const WAIT_TIME = 24 * 60 * 60 * 1000; // 24 jam dalam milidetik

// Fungsi untuk mendapatkan waktu dalam format yang lebih rapi
function getFormattedTime() {
  return new Date().toLocaleString('id-ID', { hour12: false });
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const login = async () => {
    console.log(`\n⏳ [${getFormattedTime()}] Starting login process...`);

    const cookie = process.env.COOKIE; // Mengambil cookies dari .env
    if (!cookie) {
        console.error(`⚠️ [${getFormattedTime()}] Tidak ada cookies yang diterima.`);
        return null;
    }

    try {
        const response = await axios.get(API_LOGIN, {
            headers: {
                'Cookie': cookie,
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json, text/html',
            }
        });

        if (response.status === 200) {
            console.log(`✅ [${getFormattedTime()}] Login successful!!!`);
            return cookie; // Mengembalikan cookies untuk digunakan
        } else {
            console.error(`⚠️ [${getFormattedTime()}] Login berhasil tetapi status bukan 200: ${response.status}`);
            return null;
        }
    } catch (error) {
        console.error(`❌ [${getFormattedTime()}] Login Failed!!!: ${error.message}`);
        return null;
    }
};

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

async function startRoutine() {
  const cookie = await login();
  if (!cookie) return;

  await checkPoints(cookie);
  await checkHistory(cookie);

  console.log(`\n⏳ [${getFormattedTime()}] Menunggu 24 jam sebelum mengecek kembali...\n`.yellow);
  await new Promise((resolve) => setTimeout(resolve, WAIT_TIME));
}

startRoutine();
