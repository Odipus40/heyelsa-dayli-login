require('dotenv').config();
const axios = require('axios');
const { ethers } = require('ethers');

// Ambil private key dari .env
const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!PRIVATE_KEY) {
    console.error("PRIVATE_KEY tidak ditemukan di .env");
    process.exit(1);
}

const wallet = new ethers.Wallet(PRIVATE_KEY);

async function loginHeyElsa() {
    try {
        // 1. Minta challenge message
        const challengeResponse = await axios.get('https://app.heyelsa.ai/login', {
            address: wallet.address
        });

        const message = challengeResponse.data.message;
        console.log("Challenge message:", message);

        // 2. Wallet menandatangani pesan
        const signature = await wallet.signMessage(message);
        console.log("Signature:", signature);

        // 3. Kirim signature ke server untuk login
        const loginResponse = await axios.get('https://app.heyelsa.ai/login', {
            address: wallet.address,
            signature: signature
        });

        console.log("Login successful!", loginResponse.data);
    } catch (error) {
        console.error("Login failed:", error.response?.data || error.message);
    }
}

loginHeyElsa();
