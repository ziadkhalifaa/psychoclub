import paramiko
import sys

host = "82.201.143.207"
user = "mostafa"
pword = "root@123321"

def seed_admin():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(host, username=user, password=pword)
        
        seed_ts = (
            "import { PrismaClient } from '@prisma/client';\n"
            "import bcrypt from 'bcryptjs';\n"
            "const prisma = new PrismaClient();\n"
            "async function main() {\n"
            "  const passwordHash = await bcrypt.hash('admin123', 10);\n"
            "  const user = await prisma.user.upsert({\n"
            "    where: { email: 'admin@psychoclub.org' },\n"
            "    update: {},\n"
            "    create: {\n"
            "      name: 'Admin',\n"
            "      email: 'admin@psychoclub.org',\n"
            "      passwordHash,\n"
            "      role: 'ADMIN',\n"
            "      status: 'ACTIVE'\n"
            "    }\n"
            "  });\n"
            "  console.log('Admin user created:', user.email);\n"
            "}\n"
            "main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());\n"
        )
        
        # Upload
        sftp = client.open_sftp()
        with sftp.open('/home/mostafa/psychoclub/seed_admin.ts', 'w') as f:
            f.write(seed_ts)
        sftp.close()
        
        # Run
        print("Running seed script on server...")
        stdin, stdout, stderr = client.exec_command('cd ~/psychoclub && npx tsx seed_admin.ts')
        print(stdout.read().decode())
        print(stderr.read().decode())
        
        print("Done.")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    seed_admin()
