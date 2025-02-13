const axios = require('axios');
const fs = require('fs');
const readline = require('readline');
require('colors');
const { displayHeader } = require('./helpers');
require('dotenv').config();

const API_LOGIN = 'https://app.heyelsa.ai/login?_src=';
const API_LOGOUT = 'https://app.heyelsa.ai/logout';
const API_POINTS = 'https://app.heyelsa.ai/api/points';
const API_HISTORY = 'https://app.heyelsa.ai/api/points_history';
const WAIT_TIME = 23 * 60 * 60 * 1000 + 55 * 60 * 1000; // 23 jam 55 menit

const evm_address = process.env.EVM_ADDRESS;
const cookie = process.env.COOKIE;
const LOG_FILE = 'script_log.txt';

function logMessage(message) {
    const timestamp = new Date().toLocaleString('id-ID', { hour12: false });
    const log = `[${timestamp}] ${message}`;
    console.log(log);
    fs.appendFileSync(LOG_FILE, log + '\n');
}

async function login() {
    logMessage('⏳ Starting login process...');

    if (!cookie) {
        logMessage('⚠️ No cookies received.');
        process.exit(1);
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
            logMessage('✅ Login successful!');
            return cookie;
        } else {
            logMessage(`⚠️ Login status: ${response.status}`);
            return null;
        }
    } catch (error) {
        logMessage(`❌ Login Failed: ${error.message}`);
        return null;
    }
}

async function logout(cookie) {
    logMessage('🔒 Logging out...');
    try {
        const response = await axios.post(API_LOGOUT, {}, {
            headers: {
                'Cookie': cookie,
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json',
            }
        });

        if (response.status === 200) {
            logMessage('✅ Logout successful!');
        } else {
            logMessage(`⚠️ Logout failed, status: ${response.status}`);
        }
    } catch (error) {
        logMessage(`❌ Error during logout: ${error.message}`);
    }
}

async function getTotalPoints(cookie) {
    if (!evm_address) {
        logMessage('⚠️ evm_address not set in .env');
        return;
    }
    logMessage(`💰 Checking points for address: ${evm_address}...`);
    try {
        const response = await axios.post(API_POINTS, { evm_address }, {
            headers: {
                'Cookie': cookie,
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
        logMessage(`❌ Error retrieving total points: ${error.message}`);
    }
}

async function getPointHistory(cookie) {
    if (!evm_address) {
        logMessage('⚠️ evm_address not set in .env');
        return;
    }
    logMessage(`📜 Checking history for address: ${evm_address}...`);
    try {
        const response = await axios.post(API_HISTORY, { evm_address }, {
            headers: {
                'Cookie': cookie,
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
        logMessage(`❌ Error retrieving points history: ${error.message}`);
    }
}

async function startRoutine() {
    logMessage('\n🚀 Running script...');
    await displayHeader();

    const sessionCookie = await login();
    if (!sessionCookie) {
        logMessage('❌ Login failed, retrying in 10 minutes...');
        setTimeout(startRoutine, 10 * 60 * 1000); // Retry dalam 10 menit
        return;
    }

    await getTotalPoints(sessionCookie);
    await getPointHistory(sessionCookie);
    await logout(sessionCookie);

    const nextRun = new Date(Date.now() + WAIT_TIME).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    logMessage(`⏳ Script will run again on: ${nextRun} (WIB)\n`);
    setTimeout(startRoutine, WAIT_TIME);
}

startRoutine();
