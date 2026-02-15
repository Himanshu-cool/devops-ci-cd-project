# GitHub Actions - Complete Hands-On Tutorial

## Table of Contents
1. [What is GitHub Actions?](#what-is-github-actions)
2. [Basic Concepts](#basic-concepts)
3. [Hands-On Exercise 1: Hello World](#exercise-1-hello-world)
4. [Hands-On Exercise 2: Multi-Step Workflow](#exercise-2-multi-step-workflow)
5. [Hands-On Exercise 3: Testing Python Code](#exercise-3-testing-python-code)
6. [Hands-On Exercise 4: Testing Node.js Code](#exercise-4-testing-nodejs-code)
7. [Hands-On Exercise 5: Using Secrets](#exercise-5-using-secrets)
8. [Hands-On Exercise 6: Matrix Builds](#exercise-6-matrix-builds)
9. [Hands-On Exercise 7: Conditional Execution](#exercise-7-conditional-execution)
10. [Real-World Example: Your Current Project](#real-world-example)

---

## What is GitHub Actions?

GitHub Actions is a CI/CD platform that allows you to automate your build, test, and deployment pipeline. You can create workflows that run on specific GitHub events.

**Key Benefits:**
- ✅ Automated testing on every push
- ✅ Automatic deployment
- ✅ Code quality checks
- ✅ Free for public repositories
- ✅ 2,000 free minutes/month for private repos

---

## Basic Concepts

### 1. Workflow
A YAML file in `.github/workflows/` that defines automation

### 2. Event
Triggers that start a workflow (push, pull_request, schedule, etc.)

### 3. Job
A set of steps that execute on the same runner

### 4. Step
Individual task (run command, use action)

### 5. Runner
Server that runs your workflows (ubuntu, windows, macos)

### 6. Action
Reusable unit of code

---

## Exercise 1: Hello World

**Goal:** Create your first GitHub Actions workflow

### Step 1: Create Workflow File

1. In your project, create: `.github/workflows/hello.yml`
2. Add this content:

```yaml
name: Hello World

on:
  push:
    branches:
      - main

jobs:
  say-hello:
    runs-on: ubuntu-latest
    
    steps:
      - name: Print greeting
        run: echo "Hello, GitHub Actions!"
      
      - name: Print date
        run: date
      
      - name: List files
        run: ls -la
```

### Step 2: Push and Watch

```bash
git add .github/workflows/hello.yml
git commit -m "Add hello world workflow"
git push origin main
```

### Step 3: View Results

1. Go to GitHub → Your repo → Actions tab
2. Click on the workflow run
3. Click on "say-hello" job
4. See the output of each step

**What You Learned:**
- ✅ How to create a workflow file
- ✅ Basic YAML syntax
- ✅ How to run shell commands
- ✅ How to view workflow results

---

## Exercise 2: Multi-Step Workflow

**Goal:** Create a workflow with multiple jobs

### Step 1: Create Workflow

Create `.github/workflows/multi-job.yml`:

```yaml
name: Multi-Job Workflow

on:
  push:
    branches:
      - main

jobs:
  job1:
    runs-on: ubuntu-latest
    steps:
      - name: Step 1 in Job 1
        run: echo "This is job 1, step 1"
      
      - name: Step 2 in Job 1
        run: echo "This is job 1, step 2"
  
  job2:
    runs-on: ubuntu-latest
    needs: job1  # This job waits for job1 to complete
    steps:
      - name: Step 1 in Job 2
        run: echo "This is job 2, step 1"
      
      - name: Step 2 in Job 2
        run: echo "This is job 2, step 2"
  
  job3:
    runs-on: ubuntu-latest
    needs: [job1, job2]  # This job waits for both job1 and job2
    steps:
      - name: Final step
        run: echo "All jobs completed!"
```

### Step 2: Push and Observe

```bash
git add .github/workflows/multi-job.yml
git commit -m "Add multi-job workflow"
git push origin main
```

**What You Learned:**
- ✅ Multiple jobs in one workflow
- ✅ Job dependencies with `needs`
- ✅ Sequential vs parallel execution

---

## Exercise 3: Testing Python Code

**Goal:** Automatically test Python code on every push

### Step 1: Create Python Script

Create `test_math.py`:

```python
def add(a, b):
    return a + b

def subtract(a, b):
    return a - b

def test_add():
    assert add(2, 3) == 5
    assert add(-1, 1) == 0

def test_subtract():
    assert subtract(5, 3) == 2
    assert subtract(0, 5) == -5

if __name__ == "__main__":
    test_add()
    test_subtract()
    print("All tests passed!")
```

### Step 2: Create Workflow

Create `.github/workflows/python-test.yml`:

```yaml
name: Python Tests

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      
      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install pytest
      
      - name: Run tests
        run: pytest test_math.py -v
```

### Step 3: Push and Test

```bash
git add test_math.py .github/workflows/python-test.yml
git commit -m "Add Python tests with GitHub Actions"
git push origin main
```

**What You Learned:**
- ✅ Using pre-built actions (`actions/checkout`, `actions/setup-python`)
- ✅ Installing dependencies
- ✅ Running tests automatically
- ✅ Testing on pull requests

---

## Exercise 4: Testing Node.js Code

**Goal:** Test JavaScript/Node.js code automatically

### Step 1: Create Simple Node.js Test

Create `calculator.js`:

```javascript
function add(a, b) {
    return a + b;
}

function multiply(a, b) {
    return a * b;
}

module.exports = { add, multiply };
```

Create `calculator.test.js`:

```javascript
const { add, multiply } = require('./calculator');

test('adds 1 + 2 to equal 3', () => {
    expect(add(1, 2)).toBe(3);
});

test('multiplies 2 * 3 to equal 6', () => {
    expect(multiply(2, 3)).toBe(6);
});
```

Create `package.json`:

```json
{
  "name": "calculator-test",
  "version": "1.0.0",
  "scripts": {
    "test": "jest"
  },
  "devDependencies": {
    "jest": "^29.0.0"
  }
}
```

### Step 2: Create Workflow

Create `.github/workflows/node-test.yml`:

```yaml
name: Node.js Tests

on:
  push:
    branches:
      - main

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run tests
        run: npm test
```

**What You Learned:**
- ✅ Testing Node.js applications
- ✅ Using npm in workflows
- ✅ Running Jest tests

---

## Exercise 5: Using Secrets

**Goal:** Learn to use sensitive data securely

### Step 1: Add Secret to GitHub

1. Go to GitHub → Your repo → Settings
2. Click "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. Name: `MY_SECRET_TOKEN`
5. Value: `my-super-secret-value-123`
6. Click "Add secret"

### Step 2: Create Workflow Using Secret

Create `.github/workflows/use-secrets.yml`:

```yaml
name: Using Secrets

on:
  push:
    branches:
      - main

jobs:
  use-secret:
    runs-on: ubuntu-latest
    
    steps:
      - name: Use secret (masked in logs)
        env:
          SECRET_TOKEN: ${{ secrets.MY_SECRET_TOKEN }}
        run: |
          echo "Secret length: ${#SECRET_TOKEN}"
          echo "Secret starts with: ${SECRET_TOKEN:0:3}..."
          # The actual secret value is masked in logs
      
      - name: Conditional based on secret
        if: secrets.MY_SECRET_TOKEN != ''
        run: echo "Secret exists!"
```

**What You Learned:**
- ✅ How to add secrets to GitHub
- ✅ How to use secrets in workflows
- ✅ Secrets are masked in logs
- ✅ Conditional execution based on secrets

---

## Exercise 6: Matrix Builds

**Goal:** Test across multiple versions/platforms

### Step 1: Create Matrix Workflow

Create `.github/workflows/matrix.yml`:

```yaml
name: Matrix Build

on:
  push:
    branches:
      - main

jobs:
  test:
    runs-on: ${{ matrix.os }}
    
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        python-version: ['3.8', '3.9', '3.10', '3.11']
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Set up Python ${{ matrix.python-version }}
        uses: actions/setup-python@v4
        with:
          python-version: ${{ matrix.python-version }}
      
      - name: Display Python version
        run: python --version
      
      - name: Display OS
        run: |
          echo "Running on ${{ matrix.os }}"
          echo "Python version: ${{ matrix.python-version }}"
```

**What You Learned:**
- ✅ Testing across multiple OS
- ✅ Testing across multiple versions
- ✅ Matrix strategy creates multiple jobs
- ✅ Using matrix variables

---

## Exercise 7: Conditional Execution

**Goal:** Run steps based on conditions

### Step 1: Create Conditional Workflow

Create `.github/workflows/conditional.yml`:

```yaml
name: Conditional Execution

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  conditional-steps:
    runs-on: ubuntu-latest
    
    steps:
      - name: Always runs
        run: echo "This always runs"
      
      - name: Only on push to main
        if: github.event_name == 'push' && github.ref == 'refs/heads/main'
        run: echo "This only runs on push to main"
      
      - name: Only on pull request
        if: github.event_name == 'pull_request'
        run: echo "This only runs on pull requests"
      
      - name: Only on Monday
        if: github.event.schedule == '0 0 * * 1'
        run: echo "This only runs on Monday"
      
      - name: Skip on draft PR
        if: github.event.pull_request.draft == false
        run: echo "This skips draft PRs"
```

**What You Learned:**
- ✅ Conditional step execution
- ✅ Using GitHub context variables
- ✅ Event-based conditions
- ✅ Schedule-based conditions

---

## Real-World Example: Your Current Project

Let's analyze your actual workflow:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      - run: |
          cd Backend
          pip install -r requirements.txt
      - run: |
          cd Backend
          pytest --verbose
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: |
          cd Frontend/frontend-app
          npm install
      - run: |
          cd Frontend/frontend-app
          npm test -- --watchAll=false
      - run: |
          cd Frontend/frontend-app
          npm run build
```

**What This Does:**
1. ✅ Triggers on push/PR to main
2. ✅ Checks out your code
3. ✅ Sets up Python 3.10
4. ✅ Installs backend dependencies
5. ✅ Runs backend tests with pytest
6. ✅ Sets up Node.js 18
7. ✅ Installs frontend dependencies
8. ✅ Runs frontend tests
9. ✅ Builds frontend for production

---

## Practice Exercises

### Exercise A: Add Code Coverage

Modify your Python test workflow to show code coverage:

```yaml
- name: Run tests with coverage
  run: |
    pip install pytest-cov
    pytest --cov=. --cov-report=term
```

### Exercise B: Add Linting

Add code quality checks:

```yaml
- name: Lint Python code
  run: |
    pip install flake8
    flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics

- name: Lint JavaScript code
  run: |
    cd Frontend/frontend-app
    npm run lint
```

### Exercise C: Scheduled Workflow

Create a workflow that runs daily:

```yaml
on:
  schedule:
    - cron: '0 0 * * *'  # Runs at midnight UTC every day
```

### Exercise D: Manual Trigger

Create a workflow you can trigger manually:

```yaml
on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy'
        required: true
        default: 'staging'
```

---

## Common GitHub Actions Commands

```yaml
# Checkout code
- uses: actions/checkout@v3

# Setup Python
- uses: actions/setup-python@v4
  with:
    python-version: '3.10'

# Setup Node.js
- uses: actions/setup-node@v3
  with:
    node-version: '18'

# Cache dependencies
- uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}

# Upload artifacts
- uses: actions/upload-artifact@v3
  with:
    name: build-files
    path: dist/

# Download artifacts
- uses: actions/download-artifact@v3
  with:
    name: build-files
```

---

## Debugging Tips

### 1. Enable Debug Logging

Add these secrets to your repo:
- `ACTIONS_STEP_DEBUG` = `true`
- `ACTIONS_RUNNER_DEBUG` = `true`

### 2. Use tmate for SSH Access

```yaml
- name: Setup tmate session
  uses: mxschmitt/action-tmate@v3
```

### 3. Print Environment Variables

```yaml
- name: Print env
  run: env | sort
```

### 4. Check Workflow Syntax

Use GitHub's workflow validator or:
```bash
# Install act to run workflows locally
brew install act
act -l  # List workflows
act push  # Run push event
```

---

## Best Practices

1. ✅ **Use specific action versions** (`@v3` not `@latest`)
2. ✅ **Cache dependencies** to speed up builds
3. ✅ **Use secrets for sensitive data**
4. ✅ **Keep workflows DRY** (use reusable workflows)
5. ✅ **Add status badges** to README
6. ✅ **Use matrix builds** for multiple versions
7. ✅ **Fail fast** when appropriate
8. ✅ **Use concurrency** to cancel old runs

---

## Next Steps

1. **Practice**: Create workflows for your own projects
2. **Explore**: Browse GitHub Marketplace for actions
3. **Optimize**: Add caching to speed up workflows
4. **Expand**: Add deployment workflows
5. **Monitor**: Set up notifications for failures

---

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Actions Marketplace](https://github.com/marketplace?type=actions)
- [Awesome Actions](https://github.com/sdras/awesome-actions)
- [GitHub Actions Cheat Sheet](https://github.github.io/actions-cheat-sheet/)

---

## Summary

You've learned:
- ✅ What GitHub Actions is and why it's useful
- ✅ Basic workflow syntax and structure
- ✅ How to test Python and Node.js code
- ✅ How to use secrets securely
- ✅ Matrix builds for multiple versions
- ✅ Conditional execution
- ✅ Real-world CI/CD pipeline

**Keep practicing and automating!** 🚀
