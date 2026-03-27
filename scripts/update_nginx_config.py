import paramiko
import sys

host = "82.201.143.207"
user = "mostafa"
pword = "root@123321"

def update_nginx():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(host, username=user, password=pword)
        
        # Backup
        print("Backing up Nginx config...")
        client.exec_command(f'echo {pword} | sudo -S cp /etc/nginx/sites-available/psychoclub /etc/nginx/sites-available/psychoclub.bak')
        
        # Read current config
        stdin, stdout, stderr = client.exec_command('cat /etc/nginx/sites-available/psychoclub')
        content = stdout.read().decode()
        
        # Replace 3001 with 3000
        new_content = content.replace("127.0.0.1:3001", "127.0.0.1:3000")
        
        # Write back (using a temp file and then sudo mv)
        sftp = client.open_sftp()
        with sftp.open('/home/mostafa/psychoclub_nginx.tmp', 'w') as f:
            f.write(new_content)
        sftp.close()
        
        print("Applying new Nginx config...")
        client.exec_command(f'echo {pword} | sudo -S mv /home/mostafa/psychoclub_nginx.tmp /etc/nginx/sites-available/psychoclub')
        
        # Test and reload
        print("Testing Nginx config...")
        stdin, stdout, stderr = client.exec_command(f'echo {pword} | sudo -S nginx -t')
        print(stderr.read().decode())
        
        print("Reloading Nginx...")
        client.exec_command(f'echo {pword} | sudo -S systemctl reload nginx')
        print("Done.")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    update_nginx()
