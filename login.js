require('dotenv').config();
const axios = require('axios');

const login = async () => {
    const url = 'https://app.heyelsa.ai/login'; // Pastikan ini API yang benar
    const cookie = process.env.COOKIE;

    if (!cookie) {
        console.error("Cookie tidak ditemukan. Pastikan file .env telah diisi.");
        return;
    }

    const payload = {
        "1": { "bound": null },
        "2": { "bound": null },
        "0": [
            { "action": "$F1", "options": { "onSetAIState": "$F2" } },
            [],
            "Injected",
            "$undefined",
            ["Arbitrum", "Base", "Berachain", "Optimism", "Polygon", "BSC", "Berachain", "Hyperliquid"]
        ]
    };

    try {
        const response = await axios.post(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookie,
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json',
                'Referer': 'https://app.heyelsa.ai/'
            },
            maxRedirects: 0 // Hindari redirect agar tahu jika diarahkan kembali ke login
        });

        // Mengecek apakah respons adalah HTML
        if (typeof response.data === 'string' && response.data.includes('<html')) {
            console.error("Login gagal: Server mengembalikan halaman HTML, kemungkinan login tidak berhasil.");
        } else {
            console.log('Login berhasil:', response.data);
        }
    } catch (error) {
        if (error.response) {
            console.error(`Login gagal: ${error.response.status}`, error.response.data);
        } else {
            console.error('Terjadi kesalahan:', error.message);
        }
    }
};

login();
