# Puppeteer Automation Project

一个基于 Puppeteer 的自动化浏览器项目，用于批量注册 [pipenetwork](https://pipe.network/) 网站。支持多用户、代理以及随机 User-Agent 模拟不同的设备访问。

## 功能概述

- 使用代理和随机 User-Agent 自动登录网站
- 支持多用户批量操作
- 日志记录：包含时间戳和用户编号

## 依赖

- [Puppeteer](https://pptr.dev/) - 控制 Chrome 或 Chromium 浏览器
- [puppeteer-extra](https://github.com/berstend/puppeteer-extra) - Puppeteer 的增强插件
  - [puppeteer-extra-plugin-stealth](https://github.com/berstend/puppeteer-extra/tree/master/packages/puppeteer-extra-plugin-stealth) - 隐藏 Puppeteer 自动化特征
- [random-useragent](https://github.com/skratchdot/random-useragent) - 随机生成 User-Agent

## 安装

1. **克隆项目**

   ```bash
   git clone https://github.com/fabius8/registerMan.git
   cd registerMan
   ```

2. **安装依赖**

   ```bash
   npm install
   npm install -g pm2
   ```

3. **准备代理和凭证文件**

   - 创建 `proxies.txt` 文件，格式为：`ip:port`
   - 创建 `credentials.txt` 文件，格式为：`username:password`

## 使用方法

1. **运行程序**

   ```bash
   node start-multiple.js 1 20
   ```

   **pm2其他命令**
   ```bash
   pm2 list
   pm2 logs pipe-reg-1
   pm2 logs pipe-reg-2
   pm2 stop all
   pm2 delete all
   ```

## 注意事项

- 确保 `proxies.txt` 和 `credentials.txt` 文件中有足够的代理和用户凭证。 `invitationLink.txt` 自行设置有邀请链接。
