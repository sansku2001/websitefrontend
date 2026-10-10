import { useEffect, useMemo, useState } from 'react';
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { api } from './api.js';

const imageSamples = {
  heroImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85',
  historyImage: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85',
  managingImage: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85',
  redevelopmentImage: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1200&q=85',
};
const photoSamples = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80',
];
const tr = {
  en: { story: 'Our story', committees: 'Committees', notices: 'Notices', gallery: 'Gallery', contact: 'Contact', find: 'Find us', welcome: 'Welcome to our neighbourhood', hero: 'A place to belong. A home to grow.', heroCopy: 'Ramakant CHSL is more than an address. It is a community shaped by shared celebrations, familiar faces and the everyday kindness of neighbours.', explore: 'Explore community', history: 'A story built together.', committeeHeading: 'Working for our home.', manage: 'Managing Committee', redevelopment: 'Redevelopment Committee', view: 'View committee', noticeHeading: 'Notice Board', noticeIntro: 'Building notices, updates and documents for residents.', more: 'View more notices', galleryHeading: 'Festival & event gallery', galleryIntro: 'Select an event to open its photo album.', complaint: 'Share a concern', complaintIntro: 'Use this short form to let the committee know about a building concern.', room: 'Room / flat number', concern: 'Your concern', submit: 'Submit complaint', address: 'Find your way home.', map: 'Open in Google Maps', back: 'Back to Home', members: 'Committee members', docs: 'Redevelopment documents', chooseLanguage: 'Which language would you like to use?', thanks: 'Thank you. Your concern was recorded.', loading: 'Loading the society website…' },
  mr: { story: 'आमची कहाणी', committees: 'समित्या', notices: 'सूचना', gallery: 'गॅलरी', contact: 'संपर्क', find: 'आमचा पत्ता', welcome: 'आमच्या परिसरात आपले स्वागत आहे', hero: 'आपलेपणाची जागा. वाढते घर.', heroCopy: 'रामकांत CHSL हा केवळ पत्ता नाही. एकत्र साजरे केलेले सण आणि शेजाऱ्यांच्या आपुलकीतून घडलेला हा समुदाय आहे.', explore: 'समुदाय पहा', history: 'एकत्र घडवलेली कहाणी.', committeeHeading: 'आपल्या घरासाठी तत्पर.', manage: 'व्यवस्थापन समिती', redevelopment: 'पुनर्विकास समिती', view: 'समिती पहा', noticeHeading: 'सूचना फलक', noticeIntro: 'रहिवाशांसाठी इमारतीच्या सूचना, अद्यतने आणि कागदपत्रे.', more: 'अधिक सूचना पहा', galleryHeading: 'सण आणि कार्यक्रम गॅलरी', galleryIntro: 'छायाचित्रे पाहण्यासाठी कार्यक्रम निवडा.', complaint: 'तक्रार नोंदवा', complaintIntro: 'इमारतीविषयीची तक्रार समितीपर्यंत पोहोचवण्यासाठी हा छोटा फॉर्म वापरा.', room: 'खोली / सदनिका क्रमांक', concern: 'आपली तक्रार', submit: 'तक्रार पाठवा', address: 'आपला पत्ता शोधा.', map: 'Google Maps मध्ये पहा', back: 'मुख्यपृष्ठावर परत', members: 'समिती सदस्य', docs: 'पुनर्विकास कागदपत्रे', chooseLanguage: 'आपण कोणत्या भाषेत वेबसाइट पाहू इच्छिता?', thanks: 'धन्यवाद. आपली तक्रार नोंदवली आहे.', loading: 'सोसायटीची वेबसाइट उघडत आहे…' },
};
const copy = (obj) => JSON.parse(JSON.stringify(obj));
const titleOf = (item, lang) => lang === 'mr' ? (item.mrTitle || item.title || item.name) : (item.title || item.name);
const imageUrl = (url) => url?.startsWith('/') ? url : url || '';

