const axios = require('axios');
const readline = require('readline');
require('colors');
require('dotenv').config(); // Load variabel dari .env

const API_LOGIN = 'https://app.heyelsa.ai/login?_rsc=';
const API_POINTS = 'https://app.heyelsa.ai/api/points';
const API_HISTORY = 'https://app.heyelsa.ai/api/points_history';
const WAIT_TIME = 24 * 60 * 60 * 1000; // 24 jam dalam milidetik

// Ambil variabel dari .env
const evm_address = process.env.EVM_ADDRESS;
const cookie = process.env.COOKIE; // Ambil cookies dari .env

// Fungsi untuk mendapatkan waktu dalam format yang lebih rapi
function getFormattedTime() {
  return new Date().toLocaleString('id-ID', { hour12: false });
}

const login = async () => {
    console.log(`\n⏳ [${getFormattedTime()}] Starting login process...`);

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
            return cookie;
        } else {
            console.error(`⚠️ [${getFormattedTime()}] Login berhasil tetapi status bukan 200: ${response.status}`);
            return null;
        }
    } catch (error) {
        console.error(`❌ [${getFormattedTime()}] Login Failed!!!: ${error.message}`);
        return null;
    }
};

// Fungsi untuk mengambil total poin
const getTotalPoints = async () => {
    if (!evm_address) {
        console.error("⚠️ evm_address belum diset dalam .env");
        return;
    }

    console.log(`\n💰 [${getFormattedTime()}] Mengecek jumlah poin untuk: ${evm_address}...`);

    try {
        const response = await axios.post(API_POINTS, 
            { evm_address }, // Payload
            {
                headers: {
                    'Cookie': cookie,
                    'User-Agent': 'Mozilla/5.0',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            }
        );

        if (response.status === 200 && response.data.points !== undefined) {
            console.log(`🎯 Current Points Total: ${response.data.points}`);
        } else {
            console.error(`⚠️ Gagal mengambil total poin, status: ${response.status}`);
        }
    } catch (error) {
        console.error(`❌ Terjadi kesalahan saat mengambil total poin:`, error.response?.data || error.message);
    }
};

// Fungsi untuk mengambil history poin
const getPointHistory = async () => {
    if (!evm_address) {
        console.error("⚠️ evm_address belum diset dalam .env");
        return;
    }

    console.log(`\n📜 [${getFormattedTime()}] Mengecek riwayat poin untuk: ${evm_address}...`);

    try {
        const response = await axios.post(API_HISTORY, 
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

        if (response.status === 200 && response.data.points_details) {
            console.log("🔹 Riwayat Poin:");
            response.data.points_details.forEach((entry, index) => {
                console.log(`   ${index + 1}. ${entry.activity_type} - ${entry.points} poin pada ${entry.created_at_utc}`);
            });
        } else {
            console.error(`⚠️ History poin tidak ditemukan atau tidak dalam format yang diharapkan.`);
        }
    } catch (error) {
        console.error(`❌ Terjadi kesalahan saat mengambil history poin:`, error.response?.data || error.message);
    }
};

// Fungsi utama
async function startRoutine() {
  const cookie = await login();
  if (!cookie) return;

  await getTotalPoints();
  await getPointHistory();

  console.log(`\n⏳ [${getFormattedTime()}] Menunggu 24 jam sebelum mengecek kembali...\n`.yellow);
  await new Promise((resolve) => setTimeout(resolve, WAIT_TIME));
}

startRoutine();
