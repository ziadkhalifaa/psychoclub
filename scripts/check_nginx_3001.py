import paramiko
import sys

host = "82.201.143.207"
user = "mostafa"
pword = "root@123321"

def check_nginx_all():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(host, username=user, password=pword)
        
        # Search for 3001 in all sites-enabled
        cmd = "grep -r '3001' /etc/nginx/sites-enabled/"
        stdin, stdout, stderr = client.exec_command(cmd)
        results = stdout.read().decode().strip()
        
        print(f"Grep results for '3001':\n{results}")
        
        # List all files for clarity
        stdin, stdout, stderr = client.exec_command("ls -l /etc/nginx/sites-enabled/")
        print(f"\nFiles in sites-enabled:\n{stdout.read().decode().strip()}")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    check_nginx_all()
