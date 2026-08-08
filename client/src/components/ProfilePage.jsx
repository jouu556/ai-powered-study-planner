import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import TaskForm from "./TaskForm.jsx";
import TaskPlanPanel from "./TaskPlanPanel.jsx";
import SideBar from "./SideBar.jsx";
import TaskList from "./TaskList.jsx";
import TaskPlanForm from "./TaskPlanForm.jsx";

export default function ProfilePage({ user }) {
  const [tasks, setTasks] = useState([]);
  const [planError, setPlanError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [newTask, setNewTask] = useState({
    subjectName: "",
    title: "",
    description: "",
    dueDate: "",
    status: "pending",
    priority: 2,
  });
  const [editingTask, setEditingTask] = useState(null);
  const [taskPlan, setTaskPlan] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [notifications, setNotifications] = useState([]);

useEffect(() => {
  if (user) {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/notifications?userId=${user.id}`);
        setNotifications(res.data);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };

    fetchNotifications();
  }
}, [user]);


  const priorityLabels = { 1: "Low", 2: "Medium", 3: "High" };

  // Fetch tasks
  useEffect(() => {
    if (user) {
      axios
        .get(`http://localhost:3000/tasks/${user.id}`)
        .then((res) => setTasks(res.data.tasks))
        .catch((err) => console.error(err));
    }
  }, [user]);

  // Handlers
  const handleChange = (e) => {
    if (editingTask) {
      setEditingTask({ ...editingTask, [e.target.name]: e.target.value });
    } else {
      setNewTask({ ...newTask, [e.target.name]: e.target.value });
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    const response = await axios.post("http://localhost:3000/tasks", {
      ...newTask,
      userId: user.id,
    });
    setTasks([...tasks, response.data.task]);
    setNewTask({
      subjectName: "",
      title: "",
      description: "",
      dueDate: "",
      status: "pending",
      priority: 2,
    });
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:3000/tasks/${id}`);
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const handleEdit = (task) => setEditingTask(task);

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    const response = await axios.put(
      `http://localhost:3000/tasks/${editingTask.id}`,
      editingTask
    );
    setTasks(tasks.map((t) => (t.id === editingTask.id ? response.data.task : t)));
    setEditingTask(null);
  };


const handleViewPlan = (plan) => {
  console.log("📌 Got generated plan directly:", plan);
  setTaskPlan(plan);
  setShowPlanForm(false);
};

  const handleClosePlan = () => setTaskPlan(null);

  const handleRegeneratePlan = async (taskId) => {
    try {
      setLoadingPlan(true);
      const res = await axios.get(
        `http://localhost:3000/ai/plan/task/${taskId}?regen=true`
      );
      setTaskPlan(res.data.plan);
    } catch (err) {
      setPlanError("⚠️ Failed to regenerate plan.");
    } finally {
      setLoadingPlan(false);
    }
  };

  if (!user) return <p>No user logged in.</p>;

return (
  <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Segoe UI, sans-serif" }}>
    {/* Sidebar */}
    <SideBar user={user} />

    {/* Main */}
    <main style={{ flex: 1, background: "#1c2639ff", padding: "30px", overflowY: "auto" }}>
      <h1>Welcome, {user.name}</h1>
      <p>
        Study Field: <strong>{user.studyField}</strong>
      </p>

      {/* Notifications */}
      <div style={{ marginTop: "20px" }}>
        <h2>Notifications</h2>
        {notifications.length === 0 ? (
          <p>No notifications yet.</p>
        ) : (
          <ul>
            {notifications.map((n) => (
              <li key={n.id}>
                {n.message} {!n.is_read && <strong>(new)</strong>}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Task List */}
      <TaskList
        tasks={tasks}
        priorityLabels={priorityLabels}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onGeneratePlan={(task) => {
          setSelectedTask(task);
          setShowPlanForm(true);
        }}
        onViewPlan={(plan) => {
          setTaskPlan(plan); // ✅ show plan
          setShowPlanForm(false); // ✅ skip form
        }}
      />

      {/* Task Form */}
      <TaskForm
        editingTask={editingTask}
        newTask={newTask}
        handleChange={handleChange}
        handleUpdateTask={handleUpdateTask}
        handleAddTask={handleAddTask}
      />

      {/* Task Plan Panel */}
      {taskPlan && (
        <TaskPlanPanel
          plan={taskPlan}
          loading={loadingPlan}
          onClose={handleClosePlan}
          onRegenerate={(taskId) => handleRegeneratePlan(taskId)}
        />
      )}

      {/* Task Plan Form */}
      {showPlanForm && selectedTask && (
        <TaskPlanForm
          task={selectedTask}
          onCancel={() => setShowPlanForm(false)}
          onSubmit={(plan) => handleViewPlan(plan)}
        />
      )}
    </main>
  </div>
);

}