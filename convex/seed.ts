import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Seed the database with sample blog posts
 * Call this once from the Convex dashboard to populate initial data
 */
export const seedPosts = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    const mockPosts = [
      // Productivity Posts
      {
        title: "I Taught 6,642 Googlers THIS Productivity System",
        content: `When I first joined Google back in 2016, I was the first person ever to **fail the sales case study three times in a row**.

I had joined the SMB Sales team (now called GCS Sales) as an Account Manager, and to say I was struggling would be an understatement. **My manager literally had to contact People Operations (HR)** to check if failing this many times would affect my probation.

I was **objectively the worst person on the team**.

Fast forward two years, and I was **consistently ranked in the top 5% of Google salespeople globally**. In one quarter (2019 Q4), I even ranked as the **number one salesperson** in Google - worldwide.

## The System That Changed Everything

The productivity system I developed combines three key principles:

1. **Time Blocking**: Every task gets a specific time slot
2. **Energy Management**: Schedule difficult tasks during peak hours
3. **Weekly Reviews**: Reflect and adjust every Friday

### Implementation in Google Workspace

Here's how I implemented this using Google's own tools:

\`\`\`javascript
// Example: Auto-schedule tasks based on priority
function scheduleTask(task, priority) {
  const calendar = CalendarApp.getDefaultCalendar();
  const duration = priority === 'high' ? 60 : 30;

  // Schedule during morning peak hours (9-11 AM)
  const startTime = new Date();
  startTime.setHours(9, 0, 0);

  calendar.createEvent(task.title, startTime,
    new Date(startTime.getTime() + duration * 60000));
}
\`\`\`

This system helped thousands of Googlers improve their productivity by over 40%.`,
        author: "Jeff Su",
        date: Date.parse("21 Oct 2025"),
        category: "Productivity",
        tags: ["Google Apps", "Productivity System", "Time Management"],
        slug: "taught-googlers-productivity-system",
        featuredImageUrl: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800",
      },
      {
        title: "How I Organize My Life: My Notion Command Center",
        content: `After years of trying different productivity tools, I finally built the ultimate **Notion Command Center** that manages every aspect of my life.

## Why Notion?

Notion combines the flexibility of a document editor with the power of a database. Here's what makes it special:

- **Linked databases**: Connect everything together
- **Custom views**: See your data however you want
- **Templates**: Automate repetitive setups
- **API access**: Integrate with other tools

## My Command Center Structure

### 1. Projects Dashboard
All active projects in one place with status tracking:

| Project | Status | Deadline | Priority |
|---------|--------|----------|----------|
| Blog redesign | In Progress | May 30 | High |
| Video course | Planning | June 15 | Medium |

### 2. Daily Notes
I use a daily template that includes:
- Today's focus (top 3 priorities)
- Meeting notes
- Quick captures
- End of day review

### 3. Resources Library
Everything I might need to reference:
- Article snippets
- Code snippets
- Meeting templates
- Project checklists

## Code Integration

I even integrated Notion with my development workflow:

\`\`\`python
# Push completed tasks to Notion
import requests

def update_notion(task_id, status):
    notion_api = "https://api.notion.com/v1/pages"
    headers = {
        "Authorization": "Bearer YOUR_TOKEN",
        "Notion-Version": "2022-06-28"
    }

    data = {
        "properties": {
            "Status": {"select": {"name": status}}
        }
    }

    requests.patch(f"{notion_api}/{task_id}",
                   headers=headers, json=data)
\`\`\`

This system has been a game-changer for managing my work and personal life.`,
        author: "Jeff Su",
        date: Date.parse("20 May 2025"),
        category: "Productivity",
        tags: ["Notion", "Organization", "Life Management"],
        slug: "notion-command-center",
        featuredImageUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800",
      },
      {
        title: "How to Build a Prompts Database in Notion",
        content: `As AI becomes more integrated into our workflows, having a **well-organized prompts database** is essential. Let me show you how I built mine in Notion.

## Why a Prompts Database?

- **Reusability**: Never rewrite the same prompt twice
- **Refinement**: Iterate on prompts that work
- **Sharing**: Team can access best practices
- **Learning**: Track what works and what doesn't

## Database Structure

Here's the schema I use:

**Properties:**
- Name (Title): Brief description
- Prompt (Text): The actual prompt
- Category (Select): Writing, Code, Analysis, etc.
- AI Model (Multi-select): ChatGPT, Claude, etc.
- Rating (Number): How well it works (1-5)
- Use Cases (Relation): Link to projects
- Created (Date): When you added it

## Example Prompts

### Code Review Prompt
\`\`\`
Review this code for:
1. Potential bugs
2. Performance issues
3. Security vulnerabilities
4. Best practices violations

Provide specific suggestions with examples.

[PASTE CODE HERE]
\`\`\`

### Content Outline Prompt
\`\`\`
Create a detailed outline for a blog post about [TOPIC].

Include:
- Hook/introduction angle
- 3-5 main sections
- Key points for each section
- Potential examples
- Call-to-action ideas

Target audience: [AUDIENCE]
Tone: [TONE]
\`\`\`

## Automation Tips

I use Notion's API to automatically save prompts from my browser:

\`\`\`typescript
async function savePrompt(prompt: string, category: string) {
  const response = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${NOTION_TOKEN}\`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      parent: { database_id: DATABASE_ID },
      properties: {
        Name: { title: [{ text: { content: prompt.slice(0, 50) } }] },
        Prompt: { rich_text: [{ text: { content: prompt } }] },
        Category: { select: { name: category } }
      }
    })
  });

  return response.json();
}
\`\`\`

Start building your prompts database today!`,
        author: "Jeff Su",
        date: Date.parse("18 Mar 2025"),
        category: "Productivity",
        tags: ["Notion", "AI", "Prompts"],
        slug: "prompts-database-notion",
        featuredImageUrl: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800",
      },

      // AI Posts
      {
        title: "8 Game-Changing Notion Tips",
        content: `After using Notion for over 5 years, I've discovered tips that most people never learn. Here are my top 8.

## 1. Slash Commands Are Your Best Friend

Instead of clicking through menus, use \`/\` to quickly insert any block type:
- \`/table\` for tables
- \`/code\` for code blocks
- \`/toggle\` for collapsible sections

## 2. Linked Databases

Create one master database, then create linked database views on different pages. Changes sync automatically.

## 3. Templates with Buttons

Create template buttons for recurring tasks:

\`\`\`
📝 New Blog Post
├─ Outline section
├─ Draft section
├─ Edit section
└─ Publish checklist
\`\`\`

## 4. Rollups for Analytics

Use rollup properties to calculate statistics across related databases:
- Total project hours
- Average task completion time
- Monthly revenue summaries

## 5. Callout Blocks for Important Info

Use callout blocks with emojis for key information:

💡 **Pro Tip**: Always have a callout at the top of important docs

## 6. Backlinks for Knowledge Management

Reference pages using \`@\` mentions. Notion automatically creates backlinks, building your knowledge graph.

## 7. Web Clipper for Research

The Notion Web Clipper browser extension saves articles with one click. Perfect for:
- Research
- Inspiration
- Later reading

## 8. Keyboard Shortcuts

Master these shortcuts:
- \`Cmd/Ctrl + P\`: Quick find
- \`Cmd/Ctrl + N\`: New page
- \`Cmd/Ctrl + [\`: Go back
- \`Cmd/Ctrl + ]\`: Go forward
- \`Cmd/Ctrl + Shift + L\`: Toggle dark mode

## Bonus: API Integration

For developers, Notion's API opens endless possibilities:

\`\`\`javascript
// Fetch all pages from a database
const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_TOKEN });

async function getPagesFromDatabase(databaseId) {
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: 'Status',
      select: { equals: 'In Progress' }
    },
    sorts: [
      {
        property: 'Created',
        direction: 'descending'
      }
    ]
  });

  return response.results;
}
\`\`\`

These tips have saved me countless hours. Try them out!`,
        author: "Jeff Su",
        date: Date.parse("12 Nov 2024"),
        category: "AI",
        tags: ["Notion", "Productivity", "Tips"],
        slug: "notion-tips",
        featuredImageUrl: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800",
      },

      // Career Posts
      {
        title: "How Productivity Saved My Career at Google",
        content: `This is the story of how I went from nearly failing out of Google to becoming a top performer—all through productivity systems.

## The Crisis Point

Six months into my role at Google, I was drowning:
- Missing deadlines
- Forgetting commitments
- Constantly stressed
- Poor performance reviews

My manager sat me down for a serious conversation about my future at the company.

## The Turning Point

I realized I wasn't less capable than my peers—I was just less organized. So I:

### 1. Audited My Time
I tracked every hour for two weeks and discovered:
- 40% on unimportant tasks
- 30% on meetings without clear outcomes
- Only 30% on high-impact work

### 2. Implemented Time Blocking

I created themed days:
- **Monday**: Strategy & Planning
- **Tuesday/Wednesday**: Deep work on projects
- **Thursday**: Meetings & collaboration
- **Friday**: Learning & review

### 3. Created Standard Operating Procedures

For recurring tasks, I documented the process:

\`\`\`markdown
## Client Email Response SOP

1. Check CRM for context
2. Review last 3 interactions
3. Use template based on situation
4. Personalize with 1-2 specific details
5. Include clear next steps
6. Log in CRM

Time budget: 10 minutes
\`\`\`

### 4. Weekly Reviews

Every Friday at 4 PM, I'd review:
- What went well?
- What went poorly?
- What will I improve next week?

## The Results

Within 6 months:
- Performance rating: Meets expectations → Exceeds expectations
- Sales numbers: Bottom 20% → Top 10%
- Stress level: Through the roof → Manageable

Within 2 years:
- Promoted to Senior Account Manager
- Speaking at internal conferences
- Mentoring new hires
- Top 5% globally

## The Key Insight

**Productivity isn't about working more—it's about working on the right things in the right way.**

My technical skills didn't magically improve. But by organizing my work better, I could:
- Focus on high-impact activities
- Prepare properly for important moments
- Build better relationships
- Learn and improve systematically

## Your Turn

If you're struggling at work, ask yourself:
1. Am I working on the most important things?
2. Do I have systems to ensure consistency?
3. Am I learning from my mistakes?
4. Am I managing my energy, not just my time?

Productivity isn't just a nice-to-have—it can literally save your career.`,
        author: "Jeff Su",
        date: Date.parse("1 Sep 2024"),
        category: "Career",
        tags: ["Career", "Google", "Productivity", "Success Story"],
        slug: "productivity-saved-career-google",
        featuredImageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800",
      },

      // Job Search Posts
      {
        title: "10 Must-Have Mac Apps You've Never Heard Of",
        content: `As a productivity enthusiast, I'm constantly testing new apps. Here are 10 lesser-known Mac apps that have become essential to my workflow.

## 1. Raycast (Spotlight Replacement)

Raycast is like Spotlight on steroids:
- **Lightning-fast search**
- **Extensions ecosystem**
- **Clipboard history**
- **Window management**
- **Quick calculations and conversions**

\`\`\`bash
# Install via Homebrew
brew install --cask raycast
\`\`\`

**Price**: Free (Pro: $8/month)

## 2. Rectangle (Window Management)

Snap windows to positions with keyboard shortcuts:
- \`Ctrl + Opt + Left\`: Left half
- \`Ctrl + Opt + Right\`: Right half
- \`Ctrl + Opt + F\`: Full screen

**Price**: Free

## 3. CleanShot X (Screenshot Tool)

The best screenshot tool I've ever used:
- Scrolling captures
- Annotations
- Cloud uploads
- GIF recording
- Hide desktop icons automatically

**Price**: $29 one-time

## 4. Bartender (Menu Bar Manager)

Hide menu bar icons you don't need to see all the time. Keep your menu bar clean.

**Price**: $16

## 5. Keyboard Maestro (Automation)

Create custom automation workflows:

\`\`\`
Trigger: Typed string "//meeting"
Action:
1. Open Calendar
2. Create new event
3. Set default duration (30 min)
4. Focus on title field
\`\`\`

**Price**: $36

## 6. Alfred (Launcher & More)

Another Spotlight replacement with:
- Workflows
- Snippets
- Clipboard history
- File search

\`\`\`bash
# Example workflow: Quick Google search
Keyword: g
Argument: {query}
Action: Open URL https://google.com/search?q={query}
\`\`\`

**Price**: Free (Powerpack: £34)

## 7. Hazel (File Automation)

Automatically organize files based on rules:
- Move screenshots to specific folder
- Delete downloads older than 30 days
- Rename files based on patterns
- Tag files automatically

**Price**: $42

## 8. Notion (already mentioned, but essential!)

Your second brain for:
- Notes
- Projects
- Databases
- Wikis

**Price**: Free (Personal Pro: $4/month)

## 9. Paste (Clipboard Manager)

Access your clipboard history with \`Cmd + Shift + V\`:
- Search past clipboard items
- Pin frequently used items
- Sync across devices

**Price**: $14.99/year

## 10. iStat Menus (System Monitor)

Monitor your Mac's performance:
- CPU usage
- Memory pressure
- Network speed
- Battery health
- Disk space

**Price**: $18

## Bonus Tip: Automation Script

Here's a script to automatically organize your downloads:

\`\`\`bash
#!/bin/bash

# Move different file types to specific folders
cd ~/Downloads

mkdir -p Images Documents Videos Archives

mv *.{jpg,jpeg,png,gif} Images/ 2>/dev/null
mv *.{pdf,doc,docx,txt} Documents/ 2>/dev/null
mv *.{mp4,mov,avi} Videos/ 2>/dev/null
mv *.{zip,rar,tar,gz} Archives/ 2>/dev/null

echo "Downloads organized!"
\`\`\`

Save this as \`organize_downloads.sh\` and run it with:

\`\`\`bash
chmod +x organize_downloads.sh
./organize_downloads.sh
\`\`\`

These apps have transformed how I work on my Mac. Try them out!`,
        author: "Jeff Su",
        date: Date.parse("20 Aug 2024"),
        category: "Gear",
        tags: ["Mac", "Apps", "Productivity Tools"],
        slug: "must-have-mac-apps",
        featuredImageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800",
      },

      // More Productivity Posts
      {
        title: "Google Tasks: 7 Time-Saving Tips for Better Productivity",
        content: `Google Tasks is often overlooked, but it's one of the most powerful productivity tools in the Google Workspace ecosystem.

## Why Google Tasks?

- **Native integration** with Gmail and Calendar
- **Simple and focused** (no feature bloat)
- **Cross-platform sync**
- **Free** with your Google account

## 7 Essential Tips

### 1. Email-to-Task Conversion

In Gmail, drag any email to the Tasks sidebar to create a task. The email link is automatically attached.

**Keyboard shortcut**: \`Shift + T\`

### 2. Subtasks for Project Breakdown

Break complex tasks into subtasks:
\`\`\`
📋 Launch blog redesign
  ├─ Design mockups
  ├─ Develop theme
  ├─ Migrate content
  └─ Test and deploy
\`\`\`

### 3. Due Dates + Calendar Integration

Set due dates and tasks automatically appear on Google Calendar. Perfect for:
- Deadline tracking
- Time blocking
- Daily planning

### 4. Multiple Task Lists

Create separate lists for different contexts:
- 💼 Work
- 🏠 Personal
- 📚 Learning
- 🛒 Shopping

### 5. Task Notes for Context

Add details to tasks:
- Links to relevant documents
- Brief notes
- Acceptance criteria

### 6. Keyboard Shortcuts

- \`Cmd/Ctrl + Enter\`: Complete task
- \`Cmd/Ctrl + Shift + T\`: Create task (from Gmail)
- \`Tab\`: Indent (create subtask)
- \`Shift + Tab\`: Unindent

### 7. API Integration

Automate with Apps Script:

\`\`\`javascript
function createTaskFromSpreadsheet() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = sheet.getDataRange().getValues();

  data.forEach((row, index) => {
    if (index === 0) return; // Skip header

    const [task, dueDate, notes] = row;

    Tasks.Tasks.insert({
      title: task,
      due: new Date(dueDate).toISOString(),
      notes: notes
    }, '@default');
  });
}
\`\`\`

## Pro Workflow: GTD with Google Tasks

I use Google Tasks to implement Getting Things Done (GTD):

1. **Capture**: Quickly add tasks throughout the day
2. **Clarify**: Add context and due dates during daily review
3. **Organize**: Sort into appropriate lists
4. **Reflect**: Weekly review of all lists
5. **Engage**: Work from today's calendar view

## Integration with Other Google Tools

### Gmail
- Convert emails to tasks
- Task links back to email thread

### Google Calendar
- Tasks show on calendar
- Time block around tasks

### Google Assistant
"Hey Google, add buy milk to my shopping list"

## When NOT to Use Google Tasks

Google Tasks is simple by design. If you need:
- Project management features → Use Asana or Monday
- Team collaboration → Use Notion or Clickup
- Complex workflows → Use Notion or Airtable

But for personal task management integrated with Google Workspace, it's perfect.

Try implementing these tips this week!`,
        author: "Jeff Su",
        date: Date.parse("26 Feb 2025"),
        category: "Productivity",
        tags: ["Google Tasks", "GTD", "Task Management"],
        slug: "google-tasks-tips",
        featuredImageUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800",
      },

      {
        title: "Google Keep: 11 Hidden Tips for Better Digital Organization",
        content: `Google Keep is deceptively simple. But hidden within are powerful features that make it an organizational powerhouse.

## What Makes Keep Special

- **Lightning fast**: Opens instantly
- **Voice transcription**: Speak notes
- **OCR**: Extract text from images
- **Location reminders**: Get reminded at places
- **Collaboration**: Share notes with others

## 11 Hidden Tips

### 1. Color Coding System

I use a consistent color system:
- 🟨 Yellow: Action items
- 🟦 Blue: Information/reference
- 🟩 Green: Ideas
- 🟥 Red: Urgent
- 🟪 Purple: Personal

### 2. Voice Note Transcription

Tap the microphone icon and speak. Keep transcribes AND saves the audio. Perfect for:
- Quick captures while driving
- Meeting notes
- Brain dumps

### 3. Image Text Extraction

Take a photo of a business card, whiteboard, or document. Keep will:
1. Save the image
2. Extract any text via OCR
3. Make it searchable

Try it with this:
\`\`\`
Tap ... → Grab image text
\`\`\`

### 4. Location-Based Reminders

Set reminders to trigger at specific places:
- "Pick up groceries" when near supermarket
- "Ask manager about project" when at office
- "Call mom" when you get home

### 5. Time AND Location Reminders

Combine both:
"Submit report" at office on Friday at 5 PM

### 6. Drawings and Annotations

Sketch ideas, annotate images, or create quick diagrams:
- Product wireframes
- Room layouts
- Mind maps

### 7. Collaborative Notes

Share notes with family or team:
- Shared grocery list
- Trip planning notes
- Project brainstorms

Everyone can edit in real-time.

### 8. Labels for Organization

Like hashtags for your notes:
- #meetings
- #ideas
- #recipes
- #travel

Click any label to see all related notes.

### 9. Archive vs. Delete

- **Archive**: Remove from main view but keep searchable
- **Delete**: Remove permanently (sent to trash)

Archive completed tasks to keep Keep clean while maintaining history.

### 10. Checkboxes for Tasks

Convert any note to a checklist:
\`\`\`
+ Show checkboxes
\`\`\`

Unlike Google Tasks, Keep checkboxes can:
- Include images
- Have colors
- Be part of larger notes

### 11. Dark Mode + Widgets

- Enable dark mode in settings
- Add Keep widgets to home screen (mobile)
- Pin important notes to top

## Advanced: Keep + Tasks Integration

Here's how I use both:

**Google Keep** for:
- Quick captures
- Reference information
- Shared lists
- Ideas and brainstorming

**Google Tasks** for:
- Structured to-do lists
- Due dates and calendar integration
- Subtasks and project breakdown

## Automation with Apps Script

Automatically back up Keep notes:

\`\`\`javascript
// This is conceptual - Keep doesn't have direct API access
// But you can use Google Takeout to export Keep data

function backupKeepNotes() {
  // 1. Use Google Takeout to export Keep
  // 2. Parse the exported JSON
  // 3. Save to Google Drive or Sheets

  // Manual process:
  // 1. Go to takeout.google.com
  // 2. Select only Keep
  // 3. Export and download
  // 4. Parse JSON with your preferred tool
}
\`\`\`

## My Keep Workflow

1. **Quick Capture**: Throughout the day, capture everything in Keep
2. **Daily Process**: Each evening, review notes:
   - Convert action items to Tasks
   - Add labels and colors
   - Archive or delete as needed
3. **Weekly Review**: Review archived notes for insights
4. **Monthly Cleanup**: Delete truly unnecessary items

## When to Use Keep vs. Notion

**Use Keep when**:
- You need to capture something quickly
- You're on mobile
- You want location reminders
- You need voice transcription

**Use Notion when**:
- You're building a knowledge base
- You need databases
- You want templates
- You're working on complex projects

Keep is about speed. Notion is about structure. I use both!

Start with these 11 tips and discover how powerful Keep can be.`,
        author: "Jeff Su",
        date: Date.parse("26 Nov 2024"),
        category: "Productivity",
        tags: ["Google Keep", "Organization", "Note-taking"],
        slug: "google-keep-tips",
        featuredImageUrl: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800",
      },
    ];

    // Insert all posts
    for (const post of mockPosts) {
      await ctx.db.insert("posts", post);
    }

    return `Successfully seeded ${mockPosts.length} blog posts!`;
  },
});
