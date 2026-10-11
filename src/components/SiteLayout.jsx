import { useState } from "react";
import { Link } from "react-router-dom";
import { localizedText, tr } from "../siteContent.js";

export function Header({ content, lang }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const text = tr[lang];

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <>
      <div className="topline">
        <div className="wrap">
          {text.topline}
          <span>{text.residentInfo}</span>
        </div>
      </div>
      <header className="site-header">
        <div className="wrap nav">
          <Link className="brand" to="/">
            <span className="brandmark">R</span>
            <span>
              <strong>
                {localizedText(content.site, "name", "mrName", lang) ||
                  "Ramakant CHSL"}
              </strong>
              <small>
                {localizedText(content.site, "tagline", "mrTagline", lang) ||
                  "A community, together"}
              </small>
            </span>
          </Link>
          <button
            className="menu-toggle"
            aria-label={menuOpen ? text.closeMenu : text.openMenu}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((isOpen) => !isOpen)}
          >
            ☰
          </button>
          <nav className={menuOpen ? "nav-links open" : "nav-links"}>
            <a href="/#history" onClick={closeMenu}>
              {text.story}
            </a>
            <a href="/#committees" onClick={closeMenu}>
              {text.committees}
            </a>
            <Link to="/#redevelopment-status" onClick={closeMenu}>
              {text.redevelopmentStatus}
            </Link>
            <a href="/#notices" onClick={closeMenu}>
              {text.notices}
            </a>
            <a href="/#gallery" onClick={closeMenu}>
              {text.gallery}
            </a>
            <a href="/#complaints" onClick={closeMenu}>
              {text.contact}
            </a>
            <a href="/#address" onClick={closeMenu}>
              {text.find}
            </a>
          </nav>
          <select
            aria-label={text.chooseLanguageLabel}
            value={lang}
            onChange={(event) => {
              localStorage.setItem(
                "ramakant-language-choice",
                event.target.value,
              );
              window.location.reload();
            }}
          >
            <option value="en">EN · English</option>
            <option value="mr">मराठी</option>
          </select>
        </div>
      </header>
    </>
  );
}

export function Footer({ content, lang = "en" }) {
  return (
    <footer className="footer">
      <div className="wrap">
        <b>
          {localizedText(content.site, "name", "mrName", lang) ||
            "Ramakant CHSL"}
        </b>
        <span>
          {localizedText(content.site, "tagline", "mrTagline", lang) ||
            (lang === "mr" ? "एकत्रित समुदाय" : "A community, together")}
        </span>
      </div>
    </footer>
  );
}
