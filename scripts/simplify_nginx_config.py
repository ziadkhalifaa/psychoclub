import paramiko
import sys
import re

host = "82.201.143.207"
user = "mostafa"
pword = "root@123321"

def simplify_nginx():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(host, username=user, password=pword)
        
        # Read current config
        stdin, stdout, stderr = client.exec_command('cat /etc/nginx/sites-available/psychoclub')
        content = stdout.read().decode()
        
        # Remove the location /api/ { ... } block entirely
        # It's better to let the location / { ... } handle everything on port 3000
        pattern = r"location\s+/api/\s+\{[^}]+\}"
        # Wait, the block might be multiline.
        # Let's use a more robust regex for the block.
        new_content = re.sub(r'location\s+/api/\s+\{.*?\s*\}', '', content, flags=re.DOTALL)
        
        # Write back
        sftp = client.open_sftp()
        with sftp.open('/home/mostafa/psychoclub_nginx_clean.tmp', 'w') as f:
            f.write(new_content)
        sftp.close()
        
        print("Applying cleaned Nginx config...")
        client.exec_command(f'echo {pword} | sudo -S mv /home/mostafa/psychoclub_nginx_clean.tmp /etc/nginx/sites-available/psychoclub')
        
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
    simplify_nginx()
