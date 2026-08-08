// src/components/TaskPlanForm.jsx
import { useState } from "react";

export default function TaskPlanForm({ task, onSubmit, onCancel }) {
      console.log("📝 TaskPlanForm opened with task:", task);
  const [chaptersLeft, setChaptersLeft] = useState("");
  const [daysToFinish, setDaysToFinish] = useState("");
  const [taskContent, setTaskContent] = useState("");
  const [preferredTime, setPreferredTime] = useState("flexible");
if (!task) {
  return (
    <div style={{ color: "white", padding: "20px" }}>
      ⚠️ No task selected — cannot generate plan.
    </div>
  );
}

const handleSubmit = async (e) => {
  e.preventDefault();

  const payload = {
    taskId: task.id,
    dueDate: task.due_date,
    numberOfDays: daysToFinish,
    numberOfChapters: chaptersLeft,
    preferredStudyTime: preferredTime,
    brief: taskContent,
  };


 try {
  // 1. Save preferences
  const res = await fetch("http://localhost:3000/task-plan-preferences", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
    taskId: task.id,             // ✅ required
    userId: task.user_id,   // ✅ add this!
    dueDate: task.dueDate || null, // ✅ match DB column
    numberOfDays: daysToFinish,
    numberOfChapters: chaptersLeft,
    preferredStudyTime: preferredTime,
    brief: taskContent,
  }),
    //body: JSON.stringify(payload),
  });
  const data = await res.json();
  console.log("✅ Saved preferences:", data);

  // 2. Now fetch generated plan
  const planRes = await fetch(`http://localhost:3000/ai/plan/task/${task.id}`);
  const planData = await planRes.json();
  console.log("📌 Generated Plan:", planData);

  // 3. Send plan back to ProfilePage
  onSubmit(planData.plan);
} catch (err) {
  console.error("❌ Error submitting preferences:", err);
}

};




  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2000,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "black",
          padding: "25px",
          borderRadius: "12px",
          width: "400px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          display: "flex",
          flexDirection: "column",
          gap: "15px",
        }}
      >
        <h2>📝 Generate Plan for {task.title}</h2>

        <input
          type="number"
          placeholder="How many chapters left?"
          value={chaptersLeft}
          onChange={(e) => setChaptersLeft(e.target.value)}
        />

        <input
          type="number"
          placeholder="How many days to finish?"
          value={daysToFinish}
          onChange={(e) => setDaysToFinish(e.target.value)}
        />

        <textarea
          placeholder="Brief content about the task..."
          value={taskContent}
          onChange={(e) => setTaskContent(e.target.value)}
        />

        <select
          value={preferredTime}
          onChange={(e) => setPreferredTime(e.target.value)}
        >
          <option value="flexible">Flexible</option>
          <option value="morning">Morning</option>
          <option value="afternoon">Afternoon</option>
          <option value="evening">Evening</option>
        </select>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button
            type="button"
            style={{ background: "#565050ff", padding: "8px 12px", borderRadius: "6px" }}
            onClick={onCancel}
          >
            ❌ Cancel
          </button>
          <button
            type="submit"
            style={{ background: "#2575fc", color: "white", padding: "8px 12px", borderRadius: "6px" }}
          >
            🚀 Generate
          </button>
        </div>
      </form>
    </div>
  );
}
