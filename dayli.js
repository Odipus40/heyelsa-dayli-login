const axios = require('axios');
const readline = require('readline');
require('colors');
const { displayHeader } = require('./helpers');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const API_URL = 'https://app.heyelsa.ai/login';
const WAIT_TIME = (24 * 60 + 5) * 60 * 1000;

const TASKS = [{ id: 0, name: "login" }];

displayHeader();

async function checkStatus(address) {
  const payload = {
    query: `
      query GetUserStatus($address: String!) {
        evm_address(address: $address) {
          points
          referrals_code
        }
      }
    `,
    variables: { address },
  };

  try {
    const response = await axios.post(API_URL, payload, {
      headers: { 'Content-Type': 'application/json' },
    });

    const user = response.data.data.evm_address;
    if (!user) {
      console.log('❌ User not found or error occurred.'.red);
      return null;
    }

    console.log(`\n💳 Address: ${address}`);
    console.log(`💰 Points: ${user.points}`);
    console.log(`🏅 Referrals Code: ${user.referrals_code}\n`);

    return user;
  } catch (error) {
    console.error('⚠️ Error checking status:', error.response?.data || error.message);
    return null;
  }
}

async function runTask(address, task) {
  const payload = {
    query: `
      mutation UpdateAirdropTaskStatus($input: UpdateTaskStatusInputData!) {
        evm_address {
          updateTaskStatus(input: $input) {
            success
            progress {
              isCompleted
              completedAt
            }
          }
        }
      }
    `,
    variables: {
      input: { address },
    },
  };

  try {
    const response = await axios.post(API_URL, payload, {
      headers: { 'Content-Type': 'application/json' },
    });

    const data = response.data;
    if (data.data && data.data.evm_address.updateTaskStatus.success) {
      const { completedAt } = data.data.evm_address.updateTaskStatus.progress;
      console.log(`➡️ Running task: ${task.name}`);
      console.log(`✅ Task "${task.name}" completed successfully at ${new Date(completedAt)}`.green.bold);
    } else {
      console.log(`➡️ Running task: ${task.name}`);
      console.log(`❌ Task "${task.name}" failed. Check the status or try again.`.red);
    }
  } catch (error) {
    console.error(`⚠️ An error occurred while running task "${task.name}":`, error.response?.data || error.message);
  }
}

async function startDailyTasks(address) {
  while (true) {
    const user = await checkStatus(address);
    if (!user) {
      console.log('⛔ Stopping process due to error.');
      break;
    }

    console.log('🚀 Starting daily tasks...\n'.blue.bold);
    for (const task of TASKS) {
      await runTask(address, task);
    }

    console.log('\n🎉 All tasks completed for today.'.green.bold);
    console.log('⏳ Waiting 24 hours before the next cycle...\n'.yellow);
    await new Promise((resolve) => setTimeout(resolve, WAIT_TIME));
  }
}

rl.question('🔑 Enter your address: '.cyan, (address) => {
  if (!address.trim()) {
    console.log('⚠️ Address cannot be empty!'.red.bold);
    rl.close();
    return;
  }

  rl.close();
  startDailyTasks(address);
});
