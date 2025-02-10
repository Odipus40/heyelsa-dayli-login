require('dotenv').config();
const axios = require('axios');

const swapUrl = 'https://app.heyelsa.ai/api/pipeline';
const evm_address = process.env.EVM_ADDRESS; // Pastikan ada di .env
const cookie = process.env.COOKIE;

if (!cookie || !evm_address) {
    console.error("❌ Cookie atau EVM Address tidak ditemukan. Pastikan file .env telah diisi.");
    process.exit(1);
}

// Fungsi untuk mendapatkan waktu sekarang (WIB)
const getFormattedTime = () => {
    return new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
};

// Fungsi untuk melakukan swap DAI ke ETH (Base)
const swapDAIToETH = async (amount) => {
    console.log(`\n🔄 [${getFormattedTime()}] Melakukan swap ${amount} DAI ke ETH (Base) untuk address: ${evm_address}...`);

    try {
        const payload = {
            pipeline: [
                {
                    action_type: "swap",
                    from_currency: "DAI",
                    to_currency: "ETH",
                    network: "BASE",
                    amount: amount
                }
            ],
            dry_run: true, // Simulasi tanpa eksekusi transaksi nyata
            bundled_execution: false,
            isBrowserWallet: true
        };

        const response = await axios.post(swapUrl, payload, {
            headers: {
                'Cookie': cookie,
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        });

        console.log("🔍 Debug Response (Swap DAI to ETH):", response.data); // Debug response API swap

        if (response.status === 200) {
            console.log(`✅ Swap DAI ke ETH (Base) berhasil (Simulasi)! Kamu telah menukar ${amount} DAI.`);
        } else {
            console.error(`⚠️ Swap gagal, status: ${response.status}`);
        }
    } catch (error) {
        console.error(`❌ Terjadi kesalahan saat melakukan swap DAI ke ETH:`, error.response?.data || error.message);
    }
};

// Jalankan swap dengan jumlah tertentu
swapDAIToETH(10);
