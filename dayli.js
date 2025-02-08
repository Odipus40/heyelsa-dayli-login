const axios = require("axios");
const ethers = require("ethers");
const { displayHeader } = require('./helpers');
const dotenv = require("dotenv");

dotenv.config();

const API_POINTS = "https://app.heyelsa.ai/api/points";
const API_POINTS_HISTORY = "https://app.heyelsa.ai/api/points_history";

const PRIVATE_KEYS = process.env.PRIVATE_KEYS ? process.env.PRIVATE_KEYS.split(",") : [];
if (PRIVATE_KEYS.length === 0) {
  console.error("❌ No private keys found in .env file! Please add PRIVATE_KEYS.");
  process.exit(1);
}

const CHECKIN_INTERVAL_SUCCESS = 8 * 60 * 60 * 1000;
const CHECKIN_INTERVAL_FAIL = 8 * 60 * 60 * 1000;
const MAX_RETRY_ATTEMPTS = 5;

async function checkPoints(walletAddress) {
  try {
    const response = await axios.post(`${API_POINTS}${walletAddress}`);
    const points = response.data?.points || 0;
    console.log(`🏆 [${walletAddress}] Current points: ${points}`);
  } catch (error) {
    console.error(`❌ [${walletAddress}] Failed to check points:`, error.message);
  }
}

async function checkIn(walletAddress) {
  try {
    const statusResponse = await axios.post(API_POINTS_HISTORY + walletAddress);
    if (statusResponse.data?.data?.points_details) {
      console.log(`✅ [${walletAddress}] Already checked in today! Skipping check-in...`);
    } else {
      console.log(`🟡 [${walletAddress}] Not checked in yet. Attempting check-in...`);
      const success = await attemptCheckIn(walletAddress);
      if (!success) {
        console.log(`❌ [${walletAddress}] Check-in failed. Proceeding to check points...`);
      }
    }

    await checkPoints(walletAddress);
  } catch (error) {
    console.error(`❌ [${walletAddress}] Error during check-in process:`, error.message);
  }
}

async function main() {
  while (true) {
    console.log("\n⏳ Starting Daily Login Process...");
    let success = true;
    for (const privateKey of PRIVATE_KEYS) {
      const wallet = new ethers.Wallet(privateKey);
      const walletSuccess = await checkIn(wallet.address);
      if (!walletSuccess) success = false;
    }

    const delay = success ? CHECKIN_INTERVAL_SUCCESS : CHECKIN_INTERVAL_FAIL;
    console.log(`🕖 Waiting ${delay / (60 * 60 * 1000)} hours before the next check-in...`);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}

main().catch(console.error);
