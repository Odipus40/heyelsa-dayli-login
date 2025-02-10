require('dotenv').config();
const axios = require('axios');

const login = async () => {
    const url = 'https://app.heyelsa.ai/login'; // Pastikan URL ini benar
    const cookie = process.env.COOKIE;

    if (!cookie) {
        console.error("❌ Cookie tidak ditemukan. Pastikan file .env telah diisi.");
        return;
    }

    try {
        console.log("🔹 Mengirim request login...");

        const response = await axios.get(url, {
            headers: {
                'Cookie': cookie, // Kirim cookie dalam header
                'User-Agent': 'Mozilla/5.0', // Beberapa server membutuhkan ini
                'Accept': 'application/json, text/html', // Bisa membantu jika server butuh
            }
        });

        // Cek apakah response mengandung sesuatu yang bisa memastikan login sukses
        if (response.status === 200) {
            console.log("✅ Login berhasil!");
            
            // Coba deteksi username atau sesuatu di dalam response
            if (response.data.includes("dashboard") || response.data.includes("Welcome")) {
                console.log("🔹 Login terdeteksi sebagai sukses.");
            } else {
                console.log("⚠️ Login berhasil tetapi tidak dapat memverifikasi apakah sesi valid.");
            }

        } else {
            console.error(`⚠️ Login berhasil tetapi status bukan 200: ${response.status}`);
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
