const axios = require('axios');
const readline = require('readline');
require('colors');
const { displayHeader } = require('./helpers');

require('dotenv').config(); // Load variabel dari .env

const API_LOGIN = 'https://app.heyelsa.ai/login?_src=';
const API_LOGOUT = 'https://app.heyelsa.ai/';
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
        console.error(`⚠️ [${getFormattedTime()}] No cookies received.`);
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
            console.error(`⚠️ [${getFormattedTime()}] Login success but not status 200: ${response.status}`);
            return null;
        }
    } catch (error) {
        console.error(`❌ [${getFormattedTime()}] Login Failed!!!: ${error.message}`);
        return null;
    }
};

const logout = async (cookie) => {
    console.log(`\n🔒 [${getFormattedTime()}] Logging out...`);
    try {
        const response = await axios.get(API_LOGOUT, {}, {
            headers: {
                'Cookie': cookie,
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        });

        if (response.status === 200) {
            console.log(`✅ [${getFormattedTime()}] Logout successful!`);
        } else {
            console.error(`⚠️ [${getFormattedTime()}] Logout failed with status: ${response.status}`);
        }
    } catch (error) {
        console.error(`❌ [${getFormattedTime()}] Error during logout:`, error.response?.data || error.message);
    }
};

// Fungsi untuk mengambil total poin
const getTotalPoints = async (cookie) => {
    if (!evm_address) {
        console.error("⚠️ evm_address not set in .env");
        return;
    }

    console.log(`\n💰 [${getFormattedTime()}] Checking points for address: ${evm_address}...`);

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
            console.error(`⚠️ Failed to retrieve total points, status: ${response.status}`);
        }
    } catch (error) {
        console.error(`❌ Error retrieving total points:`, error.response?.data || error.message);
    }
};

// Fungsi untuk mengambil history poin
const getPointHistory = async (cookie) => {
    if (!evm_address) {
        console.error("⚠️ evm_address not set in .env");
        return;
    }

    console.log(`\n📜 [${getFormattedTime()}] Checking history for address: ${evm_address}...`);

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
            console.log("🔹 Points History:");
            response.data.points_details.forEach((entry, index) => {
                console.log(`   ${index + 1}. ${entry.activity_type} - ${entry.points} points on ${entry.created_at_utc}`);
            });
        } else {
            console.error(`⚠️ Points history not found or not in the expected format.`);
        }
    } catch (error) {
        console.error(`❌ Error retrieving points history:`, error.response?.data || error.message);
    }
};

// Fungsi utama
async function startRoutine() {
    console.log("\n🚀 Running script...");
    await displayHeader(); // Menampilkan header jika diperlukan

    const cookie = await login();
    if (!cookie) {
        console.error("❌ Login failed, stopping execution.");
        return;
    }

    await getTotalPoints(cookie);
    await getPointHistory(cookie);
    await logout(cookie);

    const nextRun = new Date(Date.now() + WAIT_TIME).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    console.log(`\n⏳ Script will run again on: ${nextRun} (WIB)\n`);

    // Tunggu 24 jam sebelum menjalankan ulang
    await new Promise(resolve => setTimeout(resolve, WAIT_TIME));

    // Jalankan ulang
    await startRoutine();
}

// Jalankan pertama kali
startRoutine();
