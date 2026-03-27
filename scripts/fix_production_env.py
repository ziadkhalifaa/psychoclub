import paramiko

host = "82.201.143.207"
user = "mostafa"
pword = "root@123321"

env_content = """DATABASE_URL=postgresql://postgres.wtkbflyeofxzntqbmpgk:USVH26w2TjCH1hiZ@aws-1-eu-west-1.pooler.supabase.com:5432/postgres
JWT_SECRET=random_secret_123456
NODE_ENV=production
PORT=3001
"""

def fix():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(host, username=user, password=pword)
        sftp = client.open_sftp()
        print("Uploading .env to server...")
        with sftp.open('psychoclub/.env', 'w') as f:
            f.write(env_content)
        sftp.close()
        
        print("Restarting psychoclub-api to pick up new .env...")
        client.exec_command("pm2 restart psychoclub-api")
        print("Done.")
    finally:
        client.close()

if __name__ == "__main__":
    fix()
