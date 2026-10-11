import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { Footer, Header } from "../components/SiteLayout.jsx";
import { HomeTrackerCard } from "../components/RedevelopmentTracker.jsx";
import {
  imageSamples,
  imageUrl,
  localizedText,
  titleOf,
  tr,
} from "../siteContent.js";

export function Home({ content, lang, text, noticeLimit, setNoticeLimit }) {
  const [complaint, setComplaint] = useState({ room: "", concern: "" });
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  const notices = content.notices || [];
  const events = content.events || [];
  const managing = content.committees?.managing?.members || [];
  const redevelopment = content.committees?.redevelopment?.members || [];

  async function submitComplaint(event) {
    event.preventDefault();
    setSending(true);
    setStatus("");

    try {
      const result = await api.submitComplaint(complaint);
      setStatus(`${text.thanks} Reference: ${result.id}`);
      setComplaint({ room: "", concern: "" });
    } catch (error) {
      setStatus(error.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <Header content={content} lang={lang} />
      <main>
        <section className="hero">
          <div className="wrap hero-grid">
            <div>
              <span className="eyebrow">{text.welcome}</span>
              <h1>
                {localizedText(
                  content.site,
                  "welcomeTitle",
                  "mrWelcomeTitle",
                  lang,
                ) || text.hero}
              </h1>
              <p>
                {localizedText(
                  content.site,
                  "welcomeText",
                  "mrWelcomeText",
                  lang,
                ) || text.heroCopy}
              </p>
              <a className="button" href="#committees">
                {text.explore} ↗
              </a>
            </div>
            <img
              className="hero-image"
              src={imageUrl(content.site.heroImage) || imageSamples.heroImage}
              alt="Ramakant CHSL building"
              onError={(event) => {
                event.currentTarget.src = imageSamples.heroImage;
              }}
            />
          </div>
        </section>

        <section id="history" className="section white">
          <div className="wrap split">
            <img
              className="feature-image"
              src={
                imageUrl(content.site.historyImage) || imageSamples.historyImage
              }
              alt="Shared residential space"
              onError={(event) => {
                event.currentTarget.src = imageSamples.historyImage;
              }}
            />
            <div>
              <span className="eyebrow">{text.historyEyebrow}</span>
              <h2>{text.history}</h2>
              <p>{localizedText(content.site, "history", "mrHistory", lang)}</p>
              <p>
                {localizedText(
                  content.site,
                  "historyExtra",
                  "mrHistoryExtra",
                  lang,
                )}
              </p>
              <div className="stats">
                <div>
                  <b>{content.site.founded}</b>
                  <span>{text.foundedLabel}</span>
                </div>
                <div>
                  <b>{content.site.homes}</b>
                  <span>{text.homesLabel}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="committees" className="section">
          <div className="wrap">
            <SectionHeading
              eyebrow={text.peopleServe}
              title={text.committeeHeading}
              copy={text.committeeIntro}
            />
            <div className="committee-cards">
              <CommitteeCard
                content={content}
                type="managing"
                lang={lang}
                members={managing}
                image={imageSamples.managingImage}
              />
              <CommitteeCard
                content={content}
                type="redevelopment"
                lang={lang}
                members={redevelopment}
                image={imageSamples.redevelopmentImage}
              />
            </div>
          </div>
        </section>

        <HomeTrackerCard lang={lang} />

        <section id="notices" className="section white">
          <div className="wrap">
            <SectionHeading
              eyebrow={text.noticeHeading}
              title={text.noticeHeading}
              copy={text.noticeIntro}
            />
            <div className="notice-list">
              {notices.slice(0, noticeLimit).map((notice) => (
                <article className="notice-row" key={notice.id}>
                  <time>{notice.date}</time>
                  <div>
                    <h3>{titleOf(notice, lang)}</h3>
                    <p>
                      {lang === "mr"
                        ? notice.mrSummary || notice.summary
                        : notice.summary}
                    </p>
                  </div>
                  <a
                    className="button small"
                    href={notice.pdfUrl || "#"}
                    target={notice.pdfUrl ? "_blank" : undefined}
                    rel="noreferrer"
                    onClick={(event) => {
                      if (!notice.pdfUrl) {
                        event.preventDefault();
                        window.alert(text.missingNoticePdf);
                      }
                    }}
                  >
                    {text.viewPdf}
                  </a>
                </article>
              ))}
            </div>
            {notices.length > 5 && (
              <button
                className="button secondary"
                onClick={() =>
                  setNoticeLimit(noticeLimit === 5 ? notices.length : 5)
                }
              >
                {noticeLimit === 5 ? text.more : text.showFewerNotices}
              </button>
            )}
          </div>
        </section>

        <section id="gallery" className="section">
          <div className="wrap">
            <SectionHeading
              eyebrow={text.galleryHeading}
              title={text.galleryHeading}
              copy={text.galleryIntro}
            />
            <div className="event-list">
              {events.map((event) => (
                <Link
                  className="event-row"
                  to={`/gallery/${event.id}`}
                  key={event.id}
                >
                  <span>
                    <b>{titleOf(event, lang)}</b>
                    <small>
                      {lang === "mr"
                        ? event.mrDescription || event.description
                        : event.description}
                    </small>
                  </span>
                  <strong>{event.year}</strong>
                  <span aria-hidden="true">→</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="complaints" className="section white">
          <div className="wrap complaint-layout">
            <div>
              <span className="eyebrow">{text.residentSupport}</span>
              <h2>{text.complaint}</h2>
              <p>{text.complaintIntro}</p>
              <p>
                <b>{content.site.phone}</b>
                <br />
                {content.site.email}
              </p>
            </div>
            <form className="form-card" onSubmit={submitComplaint}>
              <label>
                {text.room}
                <input
                  required
                  maxLength="80"
                  value={complaint.room}
                  onChange={(event) =>
                    setComplaint({ ...complaint, room: event.target.value })
                  }
                />
              </label>
              <label>
                {text.concern}
                <textarea
                  required
                  minLength="5"
                  maxLength="2000"
                  rows="5"
                  value={complaint.concern}
                  onChange={(event) =>
                    setComplaint({ ...complaint, concern: event.target.value })
                  }
                />
              </label>
              <button className="button" disabled={sending}>
                {sending ? text.sending : text.submit}
              </button>
              {status && (
                <p role="status" className="form-status">
                  {status}
                </p>
              )}
            </form>
          </div>
        </section>

        <section id="address" className="section address-section">
          <div className="wrap address-card">
            <div>
              <span className="eyebrow">{text.visitSociety}</span>
              <h2>{text.address}</h2>
              <p className="address-text">
                {localizedText(content.site, "name", "mrName", lang) ||
                  content.site.name}
                <br />
                {localizedText(content.site, "address", "mrAddress", lang)}
              </p>
              <p>
                <b>{text.societyOffice}</b>
                <br />
                {localizedText(
                  content.site,
                  "officeHours",
                  "mrOfficeHours",
                  lang,
                )}
              </p>
              <a
                className="button"
                target="_blank"
                rel="noreferrer"
                href={
                  content.site.mapUrl ||
                  "https://www.google.com/maps/search/?api=1&query=Ramakant+CHSL+Mumbai"
                }
              >
                {text.map} ↗
              </a>
            </div>
            <div className="map-panel" aria-hidden="true">
              ⌖
            </div>
          </div>
        </section>
      </main>
      <Footer content={content} lang={lang} />
    </>
  );
}

function SectionHeading({ eyebrow, title, copy: description }) {
  return (
    <div className="section-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      {description && <p>{description}</p>}
    </div>
  );
}

function CommitteeCard({ content, type, lang, members, image }) {
  const isRedevelopment = type === "redevelopment";
  const title = isRedevelopment ? tr[lang].redevelopment : tr[lang].manage;

  return (
    <article className="committee-card">
      <img src={image} alt="" />
      <div>
        <span className="eyebrow">
          {isRedevelopment ? tr[lang].planningAhead : tr[lang].everydayCare}
        </span>
        <h3>{title}</h3>
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
        <small>
          {members.length} {tr[lang].committeeMemberCount}
        </small>
        <Link className="button small" to={`/committee/${type}`}>
          {tr[lang].view} ↗
        </Link>
      </div>
    </article>
  );
}
