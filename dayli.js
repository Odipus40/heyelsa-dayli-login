const axios = require('axios');
const readline = require('readline');
require('colors');
const { displayHeader } = require('./helpers');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const API_URL = 'https://api.heyelsa.ai/api/point'; // Ganti dengan URL API yang benar
const WAIT_TIME = 24 * 60 * 60 * 1000; // 24 jam dalam milidetik

const TASKS = [{ id: 1, name: "Daily Login" }];

async function checkStatus(address) {
  try {
    const response = await axios.post(API_URL + "/status", { address }, { points }, { address }
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const user = response.data.user;
    if (!user) {
      console.log('❌ User not found or error occurred.'.red);
      return;
    }

    console.log(`\n💳 Address: ${user.address}`);
    console.log(`💻 Status: ${user.verifiedStatus === "IS_FULLY_VERIFIED" ? "VERIFIED" : user.verifiedStatus}`);
    console.log(`🏆 Rank: ${user.rank}`);
    console.log(`💰 Points: ${user.points}`);
    
    if (user.referrals) {
      console.log(`👥 Total Referrals: ${user.referrals.totalCount}`);
      console.log(`💎 Referral Points: ${user.referrals.points}`);
      console.log(`🏅 Referral Rank: ${user.referrals.rank}`);
    }

    console.log('\n');
  } catch (error) {
    console.error('⚠️ Error checking status:', error.response?.data || error.message);
  }
}

async function runTask(address, task) {
  try {
    const response = await axios.post(API_URL + "/complete-task", { address, taskID: task.id }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.data.success) {
      console.log(`✅ Task "${task.name}" completed successfully.`);
    } else {
      console.log(`❌ Task "${task.name}" failed. Check the status or try again.`);
    }
  } catch (error) {
    console.error(`⚠️ Error running task "${task.name}":`, error.response?.data || error.message);
  }
}

async function startDailyTasks(address) {
  while (true) {
    await checkStatus(address);
    console.log('🚀 Starting daily tasks...\n'.blue.bold);

    for (const task of TASKS) {
      await runTask(address, task);
    }

    console.log('\n🎉 All tasks completed for today.'.green.bold);
    console.log('⏳ Waiting 24 hours before the next cycle...\n'.yellow);
    await new Promise(resolve => setTimeout(resolve, WAIT_TIME));
  }
}

rl.question('🔑 Enter your address: '.cyan, (address) => {
  if (!address) {
    console.log('⚠️ Address cannot be empty!'.red.bold);
    rl.close();
    return;
  }

  rl.close();
  startDailyTasks(address);
});
