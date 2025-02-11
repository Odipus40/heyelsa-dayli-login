require('dotenv').config();
const axios = require('axios');
const { ethers } = require('ethers');
require('colors');
const { displayHeader } = require('./helpers'); // Import fungsi dari helpers.js

const loginUrl = 'https://app.heyelsa.ai/api/login_privatekey';
const pointsUrl = 'https://app.heyelsa.ai/api/points';
const historyUrl = 'https://app.heyelsa.ai/api/points_history';

const privateKey = process.env.PRIVATE_KEY;
const evm_address = process.env.EVM_ADDRESS;

if (!privateKey || !evm_address) {
    console.error("❌ Private Key atau EVM Address tidak ditemukan. Pastikan file .env telah diisi.");
    process.exit(1);
}

// Fungsi untuk mendapatkan waktu sekarang (WIB)
const getFormattedTime = () => {
    return new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
};

// Fungsi untuk login menggunakan Private Key
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
                'Content-Type': 'application/json',
            }
        });

        if (response.status === 200 && response.data.token) {
            console.log(`✅ [${getFormattedTime()}] Login successful!`);
            return response.data.token; // Token ini akan digunakan untuk permintaan berikutnya
        } else {
            console.error(`⚠️ [${getFormattedTime()}] Login berhasil tetapi tidak mendapatkan token!`);
            return null;
        }
    } catch (error) {
        console.error(`❌ [${getFormattedTime()}] Login Failed!!!:`, error.response?.data || error.message);
        return null;
    }
};

// Fungsi untuk mengambil total poin dari API `/points`
const getTotalPoints = async (token) => {
    console.log(`\n💰 [${getFormattedTime()}] Points for address: ${evm_address}...`);

    try {
        const response = await axios.post(pointsUrl, 
            { evm_address }, 
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'User-Agent': 'Mozilla/5.0',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            }
        );

        console.log("🔍 Debug Response:", response.data);

        if (response.status === 200) {
            const totalPoints = response.data.points;
            console.log(`🎯 Current Points Total: ${totalPoints}`);
        } else {
            console.error(`⚠️ Failed to retrieve points, status: ${response.status}`);
        }
    } catch (error) {
        console.error(`❌ Error fetching points:`, error.response?.data || error.message);
    }
};

// Fungsi untuk mengambil history poin
const getPointHistory = async (token) => {
    console.log(`\n📌 [${getFormattedTime()}] History for address: ${evm_address}...`);

    try {
        const response = await axios.post(historyUrl, 
            { evm_address }, 
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'User-Agent': 'Mozilla/5.0',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            }
        );

        if (response.status === 200) {
            const data = response.data;
            if (data.points_details && Array.isArray(data.points_details)) {
                console.log("🔹 Points History:");
                data.points_details.forEach((entry, index) => {
                    console.log(`   ${index + 1}. ${entry.activity_type} - ${entry.points} points on ${entry.created_at_utc}`);
                });
            } else {
                console.error(`⚠️ No history found or incorrect format.`);
            }
        } else {
            console.error(`⚠️ Failed to retrieve history, status: ${response.status}`);
        }
    } catch (error) {
        console.error(`❌ Error fetching point history:`, error.response?.data || error.message);
    }
};

// Fungsi utama untuk menjalankan semua proses
const run = async () => {
    displayHeader();
    console.log(`\n🚀 [${getFormattedTime()}] Starting automatic execution...\n`);
    
    const token = await login();
    if (!token) {
        console.error("❌ Failed to retrieve authentication token. Exiting...");
        return;
    }

    await getTotalPoints(token);
    await getPointHistory(token);

    const nextRun = new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    console.log(`\n⏳ Script will run again on: ${nextRun} (WIB)\n`);
};

// Jalankan pertama kali
run();

// Jalankan setiap 24 jam sekali
const intervalTime = 24 * 60 * 60 * 1000; 
setInterval(run, intervalTime);
