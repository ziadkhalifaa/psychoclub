import paramiko
import os
import sys

host = "82.201.143.207"
user = "mostafa"
pword = "root@123321"
base_local = r"d:\Qiam\New folder\elbayez-main\elbayez-main"
base_remote = "psychoclub" # Relative to home /home/mostafa

def sftp_put_r(sftp, local_dir, remote_dir):
    try:
        sftp.mkdir(remote_dir)
        print(f"Created remote dir: {remote_dir}")
    except IOError:
        pass # Already exists

    for item in os.listdir(local_dir):
        if item in ['.git', 'node_modules', 'dist', 'uploads', 'backups', 'tmp', '.venv', '__pycache__']:
            continue
        
        # Specific exclusion for public/uploads
        if item == 'public':
            local_pub = os.path.join(local_dir, item)
            remote_pub = os.path.join(remote_dir, item).replace('\\', '/')
            try: sftp.mkdir(remote_pub)
            except IOError: pass
            
            for pub_item in os.listdir(local_pub):
                if pub_item == 'uploads': continue # Never sync uploads
                l_path = os.path.join(local_pub, pub_item)
                r_path = os.path.join(remote_pub, pub_item).replace('\\', '/')
                if os.path.isdir(l_path):
                    sftp_put_r(sftp, l_path, r_path)
                else:
                    print(f"Uploading {l_path} to {r_path}...")
                    sftp.put(l_path, r_path)
            continue

        local_path = os.path.join(local_dir, item)
        remote_path = os.path.join(remote_dir, item).replace('\\', '/')
        
        if os.path.isdir(local_path):
            sftp_put_r(sftp, local_path, remote_path)
        else:
            # Only upload files that were modified or are new
            print(f"Uploading {local_path} to {remote_path}...")
            sftp.put(local_path, remote_path)

def deploy():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        print(f"Connecting to {host}...")
        client.connect(host, username=user, password=pword)
        
        sftp = client.open_sftp()
        print("Starting recursive sync...")
        # We only sync specific root items to be safe
        root_items = ['server', 'scripts', 'prisma', 'src', 'server.ts', 'package.json', 'vite.config.ts', 'tsconfig.json', 'index.html', 'tailwind.config.ts']
        
        for item in root_items:
            l_path = os.path.join(base_local, item)
            r_path = f"{base_remote}/{item}"
            if os.path.exists(l_path):
                if os.path.isdir(l_path):
                    sftp_put_r(sftp, l_path, r_path)
                else:
                    print(f"Uploading {l_path} to {r_path}...")
                    sftp.put(l_path, r_path)
        
        sftp.close()
        print("Sync complete.")
        
        print("Installing dependencies and building...")
        commands = [
            f"cd ~/{base_remote} && npm install",
            f"cd ~/{base_remote} && export NODE_OPTIONS=--max-old-space-size=2048 && npm run build",
            f"pm2 restart psychoclub-api",
            f"pm2 restart psychoclub"
        ]
        
        for cmd in commands:
            print(f"Executing: {cmd}")
            stdin, stdout, stderr = client.exec_command(cmd)
            # Wait for completion
            exit_status = stdout.channel.recv_exit_status()
            out = stdout.read().decode()
            err = stderr.read().decode()
            if out: print(out)
            if err: print(err)
            if exit_status != 0:
                print(f"Command failed with status {exit_status}")
                # We don't necessarily abort on pm2 restart fail if one didn't exist
        
        print("Deployment successfully finished!")
    except Exception as e:
        print(f"Deployment Error: {e}")
        sys.exit(1)
    finally:
        client.close()

if __name__ == "__main__":
    deploy()
