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
  { id: 1, name: "Daily Check-In" },
];

displayHeader();

async function checkStatus(address) {
  const payload = {
          id:
            evm_address:
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
    variables: {
      filter: { address },
    },
  };

  try {
    const response = await axios.post(API_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const user = response.data.data.WebKitFormBoundaryqXiHrnM0rJUkUnNi.user;
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
  const payload = {
    [{"action":"$F1","options":{"onSetAIState":"$F2"}},[],"0x6F5dA981982011F1aC2ec345b5C2681C16298f2E","Injected","$undefined",["Arbitrum","Base","Optimism","Polygon","BSC","Hyperliquid"]]
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
        taskID: task.id,
      },
    },
  };

  try {
    const response = await axios.post(API_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = response.data;
    if (data.data && data.data.WebKitFormBoundaryqXiHrnM0rJUkUnNi.updateTaskStatus.success) {
      const { completedAt } = data.data.WebKitFormBoundaryqXiHrnM0rJUkUnNi.updateTaskStatus.progress;
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
