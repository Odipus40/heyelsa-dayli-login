const axios = require('axios');
const readline = require('readline');
require('colors');
const { displayHeader } = require('./helpers');

require('dotenv').config(); // Load variabel dari .env

const API_LOGIN = 'https://app.heyelsa.ai/login?_src=';
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
        console.error(`⚠️ [${getFormattedTime()}] Not cookies received.`);
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
            console.error(`⚠️ [${getFormattedTime()}] Login success but noy stats 200: ${response.status}`);
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
        console.error("⚠️ evm_address Failed diset on .env");
        return;
    }

    console.log(`\n💰 [${getFormattedTime()}] Check points your address: ${evm_address}...`);

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
            console.error(`⚠️ Failed to collect total points, status: ${response.status}`);
        }
    } catch (error) {
        console.error(`❌ An error occurred while retrieving total points:`, error.response?.data || error.message);
    }
};

// Fungsi untuk mengambil history poin
const getPointHistory = async () => {
    if (!evm_address) {
        console.error("⚠️ evm_address not diset on .env");
        return;
    }

    console.log(`\n📜 [${getFormattedTime()}] Check history your address: ${evm_address}...`);

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
  const cookie = 
  await displayHeader();
  await login();
  await getTotalPoints();
  await getPointHistory();
  if (!cookie) return;
  
   const nextRun = new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    console.log(`\n⏳ Script will run again on: ${nextRun} (WIB)\n`);
};

// Jalankan setiap 24 jam sekali
const intervalTime = 24 * 60 * 60 * 1000; // 24 jam dalam milidetik
setInterval(run, intervalTime);
startRoutine();
