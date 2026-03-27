import paramiko
import sys

host = "82.201.143.207"
user = "mostafa"
pword = "root@123321"

def sync_and_migrate():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(host, username=user, password=pword)
        sftp = client.open_sftp()
        
        # 1. Upload new configs and schema
        print("Uploading start_prod.sh, ecosystem.config.cjs and schema.prisma...")
        sftp.put('d:\\Qiam\\New folder\\elbayez-main\\elbayez-main\\scripts\\start_prod.sh', '/home/mostafa/psychoclub/start_prod.sh')
        sftp.put('d:\\Qiam\\New folder\\elbayez-main\\elbayez-main\\ecosystem.config.cjs', '/home/mostafa/psychoclub/ecosystem.config.cjs')
        sftp.put('d:\\Qiam\\New folder\\elbayez-main\\elbayez-main\\prisma\\schema.prisma', '/home/mostafa/psychoclub/prisma/schema.prisma')
        
        # 2. Update .env on server
        print("Updating .env on server...")
        env_content = (
            "DATABASE_URL=postgresql://psychouser:psychopassword123@localhost:5432/psychoclub\n"
            "JWT_SECRET=random_secret_123456\n"
            "NODE_ENV=production\n"
            "PORT=3000\n"
        )
        with sftp.open('/home/mostafa/psychoclub/.env', 'w') as f:
            f.write(env_content)
        sftp.close()
        
        # 3. Initialize prisma schema locally on the server
        print("Initializing local Prisma schema (prisma db push)...")
        # Ensure we are in the project dir and have DATABASE_URL set
        stdin, stdout, stderr = client.exec_command('cd ~/psychoclub && chmod +x start_prod.sh && npx prisma db push --accept-data-loss')
        
        # Wait and print output
        print(stdout.read().decode())
        print(stderr.read().decode())
        
        # 4. Restart PM2
        print("Finalizing with PM2 restart...")
        client.exec_command('pm2 delete all || true && cd ~/psychoclub && pm2 start ecosystem.config.cjs --env production && pm2 save')
        
        print("All steps complete. Local database is now LIVE.")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    sync_and_migrate()
