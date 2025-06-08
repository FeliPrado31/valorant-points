# Task Template Guide

## Overview
This document provides standardized templates for creating feature tasks using the async task methodology. Each template ensures consistency, completeness, and parallel development compatibility.

## Template Types

### 1. Foundation Setup Task Template

```markdown
# Foundation Setup Task - [Feature Name]

## Overview
[Brief description of the feature and what infrastructure needs to be established]

## Duration: [X] hours
## Type: Sequential (must be completed first)
## Dependencies: [List any external dependencies]

## Git Workflow
**IMPORTANT**: This foundation task should be completed directly on the feature branch:

1. **Ensure you're on the correct branch**:
   ```bash
   git checkout feature/[feature-name]
   git pull origin feature/[feature-name]
   ```

2. **Work on foundation setup** following the implementation steps below

3. **Commit foundation changes**:
   ```bash
   git add .
   git commit -m "feat: implement [feature-name] foundation setup"
   git push origin feature/[feature-name]
   ```

## Objectives
- [Objective 1: e.g., Install and configure required packages]
- [Objective 2: e.g., Set up base project structure]
- [Objective 3: e.g., Create placeholder files for parallel development]
- [Objective 4: e.g., Establish TypeScript types and interfaces]
- [Objective 5: e.g., Configure build tools and middleware]

## Tasks

### 1. Package Installation ([X] minutes)
**Goal**: [Description of what packages/dependencies to install]

**Commands**:
```bash
npm install [package-name]
npm install --save-dev [dev-package-name]
```

**Files Modified**:
- `package.json` (dependency addition only)
- `package-lock.json` (auto-generated)

### 2. Configuration Setup ([X] minutes)
**Goal**: [Description of configuration changes needed]

**File**: `[config-file-path]`
**Action**: [Description of changes to make]

```[language]
[Code example of configuration]
```

### 3. Project Structure Creation ([X] minutes)
**Goal**: [Description of folder/file structure to create]

**Directory Structure**:
```
[folder-structure-example]
```

**Placeholder Content**:
```[language]
[Example of placeholder file content]
```

### [Additional setup steps as needed]

## Validation Checklist
After completing this task, verify:

- [ ] `npm install` runs without errors
- [ ] `npm run build` completes successfully
- [ ] TypeScript compilation passes
- [ ] All placeholder files exist
- [ ] No existing functionality is broken
- [ ] All new files are properly typed

## Files Created/Modified Summary

### New Files Created:
- [List all new files with brief description]

### Files Modified:
- [List all modified files with description of changes]

### Files NOT Modified:
- [Explicitly list files that should remain unchanged]

## Next Steps
Once this foundation task is complete, parallel tasks can begin working on:
1. [List the parallel tasks that can start]
2. [Mention any specific order requirements]
```

### 2. Parallel Task Template

```markdown
# Task [Number]: [Task Description]

## Overview
[Brief description of what this specific task accomplishes]

## Duration: [X] hours
## Dependencies: Foundation Setup Task + [any other dependencies]
## Conflicts: None (only modifies [specific files/components])

## Git Workflow
**MANDATORY**: Follow this exact branching strategy:

1. **Create task branch**:
   ```bash
   git checkout feature/[feature-name]
   git pull origin feature/[feature-name]
   git checkout -b task-[number]-[description]
   ```

2. **Work on task** following the implementation steps below

3. **Commit and push**:
   ```bash
   git add [specific-files]
   git commit -m "feat: [task description] - [specific changes]"
   git push origin task-[number]-[description]
   ```

4. **Create Pull Request**:
   - **Target**: `feature/[feature-name]`
   - **Title**: `Task [Number]: [Task Description]`
   - **Description**: Include validation checklist from this task

## Objectives
- [Objective 1: Specific, measurable goal]
- [Objective 2: Another specific goal]
- [Objective 3: Clear deliverable]

## Files Modified (No Conflicts)
**Specific Files**:
- `[file-path-1]` ([description of changes])
- `[file-path-2]` ([description of changes])

## Implementation Strategy

### 1. [Implementation Step 1] ([X] minutes)
**Goal**: [What this step accomplishes]

**File**: `[file-path]` ([NEW FILE] or [MODIFY EXISTING])

**Implementation**:
```[language]
[Code example or detailed instructions]
```

### 2. [Implementation Step 2] ([X] minutes)
**Goal**: [What this step accomplishes]

**File**: `[file-path]`

**Implementation**:
```[language]
[Code example or detailed instructions]
```

### [Additional implementation steps as needed]

## Key Changes Made

### [Category 1: e.g., Component Integration]
- ✅ [Specific change made]
- ✅ [Another specific change]
- ✅ [Third specific change]

### [Category 2: e.g., Functionality Preservation]
- ✅ [What was preserved/maintained]
- ✅ [Another preservation note]

## Validation Checklist
- [ ] [Specific validation point 1]
- [ ] [Specific validation point 2]
- [ ] [Specific validation point 3]
- [ ] No conflicts with other tasks
- [ ] All existing functionality preserved
- [ ] Code follows project conventions

## Testing Notes
- [Specific testing instructions]
- [What to verify manually]
- [Any edge cases to test]

## Next Steps
This task completes [specific functionality]. [Any follow-up notes or dependencies for other tasks]
```

