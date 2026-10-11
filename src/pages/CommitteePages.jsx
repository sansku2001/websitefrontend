import { Link, useParams } from "react-router-dom";
import { Footer, Header } from "../components/SiteLayout.jsx";
import { RedevelopmentTracker } from "../components/RedevelopmentTracker.jsx";
import {
  imageSamples,
  imageUrl,
  localizedText,
  photoSamples,
  titleOf,
  tr,
} from "../siteContent.js";

export function CommitteePage({ content, lang }) {
  const { type = "managing" } = useParams();
  const committee = content.committees?.[type] || {};
  const isRedevelopment = type === "redevelopment";
  const title = isRedevelopment ? tr[lang].redevelopment : tr[lang].manage;
  const members = committee.members || [];
  const committeeImageKey = isRedevelopment
    ? "redevelopmentImage"
    : "managingImage";
  const committeeImage =
    imageUrl(content.site[committeeImageKey]) ||
    imageSamples[committeeImageKey];

  return (
    <>
      <Header content={content} lang={lang} />
      <main className="detail-page wrap">
        <Link className="back-link" to="/">
          ← {tr[lang].back}
        </Link>
        <h1>{title}</h1>
        <div className="detail-intro">
          <img
            src={committeeImage}
            alt={`${title} introduction`}
            onError={(event) => {
              event.currentTarget.src = imageSamples[committeeImageKey];
            }}
          />
          <p>
            {localizedText(
              content.site,
              isRedevelopment
                ? "redevelopmentDescription"
                : "managingDescription",
              isRedevelopment
                ? "mrRedevelopmentDescription"
                : "mrManagingDescription",
              lang,
            )}
          </p>
        </div>

        {isRedevelopment && <RedevelopmentTracker lang={lang} />}
        {isRedevelopment && (
          <section>
            <h2>{tr[lang].docs}</h2>
            <div className="document-list">
              {(committee.documents || []).map((document) => (
                <article className="document-row" key={document.id}>
                  <div>
                    <h3>{titleOf(document, lang)}</h3>
                    <p>
                      {lang === "mr"
                        ? document.mrSummary || document.summary
                        : document.summary}
                    </p>
                  </div>
                  <a
                    className="button small"
                    href={document.url || "#"}
                    target={document.url ? "_blank" : undefined}
                    rel="noreferrer"
                    onClick={(event) => {
                      if (!document.url) {
                        event.preventDefault();
                        window.alert(tr[lang].missingDocument);
                      }
                    }}
                  >
                    {lang === "mr" ? "कागदपत्र पहा" : "View document"}
                  </a>
                </article>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2>{tr[lang].members}</h2>
          <MemberGrid members={members} lang={lang} />
        </section>
      </main>
      <Footer content={content} lang={lang} />
    </>
  );
}

function MemberGrid({ members, lang }) {
  return (
    <div className="member-grid">
      {members.map((member, index) => (
        <article
          className="member-card"
          key={member.id || `${member.name}-${index}`}
        >
          <img
            src={
              imageUrl(member.photo) ||
              photoSamples[index % photoSamples.length]
            }
            alt={member.name || "Committee member"}
            onError={(event) => {
              event.currentTarget.src =
                photoSamples[index % photoSamples.length];
            }}
          />
          <h3>{lang === "mr" ? member.mrName || member.name : member.name}</h3>
          <b>{lang === "mr" ? member.mrRole || member.role : member.role}</b>
          <p>{lang === "mr" ? member.mrBio || member.bio : member.bio}</p>
        </article>
      ))}
    </div>
  );
}

export function EventPage({ content, lang }) {
  const { id } = useParams();
  const event = content.events.find((item) => item.id === id);

  if (!event) {
    return (
      <>
        <Header content={content} lang={lang} />
        <main className="detail-page wrap">
          <Link className="back-link" to="/">
            ← {tr[lang].back}
          </Link>
          <h1>{lang === "mr" ? "कार्यक्रम सापडला नाही" : "Event not found"}</h1>
        </main>
      </>
    );
  }

  return (
    <>
      <Header content={content} lang={lang} />
      <main className="detail-page wrap">
        <Link className="back-link" to="/#gallery">
          ← {tr[lang].back}
        </Link>
        <span className="eyebrow">
          {event.year} ·{" "}
          {lang === "mr" ? "समुदाय छायाचित्रे" : "Community gallery"}
        </span>
        <h1>{titleOf(event, lang)}</h1>
        <p className="detail-description">
          {lang === "mr"
            ? event.mrDescription || event.description
            : event.description}
        </p>
        <div className="photo-grid">
          {(event.photos || []).slice(0, 10).map((photo, index) => (
            <figure key={photo.id || `${photo.url}-${index}`}>
              <img
                src={
                  imageUrl(photo.url) ||
                  photoSamples[index % photoSamples.length]
                }
                alt={
                  (lang === "mr"
                    ? photo.mrCaption || photo.caption
                    : photo.caption) || `${titleOf(event, lang)} ${index + 1}`
                }
                onError={(event) => {
                  event.currentTarget.src =
                    photoSamples[index % photoSamples.length];
                }}
              />
              <figcaption>
                {(lang === "mr"
                  ? photo.mrCaption || photo.caption
                  : photo.caption) ||
                  `${lang === "mr" ? "छायाचित्र" : "Photo"} ${index + 1}`}
              </figcaption>
            </figure>
          ))}
        </div>
      </main>
      <Footer content={content} lang={lang} />
    </>
  );
}
