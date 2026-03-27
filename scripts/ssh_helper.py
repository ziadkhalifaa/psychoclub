import paramiko
import sys
import argparse
import os

def run_ssh_command(hostname, username, password, command):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(hostname, username=username, password=password, allow_agent=False, look_for_keys=False)
        stdin, stdout, stderr = client.exec_command(command)
        out = stdout.read().decode()
        err = stderr.read().decode()
        if out: print(out)
        if err: print(err, file=sys.stderr)
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

def upload_file(hostname, username, password, local_path, remote_path):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(hostname, username=username, password=password, allow_agent=False, look_for_keys=False)
        sftp = client.open_sftp()
        sftp.put(local_path, remote_path)
        sftp.close()
        print(f"Successfully uploaded {local_path} to {remote_path}")
    except Exception as e:
        print(f"Upload Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", required=True)
    parser.add_argument("--user", required=True)
    parser.add_argument("--password", required=True)
    parser.add_argument("--cmd", help="Command to run")
    parser.add_argument("--local-file", help="Local file to upload")
    parser.add_argument("--remote-path", help="Remote path for upload")
    args = parser.parse_args()
    
    if args.local_file and args.remote_path:
        upload_file(args.host, args.user, args.password, args.local_file, args.remote_path)
    
    if args.cmd:
        run_ssh_command(args.host, args.user, args.password, args.cmd)
