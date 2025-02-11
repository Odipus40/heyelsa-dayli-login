require('dotenv').config();
const axios = require('axios');
const { ethers } = require('ethers');
require('colors');

const loginUrl = 'https://app.heyelsa.ai/login';
const pointsUrl = 'https://app.heyelsa.ai/api/points';
const historyUrl = 'https://app.heyelsa.ai/api/points_history';

const privateKey = process.env.PRIVATE_KEY;
const evm_address = process.env.EVM_ADDRESS;

if (!privateKey || !evm_address) {
    console.error("❌ PRIVATE_KEY atau EVM_ADDRESS tidak ditemukan. Pastikan file .env telah diisi.");
    process.exit(1);
}

const getFormattedTime = () => {
    return new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
};

const login = async () => {
    console.log(`\n⏳ [${getFormattedTime()}] Starting login process using Private Key...`);

    try {
        const wallet = new ethers.Wallet(privateKey);
        const message = `Login to HeyElsa at ${new Date().toISOString()}`;
        const signature = await wallet.signMessage(message);

        const response = await axios.post(loginUrl, {
            evm_address,
            signature,
            message
        }, {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 200 && response.data.token) {
            console.log(`✅ [${getFormattedTime()}] Login successful!`);
            return response.data.token;
        } else {
            console.error(`⚠️ [${getFormattedTime()}] Login berhasil tetapi tidak mendapatkan token!`);
            return null;
        }
    } catch (error) {
        console.error(`❌ [${getFormattedTime()}] Login Failed!!!:`, error.response?.data || error.message);
        return null;
    }
};

const getTotalPoints = async (token) => {
    console.log(`\n💰 [${getFormattedTime()}] Checking points for address: ${evm_address}...`);

    try {
        const response = await axios.post(pointsUrl, { evm_address }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 200) {
            const totalPoints = response.data.points;
            console.log(`🎯 Current Points Total: ${totalPoints}`);
        } else {
            console.error(`⚠️ Gagal mengambil total poin, status: ${response.status}`);
        }
    } catch (error) {
        console.error(`❌ Error fetching points:`, error.response?.data || error.message);
    }
};

const getPointHistory = async (token) => {
    console.log(`\n📌 [${getFormattedTime()}] Fetching point history for address: ${evm_address}...`);

    try {
        const response = await axios.post(historyUrl, { evm_address }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 200) {
            const data = response.data;

            if (data.points_details && Array.isArray(data.points_details)) {
                console.log("🔹 Point History:");
                data.points_details.forEach((entry, index) => {
                    console.log(`   ${index + 1}. ${entry.activity_type} - ${entry.points} points on ${entry.created_at_utc}`);
                });
            } else {
                console.error("⚠️ Point history not found or incorrect format.");
            }
        } else {
            console.error(`⚠️ Failed to fetch point history, status: ${response.status}`);
        }
    } catch (error) {
        console.error(`❌ Error fetching point history:`, error.response?.data || error.message);
    }
};

const run = async () => {
    console.log(`\n🚀 [${getFormattedTime()}] Starting automatic execution...\n`);
    const token = await login();
    if (!token) {
        console.error("❌ Failed to retrieve authentication token. Exiting...");
        return;
    }
    await getTotalPoints(token);
    await getPointHistory(token);
};

run();
setInterval(run, 24 * 60 * 60 * 1000);
