# GitHub Actions CI/CD Setup - Complete Guide

## Step 1: Add GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add these three secrets:

### Secret 1: EC2_HOST
- Name: `EC2_HOST`
- Value: `54.227.183.69`

### Secret 2: EC2_USER
- Name: `EC2_USER`
- Value: `ubuntu`

### Secret 3: EC2_SSH_KEY
- Name: `EC2_SSH_KEY`
- Value: Copy the entire content of your CICD.pem file (including BEGIN and END lines)

```
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA4WmWLPM4X6uxrl3AFNUmd0sCFzoUZM7oZWulYuRCYlalZLhI
...
(entire key content)
...
-----END RSA PRIVATE KEY-----
```

## Step 2: Prepare EC2 Instance

### Connect to EC2
```bash
ssh -i CICD.pem ubuntu@54.227.183.69
```

### Install Required Software
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and pip
sudo apt install python3 python3-pip python3-venv -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# Install Git
sudo apt install git -y

# Verify installations
python3 --version
node --version
npm --version
git --version
```

### Clone Repository
```bash
cd /home/ubuntu
git clone https://github.com/YOUR_USERNAME/devops-ci-cd-project.git
cd devops-ci-cd-project
```

### Install Dependencies
```bash
# Backend
cd Backend
pip3 install -r requirements.txt
cd ..

# Frontend
cd Frontend/frontend-app
npm install
npm run build
cd ../..
```

## Step 3: Create Systemd Services

### Backend Service
```bash
sudo nano /etc/systemd/system/backend.service
```

Paste this:
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

### Frontend Service (using serve)
```bash
# Install serve globally
sudo npm install -g serve

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

### Enable and Start Services
```bash
sudo systemctl daemon-reload
sudo systemctl enable backend frontend
sudo systemctl start backend frontend

# Check status
sudo systemctl status backend
sudo systemctl status frontend
```

## Step 4: Configure AWS Security Group

1. Go to AWS Console → EC2 → Security Groups
2. Select your instance's security group
3. Add Inbound Rules:
   - Type: Custom TCP, Port: 5000, Source: 0.0.0.0/0 (Backend)
   - Type: Custom TCP, Port: 3000, Source: 0.0.0.0/0 (Frontend)
   - Type: SSH, Port: 22, Source: Your IP

## Step 5: Test Manual Deployment

```bash
# On EC2, test the services
curl http://localhost:5000/api/message
curl http://localhost:5000/api/health

# Access from browser
http://54.227.183.69:5000/api/message
http://54.227.183.69:3000
```

## Step 6: Push to GitHub and Trigger CI/CD

```bash
# On your local machine
cd d:\devops-ci-cd-project

git add .
git commit -m "Setup CI/CD pipeline with modern UI"
git push origin main
```

## Step 7: Monitor GitHub Actions

1. Go to your GitHub repository
2. Click **Actions** tab
3. Watch the workflow run:
   - Build and Test job (runs tests)
   - Deploy job (deploys to EC2)

## Workflow Explanation

The workflow has 2 jobs:

### Job 1: build-and-test
- Runs on every push and PR
- Tests backend with pytest
- Tests frontend with npm test
- Builds frontend production bundle

### Job 2: deploy
- Only runs on push to main branch
- Connects to EC2 via SSH
- Pulls latest code
- Installs dependencies
- Restarts services

## Troubleshooting

### Check service logs
```bash
sudo journalctl -u backend -f
sudo journalctl -u frontend -f
```

### Restart services manually
```bash
sudo systemctl restart backend
sudo systemctl restart frontend
```

### Check if ports are listening
```bash
sudo netstat -tulpn | grep :5000
sudo netstat -tulpn | grep :3000
```

### Update code manually
```bash
cd /home/ubuntu/devops-ci-cd-project
git pull origin main
sudo systemctl restart backend frontend
```

## Success Indicators

✅ GitHub Actions workflow completes successfully
✅ Backend responds at http://54.227.183.69:5000/api/message
✅ Frontend displays at http://54.227.183.69:3000
✅ Dashboard shows all services online
✅ Automatic deployment on every push to main

## Next Steps

- Set up custom domain
- Add HTTPS with Let's Encrypt
- Configure Nginx as reverse proxy
- Add monitoring and logging
- Set up database if needed
