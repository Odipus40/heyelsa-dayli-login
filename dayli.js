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

const TASKS = [
  { id: 0, name: "login" },
];

displayHeader();

async function checkStatus(address) {
  const payload = {
    query: `
        evm_address {
            points
            referrals_code
            }
          }
        }
      }
    `,
    variables: {
      filter: { evm_address },
    },
  };

  try {
    const response = await axios.post(API_URL, payload, {
      headers: {
        'Content-Type': 'text/x-component',
      },
    });

    const user = response.data.data.evm_address;
    if (!user) {
      console.log('❌ User not found or error occurred.'.red);
      return;
    }

    console.log(`\n💳 Address: ${user.address}`);
    console.log(`💰 Points: ${user.points}`);
    console.log(`🏅 Referrals: ${user.referral_code}`);
    if (user.referral_code) {
      console.log(`👥 Total Referrals: ${user.referral_code.totalCount}`);
      console.log(`💎 Referral Points: ${user.referrals.points}`);
      console.log(`🏅 Referral Rank: ${user.referrals.rank}`);
    }

    console.log('\n');
  } catch (error) {
    console.error('⚠️ Error checking status:', error.response?.data || error.message);
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
      input: {
        address,
        points,
        reffeal_code,
      },
    },
  };

  try {
    const response = await axios.post(API_URL, payload, {
      headers: {
        'Content-Type': 'text/x-component',
      },
    });

    const data = response.data;
    if (data.data && data.data.evm_address.updateTaskStatus.success) {
      const { completedAt } = data.data.evm_address.updateTaskStatus.progress;
      console.log(`➡️  Running task: ${task.name}`);
      console.log(`✅ Task "${task.name}"`.green.bold + ` completed successfully at `.green.bold + `${new Date(completedAt)}`.green.bold);
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

    await checkStatus(address);

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
  if (!address) {
    console.log('⚠️ Address cannot be empty!'.red.bold);
    rl.close();
    return;
  }

  rl.close();
  startDailyTasks(address);
});
