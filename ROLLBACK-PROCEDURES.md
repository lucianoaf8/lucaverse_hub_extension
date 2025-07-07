# Phase 1 Rollback Procedures

## Overview

This document provides comprehensive instructions for rolling back Phase 1 changes in case of critical issues or failures during implementation.

## Quick Rollback

### Automated Rollback (Recommended)

```bash
node scripts/rollback-phase1.js
```

This script will:
1. Check for uncommitted changes
2. Create a backup branch of current state
3. Switch to the baseline branch (`baseline/pre-phase1-fixes`)
4. Clean and reinstall dependencies
5. Run health checks
6. Provide a summary and next steps

### Manual Rollback

If the automated script fails, follow these steps:

```bash
# 1. Stash or commit current changes
git stash push -m "Pre-rollback changes"

# 2. Create backup branch (optional but recommended)
git checkout -b backup/manual-rollback-$(date +%s)

# 3. Switch to baseline
git checkout baseline/pre-phase1-fixes

# 4. Clean dependencies
rm -rf node_modules package-lock.json

# 5. Reinstall
npm install

# 6. Verify functionality
npm run dev
```

## Rollback Verification

After rollback, verify the following:

### 1. Check Git Status
```bash
git branch --show-current  # Should show: baseline/pre-phase1-fixes
git status                 # Should be clean
```

### 2. Run Health Check
```bash
node scripts/health-check.js
```

Expected results after rollback:
- ✅ Dependencies installed
- ✅ Dev server runs
- ❌ TypeScript errors (expected - these existed before Phase 1)
- ❌ Tests failing (expected - Jest issues existed before)
- ❌ Builds failing (expected - TypeScript errors prevent builds)

### 3. Manual Verification
1. Start dev server: `npm run dev`
2. Open http://localhost:5173
3. Verify basic functionality works
4. Check that theme switching is NOT working (expected - not implemented yet)

## Common Issues and Solutions

### Issue: Uncommitted Changes Blocking Rollback

**Solution:**
```bash
# Option 1: Stash changes
git stash push -m "Phase 1 WIP"

# Option 2: Commit changes to current branch
git add -A
git commit -m "WIP: Phase 1 implementation"

# Then run rollback
node scripts/rollback-phase1.js
```

### Issue: Dependency Conflicts After Rollback

**Solution:**
```bash
# Complete clean
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Issue: Port 5173 Already in Use

**Solution:**
```bash
# Find and kill process using port
lsof -ti:5173 | xargs kill -9
# or
npx kill-port 5173
```

### Issue: Cannot Find Baseline Branch

**Solution:**
```bash
# List all branches
git branch -a

# If baseline/pre-phase1-fixes doesn't exist, check remotes
git fetch --all

# If still not found, rollback to specific commit
git log --oneline | grep "Baseline: Pre-Phase 1"
git checkout <commit-hash>
```

## Partial Rollback

If you only need to rollback specific changes:

### Rollback Theme Changes Only
```bash
git checkout baseline/pre-phase1-fixes -- src/config/theme.ts
git checkout baseline/pre-phase1-fixes -- src/contexts/ThemeContext.tsx
git checkout baseline/pre-phase1-fixes -- src/hooks/useTheme.ts
```

### Rollback Color Changes Only
```bash
git checkout baseline/pre-phase1-fixes -- src/index.css
git checkout baseline/pre-phase1-fixes -- src/App.css
git checkout baseline/pre-phase1-fixes -- src/styles/
```

### Rollback Component Optimizations Only
```bash
git checkout baseline/pre-phase1-fixes -- src/components/
```

## Recovery from Failed Rollback

If the rollback process itself fails:

1. **Check Current Branch**
   ```bash
   git branch --show-current
   ```

2. **Hard Reset to Baseline** (⚠️ Destructive - loses all changes)
   ```bash
   git reset --hard baseline/pre-phase1-fixes
   ```

3. **Clean Everything**
   ```bash
   git clean -fdx  # Removes all untracked files
   npm install
   ```

4. **Verify Git History**
   ```bash
   git log --oneline -10
   ```

## Emergency Contacts

If rollback procedures fail and the application is critically broken:

1. Check backup branches:
   ```bash
   git branch | grep backup
   ```

2. Check stashed changes:
   ```bash
   git stash list
   ```

3. Last resort - clone fresh and cherry-pick:
   ```bash
   # In a new directory
   git clone <repository-url> lucaverse-recovery
   cd lucaverse-recovery
   git checkout baseline/pre-phase1-fixes
   ```

## Post-Rollback Actions

After successful rollback:

1. **Document Issues**
   - Create `rollback-report.md` with:
     - What caused the rollback
     - Which changes were problematic
     - Lessons learned

2. **Update Implementation Plan**
   - Revise `phase1_implementation_plan.md`
   - Add safeguards for identified issues

3. **Communicate Status**
   - Notify team of rollback
   - Update project status
   - Plan revised approach

## Rollback Success Criteria

The rollback is considered successful when:

- [ ] Git is on `baseline/pre-phase1-fixes` branch
- [ ] No uncommitted changes remain
- [ ] Dependencies are installed
- [ ] Dev server starts without errors
- [ ] Application runs at baseline functionality level
- [ ] Health check shows expected baseline results

## Notes

- Always create a backup branch before rollback
- The baseline state has known issues (TypeScript errors, test failures)
- Rollback doesn't fix pre-existing problems, only reverts Phase 1 changes
- Keep backup branches for at least 48 hours before deletion