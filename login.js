require('dotenv').config();
const axios = require('axios');

const loginUrl = 'https://app.heyelsa.ai/'; // Pastikan ini endpoint yang benar
const evm_address = process.env.EVM_ADDRESS;
const privateKey = process.env.PRIVATE_KEY; // Pastikan ini ada di .env

if (!evm_address || !privateKey) {
    console.error("❌ EVM Address atau Private Key tidak ditemukan. Pastikan file .env telah diisi.");
    process.exit(1);
}

const login = async () => {
    console.log("⏳ Starting login process using Private Key...");

    try {
        const response = await axios.post(
            loginUrl,
            { evm_address, privateKey }, // Pastikan format body ini sesuai dengan API
            {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0',
                }
            }
        );

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
