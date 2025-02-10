require('dotenv').config();
const axios = require('axios');

// Fungsi login
const login = async () => {
    const url = 'https://app.heyelsa.ai/login'; // Pastikan URL benar
    const cookie = process.env.COOKIE;

    if (!cookie) {
        console.error("❌ Cookie tidak ditemukan. Pastikan file .env telah diisi.");
        return;
    }

    // Ambil waktu sekarang
    const now = new Date();
    const formattedTime = now.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

    console.log(`\n⏳ [${formattedTime}] Memulai proses login...`);

    try {
        const response = await axios.get(url, {
            headers: {
                'Cookie': cookie, 
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json, text/html',
            }
        });

        if (response.status === 200) {
            console.log(`✅ [${formattedTime}] Login berhasil!`);
            
            if (response.data.includes("dashboard") || response.data.includes("Welcome")) {
                console.log("🔹 Login Sukses.");
            } else {
                console.log("⚠️ Login berhasil tetapi tidak dapat memverifikasi sesi.");
            }
        } else {
            console.error(`⚠️ [${formattedTime}] Login berhasil tetapi status bukan 200: ${response.status}`);
        }
    } catch (error) {
        if (error.response) {
            console.error(`❌ [${formattedTime}] Login gagal: ${error.response.status}`, error.response.data);
        } else {
            console.error(`❌ [${formattedTime}] Terjadi kesalahan:`, error.message);
        }
    }
};

// Atur jadwal agar berjalan otomatis setiap hari pada jam tertentu
const scheduleLogin = () => {
    const hour = 7;  // Ganti dengan jam yang diinginkan (24 jam format)
    const minute = 0; // Ganti dengan menit yang diinginkan

    setInterval(() => {
        const now = new Date();
        if (now.getHours() === hour && now.getMinutes() === minute) {
            login();
        }
    }, 60 * 1000); // Cek setiap menit
};

// Jalankan login pertama kali
login();

// Jalankan otomatis setiap hari
scheduleLogin();
