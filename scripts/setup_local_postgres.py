import paramiko
import sys

host = "82.201.143.207"
user = "mostafa"
pword = "root@123321"

def install_postgres():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(host, username=user, password=pword)
        
        # 1. Install Postgres
        print("Installing PostgreSQL...")
        commands = [
            f'echo {pword} | sudo -S apt update',
            f'echo {pword} | sudo -S apt install -y postgresql postgresql-contrib'
        ]
        for cmd in commands:
            stdin, stdout, stderr = client.exec_command(cmd)
            stdout.read() # wait
            
        # 2. Create User and Database
        print("Creating Database and User...")
        pg_cmds = [
            "sudo -u postgres psql -c \"CREATE USER psychouser WITH PASSWORD 'psychopassword123';\"",
            "sudo -u postgres psql -c \"CREATE DATABASE psychoclub OWNER psychouser;\"",
            "sudo -u postgres psql -c \"ALTER USER psychouser WITH SUPERUSER;\"" # Optional, for prisma db push simplicity
        ]
        for cmd in pg_cmds:
            client.exec_command(f'echo {pword} | sudo -S {cmd}')
            
        print("PostgreSQL setup complete.")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    install_postgres()