export default function App() {
  const [content, setContent] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [lang, setLang] = useState(() => localStorage.getItem('ramakant-language-choice') || 'en');
  const [askLanguage, setAskLanguage] = useState(() => !localStorage.getItem('ramakant-language-choice'));
  const [noticeLimit, setNoticeLimit] = useState(5);
  const text = tr[lang];

  useEffect(() => { api.content().then(setContent).catch((error) => setLoadError(error.message)); }, []);
  const chooseLanguage = (value) => { localStorage.setItem('ramakant-language-choice', value); setLang(value); setAskLanguage(false); };
  if (!content) return <main className="loading">{loadError ? <><h1>Website could not connect</h1><p>{loadError}</p><p>Check that the FastAPI backend is running and reload this page.</p></> : text.loading}</main>;

  return <>
    <Routes>
      <Route path="/admin" element={<AdminPage initial={content} lang={lang} />} />
      <Route path="/committee/:type" element={<CommitteePage content={content} lang={lang} />} />
      <Route path="/gallery/:id" element={<EventPage content={content} lang={lang} />} />
      <Route path="*" element={<Home content={content} lang={lang} text={text} noticeLimit={noticeLimit} setNoticeLimit={setNoticeLimit} />} />
    </Routes>
    {askLanguage && <div className="modal-backdrop"><section className="language-modal" role="dialog" aria-modal="true"><span className="eyebrow">Ramakant CHSL</span><h2>{text.chooseLanguage}</h2><div className="button-row"><button className="button" onClick={() => chooseLanguage('en')}>English</button><button className="button secondary" onClick={() => chooseLanguage('mr')}>मराठी</button></div></section></div>}
  </>;
}

function Header({ content, lang }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const text = tr[lang];
  return <>
    <div className="topline"><div className="wrap">A neighbourly home · Mumbai, Maharashtra <span>Resident information</span></div></div>
    <header className="site-header"><div className="wrap nav">
      <Link className="brand" to="/"><span className="brandmark">R</span><span><strong>{content.site.name || 'Ramakant CHSL'}</strong><small>{content.site.tagline || 'A community, together'}</small></span></Link>
      <button className="menu-toggle" aria-label="Open menu" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
      <nav className={menuOpen ? 'nav-links open' : 'nav-links'}>
        <a href="/#history" onClick={() => setMenuOpen(false)}>{text.story}</a><a href="/#committees" onClick={() => setMenuOpen(false)}>{text.committees}</a><a href="/#notices" onClick={() => setMenuOpen(false)}>{text.notices}</a><a href="/#gallery" onClick={() => setMenuOpen(false)}>{text.gallery}</a><a href="/#complaints" onClick={() => setMenuOpen(false)}>{text.contact}</a><a href="/#address" onClick={() => setMenuOpen(false)}>{text.find}</a>
      </nav>
      <select aria-label="Choose language" value={lang} onChange={(event) => { localStorage.setItem('ramakant-language-choice', event.target.value); window.location.reload(); }}><option value="en">EN · English</option><option value="mr">मराठी</option></select>
    </div></header>
  </>;
}

