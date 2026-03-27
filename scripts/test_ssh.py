import paramiko
import sys
import traceback

def test_ssh():
    host = "82.201.143.207"
    user = "root"
    pw = "5MA@2ufcquq#"
    
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        print(f"Connecting to {host} as {user}...")
        client.connect(host, username=user, password=pw, allow_agent=False, look_for_keys=False, timeout=10)
        print("Successfully connected!")
        stdin, stdout, stderr = client.exec_command("ls -la")
        print("Output:", stdout.read().decode())
    except Exception as e:
        print(f"Error type: {type(e)}")
        print(f"Error message: {e}")
        traceback.print_exc()
    finally:
        client.close()

if __name__ == "__main__":
    test_ssh()
