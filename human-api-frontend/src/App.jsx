
import { useEffect, useMemo, useState } from "react";
import "./App.css";

const initialPeople = [
  {
    id: 1,
    name: "Aryan Mehta",
    initials: "AM",
    role: "Creative & Developer",
    bio: "I turn ideas into things people can use.",
    offers: ["Video Editing", "Java", "Photography"],
    needs: ["Photoshop", "Guitar"],
    color: "violet",
  },
  {
    id: 2,
    name: "Kavya Shah",
    initials: "KS",
    role: "Designer & Artist",
    bio: "Designing things that make people stop scrolling.",
    offers: ["Photoshop", "UI Design", "Illustration"],
    needs: ["Java", "Video Editing"],
    color: "orange",
  },
  {
    id: 3,
    name: "Omkar Patil",
    initials: "OP",
    role: "Tech Enthusiast",
    bio: "Learning something new every single day.",
    offers: ["Python", "DSA", "Java"],
    needs: ["Video Editing", "UI Design"],
    color: "blue",
  },
  {
    id: 4,
    name: "Priya Nair",
    initials: "PN",
    role: "Music & Media",
    bio: "Music, storytelling, and creative experiments.",
    offers: ["Guitar", "Video Editing", "Content Writing"],
    needs: ["Python", "Photography"],
    color: "pink",
  },
];

const starterOffers = ["Java", "Python"];
const starterNeeds = ["UI Design"];
const API_URL = "http://localhost:8080/api";

function App() {
  const [backendSkills, setBackendSkills] = useState([]);
  const [backendStatus, setBackendStatus] = useState(
    "Connecting to Java backend..."
  );
  const [people, setPeople] = useState(initialPeople);

  const [currentUser, setCurrentUser] = useState({
    id: 99,
    name: "Sai",
    initials: "SA",
    role: "Builder in progress",
    bio: "Here to learn, share, and build cool things.",
    offers: starterOffers,
    needs: starterNeeds,
    color: "green",
  });

  const [page, setPage] = useState("Home");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [skillInput, setSkillInput] = useState("");
  const [skillType, setSkillType] = useState("offers");
  const [connections, setConnections] = useState([]);
  const [notice, setNotice] = useState("");

  // Load skills, people, and saved connection requests from the backend.
  useEffect(() => {
    async function loadData() {
      try {
        const skillsResponse = await fetch(`${API_URL}/skills`);

        if (!skillsResponse.ok) {
          throw new Error("Skills request failed");
        }

        const skills = await skillsResponse.json();
        setBackendSkills(skills);
        setBackendStatus("Connected to Java backend");
      } catch (error) {
        console.error("Could not load skills:", error);
        setBackendStatus("Java backend unavailable");
      }

      let peopleList = initialPeople;

      try {
        const peopleResponse = await fetch(`${API_URL}/people`);

        if (!peopleResponse.ok) {
          throw new Error("People request failed");
        }

        peopleList = await peopleResponse.json();
setPeople(peopleList);

const savedUser = peopleList.find(
  (person) => Number(person.id) === 99
);

if (savedUser) {
  setCurrentUser(savedUser);
}
      } catch (error) {
        console.error("Could not load people:", error);
      }

      try {
        const connectionsResponse = await fetch(`${API_URL}/connections`);

        if (!connectionsResponse.ok) {
          throw new Error("Connections request failed");
        }

        const requests = await connectionsResponse.json();

        const savedConnections = requests
          .filter(
            (request) =>
              Number(request.senderId) === 99 &&
              request.status !== "REJECTED"
          )
          .map((request) => {
            const person = peopleList.find(
              (item) => Number(item.id) === Number(request.receiverId)
            );

            if (!person) return null;

            return {
              ...person,
              requestId: request.id,
              requestStatus: request.status,
            };
          })
          .filter(Boolean);

        setConnections(savedConnections);
      } catch (error) {
        console.error("Could not load saved connections:", error);
      }
    }

    loadData();
  }, []);

  const allPeople = [currentUser, ...people];

  const matches = useMemo(() => {
    return people
      .map((person) => {
        const offeredToMe = person.offers.filter((skill) =>
          currentUser.needs.some(
            (need) => need.toLowerCase() === skill.toLowerCase()
          )
        );

        const neededFromMe = person.needs.filter((skill) =>
          currentUser.offers.some(
            (offer) => offer.toLowerCase() === skill.toLowerCase()
          )
        );

        const total = currentUser.needs.length + currentUser.offers.length;

        const score = total
          ? Math.round(
              ((offeredToMe.length + neededFromMe.length) / total) * 100
            )
          : 0;

        return { ...person, offeredToMe, neededFromMe, score };
      })
      .filter((person) => person.score > 0)
      .sort((a, b) => b.score - a.score);
  }, [people, currentUser]);

  const visiblePeople = people.filter((person) => {
    const query = search.toLowerCase();

    const matchesSearch =
      person.name.toLowerCase().includes(query) ||
      person.offers.some((skill) => skill.toLowerCase().includes(query)) ||
      person.needs.some((skill) => skill.toLowerCase().includes(query));

    const matchesFilter =
      filter === "All" ||
      (filter === "Can help me" &&
        person.offers.some((skill) =>
          currentUser.needs.some(
            (need) => need.toLowerCase() === skill.toLowerCase()
          )
        )) ||
      (filter === "Needs my skills" &&
        person.needs.some((skill) =>
          currentUser.offers.some(
            (offer) => offer.toLowerCase() === skill.toLowerCase()
          )
        ));

    return matchesSearch && matchesFilter;
  });

  
async function addSkill(event) {
  event.preventDefault();

  const skill = skillInput.trim();

  if (!skill) return;

  if (
    currentUser[skillType].some(
      (item) => item.toLowerCase() === skill.toLowerCase()
    )
  ) {
    setNotice("That skill is already on your profile.");
    return;
  }

  const updatedUser = {
    ...currentUser,
    [skillType]: [...currentUser[skillType], skill],
  };

  try {
    const response = await fetch(
      `http://localhost:8080/api/people/${updatedUser.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      }
    );

    if (!response.ok) throw new Error("Failed to save skill");

    const savedUser = await response.json();
    setCurrentUser(savedUser);
    setSkillInput("");
    setNotice(`${skill} added to your profile.`);
  } catch (error) {
    console.error("Could not save skill:", error);
    setNotice("Could not save skill. Please try again.");
  }
}

  
const [profileMessage, setProfileMessage] = useState("");

async function saveProfile() {
  try {
    const response = await fetch(
      `http://localhost:8080/api/people/${currentUser.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(currentUser),
      }
    );

    if (!response.ok) {
      throw new Error("Could not save profile");
    }

    const savedProfile = await response.json();
    setCurrentUser(savedProfile);
    setProfileMessage("Profile saved successfully!");
  } catch (error) {
    console.error("Profile save failed:", error);
    setProfileMessage("Could not save profile. Check the backend.");
  }
}

