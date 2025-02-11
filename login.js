require('dotenv').config();
const axios = require('axios');
const { displayHeader } = require('./helpers'); // Import fungsi dari helpers.js

const loginUrl = 'https://app.heyelsa.ai/api/login';
const pointsUrl = 'https://app.heyelsa.ai/api/points';
const historyUrl = 'https://app.heyelsa.ai/api/points_history';

const evm_address = process.env.EVM_ADDRESS;
const private_key = process.env.PRIVATE_KEY;
const rsc_value = '1dz8a'; // Nilai _rsc

if (!evm_address || !private_key) {
    console.error("❌ EVM Address atau Private Key tidak ditemukan. Pastikan file .env telah diisi.");
    process.exit(1);
}

const getFormattedTime = () => {
    return new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
};

const login = async () => {
    console.log(`\n⏳ [${getFormattedTime()}] Starting login process using _rsc method...`);

    try {
        const response = await axios.post(loginUrl, {
            evm_address,
            _rsc: rsc_value
        }, {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        });

        if (response.status === 200 && response.data.token) {
            console.log(`✅ [${getFormattedTime()}] Login successful! Token received.`);
            return response.data.token;
        } else {
            console.error(`⚠️ [${getFormattedTime()}] Login response invalid:`, response.data);
        }
    } catch (error) {
        console.error(`❌ [${getFormattedTime()}] Login Failed:`, error.response?.data || error.message);
    }
    return null;
};

const run = async () => {
    displayHeader();
    console.log(`\n🚀 [${getFormattedTime()}] Starting automatic execution...\n`);
    const token = await login();
    if (!token) {
        console.error("❌ Failed to retrieve authentication token. Exiting...");
        return;
    }
};

run();
