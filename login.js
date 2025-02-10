const { ethers } = require('ethers');
require('dotenv').config();
const axios = require('axios');

const login = async () => {
    const url = 'https://app.heyelsa.ai/login'; 
    const privateKey = process.env.PRIVATE_KEY;

    if (!privateKey) {
        console.error("Private key tidak ditemukan.");
        return;
    }

    const wallet = new ethers.Wallet(privateKey);
    const message = "Login to HeyElsa"; 
    const signature = await wallet.signMessage(message);

    const payload = {
        address: wallet.address,
        signature: signature
    };

    try {
        const response = await axios.post(url, payload, {
            headers: { 'Content-Type': 'application/json' }
        });

        console.log('Login berhasil:', response.data);
    } catch (error) {
        console.error('Login gagal:', error.response ? error.response.data : error.message);
    }
};

login();
