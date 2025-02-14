const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

const API_LOGIN = 'https://app.heyelsa.ai/login?_src=';
const cookie = process.env.COOKIE;

const login = async () => {
    console.log(`\n⏳ Starting login process...`);

    if (!cookie) {
        console.error(`⚠️ No cookies received.`);
        return null;
    }

    try {
        // Buat FormData hanya dengan field "0"
        const form = new FormData();
        form.append('0', JSON.stringify([
            { action: "$F1", options: {} }, // "options" tetap kosong
            "Injected",
            "$undefined",
            ["Arbitrum", "Base", "Berachain", "Optimism", "Polygon", "BSC", "Berachain", "Hyperliquid"]
        ]));

        // Kirim request login
        const response = await axios.get(API_LOGIN, {
            headers: {
                'Cookie': cookie,
                ...form.getHeaders(),
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json, text/html',
            },
            data: form
        });

        if (response.status === 200) {
            console.log(`✅ Login successful!!!`);
            return cookie;
        } else {
            console.error(`⚠️ Login success but not status 200: ${response.status}`);
            return null;
        }
    } catch (error) {
        console.error(`❌ Login Failed:`, error.response?.data || error.message);
        return null;
    }
};

login();
