require('dotenv').config();
const axios = require('axios');

const login = async () => {
    const url = 'https://app.heyelsa.ai/login'; // Sesuaikan jika berbeda
    const privateKey = process.env.PRIVATE_KEY; 

    if (!privateKey) {
        console.error("Private key tidak ditemukan. Pastikan file .env telah diisi.");
        return;
    }

    const payload = {
        privateKey: privateKey
    };

    try {
        const response = await axios.post(url, payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('Login berhasil:', response.data);
    } catch (error) {
        console.error('Login gagal:', error.response ? error.response.data : error.message);
    }
};

login();
