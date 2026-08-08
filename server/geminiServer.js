// geminiServer.js
import { textModel } from "./geminiClient.js";

// geminiServer.js
import pg from "pg";

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "study-planner",
  password: "postgres100188",
  port: 5432,
});
db.connect();

// now you can use db.query(...) here

// Generate a plan for ONE task.
// geminiServer.js
// ---------------- Slot Management Helpers ----------------
async function insertSlot(userId, planId, slot, task) {
  console.log("🛠️ insertSlot got slot:", slot, "minutes type:", typeof slot.minutes);
  await db.query(
    `INSERT INTO study_slots 
      (plan_id, user_id, task_id, date, start_time, end_time, minutes, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
    [planId, userId, task.id, String(slot.date).slice(0,10), slot.startTime, slot.endTime, Number(slot.minutes) || 0]
  );
}

async function resolveConflict(userId, planId, newSlot, task, existing, maxMinutes) {
  // Attach task info to new slot
  newSlot.priority = task.priority;
  newSlot.due_date = task.due_date;
  newSlot.created_at = new Date();

  // Sort by priority → due_date → created_at
  existing.sort((a, b) => {
    if (a.priority !== b.priority) return b.priority - a.priority;
    if (a.due_date !== b.due_date) return new Date(a.due_date) - new Date(b.due_date);
    return new Date(a.created_at) - new Date(b.created_at);
  });

  const weakest = existing[existing.length - 1];
  if (
    newSlot.priority > weakest.priority ||
    (newSlot.priority === weakest.priority && newSlot.due_date < weakest.due_date)
  ) {
    await db.query("DELETE FROM study_slots WHERE id = $1", [weakest.id]);
    await insertSlot(userId, planId, newSlot, task);

    await db.query(
      `INSERT INTO notifications (user_id, message)
       VALUES ($1, $2)`,
      [userId, `Task ${weakest.task_id} was moved because Task ${task.id} is higher priority.`]
    );
    return true;
  }
  return false;
}

export async function saveStudySlots(userId, planId, slots, task) {
  
  for (const slot of slots) {
    const { rows: [user] } = await db.query(
      "SELECT max_study_minutes_per_day FROM users WHERE id = $1",
      [userId]
    );
    const maxMinutes = user.max_study_minutes_per_day;

    const { rows: existing } = await db.query(
      `SELECT ss.*, t.priority, t.due_date, t.created_at
FROM study_slots ss
JOIN tasks t ON ss.task_id = t.id
WHERE ss.user_id = $1 AND ss.date = $2
`,
      [userId, slot.date]
    );

    const totalMinutes = existing.reduce((sum, s) => sum + s.minutes, 0);

    if (totalMinutes + slot.minutes <= maxMinutes) {
      await insertSlot(userId, planId, slot, task);
    } else {
      const resolved = await resolveConflict(userId, planId, slot, task, existing, maxMinutes);
      if (!resolved) {
        // push to next day until it fits
        let nextDate = new Date(slot.date);
        let inserted = false;
        while (!inserted) {
          nextDate.setDate(nextDate.getDate() + 1);
          const { rows: daySlots } = await db.query(
            `SELECT SUM(minutes) as total
             FROM study_slots WHERE user_id = $1 AND date = $2`,
            [userId, nextDate]
          );
          const dayTotal = parseInt(daySlots[0].total || 0, 10);
          if (dayTotal + slot.minutes <= maxMinutes) {
            await insertSlot(userId, planId, { ...slot, date: nextDate }, task);
            inserted = true;
          }
        }
      }
    }
  }
}

export async function generateTaskPlan(
  task,
  { todayISO = new Date().toISOString().slice(0, 10), regen = false } = {}
) {
  const priorityLabel =
    task.priority >= 3 ? "high" : task.priority === 2 ? "medium" : "low";

  // ✅ Fetch preferences (safe handling if none found)
  let prefs = {};
  try {
    const { rows } = await db.query(
      `SELECT * FROM task_plan_preferences 
       WHERE task_id = $1 
       ORDER BY updated_at DESC 
       LIMIT 1`,
      [task.id]
    );
    prefs = rows[0] || {};  // <--- default empty object if no prefs
  } catch (err) {
    console.warn("⚠️ Could not fetch preferences:", err.message);
    prefs = {};
  }

  // ✅ Build user context string safely
  const userContext = [
    prefs.number_of_chapters ? `- Chapters left: ${prefs.number_of_chapters}` : null,
    prefs.number_of_days ? `- Days to finish: ${prefs.number_of_days}` : null,
    prefs.brief ? `- Content summary: ${prefs.brief}` : null,
    prefs.preferred_study_time ? `- Preferred study time: ${prefs.preferred_study_time}` : null,
  ]
    .filter(Boolean)
    .join("\n");


  let prompt = `
TODAY: ${todayISO}

TASK INPUT (from DB + Preferences):
${JSON.stringify(
  {
    taskId: task.id,
    taskTitle: task.title,
    subject: task.subject_name ?? null,
    dueDate: task.due_date ? task.due_date.toISOString().slice(0, 10) : null,
    priority: { value: task.priority ?? 2, label: priorityLabel },
    status: task.status,
    description: task.description ?? "",
    preferences: {
      numberOfDays: prefs.number_of_days || null,
      numberOfChapters: prefs.number_of_chapters || null,
      preferredStudyTime: prefs.preferred_study_time || null,
      brief: prefs.brief || null,
    }
  },
  null,
  2
)}


${userContext ? `USER CONTEXT:\n${userContext}\n` : ""}

REQUIREMENTS:
- Always distribute the study plan across EXACTLY the number of days specified (if user says 5 days, generate 5 days).
- Use the chapters count to divide study fairly (e.g., 3 chapters in 5 days → ~0.5–1 chapter per day).
- For each day, create concrete activities tied to chapters or topics (e.g., "Read Chapter 1 (pages 1–15)", "Summarize Ch.1", "Solve 10 problems from Ch.1").
- Activities MUST reference chapter numbers, sections, or page ranges if provided in content.
- Each day should include at least:
  - One reading/learning block
  - One practice/review block
  - One checkpoint (self-test, summary, quiz, flashcards)
- Always include notes/tips on time management and study techniques (e.g., "Review summary notes before bed", "Avoid distractions by using Pomodoro 25/5").
- Use user’s preferred time windows (morning/afternoon/evening/night).
- Add variety: mix reading, practice, self-testing, and review.
- Estimated total time should be realistic (2–4 hours/day for heavy tasks, less for light tasks).
- Output valid JSON ONLY (no markdown).
- If preferences.numberOfDays is provided, ALWAYS generate EXACTLY that many days.
- If preferences.numberOfChapters is provided, split study across those chapters explicitly.


OUTPUT SCHEMA (JSON):
{
  "taskId": number,
  "taskTitle": string,
  "subject": string|null,
  "dueDate": string|null,                // "YYYY-MM-DD"
  "priority": { "value": number, "label": "low"|"medium"|"high" },
  "status": string,
  "description": string,
  "studyPlan": [
    {
      "date": "YYYY-MM-DD",
      "timeBlocks": [
        {
          "startTime": "HH:MM",
          "endTime": "HH:MM",
          "duration": number,            // minutes
          "activity": string,            // REQUIRED, concrete
          "checkpoint": string,          // REQUIRED
          "technique": string,           // e.g., "Pomodoro", "Active Recall"
          "resources": string[],         // optional
          "notes": string                // optional
        }
      ],
      "totalTime": number                // minutes in that day
    }
  ],
  "estimatedTotalTime": number          // minutes
}
`;


  if (regen) {
    prompt += `\nCreate a DIFFERENT variation of timings, activities, and checkpoints.\n`;
  }



const result = await textModel.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  // Extract and sanitize
  let text = result.response.text();
  text = text.replace(/```json\s*/g, "").replace(/```\s*/g, "");
  console.log("📌 Raw Gemini response:", text);   // See raw text from Gemini
  let plan = JSON.parse(text);

console.log("✅ Parsed Plan Object:", JSON.stringify(plan, null, 2)); // See the parsed plan neatly

    // Defensive normalization (in case model omitted fields)
  if (!Array.isArray(plan.studyPlan)) plan.studyPlan = [];
  plan.studyPlan = plan.studyPlan.map((day) => ({
    ...day,
    timeBlocks: Array.isArray(day.timeBlocks) ? day.timeBlocks : [],
  }));

  // Ensure each timeBlock has activity & checkpoint strings
  plan.studyPlan.forEach((day) => {
    day.timeBlocks = day.timeBlocks.map((b) => ({
      minutes: 25,
      activity: "Focused study block",
      checkpoint: "Summarize what you learned",
      technique: "Pomodoro",
      resources: [],
      notes: "",
      ...b,
    }));
  });
//console.log("📌 Preferences sent to Gemini:", { chapters, days, content, preferredStudyTime });
//console.log("📌 Prompt sent:\n", prompt);


    // ✅ Save slots into DB
  if (task.user_id) {
    const slots = plan.studyPlan.flatMap(day =>
      day.timeBlocks.map(block => ({
        date: day.date,
        startTime: block.startTime || null,
        endTime: block.endTime || null,
        minutes: Number(block.duration) || 25,
      }))
    );
    // ✅ Fetch plan_id from task_plan_preferences for this task
const { rows: prefRows } = await db.query(
  `SELECT plan_id 
   FROM task_plan_preferences 
   WHERE task_id = $1 
   ORDER BY updated_at DESC 
   LIMIT 1`,
  [task.id]
);

if (prefRows.length === 0) {
  throw new Error(`No task_plan_preferences found for task_id ${task.id}`);
}

const planId = prefRows[0].plan_id;
console.log("📌 Slots to insert:", JSON.stringify(slots, null, 2));
console.log("📌 Slots about to save:", slots);

    for (const slot of slots) {
  if (typeof slot.minutes !== "number") {
    throw new Error("Slot.minutes is not a number: " + JSON.stringify(slot));
  }
}
    //await saveStudySlots(task.user_id, planId, slots, task);
}

  return plan;
}






/**
 * Generate a global plan for ALL tasks for a user.
 */
export async function generateGlobalPlan(user, tasks, { todayISO = new Date().toISOString().slice(0,10) } = {}) {
  const simpleTasks = tasks.map(t => ({
    id: t.id,
    title: t.title,
    subject: t.subject_name || null,
    dueDate: t.due_date ? t.due_date.toISOString().slice(0,10) : null,
    priority: { value: t.priority ?? 2, label: t.priority >= 3 ? "high" : t.priority === 2 ? "medium" : "low" },
    status: t.status || "pending"
  }));

  const prompt = `
TODAY: ${todayISO}

USER:
{ "id": ${user.id}, "name": ${JSON.stringify(user.name || "")} }

TASKS:
${JSON.stringify(simpleTasks, null, 2)}

REQUIREMENTS:
- Build a single calendar-like plan covering the next 2–4 weeks (or until last due date).
- Balance high-priority and near due-date tasks first.
- Avoid >4 hours/day; chunk into 25–50 minute blocks.
- Return ONLY JSON object, no prose.
`;

  const result = await textModel.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }]
  });




  const text = result.response.text();
  return JSON.parse(text);
}

