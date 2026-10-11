import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { localizedStage, tr } from "../siteContent.js";

export const redevelopmentStages = [
  "Resolution",
  "Developer",
  "Agreement",
  "Approvals",
  "Construction",
  "Possession",
];

export const blankUpdate = {
  title: "",
  title_mr: "",
  stage: "Resolution",
  description: "",
  description_mr: "",
  file_url: null,
};

export function useTrackerData(limit) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    api
      .tracker(limit)
      .then((result) => {
        if (active) setData(result);
      })
      .catch((reason) => {
        if (active) setError(reason.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [limit, attempt]);

  return {
    data,
    loading,
    error,
    retry: () => setAttempt((value) => value + 1),
  };
}

function CurrentStage({ stage, lang }) {
  return (
    <div
      className="tracker-summary compact"
      style={{ gridTemplateColumns: "minmax(0, 1fr)", maxWidth: 360 }}
    >
      <article>
        <span>{tr[lang].currentStage}</span>
        <strong>{localizedStage(stage || "Resolution", lang)}</strong>
      </article>
    </div>
  );
}

function UpdateItem({ update, lang, onEdit, onDelete, showDelete = false }) {
  const createdAt = new Date(update.created_at);
  const date = Number.isNaN(createdAt.getTime())
    ? update.created_at
    : createdAt.toLocaleDateString(lang === "mr" ? "mr-IN" : undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

  return (
    <article className="timeline-item">
      <div className="timeline-meta">
        <time dateTime={update.created_at}>{date}</time>
        <span className="stage-tag">{localizedStage(update.stage, lang)}</span>
      </div>
      <h3>{lang === "mr" ? update.title_mr || update.title : update.title}</h3>
      <p>
        {lang === "mr"
          ? update.description_mr || update.description
          : update.description}
      </p>
      <div className="timeline-actions">
        {update.file_url && (
          <a
            className="file-chip"
            href={api.assetUrl(update.file_url)}
            target="_blank"
            rel="noreferrer"
          >
            ↗ {tr[lang].attachedFile}
          </a>
        )}
        {onEdit && (
          <button
            className="text-button"
            type="button"
            onClick={() => onEdit(update)}
          >
            Edit
          </button>
        )}
        {showDelete && onDelete && (
          <button
            className="text-button danger-text"
            type="button"
            onClick={() => onDelete(update)}
          >
            Delete
          </button>
        )}
      </div>
    </article>
  );
}

export function UpdateTimeline({
  updates = [],
  lang = "en",
  onEdit,
  onDelete,
  showDelete = false,
}) {
  if (!updates.length) {
    return <p className="tracker-empty">{tr[lang].noUpdates}</p>;
  }

  return (
    <div className="update-timeline">
      {updates.map((update) => (
        <UpdateItem
          key={update.id}
          update={update}
          lang={lang}
          onEdit={onEdit}
          onDelete={onDelete}
          showDelete={showDelete}
        />
      ))}
    </div>
  );
}

export function HomeTrackerCard({ lang = "en" }) {
  const { data, loading, error, retry } = useTrackerData(5);

  return (
    <section id="redevelopment-status" className="section white">
      <div className="wrap tracker-home">
        <div className="tracker-home-heading">
          <div>
            <span className="eyebrow">{tr[lang].planningForFuture}</span>
            <h2>{tr[lang].redevelopmentStatus}</h2>
          </div>
          <Link
            className="button secondary small"
            to="/committee/redevelopment#redevelopment-updates"
          >
            {tr[lang].viewMore} ↗
          </Link>
        </div>
        {loading && (
          <p className="tracker-loading" role="status">
            {tr[lang].wakingServer}
          </p>
        )}
        {error && (
          <div className="tracker-error" role="alert">
            <span>
              {tr[lang].updatesLoadError} {error}
            </span>
            <button className="button secondary small" onClick={retry}>
              {tr[lang].retry}
            </button>
          </div>
        )}
        {data && (
          <>
            <CurrentStage stage={data.current_stage} lang={lang} />
            <div className="tracker-section-heading">
              <h2>{tr[lang].latestProgress}</h2>
            </div>
            <UpdateTimeline updates={data.updates} lang={lang} />
          </>
        )}
      </div>
    </section>
  );
}

export function RedevelopmentTracker({ lang = "en" }) {
  const { data, loading, error, retry } = useTrackerData(15);
  const [visibleCount, setVisibleCount] = useState(5);
  const updates = data?.updates || [];
  const hiddenCount = Math.max(0, updates.length - visibleCount);

  return (
    <section className="tracker-block redevelopment-tracker">
      <div className="tracker-section-heading">
        <div>
          <span className="eyebrow">{tr[lang].projectProgress}</span>
          <h2>{tr[lang].redevelopmentStatus}</h2>
        </div>
      </div>
      {loading && (
        <p className="tracker-loading" role="status">
          {tr[lang].wakingServer}
        </p>
      )}
      {error && (
        <div className="tracker-error" role="alert">
          <span>
            {tr[lang].updatesLoadError} {error}
          </span>
          <button className="button secondary small" onClick={retry}>
            {tr[lang].retry}
          </button>
        </div>
      )}
      {data && (
        <>
          <CurrentStage stage={data.current_stage} lang={lang} />
          <section
            id="redevelopment-updates"
            className="updates-block"
            style={{ scrollMarginTop: 100 }}
          >
            <div className="tracker-section-heading">
              <div>
                <span className="eyebrow">{tr[lang].committeeUpdates}</span>
                <h2>{tr[lang].updates}</h2>
              </div>
            </div>
            <UpdateTimeline
              updates={updates.slice(0, visibleCount)}
              lang={lang}
            />
            {updates.length > 5 && (
              <button
                className="button secondary"
                onClick={() => setVisibleCount(visibleCount === 5 ? 15 : 5)}
              >
                {visibleCount === 5
                  ? `${tr[lang].showMore} (${hiddenCount})`
                  : tr[lang].showLess}
              </button>
            )}
          </section>
        </>
      )}
    </section>
  );
}
