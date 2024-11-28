import subprocess
import time

def start_process(index):
    command = f'node start-multiple.js {index} {index}'
    print(f'Starting process: {command}')
    process = subprocess.Popen(command, shell=True)
    
    # 等待进程完成
    process.wait()
    
    # 30秒后删除对应的 PM2 进程
    time.sleep(30)
    delete_command = f'pm2 delete pipe-reg-{index}'
    print(f'Deleting process: {delete_command}')
    subprocess.run(delete_command, shell=True)

def start_all_processes(start_index, end_index):
    for i in range(start_index, end_index + 1):
        start_process(i)

if __name__ == "__main__":
    # 获取用户输入
    start_index = int(input("请输入起始索引: "))
    end_index = int(input("请输入结束索引: "))

    # 启动指定范围的进程
    start_all_processes(start_index, end_index)
