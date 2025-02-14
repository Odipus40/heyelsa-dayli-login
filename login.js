const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

const API_LOGIN = 'https://app.heyelsa.ai/login?_src=';
const cookie = process.env.COOKIE;
const evm_address = process.env.EVM_ADDRESS; // Ambil wallet address dari .env

const login = async () => {
    console.log(`\n⏳ Starting login process...`);

    if (!cookie) {
        console.error(`⚠️ No cookies received.`);
        return null;
    }

    try {
        // Buat FormData untuk payload
        const form = new FormData();
        form.append('0', JSON.stringify([
            { action: "$F1", options: {} },
            "Injected",
            "$undefined",
            ["Arbitrum", "Base", "Berachain", "Optimism", "Polygon", "BSC", "Berachain", "Hyperliquid"]
        ]));

        form.append('preview', JSON.stringify({
            "0": [{
                "role": "system",
                "content": `User has connected from country code ID via Injected with their wallet address: ${evm_address} and it supports the following chains: Arbitrum, Base, Berachain, Optimism, Polygon, BSC, Berachain, Hyperliquid`
            }],
            "_t": "a"
        }));

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
