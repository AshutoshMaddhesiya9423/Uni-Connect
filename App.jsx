import React, { useState, useEffect } from "react";
import clubsData from "./data/clubs.json";
import "./App.css";

function App() {
  const savedUser = localStorage.getItem("currentUser");
  const [currentUser, setCurrentUser] = useState(savedUser ? JSON.parse(savedUser) : null);

  const [clubs, setClubs] = useState(
    JSON.parse(localStorage.getItem("clubs")) || clubsData.map(c => ({ ...c, members: [] }))
  );

  const [joinedByUser, setJoinedByUser] = useState(() => JSON.parse(localStorage.getItem("joinedByUser")) || {});

  const [loginName, setLoginName] = useState("");
  const [loginNumber, setLoginNumber] = useState("");

  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => localStorage.setItem("clubs", JSON.stringify(clubs)), [clubs]);
  useEffect(() => localStorage.setItem("joinedByUser", JSON.stringify(joinedByUser)), [joinedByUser]);
  useEffect(() => localStorage.setItem("currentUser", JSON.stringify(currentUser)), [currentUser]);

  const showMessage = (txt, ms = 2500) => {
    setMessage(txt);
    setTimeout(() => setMessage(""), ms);
  };

  const handleLogin = () => {
    if (!loginName.trim() || !loginNumber.trim()) {
      showMessage("Enter both name and number");
      return;
    }
    const newUser = { name: loginName.trim(), roll: loginNumber.trim() };
    setCurrentUser(newUser);
    setLoginName("");
    setLoginNumber("");
    showMessage(`Welcome ${newUser.name}`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedClub(null);
    setSearchResults([]);
    setQuery("");
    showMessage("Logged out");
  };

  const handleSearch = (customQuery = query) => {
    if (!currentUser) {
      showMessage("Login first to search clubs");
      return;
    }
    const results = clubs
      .filter(c => c.name.toLowerCase().includes(customQuery.toLowerCase()))
      .sort((a, b) => b.views - a.views);
    setSearchResults(results);
    setSelectedClub(null);
  };

  const handleClubClick = (club) => {
    if (!currentUser) {
      showMessage("Login first to view club details");
      return;
    }
    setSelectedClub(club);
  };

  const handleJoinClub = (club) => {
    const uid = `${currentUser.name}_${currentUser.roll}`;
    const userJoined = joinedByUser[uid] || {};

    if (userJoined[club.category]) {
      showMessage(`You already joined "${clubs.find(c => c.id === userJoined[club.category])?.name}" in this category.`);
      return;
    }

    // Update club views and members
    const updatedClubs = clubs.map(c =>
      c.id === club.id
        ? { ...c, views: c.views + 1, members: [...c.members, `${currentUser.name} (${currentUser.roll})`] }
        : c
    );
    setClubs(updatedClubs);

    // Update joinedByUser
    const updatedJoinedByUser = {
      ...joinedByUser,
      [uid]: { ...userJoined, [club.category]: club.id },
    };
    setJoinedByUser(updatedJoinedByUser);

    showMessage(`You joined ${club.name} ✅`);

    // Immediately go back to list view
    const filteredResults = updatedClubs
      .filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => b.views - a.views);

    setSearchResults(filteredResults);
    setSelectedClub(null); // hide detail
    setQuery(""); // clear search bar
  };

  return (
    <div className="portal-container">
      <header className="header">
        <div className="portal-title">🎭 University Club Portal</div>
        <div className="user-area">
          {currentUser ? (
            <>
              <span className="logged">
                Welcome <strong>{currentUser.name}</strong> ({currentUser.roll})
              </span>
              <button className="btn small" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <div className="login-box">
              <input className="login-input" placeholder="Name" value={loginName} onChange={e => setLoginName(e.target.value)} />
              <input className="login-input" placeholder="Number / Roll" value={loginNumber} onChange={e => setLoginNumber(e.target.value)} />
              <button className="btn small" onClick={handleLogin}>Login</button>
            </div>
          )}
        </div>
      </header>

      <div className="search-bar">
        <input type="text" placeholder="Search clubs (e.g. Python)..." value={query} onChange={e => setQuery(e.target.value)} />
        <button className="btn" onClick={() => handleSearch()}>Search</button>
      </div>

      {message && <div className="message">{message}</div>}

      {/* Club List */}
      {searchResults.length > 0 && !selectedClub && (
        <div className="result-list">
          <h2>Clubs</h2>
          <ul>
            {searchResults.map(club => {
              const uid = `${currentUser.name}_${currentUser.roll}`;
              const userJoined = joinedByUser[uid] || {};
              const alreadyJoinedId = userJoined[club.category];

              return (
                <li key={club.id} onClick={() => handleClubClick(club)}>
                  <span className="club-name" style={{ fontWeight: alreadyJoinedId === club.id ? "bold" : "normal" }}>
                    {club.name}
                  </span>
                  <span className="views">👥 {club.views}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Detail view */}
      {selectedClub && (
        <div className="card detail">
          <h2>{selectedClub.name}</h2>
          <p>{selectedClub.bulletin}</p>
          <p><strong>📞 Contact:</strong> {selectedClub.contact}</p>
          <p className="views">👥 {selectedClub.views} members</p>

          {/* Join button */}
          <button
            className="btn small"
            onClick={() => handleJoinClub(selectedClub)}
            disabled={joinedByUser[`${currentUser?.name}_${currentUser?.roll}`]?.[selectedClub.category]}
          >
            Join Club
          </button>

          {/* Members */}
          {selectedClub.members && selectedClub.members.length > 0 && (
            <div style={{ marginTop: "1rem" }}>
              <strong>Members:</strong>
              <ul>
                {selectedClub.members.map((m, i) => <li key={i}>{m}</li>)}
              </ul>
            </div>
          )}

          <button className="btn small" onClick={() => setSelectedClub(null)}>⬅ Back</button>
        </div>
      )}
    </div>
  );
}

export default App;
