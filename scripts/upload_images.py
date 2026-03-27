import paramiko
import os

host = "82.201.143.207"
user = "mostafa"
pword = "root@123321"

images = [
    ("public/images/specialists/specialist6.png", "psychoclub/public/images/specialists/specialist6.png"),
    ("public/images/specialists/specialist16.png", "psychoclub/public/images/specialists/specialist16.png"),
]

def upload_images():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(host, username=user, password=pword)
        sftp = client.open_sftp()
        for local, remote in images:
            print(f"Uploading {local}...")
            sftp.put(local, remote)
        sftp.close()
        
        print("Rebuilding frontend to update dist/...")
        client.exec_command("cd ~/psychoclub && export NODE_OPTIONS=--max-old-space-size=2048 && npm run build")
        print("Done!")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    upload_images()