### 3. Cleanup Task Template

```markdown
# Cleanup Task - [Feature Name]

## Overview
This task runs after all parallel tasks are completed and merged. It performs final integration testing, updates documentation, and cleans up task files.

## Duration: [X] hours
## Type: Sequential (runs after all parallel tasks)
## Dependencies: All parallel tasks completed and merged

## Git Workflow
**MANDATORY**: This task runs on the feature branch after all parallel tasks are merged:

1. **Ensure all parallel tasks are merged**:
   ```bash
   git checkout feature/[feature-name]
   git pull origin feature/[feature-name]
   ```

2. **Create cleanup branch**:
   ```bash
   git checkout -b task-cleanup-[feature-name]
   ```

3. **Perform cleanup steps** following the implementation below

4. **Commit and push**:
   ```bash
   git add .
   git commit -m "cleanup: finalize [feature-name] and remove task documentation"
   git push origin task-cleanup-[feature-name]
   ```

5. **Create Final PR**:
   - **Target**: `feature/[feature-name]`
   - **Title**: `Cleanup: [Feature Name] - Final Integration and Documentation`

## Objectives
- Validate complete feature integration
- Run comprehensive testing suite
- Update main project documentation
- Clean up all task documentation files
- Prepare feature for final merge to main

## Cleanup Steps

### 1. Integration Testing ([X] minutes)
**Goal**: Verify all parallel tasks work together correctly

**Testing Areas**:
- [Specific integration point 1]
- [Specific integration point 2]
- [Cross-component functionality]

**Validation Commands**:
```bash
npm run test
npm run build
npm run lint
```

### 2. Performance Validation ([X] minutes)
**Goal**: Ensure no performance regressions

**Metrics to Check**:
- [Performance metric 1]
- [Performance metric 2]
- [Bundle size impact]

### 3. Documentation Updates ([X] minutes)
**Goal**: Update main project documentation

**Files to Update**:
- `README.md` - [What to add/update]
- `CHANGELOG.md` - [Feature description]
- `docs/[relevant-docs]` - [Documentation updates]

### 4. Task Documentation Cleanup ([X] minutes)
**Goal**: Remove all task-specific documentation

**Files to Remove**:
```bash
rm -rf feature-tasks/
```

### 5. Final Validation ([X] minutes)
**Goal**: Comprehensive feature testing

**Manual Testing Checklist**:
- [ ] [Feature works as expected]
- [ ] [Integration with existing features]
- [ ] [No regressions introduced]
- [ ] [Performance is acceptable]

## Final Git Commands

### Cleanup and Merge Preparation:
```bash
# Remove task documentation
rm -rf feature-tasks/

# Commit cleanup
git add .
git commit -m "cleanup: remove task documentation after [feature-name] completion"

# Push cleanup
git push origin task-cleanup-[feature-name]

# After PR approval and merge, prepare for main merge
git checkout feature/[feature-name]
git pull origin feature/[feature-name]

# Ready for final merge to main (requires separate approval)
```

## Success Criteria
- [ ] All parallel tasks successfully integrated
- [ ] No performance regressions
- [ ] Documentation updated
- [ ] Task files cleaned up
- [ ] Feature ready for production

## Final Notes
After this cleanup task is complete and merged:
1. Feature branch is ready for final merge to main
2. All task documentation has been removed
3. Feature is fully integrated and tested
4. Documentation is up to date
```

## Template Usage Guidelines

### When to Use Each Template:
1. **Foundation Template**: For infrastructure setup tasks
2. **Parallel Template**: For independent feature implementation tasks
3. **Cleanup Template**: For final integration and cleanup tasks

### Customization Guidelines:
- Replace all `[placeholder]` text with specific values
- Adjust time estimates based on complexity
- Add/remove sections based on task requirements
- Maintain the core structure for consistency

### Quality Checklist:
- [ ] All placeholders replaced with specific values
- [ ] File paths are accurate and specific
- [ ] Git workflow commands are correct
- [ ] Validation steps are comprehensive
- [ ] Dependencies are clearly stated
- [ ] Conflicts are explicitly addressed