function Home({ content, lang, text, noticeLimit, setNoticeLimit }) {
  const [complaint, setComplaint] = useState({ room: '', concern: '' });
  const [status, setStatus] = useState('');
  const [sending, setSending] = useState(false);
  const notices = content.notices || [];
  const events = content.events || [];
  const managing = content.committees?.managing?.members || [];
  const redevelopment = content.committees?.redevelopment?.members || [];
  async function submit(event) {
    event.preventDefault(); setSending(true); setStatus('');
    try { const result = await api.submitComplaint(complaint); setStatus(`${text.thanks} Reference: ${result.id}`); setComplaint({ room: '', concern: '' }); }
    catch (error) { setStatus(error.message); }
    finally { setSending(false); }
  }
  return <><Header content={content} lang={lang}/><main>
    <section className="hero"><div className="wrap hero-grid"><div><span className="eyebrow">{text.welcome}</span><h1>{content.site.welcomeTitle || text.hero}</h1><p>{content.site.welcomeText || text.heroCopy}</p><a className="button" href="#committees">{text.explore} ↗</a></div><img className="hero-image" src={imageUrl(content.site.heroImage) || imageSamples.heroImage} alt="Ramakant CHSL building" onError={(e) => { e.currentTarget.src = imageSamples.heroImage; }}/></div></section>
    <section id="history" className="section white"><div className="wrap split"><img className="feature-image" src={imageUrl(content.site.historyImage) || imageSamples.historyImage} alt="Shared residential space" onError={(e) => { e.currentTarget.src = imageSamples.historyImage; }}/><div><span className="eyebrow">Our history</span><h2>{text.history}</h2><p>{content.site.history}</p><p>{content.site.historyExtra}</p><div className="stats"><div><b>{content.site.founded}</b><span>Founded</span></div><div><b>{content.site.homes}</b><span>Homes</span></div></div></div></div></section>
    <section id="committees" className="section"><div className="wrap"><SectionHeading eyebrow="People who serve the society" title={text.committeeHeading} copy="Meet the volunteers supporting daily life and planning for the future."/><div className="committee-cards">
      <CommitteeCard content={content} type="managing" lang={lang} members={managing} image={imageSamples.managingImage}/>
      <CommitteeCard content={content} type="redevelopment" lang={lang} members={redevelopment} image={imageSamples.redevelopmentImage}/>
    </div></div></section>
    <section id="notices" className="section white"><div className="wrap"><SectionHeading eyebrow="Community notice board" title={text.noticeHeading} copy={text.noticeIntro}/><div className="notice-list">{notices.slice(0, noticeLimit).map((notice) => <article className="notice-row" key={notice.id}><time>{notice.date}</time><div><h3>{titleOf(notice, lang)}</h3><p>{lang === 'mr' ? notice.mrSummary || notice.summary : notice.summary}</p></div><a className="button small" href={notice.pdfUrl || '#'} target={notice.pdfUrl ? '_blank' : undefined} rel="noreferrer" onClick={(e) => { if (!notice.pdfUrl) { e.preventDefault(); window.alert('The committee has not attached a PDF to this notice yet.'); }}}>View PDF</a></article>)}</div>{notices.length > 5 && <button className="button secondary" onClick={() => setNoticeLimit(noticeLimit === 5 ? notices.length : 5)}>{noticeLimit === 5 ? text.more : 'Show fewer notices'}</button>}</div></section>
    <section id="gallery" className="section"><div className="wrap"><SectionHeading eyebrow="Community memories" title={text.galleryHeading} copy={text.galleryIntro}/><div className="event-list">{events.map((event) => <Link className="event-row" to={`/gallery/${event.id}`} key={event.id}><span><b>{titleOf(event, lang)}</b><small>{lang === 'mr' ? event.mrDescription || event.description : event.description}</small></span><strong>{event.year}</strong><span aria-hidden="true">→</span></Link>)}</div></div></section>
    <section id="complaints" className="section white"><div className="wrap complaint-layout"><div><span className="eyebrow">Resident support</span><h2>{text.complaint}</h2><p>{text.complaintIntro}</p><p><b>{content.site.phone}</b><br/>{content.site.email}</p></div><form className="form-card" onSubmit={submit}><label>{text.room}<input required maxLength="80" value={complaint.room} onChange={(e) => setComplaint({ ...complaint, room: e.target.value })}/></label><label>{text.concern}<textarea required minLength="5" maxLength="2000" rows="5" value={complaint.concern} onChange={(e) => setComplaint({ ...complaint, concern: e.target.value })}/></label><button className="button" disabled={sending}>{sending ? 'Sending…' : text.submit}</button>{status && <p role="status" className="form-status">{status}</p>}</form></div></section>
    <section id="address" className="section address-section"><div className="wrap address-card"><div><span className="eyebrow">Visit the society</span><h2>{text.address}</h2><p className="address-text">{content.site.name}<br/>{content.site.address}</p><p><b>Society office</b><br/>{content.site.officeHours}</p><a className="button" target="_blank" rel="noreferrer" href={content.site.mapUrl || 'https://www.google.com/maps/search/?api=1&query=Ramakant+CHSL+Mumbai'}>{text.map} ↗</a></div><div className="map-panel" aria-hidden="true">⌖</div></div></section>
  </main><footer className="footer"><div className="wrap"><b>{content.site.name || 'Ramakant CHSL'}</b><span>A community, together</span><Link to="/admin">Secretary login</Link></div></footer></>;
}

