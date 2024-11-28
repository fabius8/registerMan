const pm2 = require('pm2');

async function startAndDeleteProcess(userNumber) {
    return new Promise((resolve, reject) => {
        pm2.start({
            script: './worker.js',
            name: `pipe-reg-${userNumber}`,
            args: [userNumber.toString()],
            max_memory_restart: '500M',
            env: {
                USER_NUMBER: userNumber
            }
        }, (err) => {
            if (err) {
                console.error(`User ${userNumber} 启动失败:`, err);
                reject(err);
                return;
            }

            console.log(`User ${userNumber} 启动成功`);

            // 30秒后删除
            setTimeout(() => {
                pm2.delete(`pipe-reg-${userNumber}`, (deleteErr) => {
                    if (deleteErr) {
                        console.error(`删除 pipe-reg-${userNumber} 失败:`, deleteErr);
                    } else {
                        console.log(`pipe-reg-${userNumber} 已删除`);
                    }
                });
            }, 30000);

            resolve();
        });
    });
}

async function main() {
    const START_USER = parseInt(process.argv[2] || 1);
    const END_USER = parseInt(process.argv[3] || 2);

    console.log(`准备启动用户 ${START_USER} 到 ${END_USER}`);

    pm2.connect(async (err) => {
        if (err) {
            console.error(err);
            process.exit(2);
        }

        try {
            for (let userNumber = START_USER; userNumber <= END_USER; userNumber++) {
                await startAndDeleteProcess(userNumber);
                await new Promise(resolve => setTimeout(resolve, 5000));  // 等待5秒
            }
        } catch (error) {
            console.error('启动过程出错:', error);
        } finally {
            pm2.disconnect((disconnectErr) => {
                if (disconnectErr) {
                    console.error('断开连接时出错:', disconnectErr);
                }
                process.exit(0);
            });
        }
    });
}

main();