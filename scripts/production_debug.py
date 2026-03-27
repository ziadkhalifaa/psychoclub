import paramiko

host = "82.201.143.207"
user = "mostafa"
pword = "root@123321"

def debug():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(host, username=user, password=pword)
        sftp = client.open_sftp()
        print("Checking .env...")
        try:
            with sftp.open('psychoclub/.env') as f:
                content = f.read().decode()
                print(".env found")
                for line in content.splitlines():
                    if line.startswith('JWT_SECRET='):
                        print("JWT_SECRET is set")
                    if line.startswith('DATABASE_URL='):
                        print("DATABASE_URL is set")
        except IOError:
            print(".env NOT found!")

        print("\nChecking PM2 status...")
        stdin, stdout, stderr = client.exec_command("pm2 jlist")
        print(stdout.read().decode())
        
        sftp.close()
    finally:
        client.close()

if __name__ == "__main__":
    debug()
