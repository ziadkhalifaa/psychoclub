import paramiko
import sys

host = "82.201.143.207"
user = "mostafa"
pword = "root@123321"

def setup_ssh():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(host, username=user, password=pword)
        
        # Check if key already exists
        stdin, stdout, stderr = client.exec_command("ls ~/.ssh/github_deploy_key")
        if stdout.channel.recv_exit_status() == 0:
            print("SSH Key already exists on server. Retrieving...")
        else:
            print("Generating new SSH key on server...")
            cmd = "ssh-keygen -t rsa -b 4096 -f ~/.ssh/github_deploy_key -N '' -q && cat ~/.ssh/github_deploy_key.pub >> ~/.ssh/authorized_keys"
            stdin, stdout, stderr = client.exec_command(cmd)
            stdout.channel.recv_exit_status()

        # Retrieve the private key
        stdin, stdout, stderr = client.exec_command("cat ~/.ssh/github_deploy_key")
        private_key = stdout.read().decode().strip()
        
        print("\n--- BEGIN PRIVATE KEY ---")
        print(private_key)
        print("--- END PRIVATE KEY ---\n")
        
        print("Successfully setup SSH key on server.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    setup_ssh()
