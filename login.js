const { ethers } = require("ethers");
require('dotenv').config();

const evm_address = process.env.EVM_ADDRESS;
const privateKey = process.env.PRIVATE_KEY; // Pastikan ini ada di .env

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
        const response = await axios.post('https://app.heyelsa.ai/', {
            evm_address,
            signature
        }, {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

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
