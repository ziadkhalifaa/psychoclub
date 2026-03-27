import paramiko
import os

host = "82.201.143.207"
user = "mostafa"
pword = "root@123321"

files_to_deploy = [
    ("src/pages/AdminDashboard.tsx", "psychoclub/src/pages/AdminDashboard.tsx"),
    ("src/components/CourseCreator.tsx", "psychoclub/src/components/CourseCreator.tsx"),
    ("src/pages/DoctorDashboard.tsx", "psychoclub/src/pages/DoctorDashboard.tsx"),
    ("src/components/ArticleEditor.tsx", "psychoclub/src/components/ArticleEditor.tsx"),
    ("src/components/Layout.tsx", "psychoclub/src/components/Layout.tsx"),
    ("src/i18n.ts", "psychoclub/src/i18n.ts"),
    ("src/pages/PrivacyPolicy.tsx", "psychoclub/src/pages/PrivacyPolicy.tsx"),
    ("server.ts", "psychoclub/server.ts"),
]

def deploy():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        print(f"Connecting to {host}...")
        client.connect(host, username=user, password=pword)
        
        sftp = client.open_sftp()
        for local_path, remote_path in files_to_deploy:
            print(f"Uploading {local_path} to {remote_path}...")
            sftp.put(local_path, remote_path)
        sftp.close()
        
        print("Running build command...")
        stdin, stdout, stderr = client.exec_command("cd ~/psychoclub && export NODE_OPTIONS=--max-old-space-size=2048 && npm run build")
        print(stdout.read().decode())
        print(stderr.read().decode())
        
        print("Restoring dual-process setup...")
        # Stop and delete old unified process
        client.exec_command("pm2 delete psychoclub")
        client.exec_command("pm2 delete psychoclub-api")
        
        # Start Backend on 3001
        print("Starting psychoclub-api on 3001...")
        client.exec_command("cd ~/psychoclub && NODE_ENV=production PORT=3001 pm2 start \"npx tsx server.ts\" --name psychoclub-api")
        
        # Start Frontend on 3000
        print("Starting psychoclub (preview) on 3000...")
        client.exec_command("cd ~/psychoclub && pm2 start \"npm run preview -- --host 0.0.0.0 --port 3000\" --name psychoclub")
        
        print("Deployment complete!")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    deploy()
