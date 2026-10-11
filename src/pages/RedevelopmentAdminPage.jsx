import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import {
  blankUpdate,
  redevelopmentStages,
  UpdateTimeline,
} from "../components/RedevelopmentTracker.jsx";

export function RedevelopmentAdminPage({ content }) {
  const [data, setData] = useState(null);
  const [summaryForm, setSummaryForm] = useState({
    current_stage: "Resolution",
  });
  const [updateForm, setUpdateForm] = useState(blankUpdate);
  const [file, setFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [attempt, setAttempt] = useState(0);

  async function loadTracker() {
    setLoading(true);
    setError("");

    try {
      const result = await api.tracker(15);
      setData(result);
      setSummaryForm({ current_stage: result.current_stage || "Resolution" });
    } catch (reason) {
      setError(reason.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTracker();
  }, [attempt]);

  function beginEdit(update) {
    setEditingId(update.id);
    setUpdateForm({
      title: update.title,
      title_mr: update.title_mr || "",
      stage: update.stage,
      description: update.description,
      description_mr: update.description_mr || "",
      file_url: update.file_url || null,
    });
    setFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveUpdate(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      let fileUrl = updateForm.file_url;
      if (file) {
        fileUrl = (await api.uploadTrackerFile(file)).file_url;
      }

      const payload = {
        ...updateForm,
        stage: editingId ? updateForm.stage : data.current_stage,
        title: updateForm.title.trim(),
        description: updateForm.description.trim(),
        file_url: fileUrl || null,
      };

      if (editingId) {
        await api.editTrackerUpdate(editingId, payload);
      } else {
        await api.createTrackerUpdate(payload);
      }

      setUpdateForm(blankUpdate);
      setFile(null);
      setEditingId(null);
      setMessage(editingId ? "Update saved." : "Update posted.");
      await loadTracker();
    } catch (reason) {
      setError(reason.message);
    } finally {
      setSaving(false);
    }
  }

  async function removeUpdate(update) {
    if (!window.confirm(`Delete “${update.title}”?`)) return;
    setError("");
    setMessage("");

    try {
      await api.deleteTrackerUpdate(update.id);
      if (editingId === update.id) {
        setEditingId(null);
        setUpdateForm(blankUpdate);
        setFile(null);
      }
      setMessage("Update deleted.");
      await loadTracker();
    } catch (reason) {
      setError(reason.message);
    }
  }

  async function saveSummary(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      await api.saveTrackerSummary(summaryForm);
      setMessage("Summary saved.");
      await loadTracker();
    } catch (reason) {
      setError(reason.message);
    } finally {
      setSaving(false);
    }
  }

  const atLimit = (data?.total_count || 0) >= 15;

  return (
    <section className="tracker-admin-embedded">
      <div className="tracker-admin-heading">
        <div>
          <span className="eyebrow">Redevelopment</span>
          <h2>Redevelopment status</h2>
        </div>
        <div className="button-row">
          <span className="update-count">
            {data?.total_count || 0} of 15 updates used
          </span>
          <Link
            className="button secondary small"
            to="/committee/redevelopment"
          >
            View public page
          </Link>
        </div>
      </div>
      {loading && (
        <p className="tracker-loading" role="status">
          Waking up the server, this can take up to a minute.
        </p>
      )}
      {error && (
        <div className="tracker-error" role="alert">
          <span>{error}</span>
          {!loading && (
            <button
              className="button secondary small"
              onClick={() => setAttempt((value) => value + 1)}
            >
              Retry
            </button>
          )}
        </div>
      )}
      {message && (
        <p className="notice-success" role="status">
          {message}
        </p>
      )}

      {data && (
        <>
          <div className="tracker-admin-grid">
            <form className="editor-card tracker-form" onSubmit={saveUpdate}>
              <h3>{editingId ? "Edit update" : "Post an update"}</h3>
              <label>
                Title
                <input
                  required
                  maxLength="120"
                  value={updateForm.title}
                  onChange={(event) =>
                    setUpdateForm({
                      ...updateForm,
                      title: event.target.value,
                    })
                  }
                />
              </label>
              <label>
                Marathi title
                <input
                  maxLength="120"
                  value={updateForm.title_mr}
                  onChange={(event) =>
                    setUpdateForm({
                      ...updateForm,
                      title_mr: event.target.value,
                    })
                  }
                />
              </label>
              <label>
                Description
                <textarea
                  required
                  maxLength="1000"
                  rows="5"
                  value={updateForm.description}
                  onChange={(event) =>
                    setUpdateForm({
                      ...updateForm,
                      description: event.target.value,
                    })
                  }
                />
                <small>
                  {updateForm.description.length} of 1000 characters
                </small>
              </label>
              <label>
                Marathi description
                <textarea
                  maxLength="1000"
                  rows="5"
                  value={updateForm.description_mr}
                  onChange={(event) =>
                    setUpdateForm({
                      ...updateForm,
                      description_mr: event.target.value,
                    })
                  }
                />
                <small>
                  {updateForm.description_mr.length} of 1000 characters
                </small>
              </label>
              <label>
                Attachment (optional)
                <input
                  type="file"
                  accept="application/pdf,image/jpeg,image/png,image/webp"
                  onChange={(event) => setFile(event.target.files[0] || null)}
                />
              </label>
              {updateForm.file_url && !file && (
                <a
                  className="file-chip"
                  href={api.assetUrl(updateForm.file_url)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open current attachment
                </a>
              )}
              {atLimit && !editingId && (
                <p className="notice-error">
                  Limit of 15 updates reached. Delete an old update to add a new
                  one.
                </p>
              )}
              <div className="button-row">
                <button
                  className="button"
                  disabled={saving || (atLimit && !editingId)}
                >
                  {saving
                    ? "Saving…"
                    : editingId
                      ? "Save update"
                      : "Post update"}
                </button>
                {editingId && (
                  <button
                    className="button secondary"
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setUpdateForm(blankUpdate);
                      setFile(null);
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <form className="editor-card tracker-form" onSubmit={saveSummary}>
              <h3>Public summary</h3>
              <label>
                Current stage
                <select
                  value={summaryForm.current_stage}
                  onChange={(event) =>
                    setSummaryForm({
                      ...summaryForm,
                      current_stage: event.target.value,
                    })
                  }
                >
                  {redevelopmentStages.map((stage) => (
                    <option key={stage}>{stage}</option>
                  ))}
                </select>
              </label>
              <button className="button" disabled={saving}>
                Save summary
              </button>
            </form>
          </div>

          <section className="tracker-admin-updates">
            <div className="tracker-section-heading">
              <h2>Posted updates</h2>
              <span className="update-count">Newest first</span>
            </div>
            <UpdateTimeline
              updates={data.updates}
              onEdit={beginEdit}
              onDelete={removeUpdate}
              showDelete={atLimit}
            />
          </section>
        </>
      )}
    </section>
  );
}
