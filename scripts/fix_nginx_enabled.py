import paramiko
import sys
import re

host = "82.201.143.207"
user = "mostafa"
pword = "root@123321"

def fix_nginx_enabled():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(host, username=user, password=pword)
        
        # Read the REAL config being used
        print("Reading /etc/nginx/sites-enabled/psychoclub...")
        stdin, stdout, stderr = client.exec_command('cat /etc/nginx/sites-enabled/psychoclub')
        content = stdout.read().decode()
        
        # Replace all 3001 with 3000
        # Also ensure no trailing slashes on proxy_pass if it's the /api/ block
        new_content = content.replace("127.0.0.1:3001", "127.0.0.1:3000")
        
        # Specific fix for the stripping prefix issue (remove trailing slash in proxy_pass)
        new_content = new_content.replace("proxy_pass http://127.0.0.1:3000/;", "proxy_pass http://127.0.0.1:3000;")
        
        # Write back directly to sites-enabled
        sftp = client.open_sftp()
        with sftp.open('/home/mostafa/psychoclub_nginx_final.tmp', 'w') as f:
            f.write(new_content)
        sftp.close()
        
        print("Applying final Nginx config to sites-enabled...")
        client.exec_command(f'echo {pword} | sudo -S mv /home/mostafa/psychoclub_nginx_final.tmp /etc/nginx/sites-enabled/psychoclub')
        
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
    fix_nginx_enabled()
