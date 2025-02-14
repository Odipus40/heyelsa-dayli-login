const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

const API_LOGIN = 'https://app.heyelsa.ai/login?_src=';
const API_POINTS = 'https://app.heyelsa.ai/api/points';
const API_HISTORY = 'https://app.heyelsa.ai/api/points_history';

const cookie = process.env.COOKIE;
const evm_address = process.env.EVM_ADDRESS;

function getFormattedTime() {
    return new Date().toLocaleString('id-ID', { hour12: false });
}

// Fungsi untuk login
const login = async () => {
    console.log(`\n⏳ [${getFormattedTime()}] Starting login process...`);

    if (!cookie) {
        console.error(`⚠️ [${getFormattedTime()}] No cookies received.`);
        return null;
    }

    try {
        const form = new FormData();
        form.append('0', JSON.stringify([
            { action: "$F1", options: {} },
            "Injected",
            "$undefined",
            ["Arbitrum", "Base", "Berachain", "Optimism", "Polygon", "BSC", "Berachain", "Hyperliquid"]
        ]));

        form.append('preview', JSON.stringify({
            "0": [{
                "role": "system",
                "content": `User has connected from country code ID via Injected with their wallet address: ${evm_address} and it supports the following chains: Arbitrum, Base, Berachain, Optimism, Polygon, BSC, Berachain, Hyperliquid`
            }],
            "_t": "a"
        }));

        const response = await axios.get(API_LOGIN, {
            headers: {
                'Cookie': cookie,
                ...form.getHeaders(),
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json, text/html',
            },
            data: form
        });

        if (response.status === 200) {
            console.log(`✅ [${getFormattedTime()}] Login successful!!!`);
            return cookie;
        } else {
            console.error(`⚠️ [${getFormattedTime()}] Login success but not status 200: ${response.status}`);
            return null;
        }
    } catch (error) {
        console.error(`❌ [${getFormattedTime()}] Login Failed:`, error.response?.data || error.message);
        return null;
    }
};

// Fungsi untuk mendapatkan total poin
const getTotalPoints = async (cookie) => {
    if (!evm_address) {
        console.error("⚠️ evm_address not set in .env");
        return;
    }

    console.log(`\n💰 [${getFormattedTime()}] Checking points for address: ${evm_address}...`);

    try {
        const response = await axios.post(API_POINTS, 
            { evm_address }, 
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

// Fungsi untuk mendapatkan history poin dengan preview
const getPointHistory = async (cookie) => {
    if (!evm_address) {
        console.error("⚠️ evm_address not set in .env");
        return;
    }

    console.log(`\n📜 [${getFormattedTime()}] Checking history for address: ${evm_address}...`);

    try {
        const response = await axios.post(API_HISTORY, 
            { evm_address }, 
            {
                headers: {
                    'Cookie': cookie,
                    'User-Agent': 'Mozilla/5.0',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            }
        );

        // Log response untuk debugging
        console.log("🔍 API Response:", JSON.stringify(response.data, null, 2));

        if (response.status === 200 && response.data.points_details && response.data.points_details.length > 0) {
            console.log("🔹 Points History Preview:");
            
            // Menampilkan preview ringkasan aktivitas pertama saja
            const preview = response.data.points_details[0]; 
            console.log(`   🎯 Last Activity: ${preview.activity_type} - ${preview.points} points`);

            console.log("\n🔹 Full Points History:");
            response.data.points_details.forEach((entry, index) => {
                console.log(`   ${index + 1}. ${entry.activity_type} - ${entry.points} points on ${entry.created_at_utc}`);
            });
        } else {
            console.error(`⚠️ No points history found.`);
        }
    } catch (error) {
        console.error(`❌ Error retrieving points history:`, error.response?.data || error.message);
    }
};

// Fungsi utama
async function startRoutine() {
    console.log("\n🚀 Running script...");

    const cookie = await login();
    if (!cookie) {
        console.error("❌ Login failed, stopping execution.");
        return;
    }

    await getTotalPoints(cookie);
    await getPointHistory(cookie);
}

// Jalankan pertama kali
startRoutine();
