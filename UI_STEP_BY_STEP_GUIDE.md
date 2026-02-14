# GitHub Actions CI/CD Setup - Step-by-Step UI Guide

## PART 1: ADDING GITHUB SECRETS (5 minutes)

### Step 1: Open Your GitHub Repository
1. Open your web browser
2. Go to https://github.com
3. Sign in to your account
4. Navigate to your repository: `devops-ci-cd-project`

### Step 2: Access Settings
1. You'll see tabs at the top: Code, Issues, Pull requests, Actions, Projects, Wiki, Security, Insights, **Settings**
2. Click on the **Settings** tab (far right)
3. If you don't see Settings, you might not have admin access to the repository

### Step 3: Navigate to Secrets
1. On the left sidebar, scroll down to find **Secrets and variables**
2. Click on **Secrets and variables** to expand it
3. Click on **Actions** (under Secrets and variables)
4. You'll see a page titled "Actions secrets and variables"

### Step 4: Add First Secret (EC2_HOST)
1. Click the green button **New repository secret** (top right)
2. You'll see a form with two fields:
   - **Name**: Type `EC2_HOST` (exactly as shown, all caps)
   - **Secret**: Type `54.227.183.69`
3. Click the green **Add secret** button at the bottom
4. You'll be redirected back to the secrets page

### Step 5: Add Second Secret (EC2_USER)
1. Click **New repository secret** again
2. Fill in:
   - **Name**: `EC2_USER`
   - **Secret**: `ubuntu`
3. Click **Add secret**

### Step 6: Add Third Secret (EC2_SSH_KEY)
1. Click **New repository secret** again
2. Fill in:
   - **Name**: `EC2_SSH_KEY`
   - **Secret**: Open your `CICD.pem` file in Notepad
     - Go to `D:\devops-ci-cd-project\CICD.pem`
     - Right-click → Open with → Notepad
     - Press Ctrl+A to select all
     - Press Ctrl+C to copy
     - Go back to GitHub browser
     - Click in the Secret field
     - Press Ctrl+V to paste
     - Make sure it includes `-----BEGIN RSA PRIVATE KEY-----` at the top
     - And `-----END RSA PRIVATE KEY-----` at the bottom
3. Click **Add secret**

### Step 7: Verify Secrets
You should now see 3 secrets listed:
- EC2_HOST
- EC2_SSH_KEY
- EC2_USER

✅ GitHub Secrets Setup Complete!

---

## PART 2: PREPARE EC2 INSTANCE (20 minutes)

### Step 1: Connect to EC2 Using PuTTY (Windows)

#### Option A: Using Git Bash (Recommended)
1. Open Git Bash (search for it in Windows Start menu)
2. Navigate to your project:
   ```bash
   cd /d/devops-ci-cd-project
   ```
3. Connect to EC2:
   ```bash
   ssh -i CICD.pem ubuntu@54.227.183.69
   ```
4. If asked "Are you sure you want to continue connecting?", type `yes` and press Enter
5. You should now see a prompt like: `ubuntu@ip-xxx-xxx-xxx-xxx:~$`

#### Option B: Using PuTTY
1. Download PuTTY from https://www.putty.org/
2. Convert CICD.pem to .ppk format using PuTTYgen
3. Open PuTTY
4. Enter Host Name: `ubuntu@54.227.183.69`
5. Go to Connection → SSH → Auth → Credentials
6. Browse and select your .ppk file
7. Click Open

### Step 2: Update System
Once connected to EC2, run these commands one by one:

