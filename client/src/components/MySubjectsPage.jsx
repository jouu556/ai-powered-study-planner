import { useEffect, useState } from "react";
import axios from "axios";

export default function MySubjectsPage({ user }) {
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState({
    subjectName: "",
    color: "#000000", // default black
  });

  // Fetch subjects
  useEffect(() => {
    if (user) {
      axios
        .get(`http://localhost:3000/subjects/${user.id}`)
        .then((res) => setSubjects(res.data.subjects))
        .catch((err) => console.error(err));
    }
  }, [user]);

  // Handle input changes
  const handleChange = (e) => {
    setNewSubject({ ...newSubject, [e.target.name]: e.target.value });
  };

  // Add subject
  const handleAddSubject = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3000/subjects", {
        ...newSubject,
        userId: user.id, // backend expects this
      });
      setSubjects([...subjects, response.data.task]); // add to UI
      setNewSubject({ subjectName: "", color: "#000000" });
    } catch (err) {
      console.error("Failed to add subject:", err);
    }
  };

  // Delete subject
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/subjects/${id}`);
      setSubjects(subjects.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Failed to delete subject:", err);
    }
  };

  if (!user) {
    return <p>Please log in to manage your subjects.</p>;
  }

  return (
    <div>
      <h1>{user.name}'s Subjects</h1>

      {/* Add Subject Form */}
      <form onSubmit={handleAddSubject}>
        <input
          name="subjectName"
          value={newSubject.subjectName}
          onChange={handleChange}
          placeholder="Subject Name"
          required
        />
        <input
          type="color"
          name="color"
          value={newSubject.color}
          onChange={handleChange}
        />
        <button type="submit">Add Subject</button>
      </form>

      {/* Subject List */}
      <ul>
        {subjects.map((s) => (
          <li key={s.id} style={{ color: s.color }}>
            <strong>{s.name}</strong>
            <button onClick={() => handleDelete(s.id)}>❌</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