function SectionHeading({ eyebrow, title, copy: description }) { return <div className="section-heading"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div>{description && <p>{description}</p>}</div>; }
function CommitteeCard({ content, type, lang, members, image }) {
  const isRedevelopment = type === 'redevelopment';
  const title = isRedevelopment ? tr[lang].redevelopment : tr[lang].manage;
  const description = isRedevelopment ? content.site.redevelopmentDescription : content.site.managingDescription;
  return <article className="committee-card"><img src={image} alt=""/><div><span className="eyebrow">{isRedevelopment ? 'Planning ahead' : 'Everyday care'}</span><h3>{title}</h3><p>{description}</p><small>{members.length} committee members</small><Link className="button small" to={`/committee/${type}`}>{tr[lang].view} ↗</Link></div></article>;
}
function CommitteePage({ content, lang }) {
  const { type = 'managing' } = useParams(); const committee = content.committees?.[type] || {};
  const isRedevelopment = type === 'redevelopment'; const title = isRedevelopment ? tr[lang].redevelopment : tr[lang].manage;
  const members = committee.members || [];
  return <><Header content={content} lang={lang}/><main className="detail-page wrap"><Link className="back-link" to="/">← {tr[lang].back}</Link><h1>{title}</h1><div className="detail-intro"><img src={imageUrl(content.site[isRedevelopment ? 'redevelopmentImage' : 'managingImage']) || imageSamples[isRedevelopment ? 'redevelopmentImage' : 'managingImage']} alt={`${title} introduction`} onError={(e) => { e.currentTarget.src = imageSamples[isRedevelopment ? 'redevelopmentImage' : 'managingImage']; }}/><p>{isRedevelopment ? content.site.redevelopmentDescription : content.site.managingDescription}</p></div>
    {isRedevelopment && <section><h2>{tr[lang].docs}</h2><div className="document-list">{(committee.documents || []).map((doc) => <article className="document-row" key={doc.id}><div><h3>{titleOf(doc, lang)}</h3><p>{lang === 'mr' ? doc.mrSummary || doc.summary : doc.summary}</p></div><a className="button small" href={doc.url || '#'} target={doc.url ? '_blank' : undefined} rel="noreferrer" onClick={(e) => { if (!doc.url) { e.preventDefault(); window.alert('No document has been uploaded for this item yet.'); }}}>View document</a></article>)}</div></section>}
    <section><h2>{tr[lang].members}</h2><MemberGrid members={members} lang={lang}/></section></main><Footer content={content}/></>;
}
function MemberGrid({ members, lang }) { return <div className="member-grid">{members.map((member, i) => <article className="member-card" key={member.id || `${member.name}-${i}`}><img src={imageUrl(member.photo) || photoSamples[i % photoSamples.length]} alt={member.name || 'Committee member'} onError={(e) => { e.currentTarget.src = photoSamples[i % photoSamples.length]; }}/><h3>{member.name}</h3><b>{member.role}</b><p>{member.bio}</p></article>)}</div>; }
function EventPage({ content, lang }) {
  const { id } = useParams(); const event = content.events.find((item) => item.id === id);
  if (!event) return <><Header content={content} lang={lang}/><main className="detail-page wrap"><Link className="back-link" to="/">← {tr[lang].back}</Link><h1>Event not found</h1></main></>;
  return <><Header content={content} lang={lang}/><main className="detail-page wrap"><Link className="back-link" to="/#gallery">← {tr[lang].back}</Link><span className="eyebrow">{event.year} · Community gallery</span><h1>{titleOf(event, lang)}</h1><p className="detail-description">{lang === 'mr' ? event.mrDescription || event.description : event.description}</p><div className="photo-grid">{(event.photos || []).slice(0, 10).map((photo, i) => <figure key={photo.id || `${photo.url}-${i}`}><img src={imageUrl(photo.url) || photoSamples[i % photoSamples.length]} alt={photo.caption || `${titleOf(event, lang)} photo ${i + 1}`} onError={(e) => { e.currentTarget.src = photoSamples[i % photoSamples.length]; }}/><figcaption>{photo.caption || `Photo ${i + 1}`}</figcaption></figure>)}</div></main><Footer content={content}/></>;
}
function Footer({ content }) { return <footer className="footer"><div className="wrap"><b>{content.site.name || 'Ramakant CHSL'}</b><span>A community, together</span><Link to="/admin">Secretary login</Link></div></footer>; }

