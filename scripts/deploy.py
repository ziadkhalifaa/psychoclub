import paramiko
import os

def upload_files(hostname, username, password, files_map):
    transport = paramiko.Transport((hostname, 22))
    try:
        transport.connect(username=username, password=password)
        sftp = paramiko.SFTPClient.from_transport(transport)
        
        for local_path, remote_path in files_map.items():
            print(f"Uploading {local_path} to {remote_path}...")
            # Ensure remote directory exists
            remote_dir = os.path.dirname(remote_path)
            try:
                sftp.chdir(remote_dir)
            except IOError:
                # This is a bit simplistic, but usually the dirs exist or we can create them
                # For this task, we know the structure
                pass
            
            sftp.put(local_path, remote_path)
            print(f"Successfully uploaded {local_path}")
            
        sftp.close()
    except Exception as e:
        print(f"Error: {e}")
    finally:
        transport.close()

if __name__ == "__main__":
    host = "82.201.143.207"
    user = "mostafa"
    pw = "root@123321"
    
    # Map of local absolute paths to remote absolute paths
    base_local = r"d:\Qiam\New folder\elbayez-main\elbayez-main"
    base_remote = "/home/mostafa/psychoclub"
    
    files_to_upload = {
        os.path.join(base_local, "server.ts"): f"{base_remote}/server.ts",
        os.path.join(base_local, "src", "i18n.ts"): f"{base_remote}/src/i18n.ts",
        os.path.join(base_local, "src", "pages", "AdminDashboard.tsx"): f"{base_remote}/src/pages/AdminDashboard.tsx",
        os.path.join(base_local, "src", "pages", "DoctorDashboard.tsx"): f"{base_remote}/src/pages/DoctorDashboard.tsx",
        os.path.join(base_local, "src", "components", "Layout.tsx"): f"{base_remote}/src/components/Layout.tsx",
        os.path.join(base_local, "src", "pages", "Profile.tsx"): f"{base_remote}/src/pages/Profile.tsx",
        os.path.join(base_local, "src", "pages", "Community.tsx"): f"{base_remote}/src/pages/Community.tsx",
    }
    
    upload_files(host, user, pw, files_to_upload)
