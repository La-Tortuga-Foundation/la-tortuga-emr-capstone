# GitHub Project Board Setup

This guide will help you set up a GitHub Project board to track your capstone work.

## Creating the Project Board

1. Go to your GitHub repository
2. Click on "Projects" tab
3. Click "New project"
4. Choose "Board" template
5. Name it "La Tortuga EMR - Capstone"

## Column Structure

Create the following columns (in order):

1. **Backlog** - All future work
2. **Sprint Planning** - Items for next sprint
3. **To Do** - Current sprint work
4. **In Progress** - Actively being worked on
5. **In Review** - Pull request submitted
6. **Testing** - Needs QA validation
7. **Done** - Completed this sprint

## Labels

Create the following labels in your repository:

### Priority
- `priority:critical` (Red) - Blocking, data loss risk
- `priority:high` (Orange) - Important for MVP
- `priority:medium` (Yellow) - Should do soon
- `priority:low` (Green) - Nice to have

### Type
- `type:bug` (Red) - Something broken
- `type:feature` (Blue) - New functionality
- `type:docs` (Gray) - Documentation
- `type:test` (Purple) - Testing
- `type:refactor` (Yellow) - Code improvement

### Component
- `component:medical` (Blue) - Medical forms
- `component:dental` (Teal) - Dental chart
- `component:queue` (Purple) - Priority queue
- `component:inventory` (Orange) - Inventory management
- `component:sync` (Red) - P2P synchronization
- `component:security` (Dark red) - Knox/encryption
- `component:ui` (Pink) - User interface

### Sprint
- `sprint-0` through `sprint-8`

### Owner
- `owner:jacob` - Jacob's tasks
- `owner:jonathan` - Jonathan's tasks
- `owner:jose` - Jose's tasks

## Initial Issues to Create

### Sprint 0 Issues

**Setup & Infrastructure (Jose)**
```markdown
Title: Set up GitHub repository structure
Labels: component:infrastructure, priority:critical, owner:jose, sprint-0
Assignee: Jose Rodriguez

Description:
- [ ] Create folder structure
- [ ] Add .gitignore
- [ ] Set up ESLint and Prettier
- [ ] Configure package.json
- [ ] Add README
```

```markdown
Title: Design SQLite database schema
Labels: component:database, priority:critical, owner:jose, sprint-0
Assignee: Jose Rodriguez

Description:
- [ ] Create ER diagrams
- [ ] Define all tables
- [ ] Document relationships
- [ ] Plan migration strategy
```

**UI/UX Planning (All Team)**
```markdown
Title: Create UI mockups for medical intake
Labels: component:medical, priority:high, owner:jacob, sprint-0
Assignee: Jacob Luytjes

Description:
- [ ] Sketch patient demographics screen
- [ ] Design vitals recording interface
- [ ] Layout systems review pages
- [ ] Create medication selection UI
```

```markdown
Title: Create UI mockups for dental chart
Labels: component:dental, priority:high, owner:jonathan, sprint-0
Assignee: Jonathan Gomez

Description:
- [ ] Design 32-tooth selector
- [ ] Layout procedure tracking
- [ ] Sketch antibiotic prescription UI
```

### Sprint 1 Issues (Sample)

```markdown
Title: Implement patient search screen
Labels: component:medical, type:feature, priority:high, owner:jacob, sprint-1
Assignee: Jacob Luytjes

Description:
Implement the patient search functionality allowing providers to find existing patients.

Acceptance Criteria:
- [ ] Search by name (first, last)
- [ ] Search by village
- [ ] Display results in list
- [ ] Tap result to open patient record
- [ ] "Add New Patient" button
```

```markdown
Title: Build login screen with authentication
Labels: component:ui, type:feature, priority:critical, owner:jonathan, sprint-1
Assignee: Jonathan Gomez

Description:
Create secure login screen for provider authentication.

Acceptance Criteria:
- [ ] Username and password fields
- [ ] Input validation
- [ ] "Remember me" option
- [ ] Error handling (invalid credentials)
- [ ] Navigate to main app on success
```

## Milestones

Create milestones for each sprint:

