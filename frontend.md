# **HackOS Frontend Architecture**

## **Global Structure**

```text
Landing Page
│
├── Authentication
│
├── Organizer Portal
│
├── Participant Portal
│
└── Reviewer Portal
```

---

## **1. ORGANIZER PORTAL**

### **Organizer Home Dashboard**

**Purpose:** Multi-hackathon overview

**Cards:**
- Total Hackathons
- Active Hackathons
- Registrations
- Teams
- Reviewers
- Evaluations
- Bias Alerts
- Engagement Rate

**Charts:**
- Registrations Over Time
- Submission Rate
- Evaluation Progress
- Skill Distribution

**Actions:**
- Create Hackathon
- View Hackathons

---

### **Create Hackathon Wizard**

#### **Step 1: Basic Information**
- Hackathon Name
- Theme
- Description
- Registration Start Date
- Registration End Date
- Event Start Date
- Event End Date
- Minimum Team Size
- Maximum Team Size

*Validation:*
- Registration end must be before event start
- Min team size < max team size
- Event end > event start

#### **Step 2: Problem Statements**
For each Problem Statement:
- Title
- Domain
- Description
- Difficulty Level

**Required Skill Coverage:**
- Backend
- Frontend
- AI/ML
- Cloud
- Security
- Design
- Mobile
- DevOps

*Organizer Actions:*
- Add Problem Statement
- Edit Problem Statement
- Delete Problem Statement

#### **Step 3: Evaluation Rubrics**
**Add Criteria (Example):**
- Innovation
- Technical Depth
- Scalability
- Impact
- Presentation

**Weight % Validation:**
- Total = 100%

*Edge Cases:*
- Weight exceeds 100%
- Duplicate criteria names
- Empty criterion

#### **Step 4: Reviewer Invitations**
**Fields:**
- Email
- Domain Expertise
- Organization

**Actions:**
- Send Invite
- Resend Invite
- Remove Reviewer

#### **Step 5: Publish**
**Review Summary Display:**
- Hackathon Details
- Problem Statements
- Rubrics
- Reviewers

**Action:** Publish Hackathon

**System Generates:**
- Registration Link
- Public Hackathon Page

---

### **View Hackathons**

Shows all hackathons.

**Each card:**
- Hackathon Name
- Status
- Registrations
- Teams
- Submissions
- Review Progress

**Actions:** View Details

---

### **Individual Hackathon Dashboard**

**Tabs:**
1. Overview
2. Registrations
3. Teams
4. Submissions
5. Reviewers
6. Evaluations
7. Analytics
8. Audit Trail

---

### **Registrations Tab**

**Table:**
- Name
- College
- Status
- Duplicate Risk
- Face Validation (mock + not storing biometric data)

**Color Codes:**
- Green = Approved
- Yellow = Review Required
- Red = High Risk

**Actions:**
- Approve
- Reject
- View Analysis
- CSV Export

Clicking Analysis opens:

**Duplicate Breakdown Modal:**
- Resume Similarity
- GitHub Similarity
- Skills Similarity
- Device Similarity
- Risk Score
- Reasoning

**Registration Edge Cases:**
*Duplicate Detected:*
- Show: Resume Similarity, GitHub Similarity, College Similarity
- Organizer can override

*Face Scan Failed (Mocked):*

---

### **Teams Tab**

**Table:**
- Team Name
- Coverage Score
- Problem Statement
- Members
- Status

**Actions:**
- View Team
- Download CSV

**Team Edge Cases:**
- *Team below minimum size:* Show Warning
- *Team exceeds maximum size:* Block new joins

---

### **Team Detail Page**

**Display:**
- Team Members
- Skill Matrix
- Coverage Score
- Problem Statement
- Submission Status
- Reviewer Assigned

**AI Recommendation Explanation:**
- Why team is strong
- Missing skills
- Potential weaknesses

---

### **Reviewers Tab**

**Table:**
- Reviewer
- Expertise
- Assignments
- Workload
- Consistency
- Bias Risk

**Actions:**
- Reassign
- Remove
- View Assignment Logic

**Reviewer Assignment Validation:**
*System Checks:*
- Expertise Match
- Workload Balance
- Conflict Of Interest

