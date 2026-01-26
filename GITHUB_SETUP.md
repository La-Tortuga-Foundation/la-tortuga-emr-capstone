# Setting Up Your GitHub Repository

**Repository URL**: https://github.com/La-Tortuga-Foundation/la-tortuga-emr-capstone

Follow these steps to upload your project to GitHub.

---

## Option 1: Using Git Command Line (Recommended)

### Step 1: Navigate to Your Project Folder

```bash
# Download and extract the la-tortuga-emr folder from Claude
# Then navigate to it in your terminal
cd path/to/la-tortuga-emr
```

### Step 2: Initialize Git Repository

```bash
# Initialize git (if not already done)
git init

# Add all files to staging
git add .

# Make your first commit
git commit -m "Initial commit: Project setup with complete documentation"
```

### Step 3: Connect to GitHub Repository

```bash
# Add the GitHub repository as remote
git remote add origin https://github.com/La-Tortuga-Foundation/la-tortuga-emr-capstone.git

# Verify the remote was added
git remote -v
```

### Step 4: Create and Push to Main Branch

```bash
# Rename your branch to main (if it's currently master)
git branch -M main

# Push to GitHub
git push -u origin main
```

If the repository already has content, you may need to force push (careful!):
```bash
git push -u origin main --force
```

### Step 5: Create Develop Branch

```bash
# Create develop branch for ongoing work
git checkout -b develop

# Push develop branch to GitHub
git push -u origin develop

# Set develop as default branch (do this on GitHub.com)
```

---

## Option 2: Using GitHub Desktop (Easier for Beginners)

### Step 1: Install GitHub Desktop
- Download from: https://desktop.github.com/
- Sign in with your GitHub account

### Step 2: Add Your Repository
1. File → Add Local Repository
2. Choose the `la-tortuga-emr` folder
3. If prompted "This directory does not appear to be a Git repository", click "Create a repository"

### Step 3: Publish to GitHub
1. Click "Publish repository" button
2. Set the repository name to: `la-tortuga-emr-capstone`
3. Choose the organization: `La-Tortuga-Foundation`
4. Uncheck "Keep this code private" (unless you want it private)
5. Click "Publish repository"

### Step 4: Create Develop Branch
1. In GitHub Desktop: Branch → New Branch
2. Name it: `develop`
3. Click "Publish branch"

---

## Option 3: Upload Files Directly on GitHub.com (Quick but Less Ideal)

### Step 1: Go to Your Repository
Visit: https://github.com/La-Tortuga-Foundation/la-tortuga-emr-capstone

### Step 2: Upload Files
1. Click "Add file" → "Upload files"
2. Drag and drop all files/folders from `la-tortuga-emr`
3. Write commit message: "Initial commit: Project setup"
4. Click "Commit changes"

**Note**: This method is easier but you lose git history and can't easily upload folder structures.

---

## Recommended Repository Settings

Once your code is pushed, configure your repository:

### 1. Set Default Branch to Develop
1. Go to Settings → Branches
2. Change default branch from `main` to `develop`
3. This protects `main` and makes `develop` the working branch

### 2. Add Branch Protection Rules
**For `main` branch:**
- Require pull request reviews before merging
- Require status checks to pass
- No direct pushes (all changes via PR)

**For `develop` branch:**
- Less strict, but still require CI checks

### 3. Add Team Members
1. Go to Settings → Collaborators and teams
2. Add team members:
   - Jacob Luytjes
   - Jonathan Gomez
   - Jose Rodriguez
3. Give them "Write" or "Admin" access

### 4. Enable GitHub Projects
1. Go to "Projects" tab
2. Click "New project"
3. Choose "Board" template
4. Name: "La Tortuga EMR - Capstone"
5. Follow `docs/PROJECT_BOARD_SETUP.md` for detailed setup

### 5. Add Repository Description
1. Click the gear icon next to "About"
2. Description: "Offline-first P2P medical EMR system for rural medical missions in Chiapas, Mexico"
3. Topics: `react-native`, `medical`, `emr`, `offline-first`, `p2p`, `healthcare`, `wifi-direct`
4. Website: (your project website if you have one)

---

## Verify Everything Works

After pushing, verify:

### ✅ Check Files Uploaded
1. Visit: https://github.com/La-Tortuga-Foundation/la-tortuga-emr-capstone
2. You should see:
   - README.md (displays on homepage)
   - All folders: `docs/`, `src/`, `tests/`, etc.
   - Configuration files: `package.json`, `.gitignore`, etc.

### ✅ Check Branches
1. Click the branch dropdown (should show "main")
2. You should see both `main` and `develop` branches

### ✅ Clone Test
```bash
# In a different directory, try cloning
git clone https://github.com/La-Tortuga-Foundation/la-tortuga-emr-capstone.git
cd la-tortuga-emr-capstone

# Verify files are there
ls -la
```

---

## Next Steps After Upload

### 1. Update README with Repository URL
Edit `README.md` and replace placeholder URLs:
```markdown
git clone https://github.com/La-Tortuga-Foundation/la-tortuga-emr-capstone.git
```

### 2. Create Initial Issues
See `docs/PROJECT_BOARD_SETUP.md` for suggested initial issues

### 3. Set Up GitHub Actions (CI/CD)
Create `.github/workflows/ci.yml` for automated testing

### 4. Invite Team Members
Send invitations to Jacob and Jonathan

### 5. Create First Sprint Milestone
1. Go to Issues → Milestones
2. Create "Sprint 0 - Foundation"
3. Due date: February 8, 2026

---

## Troubleshooting

### "Repository not found" Error
- Make sure you're logged into the correct GitHub account
- Verify you have access to the La-Tortuga-Foundation organization
- Check the repository name is exactly: `la-tortuga-emr-capstone`

### "Permission denied" Error
```bash
# Use HTTPS instead of SSH if you get auth errors
git remote set-url origin https://github.com/La-Tortuga-Foundation/la-tortuga-emr-capstone.git
```

### Files Too Large
- Check `.gitignore` is properly excluding `node_modules/`
- Don't commit build artifacts or dependencies

### "Updates were rejected" Error
```bash
# Pull first, then push
git pull origin main --rebase
git push origin main
```

---

## Quick Reference Commands

```bash
# Check current branch
git branch

# Switch to develop branch
git checkout develop

# Pull latest changes
git pull

# Create new feature branch
git checkout -b feature/your-feature-name

# See what changed
git status

# Commit changes
git add .
git commit -m "Your message"

# Push to GitHub
git push origin your-branch-name

# Update from main
git checkout develop
git pull origin develop
```

---

## Resources

- **Git Documentation**: https://git-scm.com/doc
- **GitHub Guides**: https://guides.github.com/
- **Git Cheat Sheet**: https://education.github.com/git-cheat-sheet-education.pdf
- **GitHub Desktop Guide**: https://docs.github.com/en/desktop

---

## Need Help?

If you run into issues:
1. Check GitHub documentation
2. Search for error messages on Stack Overflow
3. Ask in your team Discord/Slack
4. Create an issue in your repository with the `question` label

---

**Good luck! Your repository will be live at:**
**https://github.com/La-Tortuga-Foundation/la-tortuga-emr-capstone** 🚀