- **Sprint 0** (Due: Feb 8, 2026) - Foundation
- **Sprint 1** (Due: Feb 22, 2026) - Core UI
- **Sprint 2** (Due: Mar 8, 2026) - Medical Features
- **Sprint 3** (Due: Mar 22, 2026) - Dental Features
- **Sprint 4** (Due: Apr 5, 2026) - Queue & Inventory
- **Sprint 5** (Due: Apr 19, 2026) - P2P Sync
- **Sprint 6** (Due: May 3, 2026) - Security
- **Sprint 7** (Due: May 17, 2026) - Testing
- **Sprint 8** (Due: May 31, 2026) - Deployment

## Project Board Automation

Use GitHub Actions to automate board updates:

1. **Auto-move to "In Progress"** when issue assigned
2. **Auto-move to "In Review"** when PR opened
3. **Auto-move to "Done"** when PR merged
4. **Auto-add sprint label** based on milestone

## Weekly Sprint Board View

Each week, your board should look like:

**To Do (5-10 items)**
- Items for current sprint
- Prioritized by importance
- Assigned to team members

**In Progress (2-3 items per person)**
- Actively being worked on
- Should move to "In Review" within 2-3 days

**In Review (1-2 items per person)**
- Pull requests awaiting review
- Should be reviewed within 24 hours

**Done (10-15 items)**
- Completed this sprint
- Demo-ready

## Tips for Success

### 1. Keep Issues Small
- Each issue should be completable in 1-3 days
- Break large features into sub-issues
- Use task lists for multi-step work

### 2. Use Issue Templates
- Bug report template
- Feature request template
- Pull request template

### 3. Link Issues to PRs
```markdown
Closes #42
```
This auto-closes the issue when PR is merged.

### 4. Update Daily
- Move cards as work progresses
- Add comments with status updates
- Re-prioritize as needed

### 5. Sprint Reviews
- Demo completed items
- Close sprint milestone
- Create issues for next sprint

## Example Workflow

**Monday (Sprint Planning)**
1. Review backlog
2. Move items to "Sprint Planning"
3. Estimate effort (story points)
4. Assign to team members
5. Move to "To Do"

**Tuesday-Thursday (Development)**
1. Pick item from "To Do"
2. Move to "In Progress"
3. Create feature branch
4. Code and commit
5. Open pull request
6. Move to "In Review"

**Friday (Review & Retrospective)**
1. Review PRs, merge to develop
2. Move completed items to "Done"
3. Demo to team/stakeholders
4. Retrospective: What went well? What to improve?
5. Update backlog for next sprint

## Sample Issue List for Sprint 0

```
[ ] Repository setup and structure (#1) - Jose
[ ] Database schema design (#2) - Jose
[ ] CI/CD pipeline configuration (#3) - Jose
[ ] UI mockups - medical intake (#4) - Jacob
[ ] UI mockups - dental chart (#5) - Jonathan
[ ] UI mockups - queue management (#6) - Jacob
[ ] UI mockups - inventory (#7) - Jonathan
[ ] Spanish translation file setup (#8) - Jacob
[ ] Navigation structure design (#9) - Jonathan
[ ] Component library research (#10) - All
```

## Tracking Progress

### Burndown Chart
- Track story points completed vs. remaining
- Adjust velocity based on team capacity
- Identify blockers early

### Velocity Metrics
- Sprint 0: Establish baseline
- Sprints 1-3: Aim for consistency
- Sprints 4-8: Optimize based on learnings

### Team Capacity
- Each person: 20 hours/week (part-time, school)
- Adjust estimates accordingly
- Account for exams, holidays

## Communication

### Daily Standups (Async)
Post in Slack/Discord:
```
**Yesterday**: Completed patient search UI (#4)
**Today**: Working on vitals recording (#12)
**Blockers**: None
```

### Sprint Review
- Schedule: Last Friday of sprint
- Duration: 1 hour
- Attendees: Team + stakeholders
- Format: Demo + Q&A

### Sprint Retrospective
- Schedule: After sprint review
- Duration: 30 min
- Format: Start/Stop/Continue

---

**Remember**: The project board is a living tool. Adjust as needed to fit your team's workflow!