async function updateConnectionStatus(requestId, status) {
  try {
    const response = await fetch(
      `${API_URL}/connections/${requestId}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      }
    );

    if (!response.ok) {
      throw new Error("Could not update connection");
    }

    const updatedRequest = await response.json();

    setConnections((previous) =>
      previous.map((person) =>
        person.requestId === requestId
          ? { ...person, requestStatus: updatedRequest.status }
          : person
      )
    );

    setNotice(
      status === "ACCEPTED"
        ? "Connection accepted!"
        : "Connection request rejected."
    );
  } catch (error) {
    console.error("Connection update failed:", error);
    setNotice("Could not update connection. Please try again.");
  }
}


  
async function removeSkill(type, skill) {
  const updatedUser = {
    ...currentUser,
    [type]: currentUser[type].filter((item) => item !== skill),
  };

  try {
    const response = await fetch(
      `http://localhost:8080/api/people/${updatedUser.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      }
    );

    if (!response.ok) throw new Error("Failed to remove skill");

    const savedUser = await response.json();
    setCurrentUser(savedUser);
    setNotice(`${skill} removed from your profile.`);
  } catch (error) {
    console.error("Could not remove skill:", error);
    setNotice("Could not remove skill. Please try again.");
  }
}


  // Send a real connection request to Spring Boot.
  async function connect(person) {
    const alreadyConnected = connections.some(
      (item) => Number(item.id) === Number(person.id)
    );

    if (alreadyConnected) {
      setNotice(`You've already sent a request to ${person.name}.`);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/connections`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          senderId: currentUser.id,
          receiverId: person.id,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Could not send connection request.");
      }

      const savedRequest = await response.json();

      setConnections((items) => [
        ...items,
        {
          ...person,
          requestId: savedRequest.id,
          requestStatus: savedRequest.status,
        },
      ]);

      setNotice(`Connection request sent to ${person.name}.`);
    } catch (error) {
      console.error("Connection request failed:", error);
      setNotice(
        `Could not connect with ${person.name}. Check the backend and try again.`
      );
    }
  }

  function navigate(nextPage) {
    setPage(nextPage);
    setNotice("");
  }

  function personCard(person, score) {
    const connected = connections.some(
      (item) => Number(item.id) === Number(person.id)
    );

    return (
      <article className="person-card" key={person.id}>
        <div className="person-top">
          <div className={`avatar ${person.color}`}>{person.initials}</div>

          <div className="person-info">
            <h3>{person.name}</h3>
            <p>{person.role}</p>
          </div>

          {score > 0 && <span className="score">{score}% match</span>}
        </div>

        <p className="person-bio">{person.bio}</p>

        <div className="skill-section">
          <span className="section-label">CAN HELP WITH</span>
          <div className="chips">
            {person.offers.map((skill) => (
              <span className="chip offer-chip" key={skill}>
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="skill-section">
          <span className="section-label">LOOKING FOR</span>
          <div className="chips">
            {person.needs.map((skill) => (
              <span className="chip need-chip" key={skill}>
                {skill}
              </span>
            ))}
          </div>
        </div>

        {score > 0 && (
          <div className="match-details">
            {(person.offeredToMe?.length ?? 0) > 0 && (
              <p>
                <span>↙</span> Can help you with:{" "}
                {person.offeredToMe.join(", ")}
              </p>
            )}

            {(person.neededFromMe?.length ?? 0) > 0 && (
              <p>
                <span>↗</span> Needs your skills:{" "}
                {person.neededFromMe.join(", ")}
              </p>
            )}
          </div>
        )}

        <button
          className={`connect-button ${connected ? "connected" : ""}`}
          onClick={() => connect(person)}
          disabled={connected}
        >
          {connected ? "✓ Request sent" : "Connect →"}
        </button>
      </article>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => navigate("Home")}>
          <span className="brand-mark">h.</span>
          <span>
            human<span className="brand-light">api</span>
          </span>
        </button>

        <div className="workspace-label">WORKSPACE</div>

        <nav className="navigation">
          {[
            ["Home", "⌂"],
            ["Explore people", "⌕"],
            ["My matches", "✳"],
            ["My profile", "◉"],
            ["Connections", "↗"],
          ].map(([label, symbol]) => (
            <button
              key={label}
              className={`nav-item ${page === label ? "active" : ""}`}
              onClick={() => navigate(label)}
            >
              <span className="nav-symbol">{symbol}</span>
              {label}

              {label === "My matches" && matches.length > 0 && (
                <span className="nav-count">{matches.length}</span>
              )}

              {label === "Connections" && connections.length > 0 && (
                <span className="nav-count">{connections.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span className="note-icon">✳</span>
            <p>Everyone has something to offer.</p>
            <span>Find your people.</span>
          </div>

          <div className="mini-profile">
            <div className="avatar green">SA</div>
            <div>
              <strong>Sai</strong>
              <span>Free account</span>
            </div>
            <span className="more">···</span>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            Human API <span>/</span> {page}
          </div>

          <div className="topbar-right">
            <span className="live-dot"></span>
            <span>Community workspace</span>
            <div className="avatar green small-avatar">SA</div>
          </div>
        </header>

        <div className="page-content">
          {notice && (
            <div className="notice">
              <span>{notice}</span>
              <button onClick={() => setNotice("")}>×</button>
            </div>
          )}

          {page === "Home" && (
            <>
              <section className="hero">
                <div className="hero-content">
                  <span className="eyebrow">
                    <span className="live-dot"></span> YOUR PEOPLE ARE OUT THERE
                  </span>

                  <h1>
                    Everybody knows
                    <br />
                    <span>something.</span>
                    <br />
                    Nobody knows
                    <br />
                    everything.
                  </h1>

                  <p>
                    Find people who have what you need, and become the person
                    someone else is looking for.
                  </p>

                  <div className="hero-actions">
                    <button
                      className="primary-button"
                      onClick={() => navigate("Explore people")}
                    >
                      Find your people <span>↗</span>
                    </button>

                    <button
                      className="secondary-button"
                      onClick={() => navigate("My profile")}
                    >
                      Build your API
                    </button>
                  </div>
                </div>

                <div className="hero-visual">
                  <div className="orbit orbit-one"></div>
                  <div className="orbit orbit-two"></div>
                  <div className="orbit orbit-three"></div>
                  <div className="orbit-core">h.</div>

                  <div className="orbit-person orbit-a">
                    <span>AM</span>
                    <small>Video</small>
                  </div>

                  <div className="orbit-person orbit-b">
                    <span>KS</span>
                    <small>Design</small>
                  </div>

                  <div className="orbit-person orbit-c">
                    <span>OP</span>
                    <small>Code</small>
                  </div>

                  <div className="orbit-person orbit-d">
                    <span>PN</span>
                    <small>Music</small>
                  </div>

                  <div className="floating-tag">✳ MATCH FOUND</div>
                </div>

                <div className="hero-index">01 / THE HUMAN NETWORK</div>
              </section>

              <section className="stats-row">
                <div>
                  <span className="stat-number">{allPeople.length}</span>
                  <span className="stat-label">People in the demo</span>
                </div>

                <div>
                  <span className="stat-number">
                    {new Set(allPeople.flatMap((p) => p.offers)).size}
                  </span>
                  <span className="stat-label">Skills to discover</span>
                </div>

                <div>
                  <span className="stat-number">{matches.length}</span>
                  <span className="stat-label">Potential matches for you</span>
                </div>

                <div>
                  <span className="stat-number">{connections.length}</span>
                  <span className="stat-label">Your connections</span>
                </div>
              </section>

              <section className="section-block">
                <div className="section-heading">
                  <div>
                    <span className="eyebrow">GOOD THINGS HAPPEN HERE</span>
                    <h2>Your potential matches</h2>
                    <p>
                      People whose skills overlap with what you're looking for.
                    </p>
                  </div>

                  <button
                    className="text-button"
                    onClick={() => navigate("My matches")}
                  >
                    View all matches ↗
                  </button>
                </div>

                {matches.length ? (
                  <div className="people-grid">
                    {matches.slice(0, 3).map((person) =>
                      personCard(person, person.score)
                    )}
                  </div>
                ) : (
                  <div className="empty-state">
                    <h3>Your next connection starts with your API.</h3>
                    <p>
                      Add skills you can offer and skills you need to discover
                      matches.
                    </p>
                    <button
                      className="primary-button"
                      onClick={() => navigate("My profile")}
                    >
                      Set up your profile →
                    </button>
                  </div>
                )}
              </section>
            </>
          )}

          {page === "Explore people" && (
            <section className="section-block standalone">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">THE HUMAN NETWORK</span>
                  <h1>Find your people.</h1>
                  <p>
                    Discover useful skills, new collaborators, and unexpected
                    exchanges.
                  </p>
                </div>
              </div>

              <input
                className="search-input"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search people or skills..."
              />

              <div className="filter-row">
                {["All", "Can help me", "Needs my skills"].map((item) => (
                  <button
                    key={item}
                    className={`filter-button ${
                      filter === item ? "selected" : ""
                    }`}
                    onClick={() => setFilter(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="people-grid">
                {visiblePeople.map((person) => {
                  const match = matches.find(
                    (item) => item.id === person.id
                  );

                  return personCard(person, match?.score || 0);
                })}
              </div>

              {!visiblePeople.length && (
                <div className="empty-state">
                  <h3>No people found.</h3>
                  <p>Try a different search or filter.</p>
                </div>
              )}
            </section>
          )}

          {page === "My matches" && (
            <section className="section-block standalone">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">COMPATIBILITY ENGINE</span>
                  <h1>It's a two-way street.</h1>
                  <p>
                    Matches are based on how their offers meet your needs and
                    how your offers meet theirs.
                  </p>
                </div>
              </div>

              {matches.length ? (
                <div className="people-grid">
                  {matches.map((person) =>
                    personCard(person, person.score)
                  )}
                </div>
              ) : (
                <div className="empty-state">
                  <h3>No matches yet.</h3>
                  <p>
                    Add more skills to your profile to discover compatible
                    people.
                  </p>
                  <button
                    className="primary-button"
                    onClick={() => navigate("My profile")}
                  >
                    Update my API →
                  </button>
                </div>
              )}
            </section>
          )}

          {page === "My profile" && (
            <section className="section-block standalone">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">YOUR PERSONAL API</span>
                  <h1>Make yourself discoverable.</h1>
                  <p>
                    Tell people what you can help with and what you want to
                    learn.
                  </p>
                </div>
              </div>

              <div className="profile-panel">
                <div className="profile-header">
                  <div className="avatar green profile-avatar">SA</div>
                  <div>
                    <h2>{currentUser.name}</h2>
                    <p>{currentUser.role}</p>
                    <span className="profile-status">● Your API is active</span>
                  </div>
                </div>

                <label className="field-label" htmlFor="profile-bio">
                  ABOUT YOU
                </label>

                <textarea
                  id="profile-bio"
                  className="bio-input"
                  value={currentUser.bio}
                  onChange={(event) =>
                    setCurrentUser((user) => ({
                      ...user,
                      bio: event.target.value,
                    }))
                  }
                />
                
<div className="profile-save">
  <button
    type="button"
    className="primary-button"
    onClick={saveProfile}
  >
    Save Profile
  </button>

  {profileMessage && <p>{profileMessage}</p>}
</div>


                <div className="profile-skills">
                  <div className="skill-section">
                    <span className="section-label">⚡ I CAN HELP WITH</span>
                    <div className="chips">
                      {currentUser.offers.map((skill) => (
                        <button
                          className="chip offer-chip removable-chip"
                          key={skill}
                          onClick={() => removeSkill("offers", skill)}
                          title="Remove skill"
                        >
                          {skill} ×
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="skill-section">
                    <span className="section-label">◎ I'M LOOKING FOR</span>
                    <div className="chips">
                      {currentUser.needs.map((skill) => (
                        <button
                          className="chip need-chip removable-chip"
                          key={skill}
                          onClick={() => removeSkill("needs", skill)}
                          title="Remove skill"
                        >
                          {skill} ×
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <form className="add-skill-form" onSubmit={addSkill}>
                  <div className="skill-type-toggle">
                    <button
                      type="button"
                      className={skillType === "offers" ? "chosen" : ""}
                      onClick={() => setSkillType("offers")}
                    >
                      I can offer
                    </button>

                    <button
                      type="button"
                      className={skillType === "needs" ? "chosen" : ""}
                      onClick={() => setSkillType("needs")}
                    >
                      I need
                    </button>
                  </div>

                  <div className="add-skill-row">
                    <input
                      value={skillInput}
                      onChange={(event) => setSkillInput(event.target.value)}
                      placeholder="Enter a skill, e.g. UI Design"
                    />

                    <button type="submit" className="primary-button">
                      + Add skill
                    </button>
                  </div>
                </form>
              </div>
            </section>
          )}

          {page === "Connections" && (
            <section className="section-block standalone">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">YOUR NETWORK</span>
                  <h1>Good things start with people.</h1>
                  <p>
                    Everyone you've sent a connection request to appears here.
                  </p>
                </div>
              </div>

              {connections.length ? (
                <div className="people-grid">
                  
{connections.map((person) => (
  <div className="connection-card" key={person.requestId}>
    {personCard(person, 0)}

    <p>
      Status: <strong>{person.requestStatus || "PENDING"}</strong>
    </p>

    {person.requestStatus === "PENDING" && (
      <div className="connection-actions">
        <button
          className="primary-button"
          onClick={() =>
            updateConnectionStatus(person.requestId, "ACCEPTED")
          }
        >
          Accept
        </button>

        <button
          className="secondary-button"
          onClick={() =>
            updateConnectionStatus(person.requestId, "REJECTED")
          }
        >
          Reject
        </button>
      </div>
    )}
  </div>
))}

                </div>
              ) : (
                <div className="empty-state">
                  <h3>Your network is waiting.</h3>
                  <p>
                    Explore people and send your first connection request.
                  </p>
                  <button
                    className="primary-button"
                    onClick={() => navigate("Explore people")}
                  >
                    Explore people →
                  </button>
                </div>
              )}
            </section>
          )}

          <footer className="footer">
            <span>HUMAN API © 2026</span>
            <span>
              Built on what we can do for each other. <b>✳</b>
            </span>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default App;

