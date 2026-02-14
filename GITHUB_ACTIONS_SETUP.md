# GitHub Actions CI/CD Setup Guide

## Step 1: Add GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add these secrets:

1. **EC2_HOST**
   - Value: `54.227.183.69`

2. **EC2_USER**
   - Value: `ubuntu` (or `ec2-user` for Amazon Linux)

3. **EC2_SSH_KEY**
   - Copy entire content of `CICD.pem` file
   - Include `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`

## Step 2: Prepare EC2 Instance

SSH into your EC2 instance:
```bash
ssh -i CICD.pem ubuntu@54.227.183.69
```

Install required software:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and pip
sudo apt install python3 python3-pip -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# Install Git
sudo apt install git -y

# Clone your repository
cd /home/ubuntu
git clone https://github.com/YOUR_USERNAME/devops-ci-cd-project.git
cd devops-ci-cd-project
```

## Step 3: Create Systemd Services

### Backend Service
```bash
sudo nano /etc/systemd/system/backend.service
```

Add:
```ini
[Unit]
Description=Flask Backend
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/devops-ci-cd-project/Backend
ExecStart=/usr/bin/python3 app.py
Restart=always

[Install]
WantedBy=multi-user.target
```

### Frontend Service
```bash
sudo nano /etc/systemd/system/frontend.service
```

Add:
```ini
[Unit]
Description=React Frontend
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/devops-ci-cd-project/Frontend/frontend-app
ExecStart=/usr/bin/npm start
Restart=always
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

Enable and start services:
```bash
sudo systemctl daemon-reload
sudo systemctl enable backend frontend
sudo systemctl start backend frontend
```

## Step 4: Configure Security Group

In AWS Console, add inbound rules:
- Port 5000 (Backend)
- Port 3000 (Frontend)
- Port 22 (SSH)

## Step 5: Test the Pipeline

Push code to main branch:
```bash
git add .
git commit -m "Setup CI/CD pipeline"
git push origin main
```

Check GitHub Actions tab to see the pipeline running.

## Alternative: Self-Hosted GitHub Runner (Optional)

If you want to use EC2 as a self-hosted runner:

1. Go to GitHub repo → Settings → Actions → Runners → New self-hosted runner
2. Select Linux
3. Follow the commands provided, example:

```bash
# SSH to EC2
ssh -i CICD.pem ubuntu@54.227.183.69

# Create runner directory
mkdir actions-runner && cd actions-runner

# Download runner
curl -o actions-runner-linux-x64-2.311.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz

# Extract
tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz

# Configure (use token from GitHub)
./config.sh --url https://github.com/YOUR_USERNAME/devops-ci-cd-project --token YOUR_TOKEN

# Install as service
sudo ./svc.sh install
sudo ./svc.sh start
```

4. Update workflow to use `runs-on: self-hosted` instead of `ubuntu-latest`
