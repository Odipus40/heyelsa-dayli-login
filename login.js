const { ethers } = require("ethers");
const axios = require("axios"); // Tambahkan ini!
require('dotenv').config();

const evm_address = process.env.EVM_ADDRESS;
const privateKey = process.env.PRIVATE_KEY;

if (!evm_address || !privateKey) {
    console.error("❌ EVM Address atau Private Key tidak ditemukan. Pastikan file .env telah diisi.");
    process.exit(1);
}

const signMessage = async (privateKey, message) => {
    const wallet = new ethers.Wallet(privateKey);
    return await wallet.signMessage(message);
};

const login = async () => {
    console.log("⏳ Starting login process using Private Key...");

    try {
        const signature = await signMessage(privateKey, "Login to HeyElsa"); // Panggil setelah deklarasi
        console.log("✅ Signature Created:", signature);
        
        // Kirim signature ke API login
        const response = await axios.post('https://app.heyelsa.ai/api/login', {
    evm_address,
    signature,
    _rsc: "1dz8a"
}, { headers });

        console.log("🔍 Debug Response:", response.data);

        if (response.status === 200 && response.data.token) {
            console.log(`✅ Login successful! Token: ${response.data.token}`);
            return response.data.token;
        } else {
            console.error(`⚠️ Login response tidak sesuai:`, response.data);
            process.exit(1);
        }
    } catch (error) {
        console.error(`❌ Login Failed! Status: ${error.response?.status}`);
        console.error("🔍 Full Error Response:", error.response?.data || error.message);
        process.exit(1);
    }
};

login();