function AdminPage({ initial, lang }) {
  const [content, setContent] = useState(() => copy(initial));
  const [authenticated, setAuthenticated] = useState(false);
  const [section, setSection] = useState('overview');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const navigate = useNavigate();
  useEffect(() => { api.session().then((session) => { if (session.authenticated) { setAuthenticated(true); api.complaints().then(setComplaints).catch(() => {}); } }).catch(() => {}); }, []);
  async function signIn(username, password) { setError(''); try { await api.login(username, password); setAuthenticated(true); setComplaints(await api.complaints()); } catch (e) { setError(e.message); } }
  async function save() { setBusy(true); setMessage(''); setError(''); try { await api.saveContent(content); setMessage('Changes saved. The public website is updated.'); } catch (e) { setError(e.message); } finally { setBusy(false); } }
  async function upload(file) { if (!file) return ''; if (file.size > 9 * 1024 * 1024) throw new Error('Each file must be smaller than 9 MB.'); return (await api.upload(file)).url; }
  async function exportBackup() {
    try { const bundle = { content, complaints: await api.complaints() }; const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' })); a.download = 'ramakant-chsl-backup.json'; a.click(); URL.revokeObjectURL(a.href); }
    catch (e) { setError(e.message); }
  }
  async function importBackup(file) {
    if (!file) return;
    try { const bundle = JSON.parse(await file.text()); const restored = bundle.content || bundle; await api.saveContent(restored); if (Array.isArray(bundle.complaints)) await api.importComplaints(bundle.complaints); setContent(restored); setMessage('Backup restored. Please upload the photo and PDF files again.'); }
    catch (e) { setError(`Could not restore backup: ${e.message}`); }
  }
  async function signOut() { await api.logout(); setAuthenticated(false); }
  if (!authenticated) return <Login onLogin={signIn} error={error} onHome={() => navigate('/')}/>;
  const labels = { overview: 'Website information', notices: 'Notices', events: 'Gallery events', managing: 'Managing Committee', redevelopment: 'Redevelopment Committee', complaints: 'Complaints' };
  return <div className="admin-shell"><header className="admin-header"><div><h1>Ramakant CHSL · Secretary Panel</h1><span>Update the information shown on the website.</span></div><div className="button-row"><Link className="button secondary" to="/">View website</Link><button className="button secondary" onClick={signOut}>Sign out</button></div></header><div className="admin-layout"><nav className="admin-tabs">{Object.entries(labels).map(([key, label]) => <button key={key} className={section === key ? 'active' : ''} onClick={() => { setSection(key); setMessage(''); setError(''); }}>{label}</button>)}</nav><main className="admin-main"><div className="admin-top"><div><h2>{labels[section]}</h2><p>English and Marathi text can be added in the matching fields.</p></div><div className="button-row"><button className="button secondary" onClick={exportBackup}>Download backup</button><label className="button secondary file-button">Restore backup<input type="file" accept="application/json,.json" onChange={(e) => { importBackup(e.target.files[0]); e.target.value = ''; }}/></label><button className="button" disabled={busy} onClick={save}>{busy ? 'Saving…' : 'Save changes'}</button></div></div>{message && <p className="notice-success" role="status">{message}</p>}{error && <p className="notice-error" role="alert">{error}</p>}
      {section === 'overview' && <SiteEditor content={content} setContent={setContent} upload={upload}/>}
      {section === 'notices' && <NoticeEditor content={content} setContent={setContent} upload={upload}/>}
      {section === 'events' && <EventEditor content={content} setContent={setContent} upload={upload}/>}
      {section === 'managing' && <MemberEditor type="managing" content={content} setContent={setContent} upload={upload}/>}
      {section === 'redevelopment' && <><DocumentEditor content={content} setContent={setContent} upload={upload}/><MemberEditor type="redevelopment" content={content} setContent={setContent} upload={upload}/></>}
      {section === 'complaints' && <ComplaintList complaints={complaints} reload={() => api.complaints().then(setComplaints)} onUpdate={async (c) => { await api.updateComplaint(c.id, c.status === 'Resolved' ? 'Open' : 'Resolved'); await api.complaints().then(setComplaints); }}/>}
    </main></div></div>;
}
function Login({ onLogin, error, onHome }) {
  const [username, setUsername] = useState('secretary'); const [password, setPassword] = useState('');
  return <main className="login-wrap"><form className="login-card" onSubmit={(e) => { e.preventDefault(); onLogin(username, password); }}><Link className="back-link" to="/">← Back to website</Link><span className="eyebrow">Secretary access</span><h1>Society admin</h1><p>Sign in to update the Ramakant CHSL website.</p><label>Username<input autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} required/></label><label>Password<input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required/></label><button className="button">Sign in</button>{error && <p className="notice-error" role="alert">{error}</p>}</form></main>;
}
function SiteEditor({ content, setContent, upload }) {
  const site = content.site || {};
  const fields = [['name','Society name'],['tagline','Short tagline'],['topline','Top banner text'],['welcomeTitle','Home page title'],['welcomeText','Home page introduction'],['history','Building history'],['historyExtra','Additional history'],['founded','Year founded'],['homes','Number of homes'],['managingDescription','Managing Committee description'],['redevelopmentDescription','Redevelopment Committee description'],['address','Full address'],['officeHours','Office hours'],['phone','Phone'],['email','Email'],['mapUrl','Google Maps link']];
  const update = (key, value) => setContent((prev) => ({ ...prev, site: { ...prev.site, [key]: value } }));
  return <div className="editor-card"><h3>Website wording and contact details</h3><div className="editor-grid">{fields.map(([key, label]) => <label key={key}>{label}{['welcomeText','history','historyExtra','managingDescription','redevelopmentDescription','address'].includes(key) ? <textarea rows="3" value={site[key] || ''} onChange={(e) => update(key, e.target.value)}/> : <input value={site[key] || ''} onChange={(e) => update(key, e.target.value)}/>}</label>)}</div><h3>Building photographs</h3><div className="editor-grid">{[['heroImage','Home page building photo'],['historyImage','History photo'],['managingImage','Managing Committee photo'],['redevelopmentImage','Redevelopment photo']].map(([key,label]) => <label key={key}>{label}<input type="file" accept="image/png,image/jpeg,image/webp" onChange={async(e)=>{try{update(key,await upload(e.target.files[0]));}catch(err){alert(err.message)}}}/>{site[key] && <img className="upload-preview" src={site[key]} alt="Uploaded preview"/>}</label>)}</div></div>;
}
function NoticeEditor({ content, setContent, upload }) {
  const rows = content.notices || [];
  const change = (i, key, value) => setContent((prev) => ({ ...prev, notices: prev.notices.map((n, j) => j === i ? { ...n, [key]: value } : n) }));
  return <div className="editor-card"><div className="admin-subhead"><h3>Notice board entries</h3><button className="button secondary" onClick={() => setContent((p) => ({ ...p, notices: [...p.notices, { id: crypto.randomUUID(), title: '', mrTitle: '', date: '', summary: '', mrSummary: '', pdfUrl: '' }] }))}>Add notice</button></div>{rows.map((n, i) => <article className="editor-item" key={n.id || i}><div className="admin-subhead"><h3>Notice {i + 1}</h3><button className="button danger small" onClick={() => setContent((p) => ({ ...p, notices: p.notices.filter((_, j) => i !== j) }))}>Remove</button></div><div className="editor-grid">{[['title','Title'],['mrTitle','Marathi title'],['date','Date'],['summary','Short summary'],['mrSummary','Marathi summary']].map(([k,label]) => <label key={k}>{label}{k.includes('summary') || k.includes('Summary') ? <textarea rows="3" value={n[k] || ''} onChange={(e)=>change(i,k,e.target.value)}/> : <input value={n[k] || ''} onChange={(e)=>change(i,k,e.target.value)}/>}</label>)}</div><label className="file-button">Attach PDF<input type="file" accept="application/pdf,.pdf" onChange={async(e)=>{try{change(i,'pdfUrl',await upload(e.target.files[0]));}catch(err){alert(err.message)}}}/></label>{n.pdfUrl && <a href={n.pdfUrl} target="_blank" rel="noreferrer">Open attached PDF</a>}</article>)}</div>;
}
function EventEditor({ content, setContent, upload }) {
  const events = content.events || [];
  const setEvent = (i, key, value) => setContent((p)=>({...p,events:p.events.map((event,j)=>j===i?{...event,[key]:value}:event)}));
  return <div className="editor-card"><div className="admin-subhead"><h3>Festival and event albums</h3><button className="button secondary" onClick={()=>setContent((p)=>({...p,events:[...p.events,{id:crypto.randomUUID(),title:'',mrTitle:'',year:String(new Date().getFullYear()),description:'',mrDescription:'',photos:[]}]}))}>Add event</button></div>{events.map((event,i)=><article className="editor-item" key={event.id||i}><div className="admin-subhead"><h3>Event album {i+1}</h3><button className="button danger small" onClick={()=>setContent((p)=>({...p,events:p.events.filter((_,j)=>j!==i)}))}>Remove</button></div><div className="editor-grid">{[['title','Event title'],['mrTitle','Marathi title'],['year','Year'],['description','Description'],['mrDescription','Marathi description']].map(([k,label])=><label key={k}>{label}{k.toLowerCase().includes('description')?<textarea rows="3" value={event[k]||''} onChange={(e)=>setEvent(i,k,e.target.value)}/>:<input value={event[k]||''} onChange={(e)=>setEvent(i,k,e.target.value)}/>}</label>)}</div><div className="admin-subhead"><h4>Photos ({event.photos?.length||0} of 10)</h4><label className="button secondary file-button">Add photos<input type="file" multiple accept="image/png,image/jpeg,image/webp" onChange={async(e)=>{try{const files=[...e.target.files];if((event.photos?.length||0)+files.length>10)throw new Error('An event can have up to 10 photos.');const uploaded=[];for(const file of files)uploaded.push({url:await upload(file),caption:file.name.replace(/\.[^.]+$/,'')});setEvent(i,'photos',[...(event.photos||[]),...uploaded]);}catch(err){alert(err.message)}e.target.value='';}}/></label></div><div className="photo-editor">{(event.photos||[]).map((photo,j)=><div className="photo-editor-row" key={photo.id||photo.url+j}><img src={photo.url} alt="Event preview"/><input aria-label="Photo caption" value={photo.caption||''} onChange={(e)=>{const next=[...event.photos];next[j]={...photo,caption:e.target.value};setEvent(i,'photos',next)}}/><button className="button danger small" onClick={()=>setEvent(i,'photos',event.photos.filter((_,k)=>k!==j))}>Remove</button></div>)}</div></article>)}</div>;
}
function MemberEditor({ type, content, setContent, upload }) {
  const members = content.committees?.[type]?.members || [];
  const title = type === 'managing' ? tr.en.manage : tr.en.redevelopment;
  const setMembers = (next) => setContent((p)=>({...p,committees:{...p.committees,[type]:{...p.committees[type],members:next}}}));
  return <div className="editor-card"><div className="admin-subhead"><h3>{title} members</h3><button className="button secondary" onClick={()=>setMembers([...members,{id:crypto.randomUUID(),name:'',role:'Committee member',bio:'',photo:''}])}>Add member</button></div>{members.map((m,i)=><article className="editor-item" key={m.id||i}><div className="admin-subhead"><h3>Member {i+1}</h3><button className="button danger small" onClick={()=>setMembers(members.filter((_,j)=>j!==i))}>Remove</button></div><div className="editor-grid">{[['name','Full name'],['role','Role'],['bio','Short profile']].map(([k,label])=><label key={k}>{label}{k==='bio'?<textarea rows="3" value={m[k]||''} onChange={(e)=>setMembers(members.map((x,j)=>j===i?{...x,[k]:e.target.value}:x))}/>:<input value={m[k]||''} onChange={(e)=>setMembers(members.map((x,j)=>j===i?{...x,[k]:e.target.value}:x))}/>}</label>)}</div><label className="file-button">Choose member photo<input type="file" accept="image/png,image/jpeg,image/webp" onChange={async(e)=>{try{const photo=await upload(e.target.files[0]);setMembers(members.map((x,j)=>j===i?{...x,photo}:x));}catch(err){alert(err.message)}}}/></label>{m.photo && <img className="upload-preview" src={m.photo} alt="Member photo preview"/>}</article>)}</div>;
}
function DocumentEditor({ content, setContent, upload }) {
  const documents = content.committees?.redevelopment?.documents || [];
  const setDocuments = (next) => setContent((p)=>({...p,committees:{...p.committees,redevelopment:{...p.committees.redevelopment,documents:next}}}));
  return <div className="editor-card"><div className="admin-subhead"><h3>Redevelopment documents</h3><button className="button secondary" onClick={()=>setDocuments([...documents,{id:crypto.randomUUID(),title:'',mrTitle:'',summary:'',mrSummary:'',url:''}])}>Add document</button></div>{documents.map((doc,i)=><article className="editor-item" key={doc.id||i}><div className="admin-subhead"><h3>Document {i+1}</h3><button className="button danger small" onClick={()=>setDocuments(documents.filter((_,j)=>j!==i))}>Remove</button></div><div className="editor-grid">{[['title','Title'],['mrTitle','Marathi title'],['summary','Description'],['mrSummary','Marathi description']].map(([k,label])=><label key={k}>{label}{k.toLowerCase().includes('summary')?<textarea rows="3" value={doc[k]||''} onChange={(e)=>setDocuments(documents.map((x,j)=>j===i?{...x,[k]:e.target.value}:x))}/>:<input value={doc[k]||''} onChange={(e)=>setDocuments(documents.map((x,j)=>j===i?{...x,[k]:e.target.value}:x))}/>}</label>)}</div><label className="file-button">Attach PDF<input type="file" accept="application/pdf,.pdf" onChange={async(e)=>{try{const url=await upload(e.target.files[0]);setDocuments(documents.map((x,j)=>j===i?{...x,url}:x));}catch(err){alert(err.message)}}}/></label>{doc.url && <a href={doc.url} target="_blank" rel="noreferrer">Open PDF</a>}</article>)}</div>;
}
function ComplaintList({ complaints, onUpdate }) { return <div className="editor-card"><h3>Resident complaints</h3>{complaints.length ? complaints.map((item)=><article className="complaint-row" key={item.id}><div><b>Room {item.room} · {new Date(item.createdAt).toLocaleString()}</b><p>{item.concern}</p><small>{item.id}</small></div><button className="button secondary small" onClick={()=>onUpdate(item)}>{item.status==='Resolved'?'Reopen':'Mark resolved'}</button></article>) : <p>No complaints have been submitted.</p>}</div>; }
