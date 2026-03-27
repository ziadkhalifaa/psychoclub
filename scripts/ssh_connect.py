import paramiko
import sys

def run_ssh_command(hostname, username, password, command):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(hostname, username=username, password=password, timeout=10)
        stdin, stdout, stderr = client.exec_command(command)
        out = stdout.read().decode()
        err = stderr.read().decode()
        if out: print(f"Output:\n{out}")
        if err: print(f"Error:\n{err}", file=sys.stderr)
        return True
    except Exception as e:
        print(f"Failed to connect or execute command: {e}")
        return False
    finally:
        client.close()

if __name__ == "__main__":
    host = "82.201.143.207"
    user = "mostafa"
    pw = "root@123321"
    cmd = sys.argv[1] if len(sys.argv) > 1 else "whoami; pwd; ls -la"
    run_ssh_command(host, user, pw, cmd)