```bash
sudo apt update
```
Wait for it to complete (you'll see "Reading package lists... Done")

```bash
sudo apt upgrade -y
```
Wait for it to complete (may take 2-3 minutes)

### Step 3: Install Python
```bash
sudo apt install python3 python3-pip python3-venv -y
```
Wait for installation to complete

Verify:
```bash
python3 --version
```
You should see: Python 3.x.x

### Step 4: Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
```
Wait for it to complete

```bash
sudo apt install nodejs -y
```
Wait for installation (may take 2-3 minutes)

Verify:
```bash
node --version
npm --version
```
You should see version numbers

### Step 5: Install Git
```bash
sudo apt install git -y
```

Verify:
```bash
git --version
```

### Step 6: Clone Your Repository
```bash
cd /home/ubuntu
```

```bash
git clone https://github.com/YOUR_USERNAME/devops-ci-cd-project.git
```
**IMPORTANT**: Replace `YOUR_USERNAME` with your actual GitHub username

If asked for credentials:
- Username: Your GitHub username
- Password: Use a Personal Access Token (not your password)
  - Go to GitHub → Settings → Developer settings → Personal access tokens → Generate new token
  - Select "repo" scope
  - Copy the token and paste it as password

### Step 7: Install Backend Dependencies
```bash
cd devops-ci-cd-project/Backend
```

```bash
pip3 install -r requirements.txt
```
Wait for installation

### Step 8: Install Frontend Dependencies
```bash
cd /home/ubuntu/devops-ci-cd-project/Frontend/frontend-app
```

```bash
npm install
```
Wait for installation (may take 3-5 minutes)

```bash
npm run build
```
Wait for build to complete

### Step 9: Install 'serve' for Frontend
```bash
sudo npm install -g serve
```

### Step 10: Create Backend Service
```bash
sudo nano /etc/systemd/system/backend.service
```

This opens a text editor. Copy and paste this (right-click to paste in terminal):

```ini
[Unit]
Description=Flask Backend API
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/devops-ci-cd-project/Backend
Environment="PATH=/usr/bin:/usr/local/bin"
ExecStart=/usr/bin/python3 app.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

To save and exit:
1. Press `Ctrl + X`
2. Press `Y` (for yes)
3. Press `Enter`

### Step 11: Create Frontend Service
```bash
sudo nano /etc/systemd/system/frontend.service
```

Paste this:

```ini
[Unit]
Description=React Frontend
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/devops-ci-cd-project/Frontend/frontend-app
Environment="PATH=/usr/bin:/usr/local/bin"
ExecStart=/usr/bin/serve -s build -l 3000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Save and exit (Ctrl+X, Y, Enter)

### Step 12: Start Services
```bash
sudo systemctl daemon-reload
```

```bash
sudo systemctl enable backend frontend
```

```bash
sudo systemctl start backend frontend
```

### Step 13: Check Services Status
```bash
sudo systemctl status backend
```
You should see "active (running)" in green

Press `q` to exit

```bash
sudo systemctl status frontend
```
You should see "active (running)" in green

Press `q` to exit

### Step 14: Test Locally on EC2
```bash
curl http://localhost:5000/api/message
```
You should see: `{"message":"Hello, DevOps CI/CD!"}`

```bash
curl http://localhost:3000
```
You should see HTML content

✅ EC2 Setup Complete!

---

## PART 3: CONFIGURE AWS SECURITY GROUP (5 minutes)

### Step 1: Open AWS Console
1. Go to https://aws.amazon.com/console/
2. Sign in to your AWS account
3. Make sure you're in the correct region (top right, e.g., "US East (N. Virginia)")

### Step 2: Navigate to EC2
1. In the search bar at the top, type "EC2"
2. Click on "EC2" (Virtual Servers in the Cloud)

### Step 3: Find Your Instance
1. On the left sidebar, click "Instances"
2. Find your instance (should show IP: 54.227.183.69)
3. Click on the Instance ID (starts with i-xxxxx)

### Step 4: Access Security Group
1. Scroll down to the "Security" tab
2. Under "Security groups", you'll see a link like "sg-xxxxx"
3. Click on that security group link

### Step 5: Edit Inbound Rules
1. Click on the "Inbound rules" tab
2. Click the "Edit inbound rules" button (orange button on the right)

### Step 6: Add Rules
You should see existing rules. Click "Add rule" button for each new rule:

**Rule 1: Backend**
- Type: Custom TCP
- Port range: 5000
- Source: Custom → 0.0.0.0/0
- Description: Backend API
- Click "Add rule"

**Rule 2: Frontend**
- Type: Custom TCP
- Port range: 3000
- Source: Custom → 0.0.0.0/0
- Description: Frontend App
- Click "Add rule"

**Rule 3: SSH (if not already there)**
- Type: SSH
- Port range: 22
- Source: My IP (or 0.0.0.0/0 for testing)
- Description: SSH Access

### Step 7: Save Rules
1. Click the orange "Save rules" button at the bottom right
2. You should see "Successfully modified inbound rules"

✅ Security Group Configured!

---

## PART 4: TEST YOUR APPLICATION (2 minutes)

### Step 1: Test Backend
1. Open your web browser
2. Go to: `http://54.227.183.69:5000/api/message`
3. You should see: `{"message":"Hello, DevOps CI/CD!"}`

### Step 2: Test Frontend
1. In your browser, go to: `http://54.227.183.69:3000`
2. You should see your beautiful dashboard with:
   - Purple gradient background
   - "DevOps CI/CD Dashboard" title
   - Three cards showing Frontend, Backend, and CI/CD status
   - All showing "Online" status

✅ Application is Live!

---

## PART 5: PUSH CODE AND TRIGGER CI/CD (3 minutes)

### Step 1: Open Git Bash on Your Local Machine
1. Press Windows key
2. Type "Git Bash"
3. Press Enter

### Step 2: Navigate to Your Project
```bash
cd /d/devops-ci-cd-project
```

### Step 3: Check Git Status
```bash
git status
```
You should see modified files in red

### Step 4: Add All Changes
```bash
git add .
```

### Step 5: Commit Changes
```bash
git commit -m "Setup CI/CD pipeline with modern UI"
```

### Step 6: Push to GitHub
```bash
git push origin main
```

If asked for credentials:
- Username: Your GitHub username
- Password: Your Personal Access Token

---

## PART 6: MONITOR GITHUB ACTIONS (2 minutes)

### Step 1: Go to GitHub Actions
1. Open your browser
2. Go to your GitHub repository
3. Click on the "Actions" tab (between Pull requests and Projects)

### Step 2: Watch the Workflow
1. You should see a workflow running with your commit message
2. It will show a yellow dot (running) or green checkmark (success) or red X (failed)
3. Click on the workflow name to see details

### Step 3: View Job Details
1. You'll see two jobs:
   - **build-and-test**: Running tests
   - **deploy**: Deploying to EC2 (only runs after tests pass)
2. Click on each job to see the steps
3. Each step will show:
   - ✓ Green checkmark = Success
   - ⊗ Red X = Failed
   - Yellow spinner = Running

### Step 4: Wait for Completion
- The entire workflow takes about 3-5 minutes
- When complete, both jobs should show green checkmarks

✅ CI/CD Pipeline is Working!

---

## VERIFICATION CHECKLIST

After completing all steps, verify:

- [ ] GitHub Secrets page shows 3 secrets
- [ ] EC2 instance is running
- [ ] Backend service is active: `sudo systemctl status backend`
- [ ] Frontend service is active: `sudo systemctl status frontend`
- [ ] Backend accessible: http://54.227.183.69:5000/api/message
- [ ] Frontend accessible: http://54.227.183.69:3000
- [ ] GitHub Actions workflow completed successfully
- [ ] Dashboard shows all services online

---

## TROUBLESHOOTING

### If GitHub Actions Fails:
1. Click on the failed job
2. Look for red X marks
3. Read the error message
4. Common issues:
   - Secrets not set correctly
   - EC2 not accessible
   - Services not running on EC2

### If Services Don't Start on EC2:
```bash
# Check logs
sudo journalctl -u backend -n 50
sudo journalctl -u frontend -n 50

# Restart services
sudo systemctl restart backend frontend
```

### If Can't Access from Browser:
1. Check AWS Security Group rules
2. Verify EC2 instance is running
3. Check services are running: `sudo systemctl status backend frontend`

---

## SUCCESS! 🎉

You now have a fully automated CI/CD pipeline that:
- ✅ Runs tests automatically on every push
- ✅ Deploys to EC2 automatically when tests pass
- ✅ Shows a beautiful dashboard
- ✅ Monitors system health

Every time you push code to GitHub, it will automatically test and deploy!
