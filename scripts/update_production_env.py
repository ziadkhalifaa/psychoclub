import paramiko
import sys

host = "82.201.143.207"
user = "mostafa"
pword = "root@123321"

def update_env():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(host, username=user, password=pword)
        
        env_content = (
            "DATABASE_URL=postgresql://postgres.wtkbflyeofxzntqbmpgk:USVH26w2TjCH1hiZ@aws-1-eu-west-1.pooler.supabase.com:5432/postgres\n"
            "JWT_SECRET=random_secret_123456\n"
            "NODE_ENV=production\n"
            "PORT=3000\n"
        )
        
        # Use SFTP to write the file accurately
        sftp = client.open_sftp()
        with sftp.open('/home/mostafa/psychoclub/.env', 'w') as f:
            f.write(env_content)
        sftp.close()
        
        print("Successfully updated .env on server.")
        
        # Force PM2 to reload everything
        print("Force-restarting PM2 with fresh environment...")
        client.exec_command("pm2 delete all || true")
        # Use npm start which uses 'tsx server.ts' as defined in package.json
        client.exec_command("cd ~/psychoclub && pm2 start 'npm start' --name psychoclub-api")
        client.exec_command("pm2 save")
        print("Done.")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    update_env()
