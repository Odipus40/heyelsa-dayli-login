require('dotenv').config();
const axios = require('axios');
const { ethers } = require('ethers');
require('colors');
const { displayHeader } = require('./helpers');

const loginUrl = 'https://app.heyelsa.ai/api/login';
const pointsUrl = 'https://app.heyelsa.ai/api/points';
const historyUrl = 'https://app.heyelsa.ai/api/points_history';

const privateKey = process.env.PRIVATE_KEY;
const evm_address = process.env.EVM_ADDRESS;

if (!privateKey || !evm_address) {
    console.error("❌ Private Key atau EVM Address tidak ditemukan. Pastikan file .env telah diisi.");
    process.exit(1);
}

const getFormattedTime = () => {
    return new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
};

const signMessage = async (message) => {
    const wallet = new ethers.Wallet(privateKey);
    return await wallet.signMessage(message);
};

const login = async () => {
    console.log(`\n⏳ [${getFormattedTime()}] Starting login process using Private Key...`);
    try {
        const message = `Login request for ${evm_address} at ${getFormattedTime()}`;
        const signature = await signMessage(message);

        const response = await axios.post(loginUrl, {
            evm_address,
            message,
            signature
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
            console.error(`⚠️ Login failed: ${JSON.stringify(response.data)}`);
            process.exit(1);
        }
    } catch (error) {
        console.error(`❌ [${getFormattedTime()}] Login Failed!!!:`, error.response?.data || error.message);
        process.exit(1);
    }
};

const getTotalPoints = async (token) => {
    console.log(`\n💰 [${getFormattedTime()}] Checking points for address: ${evm_address}...`);
    try {
        const response = await axios.get(pointsUrl, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json'
            }
        });
        console.log(`🎯 Current Points Total: ${response.data.points}`);
    } catch (error) {
        console.error(`❌ Error fetching points:`, error.response?.data || error.message);
    }
};

const getPointHistory = async (token) => {
    console.log(`\n📌 [${getFormattedTime()}] Fetching point history...`);
    try {
        const response = await axios.get(historyUrl, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json'
            }
        });
        console.log(`📜 History:`, response.data);
    } catch (error) {
        console.error(`❌ Error fetching point history:`, error.response?.data || error.message);
    }
};

const run = async () => {
    displayHeader();
    console.log(`\n🚀 [${getFormattedTime()}] Starting automatic execution...\n`);
    const token = await login();
    await getTotalPoints(token);
    await getPointHistory(token);

    const nextRun = new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    console.log(`\n⏳ Script will run again on: ${nextRun} (WIB)\n`);
};

run();
setInterval(run, 24 * 60 * 60 * 1000);
