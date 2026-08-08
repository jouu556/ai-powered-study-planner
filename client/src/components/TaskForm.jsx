export default function TaskForm({
  editingTask,
  newTask,
  handleChange,
  handleUpdateTask,
  handleAddTask,
}) {
  return (
    <section style={{ marginTop: "40px" }}>
      <h2>{editingTask ? "✏ Edit Task" : "➕ Add Task"}</h2>
      <form
        onSubmit={editingTask ? handleUpdateTask : handleAddTask}
        style={{
          marginTop: "15px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "15px",
          background: "white",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0px 3px 8px rgba(0,0,0,0.1)",
        }}
      >
        <input
          style={inputStyle}
          name="title"
          value={editingTask ? editingTask.title : newTask.title}
          onChange={handleChange}
          placeholder="Title"
          required
        />
        <input
          style={inputStyle}
          name="subjectName"
          value={editingTask ? editingTask.subjectName : newTask.subjectName}
          onChange={handleChange}
          placeholder="Subject Name"
          required
        />
        <textarea
          style={{ ...inputStyle, gridColumn: "span 2" }}
          name="description"
          value={editingTask ? editingTask.description : newTask.description}
          onChange={handleChange}
          placeholder="Description"
        />
        <input
          style={inputStyle}
          type="date"
          name="dueDate"
          value={editingTask ? editingTask.dueDate : newTask.dueDate}
          onChange={handleChange}
        />
        <select
          style={inputStyle}
          name="priority"
          value={editingTask ? editingTask.priority : newTask.priority}
          onChange={handleChange}
        >
          <option value={1}>Low</option>
          <option value={2}>Medium</option>
          <option value={3}>High</option>
        </select>
        <select
          style={inputStyle}
          name="status"
          value={editingTask ? editingTask.status : newTask.status}
          onChange={handleChange}
        >
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <button
          type="submit"
          style={{
            gridColumn: "span 2",
            background: editingTask ? "#06d6a0" : "#2575fc",
            border: "none",
            padding: "12px",
            borderRadius: "8px",
            color: "white",
            fontSize: "1rem",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {editingTask ? "💾 Save Changes" : "➕ Add Task"}
        </button>
      </form>
    </section>
  );
}

const inputStyle = {
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  fontSize: "1rem",
};
