const axios = require("axios");
const ethers = require("ethers");
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

async function checkPoints(walletAddress) {
  try {
    console.log(`🔍 Checking points for wallet: ${walletAddress}`);
    const response = await axios.post(API_POINTS, { wallet_address: walletAddress });
    const points = response.data?.points || 0;
    console.log(`🏆 [${walletAddress}] Current points: ${points}`);
    return points;
  } catch (error) {
    console.error(`❌ [${walletAddress}] Failed to check points:`, error.response?.data || error.message);
    return 0;
  }
}

async function checkIn(walletAddress) {
  try {
    const statusResponse = await axios.get(`${API_POINTS_HISTORY}?wallet_address=${walletAddress}`);
    if (statusResponse.data?.data?.points_details) {
      console.log(`✅ [${walletAddress}] Already dayli login today!`);
      return true;
    }

    console.log(`🟡 [${walletAddress}] Dayli login failed. Attempting check-in...`);
    const pointsBefore = await checkPoints(walletAddress);

    if (pointsBefore > 0) {
      console.log(`✅ [${walletAddress}] Check-in successful.`);
      return true;
    } else {
      console.log(`❌ [${walletAddress}] Check-in failed.`);
      return false;
    }
  } catch (error) {
    console.error(`❌ [${walletAddress}] Error during login process:`, error.response?.data || error.message);
    return false;
  }
}

async function main() {
  try {
    let attempts = 0;
    while (attempts < 3) {
      console.log("\n⏳ Starting Daily Login Process...");
      let success = true;

      for (const privateKey of PRIVATE_KEYS) {
        try {
          const wallet = new ethers.Wallet(privateKey);
          const walletSuccess = await checkIn(wallet.address);
          if (!walletSuccess) success = false;
        } catch (error) {
          console.error(`❌ Error processing wallet ${privateKey}:`, error.message);
          success = false;
        }
      }

      if (success) {
        console.log("✅ All wallets checked in successfully.");
        break;
      } else {
        attempts++;
        console.log(`🔄 Retrying in 8 hours... (Attempt ${attempts}/3)`);
        await new Promise((resolve) => setTimeout(resolve, CHECKIN_INTERVAL_FAIL));
      }
    }

    console.log("🚨 Max attempts reached. Stopping script.");
  } catch (error) {
    console.error("🚨 Critical error in main process:", error);
  }
}

main().catch(console.error);
