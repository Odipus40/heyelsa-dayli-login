const axios = require('axios');
const fs = require('fs');
const readline = require('readline');
require('colors');
const { displayHeader } = require('./helpers');
require('dotenv').config();

const API_LOGIN = 'https://app.heyelsa.ai/api/login';
const API_POINTS = 'https://app.heyelsa.ai/api/points';
const API_HISTORY = 'https://app.heyelsa.ai/api/points_history';
const WAIT_TIME = 23 * 60 * 60 * 1000 + 55 * 60 * 1000;

const evm_address = process.env.EVM_ADDRESS;
const LOG_FILE = 'script_log.txt';

function logMessage(message) {
    const timestamp = new Date().toLocaleString('id-ID', { hour12: false });
    const log = `[${timestamp}] ${message}`;
    console.log(log);
    fs.appendFileSync(LOG_FILE, log + '\n');
}

async function loginWithWalletAddress() {
    logMessage('⏳ Starting wallet address login process...');
    
    if (!evm_address) {
        logMessage('⚠️ No wallet address provided in .env');
        return null;
    }
    
    try {
        const response = await axios.get(API_LOGIN, {
            address: evm_address
        }, {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        });
        
        if (response.status === 200 && response.data.token) {
            logMessage('✅ Wallet address login successful!');
            return response.data.token;
        } else {
            logMessage(`⚠️ Login status: ${response.status} - ${JSON.stringify(response.data)}`);
            return null;
        }
    } catch (error) {
        logMessage(`❌ Login Failed: ${error.response?.status} - ${JSON.stringify(error.response?.data) || error.message}`);
        return null;
    }
}

async function getTotalPoints(token) {
    if (!evm_address) {
        logMessage('⚠️ evm_address not set in .env');
        return;
    }
    logMessage(`💰 Checking points for address: ${evm_address}...`);
    try {
        const response = await axios.post(API_POINTS, { evm_address }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        });
        if (response.status === 200 && response.data.points !== undefined) {
            logMessage(`🎯 Current Points Total: ${response.data.points}`);
        } else {
            logMessage(`⚠️ Failed to retrieve total points, status: ${response.status}`);
        }
    } catch (error) {
        logMessage(`❌ Error retrieving total points: ${error.response?.status} - ${JSON.stringify(error.response?.data) || error.message}`);
    }
}

async function getPointHistory(token) {
    if (!evm_address) {
        logMessage('⚠️ evm_address not set in .env');
        return;
    }
    logMessage(`📜 Checking history for address: ${evm_address}...`);
    try {
        const response = await axios.post(API_HISTORY, { evm_address }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        });
        if (response.status === 200 && response.data.points_details) {
            logMessage('🔹 Points History:');
            response.data.points_details.forEach((entry, index) => {
                logMessage(`   ${index + 1}. ${entry.activity_type} - ${entry.points} points on ${entry.created_at_utc}`);
            });
        } else {
            logMessage('⚠️ Points history not found.');
        }
    } catch (error) {
        logMessage(`❌ Error retrieving points history: ${error.response?.status} - ${JSON.stringify(error.response?.data) || error.message}`);
    }
}

async function startRoutine() {
    logMessage('\n🚀 Running script...');
    await displayHeader();

    const token = await loginWithWalletAddress();
    if (!token) {
        logMessage('❌ Login failed, retrying in 10 minutes...');
        setTimeout(startRoutine, 10 * 60 * 1000);
        return;
    }

    await getTotalPoints(token);
    await getPointHistory(token);

    const nextRun = new Date(Date.now() + WAIT_TIME).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    logMessage(`⏳ Script will run again on: ${nextRun} (WIB)\n`);
    setTimeout(startRoutine, WAIT_TIME);
}

startRoutine();
