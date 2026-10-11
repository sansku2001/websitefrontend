import { useEffect, useMemo, useState } from "react";
import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { api } from "./api.js";
import { Footer, Header } from "./components/SiteLayout.jsx";
import { Home } from "./pages/HomePage.jsx";
import { RedevelopmentAdminPage } from "./pages/RedevelopmentAdminPage.jsx";
import {
  blankUpdate,
  HomeTrackerCard,
  RedevelopmentTracker,
  redevelopmentStages,
  UpdateTimeline,
} from "./components/RedevelopmentTracker.jsx";
import { CommitteePage, EventPage } from "./pages/CommitteePages.jsx";
import {
  copy,
  imageSamples,
  imageUrl,
  photoSamples,
  titleOf,
  tr,
} from "./siteContent.js";

export default function App() {
  const location = useLocation();
  const [content, setContent] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [contentAttempt, setContentAttempt] = useState(0);
  const [lang, setLang] = useState(
    () => localStorage.getItem("ramakant-language-choice") || "en",
  );
  const [askLanguage, setAskLanguage] = useState(
    () => !localStorage.getItem("ramakant-language-choice"),
  );
  const [noticeLimit, setNoticeLimit] = useState(5);
  const text = tr[lang];

  useEffect(() => {
    let active = true;
    setLoadError("");
    api
      .content()
      .then((result) => {
        if (active) setContent(result);
      })
      .catch((error) => {
        if (active) setLoadError(error.message);
      });
    return () => {
      active = false;
    };
  }, [contentAttempt]);

  useEffect(() => {
    if (
      !content ||
      location.pathname !== "/" ||
      location.hash !== "#redevelopment-status"
    ) {
      return;
    }
    const frame = requestAnimationFrame(() =>
      document
        .getElementById("redevelopment-status")
        ?.scrollIntoView({ behavior: "smooth" }),
    );
    return () => cancelAnimationFrame(frame);
  }, [content, location.pathname, location.hash]);

  function chooseLanguage(value) {
    localStorage.setItem("ramakant-language-choice", value);
    setLang(value);
    setAskLanguage(false);
  }

  if (!content) {
    return (
      <main className="loading">
        {loadError ? (
          <>
            <h1>Website could not connect</h1>
            <p>{loadError}</p>
            <p>The server may still be waking up. Please try again.</p>
            <button
              className="button"
              onClick={() => setContentAttempt((value) => value + 1)}
            >
              Retry
            </button>
          </>
        ) : (
          <>
            <p>Waking up the server, this can take up to a minute.</p>
            {text.loading}
          </>
        )}
      </main>
    );
  }

  return (
    <>
      <Routes>
        <Route
          path="/admin"
          element={<AdminPage initial={content} lang={lang} />}
        />
        <Route
          path="/redevelopment"
          element={<Navigate to="/committee/redevelopment" replace />}
        />
        <Route
          path="/redevelopment/admin"
          element={<Navigate to="/admin?section=redevelopmentStatus" replace />}
        />
        <Route
          path="/committee/:type"
          element={<CommitteePage content={content} lang={lang} />}
        />
        <Route
          path="/gallery/:id"
          element={<EventPage content={content} lang={lang} />}
        />
        <Route
          path="*"
          element={
            <Home
              content={content}
              lang={lang}
              text={text}
              noticeLimit={noticeLimit}
              setNoticeLimit={setNoticeLimit}
            />
          }
        />
      </Routes>
      {askLanguage && (
        <div className="modal-backdrop">
          <section className="language-modal" role="dialog" aria-modal="true">
            <span className="eyebrow">Ramakant CHSL</span>
            <h2>{text.chooseLanguage}</h2>
            <div className="button-row">
              <button className="button" onClick={() => chooseLanguage("en")}>
                English
              </button>
              <button
                className="button secondary"
                onClick={() => chooseLanguage("mr")}
              >
                मराठी
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

function AdminPage({ initial, lang }) {
  const location = useLocation();
  const requestedSection = new URLSearchParams(location.search).get("section");
  const [content, setContent] = useState(() => copy(initial));
  const [authenticated, setAuthenticated] = useState(false);
  const [section, setSection] = useState(() =>
    requestedSection === "redevelopmentStatus" ? requestedSection : "overview",
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    api
      .session()
      .then((session) => {
        if (session.authenticated) {
          setAuthenticated(true);
          api
            .complaints()
            .then(setComplaints)
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, []);
  async function signIn(username, password) {
    setError("");
    try {
      await api.login(username, password);
      setAuthenticated(true);
      setComplaints(await api.complaints());
    } catch (e) {
      setError(e.message);
    }
  }
  async function save() {
    setBusy(true);
    setMessage("");
    setError("");
    try {
      await api.saveContent(content);
      setMessage("Changes saved. The public website is updated.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function upload(file) {
    if (!file) return "";
    if (file.size > 9 * 1024 * 1024)
      throw new Error("Each file must be smaller than 9 MB.");
    return (await api.upload(file)).url;
  }
  async function exportBackup() {
    try {
      const bundle = { content, complaints: await api.complaints() };
      const a = document.createElement("a");
      a.href = URL.createObjectURL(
        new Blob([JSON.stringify(bundle, null, 2)], {
          type: "application/json",
        }),
      );
      a.download = "ramakant-chsl-backup.json";
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      setError(e.message);
    }
  }
  async function importBackup(file) {
    if (!file) return;
    try {
      const bundle = JSON.parse(await file.text());
      const restored = bundle.content || bundle;
      await api.saveContent(restored);
      if (Array.isArray(bundle.complaints))
        await api.importComplaints(bundle.complaints);
      setContent(restored);
      setMessage(
        "Backup restored. Please upload the photo and PDF files again.",
      );
    } catch (e) {
      setError(`Could not restore backup: ${e.message}`);
    }
  }
  async function signOut() {
    await api.logout();
    setAuthenticated(false);
  }
  if (!authenticated)
    return (
      <Login onLogin={signIn} error={error} onHome={() => navigate("/")} />
    );
  const labels = {
    overview: "Website information",
    notices: "Notices",
    events: "Gallery events",
    managing: "Managing Committee",
    redevelopment: "Redevelopment Committee",
    redevelopmentStatus: "Redevelopment status",
    complaints: "Complaints",
  };
  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div>
          <h1>Ramakant CHSL · Secretary Panel</h1>
          <span>Update the information shown on the website.</span>
        </div>
        <div className="button-row">
          <Link className="button secondary" to="/">
            View website
          </Link>
          <button className="button secondary" onClick={signOut}>
            Sign out
          </button>
        </div>
      </header>
      <div className="admin-layout">
        <nav className="admin-tabs">
          {Object.entries(labels).map(([key, label]) => (
            <button
              key={key}
              className={section === key ? "active" : ""}
              onClick={() => {
                setSection(key);
                setMessage("");
                setError("");
              }}
            >
              {label}
            </button>
          ))}
        </nav>
        <main className="admin-main">
          <div className="admin-top">
            <div>
              <h2>{labels[section]}</h2>
              <p>
                English and Marathi text can be added in the matching fields.
              </p>
            </div>
            <div className="button-row">
              <button className="button secondary" onClick={exportBackup}>
                Download backup
              </button>
              <label className="button secondary file-button">
                Restore backup
                <input
                  type="file"
                  accept="application/json,.json"
                  onChange={(e) => {
                    importBackup(e.target.files[0]);
                    e.target.value = "";
                  }}
                />
              </label>
              <button className="button" disabled={busy} onClick={save}>
                {busy ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
          {message && (
            <p className="notice-success" role="status">
              {message}
            </p>
          )}
          {error && (
            <p className="notice-error" role="alert">
              {error}
            </p>
          )}
          {section === "overview" && (
            <SiteEditor
              content={content}
              setContent={setContent}
              upload={upload}
            />
          )}
          {section === "notices" && (
            <NoticeEditor
              content={content}
              setContent={setContent}
              upload={upload}
            />
          )}
          {section === "events" && (
            <EventEditor
              content={content}
              setContent={setContent}
              upload={upload}
            />
          )}
          {section === "managing" && (
            <MemberEditor
              type="managing"
              content={content}
              setContent={setContent}
              upload={upload}
            />
          )}
          {section === "redevelopment" && (
            <>
              <DocumentEditor
                content={content}
                setContent={setContent}
                upload={upload}
              />
              <MemberEditor
                type="redevelopment"
                content={content}
                setContent={setContent}
                upload={upload}
              />
            </>
          )}
          {section === "redevelopmentStatus" && (
            <RedevelopmentAdminPage content={content} />
          )}
          {section === "complaints" && (
            <ComplaintList
              complaints={complaints}
              reload={() => api.complaints().then(setComplaints)}
              onUpdate={async (c) => {
                await api.updateComplaint(
                  c.id,
                  c.status === "Resolved" ? "Open" : "Resolved",
                );
                await api.complaints().then(setComplaints);
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}
function Login({ onLogin, error, onHome }) {
  const [username, setUsername] = useState("secretary");
  const [password, setPassword] = useState("");
  return (
    <main className="login-wrap">
      <form
        className="login-card"
        onSubmit={(e) => {
          e.preventDefault();
          onLogin(username, password);
        }}
      >
        <Link className="back-link" to="/">
          ← Back to website
        </Link>
        <span className="eyebrow">Secretary access</span>
        <h1>Society admin</h1>
        <p>Sign in to update the Ramakant CHSL website.</p>
        <label>
          Username
          <input
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button className="button">Sign in</button>
        {error && (
          <p className="notice-error" role="alert">
            {error}
          </p>
        )}
      </form>
    </main>
  );
}
function SiteEditor({ content, setContent, upload }) {
  const site = content.site || {};
  const fields = [
    ["name", "Society name"],
    ["tagline", "Short tagline"],
    ["topline", "Top banner text"],
    ["welcomeTitle", "Home page title"],
    ["welcomeText", "Home page introduction"],
    ["history", "Building history"],
    ["historyExtra", "Additional history"],
    ["founded", "Year founded"],
    ["homes", "Number of homes"],
    ["managingDescription", "Managing Committee description"],
    ["redevelopmentDescription", "Redevelopment Committee description"],
    ["address", "Full address"],
    ["officeHours", "Office hours"],
    ["phone", "Phone"],
    ["email", "Email"],
    ["mapUrl", "Google Maps link"],
  ];
  const marathiFields = [
    ["mrName", "Society name in Marathi"],
    ["mrTagline", "Short tagline in Marathi"],
    ["mrWelcomeTitle", "Home page title in Marathi"],
    ["mrWelcomeText", "Home page introduction in Marathi"],
    ["mrHistory", "Building history in Marathi"],
    ["mrHistoryExtra", "Additional history in Marathi"],
    ["mrManagingDescription", "Managing Committee description in Marathi"],
    [
      "mrRedevelopmentDescription",
      "Redevelopment Committee description in Marathi",
    ],
    ["mrAddress", "Full address in Marathi"],
    ["mrOfficeHours", "Office hours in Marathi"],
  ];
  const update = (key, value) =>
    setContent((prev) => ({ ...prev, site: { ...prev.site, [key]: value } }));
  return (
    <div className="editor-card">
      <h3>Website wording and contact details</h3>
      <div className="editor-grid">
        {fields.map(([key, label]) => (
          <label key={key}>
            {label}
            {[
              "welcomeText",
              "history",
              "historyExtra",
              "managingDescription",
              "redevelopmentDescription",
              "address",
            ].includes(key) ? (
              <textarea
                rows="3"
                value={site[key] || ""}
                onChange={(e) => update(key, e.target.value)}
              />
            ) : (
              <input
                value={site[key] || ""}
                onChange={(e) => update(key, e.target.value)}
              />
            )}
          </label>
        ))}
      </div>
      <h3>Marathi translations</h3>
      <div className="editor-grid">
        {marathiFields.map(([key, label]) => (
          <label key={key}>
            {label}
            {[
              "mrWelcomeText",
              "mrHistory",
              "mrHistoryExtra",
              "mrManagingDescription",
              "mrRedevelopmentDescription",
              "mrAddress",
            ].includes(key) ? (
              <textarea
                rows="3"
                value={site[key] || ""}
                onChange={(event) => update(key, event.target.value)}
              />
            ) : (
              <input
                value={site[key] || ""}
                onChange={(event) => update(key, event.target.value)}
              />
            )}
          </label>
        ))}
      </div>
      <h3>Building photographs</h3>
      <div className="editor-grid">
        {[
          ["heroImage", "Home page building photo"],
          ["historyImage", "History photo"],
          ["managingImage", "Managing Committee photo"],
          ["redevelopmentImage", "Redevelopment photo"],
        ].map(([key, label]) => (
          <label key={key}>
            {label}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={async (e) => {
                try {
                  update(key, await upload(e.target.files[0]));
                } catch (err) {
                  alert(err.message);
                }
              }}
            />
            {site[key] && (
              <img
                className="upload-preview"
                src={site[key]}
                alt="Uploaded preview"
              />
            )}
          </label>
        ))}
      </div>
    </div>
  );
}
function NoticeEditor({ content, setContent, upload }) {
  const rows = content.notices || [];
  const change = (i, key, value) =>
    setContent((prev) => ({
      ...prev,
      notices: prev.notices.map((n, j) =>
        j === i ? { ...n, [key]: value } : n,
      ),
    }));
  return (
    <div className="editor-card">
      <div className="admin-subhead">
        <h3>Notice board entries</h3>
        <button
          className="button secondary"
          onClick={() =>
            setContent((p) => ({
              ...p,
              notices: [
                ...p.notices,
                {
                  id: crypto.randomUUID(),
                  title: "",
                  mrTitle: "",
                  date: "",
                  summary: "",
                  mrSummary: "",
                  pdfUrl: "",
                },
              ],
            }))
          }
        >
          Add notice
        </button>
      </div>
      {rows.map((n, i) => (
        <article className="editor-item" key={n.id || i}>
          <div className="admin-subhead">
            <h3>Notice {i + 1}</h3>
            <button
              className="button danger small"
              onClick={() =>
                setContent((p) => ({
                  ...p,
                  notices: p.notices.filter((_, j) => i !== j),
                }))
              }
            >
              Remove
            </button>
          </div>
          <div className="editor-grid">
            {[
              ["title", "Title"],
              ["mrTitle", "Marathi title"],
              ["date", "Date"],
              ["summary", "Short summary"],
              ["mrSummary", "Marathi summary"],
            ].map(([k, label]) => (
              <label key={k}>
                {label}
                {k.includes("summary") || k.includes("Summary") ? (
                  <textarea
                    rows="3"
                    value={n[k] || ""}
                    onChange={(e) => change(i, k, e.target.value)}
                  />
                ) : (
                  <input
                    value={n[k] || ""}
                    onChange={(e) => change(i, k, e.target.value)}
                  />
                )}
              </label>
            ))}
          </div>
          <label className="file-button">
            Attach PDF
            <input
              type="file"
              accept="application/pdf,.pdf"
              onChange={async (e) => {
                try {
                  change(i, "pdfUrl", await upload(e.target.files[0]));
                } catch (err) {
                  alert(err.message);
                }
              }}
            />
          </label>
          {n.pdfUrl && (
            <a href={n.pdfUrl} target="_blank" rel="noreferrer">
              Open attached PDF
            </a>
          )}
        </article>
      ))}
    </div>
  );
}
function EventEditor({ content, setContent, upload }) {
  const events = content.events || [];
  const setEvent = (i, key, value) =>
    setContent((p) => ({
      ...p,
      events: p.events.map((event, j) =>
        j === i ? { ...event, [key]: value } : event,
      ),
    }));
  return (
    <div className="editor-card">
      <div className="admin-subhead">
        <h3>Festival and event albums</h3>
        <button
          className="button secondary"
          onClick={() =>
            setContent((p) => ({
              ...p,
              events: [
                ...p.events,
                {
                  id: crypto.randomUUID(),
                  title: "",
                  mrTitle: "",
                  year: String(new Date().getFullYear()),
                  description: "",
                  mrDescription: "",
                  photos: [],
                },
              ],
            }))
          }
        >
          Add event
        </button>
      </div>
      {events.map((event, i) => (
        <article className="editor-item" key={event.id || i}>
          <div className="admin-subhead">
            <h3>Event album {i + 1}</h3>
            <button
              className="button danger small"
              onClick={() =>
                setContent((p) => ({
                  ...p,
                  events: p.events.filter((_, j) => j !== i),
                }))
              }
            >
              Remove
            </button>
          </div>
          <div className="editor-grid">
            {[
              ["title", "Event title"],
              ["mrTitle", "Marathi title"],
              ["year", "Year"],
              ["description", "Description"],
              ["mrDescription", "Marathi description"],
            ].map(([k, label]) => (
              <label key={k}>
                {label}
                {k.toLowerCase().includes("description") ? (
                  <textarea
                    rows="3"
                    value={event[k] || ""}
                    onChange={(e) => setEvent(i, k, e.target.value)}
                  />
                ) : (
                  <input
                    value={event[k] || ""}
                    onChange={(e) => setEvent(i, k, e.target.value)}
                  />
                )}
              </label>
            ))}
          </div>
          <div className="admin-subhead">
            <h4>Photos ({event.photos?.length || 0} of 10)</h4>
            <label className="button secondary file-button">
              Add photos
              <input
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp"
                onChange={async (e) => {
                  try {
                    const files = [...e.target.files];
                    if ((event.photos?.length || 0) + files.length > 10)
                      throw new Error("An event can have up to 10 photos.");
                    const uploaded = [];
                    for (const file of files)
                      uploaded.push({
                        url: await upload(file),
                        caption: file.name.replace(/\.[^.]+$/, ""),
                        mrCaption: "",
                      });
                    setEvent(i, "photos", [
                      ...(event.photos || []),
                      ...uploaded,
                    ]);
                  } catch (err) {
                    alert(err.message);
                  }
                  e.target.value = "";
                }}
              />
            </label>
          </div>
          <div className="photo-editor">
            {(event.photos || []).map((photo, j) => (
              <div className="photo-editor-row" key={photo.id || photo.url + j}>
                <img src={photo.url} alt="Event preview" />
                <input
                  aria-label="Photo caption"
                  value={photo.caption || ""}
                  onChange={(e) => {
                    const next = [...event.photos];
                    next[j] = { ...photo, caption: e.target.value };
                    setEvent(i, "photos", next);
                  }}
                />
                <input
                  aria-label="Marathi photo caption"
                  placeholder="Marathi caption"
                  value={photo.mrCaption || ""}
                  onChange={(e) => {
                    const next = [...event.photos];
                    next[j] = { ...photo, mrCaption: e.target.value };
                    setEvent(i, "photos", next);
                  }}
                />
                <button
                  className="button danger small"
                  onClick={() =>
                    setEvent(
                      i,
                      "photos",
                      event.photos.filter((_, k) => k !== j),
                    )
                  }
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
function MemberEditor({ type, content, setContent, upload }) {
  const members = content.committees?.[type]?.members || [];
  const title = type === "managing" ? tr.en.manage : tr.en.redevelopment;
  const setMembers = (next) =>
    setContent((p) => ({
      ...p,
      committees: {
        ...p.committees,
        [type]: { ...p.committees[type], members: next },
      },
    }));
  return (
    <div className="editor-card">
      <div className="admin-subhead">
        <h3>{title} members</h3>
        <button
          className="button secondary"
          onClick={() =>
            setMembers([
              ...members,
              {
                id: crypto.randomUUID(),
                name: "",
                mrName: "",
                role: "Committee member",
                mrRole: "",
                bio: "",
                mrBio: "",
                photo: "",
              },
            ])
          }
        >
          Add member
        </button>
      </div>
      {members.map((m, i) => (
        <article className="editor-item" key={m.id || i}>
          <div className="admin-subhead">
            <h3>Member {i + 1}</h3>
            <button
              className="button danger small"
              onClick={() => setMembers(members.filter((_, j) => j !== i))}
            >
              Remove
            </button>
          </div>
          <div className="editor-grid">
            {[
              ["name", "Full name"],
              ["mrName", "Name in Marathi"],
              ["role", "Role"],
              ["mrRole", "Role in Marathi"],
              ["bio", "Short profile"],
              ["mrBio", "Short profile in Marathi"],
            ].map(([k, label]) => (
              <label key={k}>
                {label}
                {k === "bio" || k === "mrBio" ? (
                  <textarea
                    rows="3"
                    value={m[k] || ""}
                    onChange={(e) =>
                      setMembers(
                        members.map((x, j) =>
                          j === i ? { ...x, [k]: e.target.value } : x,
                        ),
                      )
                    }
                  />
                ) : (
                  <input
                    value={m[k] || ""}
                    onChange={(e) =>
                      setMembers(
                        members.map((x, j) =>
                          j === i ? { ...x, [k]: e.target.value } : x,
                        ),
                      )
                    }
                  />
                )}
              </label>
            ))}
          </div>
          <label className="file-button">
            Choose member photo
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={async (e) => {
                try {
                  const photo = await upload(e.target.files[0]);
                  setMembers(
                    members.map((x, j) => (j === i ? { ...x, photo } : x)),
                  );
                } catch (err) {
                  alert(err.message);
                }
              }}
            />
          </label>
          {m.photo && (
            <img
              className="upload-preview"
              src={m.photo}
              alt="Member photo preview"
            />
          )}
        </article>
      ))}
    </div>
  );
}
function DocumentEditor({ content, setContent, upload }) {
  const documents = content.committees?.redevelopment?.documents || [];
  const setDocuments = (next) =>
    setContent((p) => ({
      ...p,
      committees: {
        ...p.committees,
        redevelopment: { ...p.committees.redevelopment, documents: next },
      },
    }));
  return (
    <div className="editor-card">
      <div className="admin-subhead">
        <h3>Redevelopment documents</h3>
        <button
          className="button secondary"
          onClick={() =>
            setDocuments([
              ...documents,
              {
                id: crypto.randomUUID(),
                title: "",
                mrTitle: "",
                summary: "",
                mrSummary: "",
                url: "",
              },
            ])
          }
        >
          Add document
        </button>
      </div>
      {documents.map((doc, i) => (
        <article className="editor-item" key={doc.id || i}>
          <div className="admin-subhead">
            <h3>Document {i + 1}</h3>
            <button
              className="button danger small"
              onClick={() => setDocuments(documents.filter((_, j) => j !== i))}
            >
              Remove
            </button>
          </div>
          <div className="editor-grid">
            {[
              ["title", "Title"],
              ["mrTitle", "Marathi title"],
              ["summary", "Description"],
              ["mrSummary", "Marathi description"],
            ].map(([k, label]) => (
              <label key={k}>
                {label}
                {k.toLowerCase().includes("summary") ? (
                  <textarea
                    rows="3"
                    value={doc[k] || ""}
                    onChange={(e) =>
                      setDocuments(
                        documents.map((x, j) =>
                          j === i ? { ...x, [k]: e.target.value } : x,
                        ),
                      )
                    }
                  />
                ) : (
                  <input
                    value={doc[k] || ""}
                    onChange={(e) =>
                      setDocuments(
                        documents.map((x, j) =>
                          j === i ? { ...x, [k]: e.target.value } : x,
                        ),
                      )
                    }
                  />
                )}
              </label>
            ))}
          </div>
          <label className="file-button">
            Attach PDF
            <input
              type="file"
              accept="application/pdf,.pdf"
              onChange={async (e) => {
                try {
                  const url = await upload(e.target.files[0]);
                  setDocuments(
                    documents.map((x, j) => (j === i ? { ...x, url } : x)),
                  );
                } catch (err) {
                  alert(err.message);
                }
              }}
            />
          </label>
          {doc.url && (
            <a href={doc.url} target="_blank" rel="noreferrer">
              Open PDF
            </a>
          )}
        </article>
      ))}
    </div>
  );
}
function ComplaintList({ complaints, onUpdate }) {
  return (
    <div className="editor-card">
      <h3>Resident complaints</h3>
      {complaints.length ? (
        complaints.map((item) => (
          <article className="complaint-row" key={item.id}>
            <div>
              <b>
                Room {item.room} · {new Date(item.createdAt).toLocaleString()}
              </b>
              <p>{item.concern}</p>
              <small>{item.id}</small>
            </div>
            <button
              className="button secondary small"
              onClick={() => onUpdate(item)}
            >
              {item.status === "Resolved" ? "Reopen" : "Mark resolved"}
            </button>
          </article>
        ))
      ) : (
        <p>No complaints have been submitted.</p>
      )}
    </div>
  );
}
