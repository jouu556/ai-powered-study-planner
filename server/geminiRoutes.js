// geminiRoutes.js
import express from "express";
import { generateTaskPlan, generateGlobalPlan, saveStudySlots } from "./geminiServer.js";
import pg from "pg";
//import { saveStudySlots } from "./server.js";

const router = express.Router();

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "study-planner",
  password: "postgres100188",
  port: 5432,
});
if (!db._connected) await db.connect();

router.get("/plan/task/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;

    // 1. Get the task
    const taskQ = await db.query(
      `SELECT id, user_id, title, description, due_date, status, priority, subject_name
       FROM tasks WHERE id = $1`,
      [taskId]
    );
    if (taskQ.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }
    const task = taskQ.rows[0];
    if (task.due_date && !(task.due_date instanceof Date)) {
      task.due_date = new Date(task.due_date);
    }

    // 2. Get preferences (make sure they exist)
    const prefQ = await db.query(
      `SELECT plan_id, number_of_days, user_id, number_of_chapters, preferred_study_time, brief
       FROM task_plan_preferences WHERE task_id = $1
       ORDER BY updated_at DESC LIMIT 1
       `,
      [taskId]
    );
if (prefQ.rows.length === 0) {
  return res.status(400).json({ success: false, message: "No preferences found for this task." });
}
const preferences = prefQ.rows[0];


   // 3. Generate plan from AI
const regen = req.query.regen === "true";
const plan = await generateTaskPlan(task, preferences, { regen });

// 4. Get the plan_id from preferences (already linked to task)
const planId = preferences.plan_id;

// 5. Flatten studyPlan into slots
const slots = plan.studyPlan.flatMap(day =>
  day.timeBlocks.map(block => ({
    date: day.date,
    startTime: block.startTime || null,
    endTime: block.endTime || null,
    minutes: Number(block.duration) || 25,
  }))
);

// 6. Save slots linked to this plan
await saveStudySlots(task.user_id, planId, slots, task);


// 7. Return response
res.json({ success: true, planId, plan });

} catch (err) {
  console.error("❌ AI task plan error:", err.message, err.stack);
  res.status(500).json({ success: false, message: "Failed to generate task plan.", error: err.message });
}

});



router.post("/plan/task/:taskId", async (req, res) => {
  try {
    //const { taskId } = req.params;
     const taskId = parseInt(req.params.taskId, 10);
    const { chapters, days, content, preferredStudyTime } = req.body ?? {};
// Check if a plan already exists for this task

const existing = await db.query(
  "SELECT * FROM task_plan_preferences WHERE task_id = $1",
  [taskId]
);

if (existing.rows.length > 0) {
  // ✅ Update existing
  await db.query(
    `UPDATE task_plan_preferences
SET number_of_days = $2,
    number_of_chapters = $3,
    preferred_study_time = $4,
    brief = $5,
    updated_at = NOW()
WHERE task_id = $1
`,
    [taskId, days, chapters, preferredStudyTime, content]
  );
} else {
  // ✅ Insert new
  const prefQ = await db.query(
    `INSERT INTO task_plan_preferences 
      (task_id, number_of_days, number_of_chapters, preferred_study_time, brief, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
     RETURNING plan_id`,
    [taskId, days, chapters, preferredStudyTime, content]
  );

  const prefId = prefQ.rows[0].id;
}


    res.json({ success: true, message: "Preferences saved." });
  } catch (err) {
    console.error("Save preferences error:", err);
    res.status(500).json({ success: false, message: "Failed to save preferences." });
  }
}); 
// GET /api/notifications?userId=123
router.get("/api/notifications", async (req, res) => {
  const { userId } = req.query;
  try {
    const { rows } = await db.query(
      "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});



router.get("/plan/global/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const userQ = await db.query(
      `SELECT id, name, email, study_field FROM users WHERE id = $1`,
      [userId]
    );
    if (userQ.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const user = userQ.rows[0];
    const tasksQ = await db.query(
      `SELECT id, title, description, due_date, status, priority, subject_name
       FROM tasks WHERE user_id = $1 ORDER BY COALESCE(due_date, NOW() + interval '30 days') ASC`,
      [userId]
    );
    const tasks = tasksQ.rows.map(t => ({
      ...t,
      due_date: t.due_date ? new Date(t.due_date) : null
    }));
    const regen = req.query.regen === "true";
    const plan = await generateGlobalPlan(user, tasks, { regen });

    res.json({ success: true, plan });
  } catch (err) {
    console.error("AI global plan error:", err);
    res.status(500).json({ success: false, message: "Failed to generate global plan." });
  }
});

export default router;


