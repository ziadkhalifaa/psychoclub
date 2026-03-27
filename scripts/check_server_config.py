import paramiko

host = "82.201.143.207"
user = "mostafa"
pword = "root@123321"

def check():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(host, username=user, password=pword)
        sftp = client.open_sftp()
        with sftp.open('psychoclub/vite.config.ts') as f:
            print(f.read().decode())
        sftp.close()
    finally:
        client.close()

if __name__ == "__main__":
    check()
