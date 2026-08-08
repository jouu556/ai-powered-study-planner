import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import pg from "pg";
import bcrypt from "bcrypt";
import geminiRoutes from "./geminiRoutes.js";

/* API KEY :
AIzaSyDIMvJNBRqMXkVkRXp3PE8yrHl-lBJ8u0Y
*/

const app = express();
app.use(cors());
app.use(express.json());


app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

const PORT = process.env.PORT || 3000;
const saltRounds = 10;
app.use("/ai", geminiRoutes);

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "study-planner",
  password: "postgres100188",
  port: 5432,
});
db.connect();

dotenv.config();


// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Server is running 🚀" });
});

app.post("/register", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;
  const name = req.body.name;
  const studyField = req.body.studyField;
  const time = new Date();

  try {
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (checkResult.rows.length > 0) {
      res.send("Email already exists. Try logging in.");
    } else {
      //hashing the password and saving it in the database
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.error("Error hashing password:", err);
        } else {
          console.log("Hashed Password:", hash);
         await db.query(
  "INSERT INTO users (email, password_hash, name, study_field, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING *",
  [email, hash, name, studyField, time]
).then(result => {
  const newUser = result.rows[0];
  res.status(201).json({
    success: true,
    message: "User registered",
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      studyField: newUser.study_field
    }
  });
});

        }
      });
    }
  } catch (err) {
    console.log(err);
     res.status(500).json({ success: false, message: "Server error." });
  }
});

app.post("/login", async (req, res) => {
  const email = req.body.username;
  const loginPassword = req.body.password;

  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const storedHashedPassword = user.password_hash;
      bcrypt.compare(loginPassword, storedHashedPassword, (err, result) => {
        if (err) {
          console.error("Error comparing passwords:", err);
          return res.status(500).json({ success: false, message: "Server error." });
        } else {
          if (result) {
        return res.status(200).json({
        success: true,
        message: "Login successful",
            user: {
            id: user.id,
            email: user.email,
            name: user.name,
            studyField: user.study_field
            }
            });
        }
          
          else {
            return res.status(401).json({ success: false, message: "Incorrect password." });
          }
        }
      });
    } else {
      res.send("User not found");
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

app.post("/tasks", async (req, res) => {
    const { userId, subjectName, title, description, dueDate, status, priority } = req.body;  
    
    try {

    //const userId = req.user?.id; 

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    // 1. Look up the subjectId from subjectName
    const subjectResult = await db.query(
      "SELECT id FROM subjects WHERE name = $1 AND user_id = $2",
      [subjectName, userId]
    );
    let subjectId;
    if (subjectResult.rows.length > 0) {
      subjectId = subjectResult.rows[0].id;
    } else {
    // Auto-create subject WITH userId
      const insertSubject = await db.query(
        "INSERT INTO subjects (user_id, name) VALUES ($1, $2) RETURNING id",
        [userId, subjectName]
      );
      subjectId = insertSubject.rows[0].id;
    }
    const priorityMap = {
    low: 1,
    medium: 2,
    high: 3,
    };

    const priorityValue = priorityMap[priority] || 2; 
    
    const result = await db.query(
      `INSERT INTO tasks 
        (user_id, subject_id, subject_name, title, description, due_date, status, priority, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),NOW()) 
       RETURNING *`,
      [userId, subjectId, subjectName, title, description, dueDate, status, priorityValue]
    );
     res.json({ success: true, task: result.rows[0] });

  } catch (err) {
    console.error("Error creating task:", err);
    res.status(500).json({ success: false, message: "Failed to create task." });
  }

});
app.get("/tasks/:userId", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM tasks WHERE user_id = $1 ORDER BY due_date", [req.params.userId]);
    res.json({ success: true, tasks: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch tasks." });
  }
});

// Update task
app.put("/tasks/:id", async (req, res) => {
  const { title, description, dueDate, status, priority } = req.body;
  try {
    const result = await db.query(
      `UPDATE tasks 
       SET title=$1, description=$2, due_date=$3, status=$4, priority=$5, updated_at=NOW()
       WHERE id=$6 RETURNING *`,
      [title, description, dueDate, status, priority, req.params.id]
    );
    res.json({ success: true, task: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update task." });
  }
});

app.delete("/tasks/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM tasks WHERE id=$1", [req.params.id]);
    res.json({ success: true, message: "Task deleted." });
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({ success: false, message: "Failed to delete task." });
  }
});




///////////////////////////////////////////////////////////////////////////

app.post("/subjects", async (req, res) => {
    const { userId, subjectName, color } = req.body;  
    
    try {

   // const userId = req.user?.id; 

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    // 1. Look up the subjectId from subjectName

    const result = await db.query(
      `INSERT INTO subjects 
        (user_id, name, color, created_at)
       VALUES ($1,$2,$3,NOW()) 
       RETURNING *`,
      [userId, subjectName, color]
    );
     res.json({ success: true, task: result.rows[0] });

  } catch (err) {
    console.error("Error adding subject:", err);
    res.status(500).json({ success: false, message: "Failed to add subject." });
  }

});
// Get all subjects for a user
app.get("/subjects/:userId", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM subjects WHERE user_id = $1 ORDER BY created_at DESC",
      [req.params.userId]
    );
    res.json({ success: true, subjects: result.rows });
  } catch (err) {
    console.error("Error fetching subjects:", err);
    res.status(500).json({ success: false, message: "Failed to fetch subjects." });
  }
});

// Delete subject
app.delete("/subjects/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM subjects WHERE id=$1", [req.params.id]);
    res.json({ success: true, message: "Subject deleted." });
  } catch (err) {
    console.error("Error deleting subject:", err);
    res.status(500).json({ success: false, message: "Failed to delete subject." });
  }
});
// Save task plan preferences
// backend (server.js)
app.post("/task-plan-preferences", async (req, res) => {
  const { taskId, userId, dueDate, numberOfDays, numberOfChapters, preferredStudyTime, brief } = req.body;

  try {
    const existing = await db.query(
      "SELECT * FROM task_plan_preferences WHERE task_id = $1 AND user_id = $2",
      [taskId, userId]
    );

    let result;
    if (existing.rows.length > 0) {
      result = await db.query(
        `UPDATE task_plan_preferences
         SET due_date = $3,
             number_of_days = $4,
             number_of_chapters = $5,
             preferred_study_time = $6,
             brief = $7,
             updated_at = NOW()
         WHERE task_id = $1 AND user_id = $2
         RETURNING *`,
        [taskId, userId, dueDate, numberOfDays || null, numberOfChapters || null, preferredStudyTime || null, brief || null]
      );
    } else {
      result = await db.query(
        `INSERT INTO task_plan_preferences
          (task_id, user_id, due_date, number_of_days, number_of_chapters, preferred_study_time, brief, updated_at, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
         RETURNING *`,
        [taskId, userId, dueDate, numberOfDays || null, numberOfChapters || null, preferredStudyTime || null, brief || null]
      );
    }

    res.status(201).json({ success: true, preference: result.rows[0] });
  } catch (err) {
    console.error("❌ Error saving preferences:", err.message);
    res.status(500).json({ success: false, message: "Failed to save preferences." });
  }
});


// Example in index.js
app.get("/api/tasks", (req, res) => {
  res.json([
    { id: 1, title: "Study React", done: false },
    { id: 2, title: "Review PostgreSQL", done: true }
  ]);
});


// Start server
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