*Display:*
- Expertise Match %
- Workload %
- Conflict Status

---

### **Reviewer Assignment Screen**

**Visualization:** Reviewer ←→ Team

**Show:**
- Expertise Match %
- Workload %
- Conflict Check
- Assignment Score

**AI Explanation:**
- Why reviewer was chosen

---

### **Submissions Tab**

**Display:**
- Team
- Submission Status
- Submitted Time
- Reviewer Assigned

**Actions:**
- View Submission

---

### **Evaluations Tab**

**Overview:**
- Total Evaluations
- Pending
- Completed

**Actions:**
- Generate Results
- Publish Results

---

### **Analytics Tab**

**Metrics:**
- Registration Funnel
- Team Formation Rate
- Submission Rate
- Evaluation Completion
- Reviewer Performance
- Bias Alerts
- Skill Distribution
- Team Distribution

**Predictive Insights:**
- Teams likely not to submit
- Reviewer overload warnings

---

## **2. PARTICIPANT PORTAL**

### **Participant Authentication**
Landing Page → Login / Signup → Select Role: Participant → Participant Dashboard

---

### **Participant Dashboard**

**Cards:**
- Registered Hackathons
- Team Status (Teams)
- Submission Status (Pending Invites)
- Notifications
- Recommendations

**Actions:**
- Browse Hackathons
- Create Team
- Join Team

---

### **Browse Hackathons**

**Cards:**
- Hackathon Name
- Theme
- Open Spots
- Registration Deadline
- AI Match %

**Action:** Register

---

### **Register For Hackathon**

**Step 1: Profile**
- Name
- College
- Email
- Phone (Mock OTP)
- GitHub (Optional)
- LinkedIn (Optional)
- Resume Upload

**Step 2: Resume Parsing & Skills**
- Resume Parsing
- Skill Extraction (Magic Resume Autofill extracts Skills, Projects, Experience)
- Preview Extracted Skills
- Edit Skills

### **Step 3: Face Validation (Mocked)**
- Consent Required (Explicit purpose: true-person validation only)
- Options: Validate with Camera (Mocked UI) or Skip

**Step 4: Registration Pipeline (Live Progress)**
- Resume Parsed
- Skills Extracted
- Duplicate Check
- Validation
- Approval
- Supabase Realtime Updates

**Registration Status Screen:**
- Approved
- Review Required
- Rejected

---

### **Post Registration Dashboard**

**Shows:**
- Registered Hackathons
- Registration Status
- Suggested Problem Statements
- Suggested Teams
- Suggested Teammates

---

### **Hackathon Workspace**

This becomes the participant’s main screen.

**Tabs:**
1. Overview
2. Team
3. Recruitment
4. Submission
5. Results

---

### **Team Formation & Management**

**Options:**
- Create Team
- Join Team

---

### **Create Team**

**Fields:**
- Team Name
- Problem Statement
- Recruiting Status

**Required Roles:**
- Backend
- Frontend
- AI/ML
- Design
- Cloud

**Actions:** Create, Invite Members

**Team Creation Edge Cases:**
- *Problem Statement not selected:* Prevent creation
- *Maximum team size reached:* Disable invitations

---

### **Invite Members**

**Methods:** Share Invite Code

**Status:** Pending, Accepted, Rejected

---

### **Recruitment Marketplace (Critical Missing Feature)**

Shows recommended participants.

**Card:**
- Name
- Skills
- Match %
- Role
- Coverage Improvement

**Actions:** Invite

**AI Reason:** e.g., "This participant fills backend gap."

---

### **Join Team Marketplace**

Shows all teams, sorted by compatibility.

**Filters:**
- Problem Statement
- Domain
- Team Size
- Required Skills

**Card:**
- Team Name
- Problem Statement
- Coverage Score
- Missing Skills
- Current Members
- Compatibility %

**AI Explanation:** e.g., "Joining this team increases team coverage from 68% to 92%."

**Actions:** Request Join

**Join Team Edge Cases:**
- *Team Full:* Join Disabled
- *Existing Team Member:* Cannot join another team
- *Pending Join Request Exists:* Block duplicate request

---

### **AI Team Recommendations**

**Show Recommended Teams & Reason Examples:**
- Team lacks Backend
- Team lacks AI Engineer
- Team lacks Designer

