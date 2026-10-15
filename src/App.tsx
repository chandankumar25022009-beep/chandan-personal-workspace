import { useEffect, useState } from 'react'
import {
  ArrowDown,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Award,
  BarChart3,
  BookOpen,
  Code2,
  ExternalLink,
  GraduationCap,
  Link2,
  Mail,
  Menu,
  Moon,
  Sun,
  X,
} from 'lucide-react'

const links = [
  ['About', '#about'],
  ['Skills', '#skills'],
  ['Projects', '#projects'],
  ['Journey', '#journey'],
  ['Contact', '#contact'],
] as const

const skills = [
  { name: 'Python', level: 'Learning', icon: Code2 },
  { name: 'Data analysis', level: 'Learning', icon: BarChart3 },
  { name: 'Data science', level: 'Exploring', icon: BookOpen },
  { name: 'Web development', level: 'Exploring', icon: Code2 },
  { name: 'Machine learning', level: 'Exploring', icon: BarChart3 },
  { name: 'Generative AI', level: 'Exploring', icon: BookOpen },
]

function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('portfolio-theme')
    return saved === 'light' ? 'light' : 'dark'
  })
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('portfolio-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme((current) => current === 'dark' ? 'light' : 'dark')

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="wordmark" href="#home" aria-label="Chandan Kumar, home">
          <span className="wordmark-mark">C<span>.</span></span>
          <span className="wordmark-name">Chandan Kumar</span>
        </a>
        <nav className={`nav-links${menuOpen ? ' is-open' : ''}`} aria-label="Main navigation">
          {links.map(([label, href]) => (
            <a href={href} key={href} onClick={() => setMenuOpen(false)}>{label}</a>
          ))}
        </nav>
        <div className="header-actions">
          <button className="icon-button theme-button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <a className="header-contact" href="#contact">Let’s talk <ArrowUpRight size={15} /></a>
          <button className="icon-button menu-button" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <main>
        <section className="hero section-wrap" id="home">
          <div className="hero-copy">
            <div className="eyebrow"><span className="status-dot" /> STUDENT · MEERUT, INDIA</div>
            <h1>Curious by nature.<br /><span>Driven by data.</span></h1>
            <p className="hero-role">Aspiring Data Analyst <i>/</i> Data Science Learner <i>/</i> Diploma CSE Student</p>
            <p className="hero-intro">I’m Chandan, a computer science student building my foundations in Python and data science. I enjoy turning questions into things I can explore, understand, and build.</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#contact">Get in touch <ArrowUpRight size={17} /></a>
              <a className="button button-quiet" href="#projects">Explore my work <ArrowDown size={16} /></a>
            </div>
            <div className="hero-socials" aria-label="Social profiles">
              <a href="https://github.com/chandankumar25022009-beep" target="_blank" rel="noreferrer"><Code2 size={16} /> GitHub <ArrowUpRight size={13} /></a>
              <a href="https://www.linkedin.com/in/chandan-kumar-9a3b22337" target="_blank" rel="noreferrer"><Link2 size={16} /> LinkedIn <ArrowUpRight size={13} /></a>
            </div>
          </div>
          <figure className="hero-art hero-photo">
            <img src={`${import.meta.env.BASE_URL}images/chandan-kumar.png`} alt="Portrait of Chandan Kumar" width="896" height="1152" />
          </figure>
          <a href="#about" className="scroll-cue" aria-label="Scroll to about section"><span>SCROLL TO EXPLORE</span><ArrowDownRight size={17} /></a>
        </section>

        <section className="intro-strip" aria-label="Personal introduction">
          <div className="section-wrap strip-inner"><span className="strip-index">01 / A LITTLE ABOUT ME</span><p>Learning the tools to make sense of the world, <em>one question at a time.</em></p><span className="strip-spark">✳</span></div>
        </section>

        <section className="content-section section-wrap" id="about">
          <div className="section-heading"><span className="section-index">01</span><div><p className="eyebrow">THE PERSON BEHIND THE SCREEN</p><h2>A learner with<br />a long view.</h2></div><p className="heading-note">Good work starts with good questions.<br />I’m here to keep asking them.</p></div>
          <div className="about-grid">
            <div className="about-main"><p className="lead-copy">I’m currently pursuing a Diploma in Computer Science and Engineering at Subharti Polytechnic College, Meerut. I’m at the beginning of my journey in data, and I’m comfortable saying so.</p><p className="body-copy">Right now, I’m learning Python and the fundamentals of data science. I’m interested in how data analysis, machine learning, and generative AI can help people see a problem differently. Along the way, web development gives me a way to share what I’m learning.</p><p className="body-copy">My approach is simple: stay curious, practise the basics, and be honest about what I know and what I still need to learn.</p></div>
            <aside className="about-aside"><div className="aside-rule" /><p className="aside-label">CURRENTLY</p><div className="aside-item"><span className="aside-icon"><GraduationCap size={17} /></span><div><strong>Diploma student</strong><small>Computer Science & Engineering</small></div></div><div className="aside-item"><span className="aside-icon"><BookOpen size={17} /></span><div><strong>Building foundations</strong><small>Python · Data science</small></div></div><div className="aside-item"><span className="aside-icon"><ArrowUpRight size={17} /></span><div><strong>Open to learning</strong><small>New ideas and good questions</small></div></div><a className="text-link" href="#education">My education <ArrowRight size={15} /></a></aside>
          </div>
        </section>

        <section className="skills-section" id="skills"><div className="section-wrap skills-inner">
          <div className="section-heading"><span className="section-index">02</span><div><p className="eyebrow">TOOLS & TOPICS</p><h2>Learning, not<br />overclaiming.</h2></div><p className="heading-note">An honest snapshot of what I’m<br />studying and exploring right now.</p></div>
          <div className="skill-grid">{skills.map(({ name, level, icon: Icon }, index) => <article className="skill-item" key={name}><div className="skill-top"><span className="skill-number">0{index + 1}</span><Icon size={19} strokeWidth={1.6} /></div><h3>{name}</h3><div className="skill-bottom"><span>{level}</span><span className="skill-line" /></div></article>)}</div>
          <p className="skills-note"><span className="status-dot" /> Skills shown here reflect my current learning stage, not professional proficiency.</p>
        </div></section>

        <section className="content-section section-wrap" id="projects">
          <div className="section-heading"><span className="section-index">03</span><div><p className="eyebrow">SELECTED WORK</p><h2>Small steps.<br />Real practice.</h2></div><p className="heading-note">Personal and beginner projects<br />will appear here as I build them.</p></div>
          <div className="empty-project"><div className="empty-project-mark"><Code2 size={25} /></div><div><span className="eyebrow">THE WORK IS IN PROGRESS</span><h3>First projects are taking shape.</h3><p>I’m building my skills before presenting projects here. Check back as my learning turns into practical work.</p></div><a className="circle-link" href="https://github.com/chandankumar25022009-beep" target="_blank" rel="noreferrer" aria-label="Visit Chandan's GitHub"><ArrowUpRight size={20} /></a></div>
        </section>

        <section className="education-section" id="education"><div className="section-wrap education-inner">
          <div className="section-heading"><span className="section-index">04</span><div><p className="eyebrow">EDUCATION</p><h2>Foundations<br />for what’s next.</h2></div><p className="heading-note">A work in progress, in the<br />best possible sense.</p></div>
          <div className="education-row"><div className="education-date">CURRENT <span>—</span> 2027</div><div className="education-degree"><span className="education-icon"><GraduationCap size={20} /></span><div><h3>Diploma in Computer Science and Engineering</h3><p>Swami Vivekanand Subharti University · Subharti Polytechnic College</p><p className="education-location">Meerut, Uttar Pradesh, India</p></div></div><span className="education-tag">IN PROGRESS</span></div>
          <div className="education-row education-placeholder"><div className="education-date">PREVIOUS</div><div className="education-degree"><span className="education-icon"><BookOpen size={19} /></span><div><h3>School education</h3><p>School details not added yet.</p></div></div><span className="placeholder-edit">Add details when ready</span></div>
        </div></section>

        <section className="content-section section-wrap" id="certificates"><div className="section-heading"><span className="section-index">05</span><div><p className="eyebrow">CERTIFICATES</p><h2>Earned, not<br />assumed.</h2></div><p className="heading-note">Only certificates I can verify<br />will be listed here.</p></div><div className="certificate-empty"><Award size={21} /><p>No certificates added yet.</p><span>This section will grow when I have credentials to share.</span></div></section>

        <section className="journey-section" id="journey"><div className="section-wrap journey-inner">
          <div className="section-heading"><span className="section-index">06</span><div><p className="eyebrow">LEARNING JOURNEY</p><h2>Progress over<br />performance.</h2></div><p className="heading-note">A few things I’m focused on<br />understanding next.</p></div>
          <div className="journey-list"><div className="journey-row"><span className="journey-marker marker-current" /><span className="journey-status">RIGHT NOW</span><h3>Python fundamentals</h3><span className="journey-detail">Learning the language, one concept at a time</span><ArrowUpRight size={16} /></div><div className="journey-row"><span className="journey-marker" /><span className="journey-status">UP NEXT</span><h3>Working with data</h3><span className="journey-detail">Exploring how to clean, organise, and understand data</span><ArrowUpRight size={16} /></div><div className="journey-row"><span className="journey-marker" /><span className="journey-status">ON THE HORIZON</span><h3>Machine learning basics</h3><span className="journey-detail">Building context before reaching for complex tools</span><ArrowUpRight size={16} /></div></div>
        </div></section>

        <section className="resume-section section-wrap" id="resume"><div className="resume-copy"><p className="eyebrow">RESUME</p><h2>My resume.</h2><p>Open the resume on Google Docs. Access depends on the document’s sharing settings.</p></div><a className="button button-primary" href="https://docs.google.com/document/d/1C9TlBLlB-XGHaWZd74S_I8QOQAk3GpzJ/edit" target="_blank" rel="noreferrer" aria-label="Open resume on Google Docs in a new tab">Open resume <ExternalLink size={16} /></a></section>

        <section className="contact-section" id="contact"><div className="section-wrap contact-inner"><div className="contact-top"><span className="eyebrow"><span className="status-dot" /> OPEN TO CONNECTING</span><span className="contact-index">07 / GET IN TOUCH</span></div><h2>Have a question<br />or an idea to share<span>?</span></h2><div className="contact-bottom"><p>I’m early in my journey, but always glad to meet people who enjoy learning and building.</p><a className="button button-light" href="https://www.linkedin.com/in/chandan-kumar-9a3b22337" target="_blank" rel="noreferrer">Connect on LinkedIn <ArrowUpRight size={17} /></a></div><div className="contact-socials"><a href="https://github.com/chandankumar25022009-beep" target="_blank" rel="noreferrer"><Code2 size={17} /> GitHub <ExternalLink size={13} /></a><a href="https://www.linkedin.com/in/chandan-kumar-9a3b22337" target="_blank" rel="noreferrer"><Link2 size={17} /> LinkedIn <ExternalLink size={13} /></a><span className="email-note"><Mail size={16} /> Email not listed yet</span></div></div></section>
      </main>

      <footer className="site-footer"><div className="section-wrap footer-inner"><a className="wordmark footer-wordmark" href="#home"><span className="wordmark-mark">C<span>.</span></span><span className="wordmark-name">Chandan Kumar</span></a><span className="footer-note">Learning in public. Building at my own pace.</span><span className="copyright">© {new Date().getFullYear()} Chandan Kumar</span><a href="#home" className="back-top">BACK TO TOP <ArrowUpRight size={14} /></a></div></footer>
    </div>
  )
}

export default App