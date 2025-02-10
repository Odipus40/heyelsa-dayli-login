require('dotenv').config();
const axios = require('axios');

const login = async () => {
    const url = 'https://app.heyelsa.ai/login'; // Sesuaikan jika berbeda
    const cookie = process.env.COOKIE;

    if (!cookie) {
        console.error("Cookie tidak ditemukan. Pastikan file .env telah diisi.");
        return;
    }

    try {
        const response = await axios.get(url, {
            headers: {
                'Cookie': cookie, // Kirim cookie dalam header
                'User-Agent': 'Mozilla/5.0', // Beberapa server membutuhkan ini
            }
        });

        console.log('Login berhasil:', response.data);
    } catch (error) {
        if (error.response) {
            console.error('Login gagal:', error.response.status, error.response.data);
        } else {
            console.error('Terjadi kesalahan:', error.message);
        }
    }
};

login();