**Display:** Coverage Improvement %

---

### **Auto Team Formation**

**Trigger:** X time Before Event, For Users Without Teams

**System:**
- Groups Participants
- Maximizes Skill Coverage
- Balances Team Sizes

**Auto Formation Edge Cases:**
- *Not enough participants:* Create smaller teams, Notify organizer

---

### **Hackathon Active State**

**After Event Starts (Lock):**
- Team Changes
- Invitations
- Problem Statement Selection

---

### **Team Workspace**

**Sections:**
- Members
- Invitations
- Coverage Radar
- Chat
- Tasks
- Submission Status
- Problem Statement

---

### **Submission**

**Fields:**
- Project Name
- Description
- GitHub Repository
- Demo Link
- PPT Upload
- Tech Stack
- Video

**Actions:** Save Draft, Submit

**Submission Edge Cases:**
- *Deadline Missed:* Mark Late Submission, Organizer decides acceptance

---

### **Results Page**

**Display:**
- Rank
- Final Score
- Confidence Score
- Reviewer Comments
- AI Feedback
- Leaderboard

---

## **3. REVIEWER PORTAL**

### **Reviewer Authentication**
Landing Page → Login / Signup → Select Role: Reviewer → Reviewer Dashboard

---

### **Reviewer Dashboard**

**Cards:**
- Assigned Hackathons
- Assigned Teams (Pending Evaluations)
- Completed Reviews (Completed Evaluations)
- Consistency Score

---

### **Profile Setup**

**Fields:**
- Name
- Expertise Domains
- Experience
- Organization
- Availability

**Conflict Declarations (Examples):**
- College Affiliation
- Previous Mentorship
- Known Teams

**Action:** Save Profile

---

### **Assigned Hackathons**

**Card:**
- Hackathon Name
- Teams Assigned
- Pending Reviews
- Evaluation Progress

---

### **Team Queue (Evaluation List)**

**Table:**
- Team Name
- Problem Statement
- Submission Status
- Expertise Match %
- Priority

**Action:** Evaluate

---

### **Evaluation Screen**

**Show Team Details:**
- Submission
- GitHub Repository
- Demo Link
- PPT
- Problem Statement

**Rubric:**
- Innovation
- Technical Depth
- Scalability
- Impact
- Presentation

**Scores:** Score Range (0-10)

**Comments:** Feedback Box (Optional)

**Action:** Submit Evaluation

**Reviewer Edge Cases:**
- *Reviewer attempts scoring outside range:* Block Submission
- *Missing mandatory rubric score:* Block Submission

**Reviewer Assignment Edge Cases:**
- *Reviewer Declines Assignment:* System finds replacement reviewer
- *Conflict Detected Later:* Assignment removed, Recomputed automatically
- *Reviewer No Show:* System triggers reassignment, Organizer notified

---

### **After Evaluation (History & Insights)**

**Evaluation History (Reviewer Can View):**
- Previous Reviews (Submitted Scores)
- Average Scores (Evaluation History)
- Consistency Score
- Reliability Score

**Reviewer Insights (Visible Only To Reviewer):**
- Average Score
- Peer Average
- Consistency Trend
- Completion Rate

**Bias Monitoring:**
- *Visible To Reviewer:* Personal Consistency Score, Average Score Compared To Peers
- *Visible To Organizer Only:* Bias Alerts, Outlier Detection, Statistical Analysis

---

### **Results Published**

**Reviewer Can View:**
- Winning Teams
- Final Rankings
- Reviewer Statistics

---

## **GLOBAL STATE TRANSITIONS**

### **Participant**
```text
DISCOVER
→ REGISTER
→ VALIDATION
→ APPROVED
→ TEAM FORMATION
→ TEAM LOCKED
→ SUBMISSION
→ EVALUATION
→ RESULTS
```

### **Reviewer**
```text
INVITED
→ ACCEPTED
→ ASSIGNED
→ REVIEWING
→ COMPLETED
```

### **Organizer**
```text
CREATE
→ PUBLISH
→ REGISTRATION
→ TEAM FORMATION
→ SUBMISSION
→ REVIEW
→ RESULTS
→ CLOSED
```
