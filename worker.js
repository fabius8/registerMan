const fs = require('fs');
const path = require('path');
const randomUseragent = require('random-useragent');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
require('dotenv').config();

puppeteer.use(StealthPlugin());

// 获取传入的用户编号
const userNumber = parseInt(process.argv[2] || process.env.USER_NUMBER);

// 创建一个专门记录成功注册的日志文件
const successLogPath = path.resolve('successful_registrations.txt');

function getCurrentTime() {
    const now = new Date();
    return now.toISOString().replace('T', ' ').split('.')[0];
}

function log(userIndex, message) {
    console.log(`[${getCurrentTime()}] [User ${userIndex + 1}] ${message}`);
}

function logSuccessfulRegistration(userIndex, username, password) {
    const logEntry = `[${getCurrentTime()}] User ${userIndex + 1}: ${username}:${password}\n`;
    
    // 追加到成功注册日志文件
    fs.appendFileSync(successLogPath, logEntry);
    
    // 控制台输出
    console.log(`✅ Successful Registration - ${logEntry.trim()}`);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 从文件中读取代理信息并解析
function loadProxies(filePath) {
    const proxies = [];
    const data = fs.readFileSync(filePath, 'utf-8').split('\n');
    data.forEach(line => {
        const [ip, port] = line.trim().split(':');
        if (ip && port) {
            proxies.push({ ip, port });
        }
    });
    return proxies;
}

// 从文件中读取用户名和密码
function loadCredentials(filePath) {
    const credentials = [];
    const data = fs.readFileSync(filePath, 'utf-8').split('\n');
    data.forEach(line => {
        const [username, password] = line.trim().split(':');
        if (username && password) {
            credentials.push({ username, password });
        }
    });
    return credentials;
}

// 新增函数：从文件中随机选择邀请链接
function getRandomInvitationLink(filePath) {
    const links = fs.readFileSync(filePath, 'utf-8')
        .split('\n')
        .filter(link => link.trim() !== '');
    
    if (links.length === 0) {
        throw new Error('No invitation links found in the file');
    }
    
    const randomIndex = Math.floor(Math.random() * links.length);
    return links[randomIndex].trim();
}

async function launch(userIndex, userDataDir, proxy, userCredentials) {
    const extensionPath2 = path.resolve('extension/canvas');

    const extensionPaths = extensionPath2

    const proxyUrl = `http://${proxy.ip}:${proxy.port}`;
    // 动态调试端口，根据 userIndex 生成不同的端口号
    const debuggingPort = 11500 + userIndex;

    let executablePath;
    if (process.env.CHROME_PATH) {
        executablePath = process.env.CHROME_PATH;
    }
    console.log('Using Chrome path:', executablePath || 'Default Chromium from puppeteer');



    const browser = await puppeteer.launch({
        ...executablePath && { executablePath },
        headless: false,
        ignoreHTTPSErrors: true,
        userDataDir: userDataDir,
        args: [
            `--no-sandbox`,
            `--disable-extensions-except=${extensionPaths}`,
            `--load-extension=${extensionPaths}`,
            //`--ignore-certificate-errors=${pemPath}`,
            `--proxy-server=${proxyUrl}`,
            `--remote-debugging-port=${debuggingPort}`,  // 根据 userIndex 设置的调试端口
            //'--disable-gpu',  // 禁用GPU加速
            //'--disable-dev-shm-usage', // 禁用/dev/shm使用
            //'--disable-setuid-sandbox',
            '--no-first-run',
            '--no-zygote',
            `--js-flags=--max-old-space-size=512`, // 限制JavaScript堆内存
        ],
    });
    log(userIndex, `Browser launched successfully with user data directory: ${userDataDir}`);

    try {
        await sleep(5000)

        const page = await browser.newPage();

        const randomUserAgent = randomUseragent.getRandom();
        await page.setUserAgent(randomUserAgent);
        log(userIndex, `Using user agent: ${randomUserAgent}`);

        // 随机选择邀请链接
        const invitationLink = getRandomInvitationLink('invitationLink.txt');
        log(userIndex, `Navigating to ${invitationLink}...`);
        await page.goto(invitationLink, { waitUntil: 'domcontentloaded' });

        // 设置拦截器捕获signup API响应
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            request.continue();
        });

        page.on('response', async (response) => {
            if (response.url().includes('api/signup')) {
                try {
                    const responseBody = await response.text();
                    if (responseBody.includes('User registered successfully')) {
                        logSuccessfulRegistration(
                            userIndex, 
                            userCredentials.username, 
                            userCredentials.password
                        );
                    }
                } catch (error) {
                    log(userIndex, `Error checking signup response: ${error.message}`);
                }
            }
        });

        // 查找并输入邮箱
        const emailSelector = 'input[placeholder="Email"]';
        const passwordSelector = 'input[placeholder="Password"]';

        // 输入邮箱
        const emailInput = await page.waitForSelector(emailSelector, { timeout: 5000 });
        if (emailInput) {
            await emailInput.type(userCredentials.username);
            log(userIndex, `Entered ${userCredentials.username} into email input.`);
            
            // 输入密码
            const passwordInput = await page.waitForSelector(passwordSelector, { timeout: 5000 });
            if (passwordInput) {
                await passwordInput.type(userCredentials.password);
                log(userIndex, `Entered ${userCredentials.password} into password input.`);

                // 按下回车键
                await page.click('.primary-btn');
                log(userIndex, "Submitted login form.");
            } else {
                log(userIndex, "Password input not found, skipping.");
            }
        } else {
            log(userIndex, "Email input not found, skipping password input.");
        }

    } catch (e) {
        log(userIndex, `Error: ${e.message}`);
    }

    await sleep(10000)

}

// 主运行函数
async function run() {
    try {
        const userIndex = userNumber - 1;
        const baseUserDataDir = path.resolve('USERDATA');
        const userDataDir = path.join(baseUserDataDir, userNumber.toString().padStart(4, '0'));
        
        // 确保用户数据目录存在
        fs.mkdirSync(userDataDir, { recursive: true });

        // 读取代理和凭据
        const proxies = loadProxies('proxies.txt');
        const credentials = loadCredentials('credentials.txt');

        if (!proxies[userIndex] || !credentials[userIndex]) {
            throw new Error('代理或凭据不足');
        }

        await launch(userIndex, userDataDir, proxies[userIndex], credentials[userIndex]);
    } catch (error) {
        console.error(`Worker ${userNumber} error:`, error);
        process.exit(1);
    }
}

// 启动工作进程
run();

// 错误处理
process.on('uncaughtException', (err) => {
    console.error(`Worker ${userNumber} uncaught exception:`, err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error(`Worker ${userNumber} unhandled rejection:`, reason);
    process.exit(1);
});
