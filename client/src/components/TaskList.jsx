import React from "react";
import axios from "axios";

export default function TaskList({ tasks, priorityLabels, onEdit, onDelete, onGeneratePlan, onViewPlan}) {
  return (
    <section>
      <h2>Your Tasks</h2>
      <div style={{ display: "grid", gap: "12px", marginTop: "10px" }}>
        {tasks.map((t) => (
          <div
            key={t.id}
            style={{
              background: "#1c2639ff",
              padding: "15px",
              borderRadius: "10px",
              boxShadow: "0px 3px 8px rgba(0,0,0,0.1)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <strong>{t.title}</strong>
              <p style={{ margin: 0, fontSize: "0.9em", color: "#555" }}>
                {t.subject_name || t.subjectName} • {priorityLabels[t.priority]} Priority • {t.status}
              </p>
            </div>
            <div>
              <button style={editBtn} onClick={() => onEdit(t)}>✏ Edit</button>
              <button style={deleteBtn} onClick={() => onDelete(t.id)}>❌ Delete</button>
              
              <button
                style={{ ...editBtn, background: "#118ab2" }}
                onClick={() => onGeneratePlan(t)}
              >
                📘 Generate Plan
              </button>
<button
  onClick={() => {
    axios.get(`http://localhost:3000/ai/plan/task/${t.id}`)
      .then(res => {
        if (res.data.plan) {
          console.log("📖 Viewing existing plan:", res.data.plan);
          //setTaskPlan(res.data.plan);   // ✅ show it in TaskPlanPanel
          //setShowPlanForm(false);       // ✅ make sure form stays closed
          onViewPlan(res.data.plan); // ✅ use parent handler

        } else {
          alert("⚠️ No plan found for this task.");
        }
      })
      .catch(err => {
        console.error("❌ Error fetching plan:", err);
        alert("⚠️ No plan found for this task.");
      });
  }}
>
  👀 View Current Plan
</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const editBtn = {
  background: "#ffb703",
  border: "none",
  padding: "6px 12px",
  borderRadius: "8px",
  cursor: "pointer",
  marginRight: "8px",
  color: "white",
};
const deleteBtn = {
  background: "#e63946",
  border: "none",
  padding: "6px 12px",
  borderRadius: "8px",
  cursor: "pointer",
  color: "white",
};
