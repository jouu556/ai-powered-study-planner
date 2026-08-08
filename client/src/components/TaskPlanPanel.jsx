export default function TaskPlanPanel({
  plan,
  loading,
  onClose,
  onRegenerate,
}) {
  if (!plan) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: "460px",
        height: "100%",
        background: "linear-gradient(135deg, #f9fafb, #e8f0fe)",
        boxShadow: "-3px 0px 12px rgba(0,0,0,0.3)",
        zIndex: 1000,
        fontFamily: "Segoe UI, sans-serif",
        color: "#111",
        display: "flex",
        flexDirection: "column", // ✅ split header/content/footer
      }}
    >
      {/* Scrollable content */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px",
        }}
      >
        {loading ? (
          <p>⏳ Generating plan...</p>
        ) : (
          <>
            <h2 style={{ marginBottom: "5px" }}>📘 {plan.taskTitle}</h2>
            <p style={{ marginBottom: "20px" }}>
              <strong>Subject:</strong> {plan.subject}
            </p>

            {plan.studyPlan?.map((day, i) => (
              <div
                key={i}
                style={{
                  marginBottom: "25px",
                  background: "white",
                  borderRadius: "16px",
                  padding: "18px",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                  transition: "transform 0.2s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "scale(1.02)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1.0)")
                }
              >
                <h4 style={{ marginBottom: "12px", color: "#3a86ff" }}>
                  📅 {day.date || `Day ${i + 1}`}
                </h4>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {day.timeBlocks?.map((block, j) => (
                    <div
                      key={j}
                      style={{
                        background: "#f1f5f9",
                        borderLeft: "5px solid #3a86ff",
                        borderRadius: "10px",
                        padding: "12px 14px",
                        marginBottom: "12px",
                      }}
                    >
                      <p style={{ margin: 0, fontWeight: "bold" }}>
                        ⏰ {block.startTime} – {block.endTime}
                      </p>
                      <p style={{ margin: "4px 0" }}>📖 {block.activity}</p>
                      {block.checkpoint && (
                        <p style={{ color: "#2a9d8f" }}>✅ {block.checkpoint}</p>
                      )}
                      {block.notes && (
                        <p style={{ color: "#6c757d" }}>📝 {block.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Sticky footer */}
      <div
        style={{
          padding: "12px 20px",
          background: "white",
          borderTop: "1px solid #ddd",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <button
          style={{
            background: "#e63946",
            border: "none",
            padding: "10px 16px",
            borderRadius: "8px",
            cursor: "pointer",
            color: "white",
            fontWeight: "bold",
          }}
          onClick={onClose}
        >
          ❌ Close
        </button>
        <button
          style={{
            background: "#ffb703",
            border: "none",
            padding: "10px 16px",
            borderRadius: "8px",
            cursor: "pointer",
            color: "white",
            fontWeight: "bold",
          }}
          onClick={() => onRegenerate(plan.taskId)}
        >
          🔄 Regenerate Plan
        </button>
                <button style={footerBtn("#3a86ff")}>
          ⬇️ Download PDF
        </button>
      </div>
    </div>
  );
}
const footerBtn = (color) => ({
  background: color,
  border: "none",
  padding: "10px 16px",
  borderRadius: "8px",
  cursor: "pointer",
  color: "white",
  fontWeight: "bold",
});
