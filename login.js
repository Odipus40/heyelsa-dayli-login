require('dotenv').config();
const axios = require('axios');
const FormData = require('form-data');

const login = async () => {
    const url = 'https://app.heyelsa.ai/api/login'; // 🔹 Pastikan ini adalah API yang benar
    const cookie = process.env.COOKIE;

    if (!cookie) {
        console.error("❌ Cookie tidak ditemukan. Pastikan file .env telah diisi.");
        return;
    }

    // Membuat form-data
    const form = new FormData();
    form.append('1', JSON.stringify({ id: "REPLACE_WITH_ID_1", bound: null }));
    form.append('2', JSON.stringify({ id: "REPLACE_WITH_ID_2", bound: null }));
    form.append('0', JSON.stringify([
        { "action": "$F1", "options": { "onSetAIState": "$F2" } },
        [],
        "Injected",
        "$undefined",
        ["Arbitrum", "Base", "Berachain", "Optimism", "Polygon", "BSC", "Berachain", "Hyperliquid"]
    ]));

    try {
        console.log("🔹 Mengirim request ke:", url);

        const response = await axios.post(url, form, {
            headers: {
                ...form.getHeaders(),
                'Cookie': cookie,
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json',
                'Referer': 'https://app.heyelsa.ai/'
            }
        });

        console.log('✅ Login berhasil:', response.data);
    } catch (error) {
        if (error.response) {
            console.error(`❌ Login gagal: ${error.response.status}`, error.response.data);
        } else {
            console.error('❌ Terjadi kesalahan:', error.message);
        }
    }
};

login();
