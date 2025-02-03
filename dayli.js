import axios from 'axios';

const API_URL = 'https://api.heyelsa.com/daily-login'; // Ganti dengan endpoint yang benar
const WALLET_ADDRESS = '0x6F5dA981982011F1aC2ec345b5C2681C16298f2E';

async function dailyLogin() {
    try {
        const payload = {
            id: '6d825d29a6f8b2678cb74405bfd038c7db9c4a2f',
            address: WALLET_ADDRESS,
            action: '$F1',
            options: {
                onSetAIState: '$F2'
            },
            networks: ["Arbitrum", "Base", "Optimism", "Polygon", "BSC", "Hyperliquid"]
        };

        const response = await axios.post(API_URL, payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.data.success) {
            console.log('✅ Daily login successful:', response.data);
        } else {
            console.log('⚠️ Daily login failed:', response.data);
        }
    } catch (error) {
        console.error('❌ Error during daily login:', error.response?.data || error.message);
    }
}

async function startDailyTask() {
    while (true) {
        console.log('🚀 Running daily login...');
        await dailyLogin();
        console.log('⏳ Waiting 24 hours for the next login...');
        await new Promise(resolve => setTimeout(resolve, 24 * 60 * 60 * 1000));
    }
}

startDailyTask();
