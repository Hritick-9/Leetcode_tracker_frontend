import React, { useEffect, useState } from "react";

function App() {
  const [usernames, setUsernames] = useState([
    "saurabhmishra1491",
    "_restart_2024",
    "urstrulyatish",
    "kumarhritick932003",
    "goyalyashgoyal11",
  ]);
  const [newUsername, setNewUsername] = useState("");
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isToday = (timeString) => {
    const date = new Date(timeString);
    if (isNaN(date.getTime())) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  function convertToIST(timeStr) {
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) return "Invalid Date";
    // Add 5 hours 30 minutes
    const istDate = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
    return istDate.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  }

  async function fetchSubmissions(userList) {
    setLoading(true);
    setError(null);
    const results = { ...data };
    const validUsernames = [...usernames];

    try {
      for (const user of userList) {
        if (results[user]) continue;
        const res = await fetch(
          "https://leetcode-tracker-backend-ogqw.onrender.com/api/submissions",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: user }),
          }
        );

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(`Error for ${user}: ${errData.error || res.statusText}`);
        }

        const json = await res.json();
        if (json.submissions && json.submissions.length > 0) {
          results[user] = json.submissions;
        } else {
          if (userList.length === 1) {
            const index = validUsernames.indexOf(user);
            if (index !== -1) {
              validUsernames.splice(index, 1);
              alert(`User "${user}" has zero submissions and will not be added.`);
            }
          }
        }
      }
      setData(results);
      setUsernames(validUsernames);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSubmissions(usernames);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddUser = (e) => {
    e.preventDefault();
    const trimmed = newUsername.trim();
    if (!trimmed) return;
    if (usernames.includes(trimmed)) {
      alert("Username already exists");
      return;
    }
    setUsernames((prev) => [...prev, trimmed]);
    fetchSubmissions([trimmed]);
    setNewUsername("");
  };

  if (loading && Object.keys(data).length === 0)
    return <p>Loading submissions...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "2rem auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>LeetCode Submissions Tracker</h2>

      {usernames.map((user) => {
        const submissions = data[user] || [];
        const todayCount = submissions.filter((s) => isToday(s.time)).length;

        return (
          <div key={user} style={{ marginBottom: "3rem" }}>
            <h3>
              {user} —{" "}
              <span style={{ fontWeight: "normal" }}>
                {todayCount} submissions today
              </span>
            </h3>
            {submissions.length > 0 ? (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  textAlign: "left",
                  fontSize: "0.9rem",
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        borderBottom: "1px solid #ccc",
                        padding: "0.5rem",
                      }}
                    >
                      Problem
                    </th>
                    <th
                      style={{
                        borderBottom: "1px solid #ccc",
                        padding: "0.5rem",
                      }}
                    >
                      Link to Problem
                    </th>
                    <th
                      style={{
                        borderBottom: "1px solid #ccc",
                        padding: "0.5rem",
                      }}
                    >
                      Language
                    </th>
                    <th
                      style={{
                        borderBottom: "1px solid #ccc",
                        padding: "0.5rem",
                      }}
                    >
                      Time (IST)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub) => (
                    <tr key={sub.id}>
                      <td
                        style={{
                          borderBottom: "1px solid #eee",
                          padding: "0.5rem",
                        }}
                      >
                        {sub.title}
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #eee",
                          padding: "0.5rem",
                        }}
                      >
                        <a
                          href={`https://leetcode.com/problems/${sub.titleSlug}/`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#0074d9", textDecoration: "none" }}
                        >
                          Click Me
                        </a>
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #eee",
                          padding: "0.5rem",
                        }}
                      >
                        {sub.language}
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #eee",
                          padding: "0.5rem",
                        }}
                      >
                        {convertToIST(sub.time)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No submissions found.</p>
            )}
          </div>
        );
      })}

      <form
        onSubmit={handleAddUser}
        style={{
          marginTop: "2rem",
          display: "flex",
          maxWidth: 400,
          gap: "0.5rem",
        }}
      >
        <input
          type="text"
          placeholder="Add LeetCode username"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
          style={{ flex: 1, padding: "0.5rem", fontSize: "1rem" }}
        />
        <button
          type="submit"
          style={{
            padding: "0.5rem 1rem",
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          Add
        </button>
      </form>

      {loading && Object.keys(data).length > 0 && (
        <p style={{ marginTop: "1rem" }}>Loading new submissions...</p>
      )}
    </div>
  );
}

export default App;
