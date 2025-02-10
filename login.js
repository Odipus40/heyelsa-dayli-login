require('dotenv').config();
const axios = require('axios');

const login = async () => {
    const url = 'https://app.heyelsa.ai/api/login'; // 🔹 Pastikan ini adalah API login yang benar
    const cookie = process.env.COOKIE;

    if (!cookie) {
        console.error("❌ Cookie tidak ditemukan. Pastikan file .env telah diisi.");
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
        console.log("🔹 Mengirim request ke:", url);
        console.log("🔹 Payload:", JSON.stringify(payload, null, 2));

        const response = await axios.post(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookie,
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json',
                'Referer': 'https://app.heyelsa.ai/'
            },
            withCredentials: true, // 🔹 Jika API butuh sesi/cookie
            validateStatus: (status) => status < 500 // 🔹 Hindari error karena status 405
        });

        if (response.status === 405) {
            console.error("❌ ERROR 405: Metode POST tidak diizinkan! Coba metode GET.");
        } else if (typeof response.data === 'string' && response.data.includes('<html')) {
            console.error("❌ Login gagal: Server mengembalikan halaman HTML, kemungkinan login tidak berhasil.");
        } else {
            console.log('✅ Login berhasil:', response.data);
        }
    } catch (error) {
        if (error.response) {
            console.error(`❌ Login gagal: ${error.response.status}`, error.response.data);
        } else {
            console.error('❌ Terjadi kesalahan:', error.message);
        }
    }
};

login();
