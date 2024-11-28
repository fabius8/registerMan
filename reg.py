import subprocess
import time
import threading

def start_process(index):
    command = f'node start-multiple.js {index} {index}'
    print(f'Starting process: {command}')
    process = subprocess.Popen(command, shell=True)
    
    # 30秒后删除对应的 PM2 进程
    time.sleep(30)
    delete_command = f'pm2 delete pipe-reg-{index}'
    print(f'Deleting process: {delete_command}')
    subprocess.run(delete_command, shell=True)

def start_all_processes(start_index, end_index):
    threads = []
    for i in range(start_index, end_index + 1):
        thread = threading.Thread(target=start_process, args=(i,))
        threads.append(thread)
        thread.start()

    # 等待所有线程完成
    for thread in threads:
        thread.join()

if __name__ == "__main__":
    # 获取用户输入
    start_index = int(input("请输入起始索引: "))
    end_index = int(input("请输入结束索引: "))

    # 启动指定范围的进程
    start_all_processes(start_index, end_index)
