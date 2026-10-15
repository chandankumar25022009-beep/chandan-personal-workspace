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
import portfolioData from './data/portfolio.json'
import type { PortfolioContent } from './data/types'

const links = [
  ['About', '#about'],
  ['Skills', '#skills'],
  ['Projects', '#projects'],
  ['Journey', '#journey'],
  ['Contact', '#contact'],
] as const

const categoryIcons: Record<string, typeof Code2> = {
  Programming: Code2,
  Data: BarChart3,
  Databases: BookOpen,
  'Business Intelligence': BarChart3,
  Visualization: BarChart3,
  'Data Science': BookOpen,
  Interests: Code2,
}

function App() {
  const [content, setContent] = useState<PortfolioContent>(portfolioData as PortfolioContent)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('portfolio-theme')
    return saved === 'light' ? 'light' : portfolioData.settings.defaultTheme as 'dark' | 'light'
  })
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('portfolio-theme', theme)
  }, [theme])

  useEffect(() => {
    if (!__PORTFOLIO_BACKEND_ENABLED__) return
    let active = true
    fetch('/api/content')
      .then((response) => response.ok ? response.json() : null)
      .then((remote: PortfolioContent | null) => {
        if (active && remote?.schemaVersion === 1) setContent(remote)
      })
      .catch(() => undefined)
    return () => { active = false }
  }, [])

  useEffect(() => {
    document.title = content.settings.title
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (description) description.content = content.settings.description
  }, [content.settings])

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
            <div className="eyebrow"><span className="status-dot" /> STUDENT · {content.profile.location.toUpperCase()}</div>
            <h1>Curious by nature.<br /><span>Driven by data.</span></h1>
            <p className="hero-role">{content.profile.headline}</p>
            <p className="hero-intro">{content.profile.intro}</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#contact">Get in touch <ArrowUpRight size={17} /></a>
              <a className="button button-quiet" href="#projects">Explore my work <ArrowDown size={16} /></a>
            </div>
            <div className="hero-socials" aria-label="Social profiles">
              <a href={content.profile.social.github} target="_blank" rel="noreferrer"><Code2 size={16} /> GitHub <ArrowUpRight size={13} /></a>
              <a href={content.profile.social.linkedin} target="_blank" rel="noreferrer"><Link2 size={16} /> LinkedIn <ArrowUpRight size={13} /></a>
            </div>
          </div>
          <figure className="hero-art hero-photo">
            <img src={`${import.meta.env.BASE_URL}images/chandan-kumar.png`} alt={`Portrait of ${content.profile.name}`} width="896" height="1152" />
          </figure>
          <a href="#about" className="scroll-cue" aria-label="Scroll to about section"><span>SCROLL TO EXPLORE</span><ArrowDownRight size={17} /></a>
        </section>

        <section className="intro-strip" aria-label="Personal introduction">
          <div className="section-wrap strip-inner"><span className="strip-index">01 / A LITTLE ABOUT ME</span><p>Learning the tools to make sense of the world, <em>one question at a time.</em></p><span className="strip-spark">✳</span></div>
        </section>

        <section className="content-section section-wrap" id="about">
          <div className="section-heading"><span className="section-index">01</span><div><p className="eyebrow">THE PERSON BEHIND THE SCREEN</p><h2>A learner with<br />a long view.</h2></div><p className="heading-note">Good work starts with good questions.<br />I’m here to keep asking them.</p></div>
          <div className="about-grid">
            <div className="about-main"><p className="lead-copy">{content.profile.about}</p><p className="body-copy">My interests include Python, data analysis, Data Science, Excel, SQL, statistics, Machine Learning, Generative AI, and web development. These are learning interests, not claims of professional proficiency.</p><p className="body-copy">My approach is simple: stay curious, practise the basics, and be honest about what I know and what I still need to learn.</p></div>
            <aside className="about-aside"><div className="aside-rule" /><p className="aside-label">CURRENTLY</p><div className="aside-item"><span className="aside-icon"><GraduationCap size={17} /></span><div><strong>Diploma student</strong><small>Computer Science & Engineering</small></div></div><div className="aside-item"><span className="aside-icon"><BookOpen size={17} /></span><div><strong>Building foundations</strong><small>Python · Data science</small></div></div><div className="aside-item"><span className="aside-icon"><ArrowUpRight size={17} /></span><div><strong>Open to learning</strong><small>New ideas and good questions</small></div></div><a className="text-link" href="#education">My education <ArrowRight size={15} /></a></aside>
          </div>
        </section>

        <section className="skills-section" id="skills"><div className="section-wrap skills-inner">
          <div className="section-heading"><span className="section-index">02</span><div><p className="eyebrow">TOOLS & TOPICS</p><h2>Learning, not<br />overclaiming.</h2></div><p className="heading-note">An honest snapshot of what I’m<br />studying and exploring right now.</p></div>
          <div className="skill-grid">{content.skills.map((skill, index) => { const Icon = categoryIcons[skill.category] ?? Code2; return <article className="skill-item" key={skill.id}><div className="skill-top"><span className="skill-number">{String(index + 1).padStart(2, '0')}</span><Icon size={19} strokeWidth={1.6} /></div><h3>{skill.name}</h3><div className="skill-bottom"><span>{skill.status}</span><span className="skill-line" /></div></article> })}</div>
          <p className="skills-note"><span className="status-dot" /> Skills shown here reflect my current learning stage, not professional proficiency.</p>
        </div></section>

        <section className="content-section section-wrap" id="projects">
          <div className="section-heading"><span className="section-index">03</span><div><p className="eyebrow">SELECTED WORK</p><h2>Small steps.<br />Real practice.</h2></div><p className="heading-note">Only actual personal and beginner work appears here.</p></div>
          {content.projects.filter((project) => project.published).length ? <div className="project-list">{content.projects.filter((project) => project.published).map((project) => <article className="empty-project" key={project.id}><div className="empty-project-mark"><Code2 size={25} /></div><div><span className="eyebrow">{project.status}</span><h3>{project.name}</h3>{project.problem && <p><strong>Problem:</strong> {project.problem}</p>}<p>{project.description}</p>{project.dataset && <p><strong>Dataset:</strong> {project.dataset}</p>}{project.findings && <p><strong>Findings:</strong> {project.findings}</p>}<p>{project.technologies.join(' · ')}</p><div className="project-links">{project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noreferrer">GitHub <ExternalLink size={13} /></a>}{project.demoUrl && <a href={project.demoUrl} target="_blank" rel="noreferrer">Live demo <ExternalLink size={13} /></a>}</div></div></article>)}</div> : <div className="empty-project"><div className="empty-project-mark"><Code2 size={25} /></div><div><span className="eyebrow">THE WORK IS IN PROGRESS</span><h3>First projects are taking shape.</h3><p>Projects will appear here when there is real code and work to share. The learning repository is linked below.</p></div><a className="circle-link" href={content.profile.social.github} target="_blank" rel="noreferrer" aria-label="Visit Chandan's GitHub"><ArrowUpRight size={20} /></a></div>}
        </section>

        <section className="education-section" id="education"><div className="section-wrap education-inner">
          <div className="section-heading"><span className="section-index">04</span><div><p className="eyebrow">EDUCATION</p><h2>Foundations<br />for what’s next.</h2></div><p className="heading-note">A work in progress, in the<br />best possible sense.</p></div>
          {content.education.map((entry) => <div className="education-row" key={entry.id}><div className="education-date">{entry.period}</div><div className="education-degree"><span className="education-icon"><GraduationCap size={20} /></span><div><h3>{entry.title}</h3><p>{entry.institution}</p><p className="education-location">{entry.location}{entry.detail ? ` · ${entry.detail}` : ''}</p></div></div><span className="education-tag">{entry.status.toUpperCase()}</span></div>)}
        </div></section>

        <section className="content-section section-wrap" id="certificates"><div className="section-heading"><span className="section-index">05</span><div><p className="eyebrow">CERTIFICATES</p><h2>Earned, not<br />assumed.</h2></div><p className="heading-note">Only certificates I can verify<br />will be listed here.</p></div>{content.certificates.filter((certificate) => certificate.published).length ? content.certificates.filter((certificate) => certificate.published).map((certificate) => <div className="certificate-empty" key={certificate.id}><Award size={21} /><p>{certificate.title}</p><span>{certificate.issuer}{certificate.date ? ` · ${certificate.date}` : ''}</span>{certificate.fileUrl && <a className="text-link" href={certificate.fileUrl} target="_blank" rel="noreferrer">Open certificate file <ExternalLink size={14} /></a>}{certificate.verificationUrl && <a className="text-link" href={certificate.verificationUrl} target="_blank" rel="noreferrer">Verify certificate <ExternalLink size={14} /></a>}</div>) : <div className="certificate-empty"><Award size={21} /><p>No certificates added yet.</p><span>This section will grow when there are credentials to share.</span></div>}</section>

        <section className="journey-section" id="journey"><div className="section-wrap journey-inner">
          <div className="section-heading"><span className="section-index">06</span><div><p className="eyebrow">LEARNING JOURNEY</p><h2>Progress over<br />performance.</h2></div><p className="heading-note">Roadmap topics reflect verified practice or future plans.</p></div>
          <div className="journey-list">{content.journey.map((item) => <div className="journey-row" key={item.id}><span className={`journey-marker${item.status === 'Learning' || item.status === 'Beginner' ? ' marker-current' : ''}`} /><span className="journey-status">{item.status}</span><h3>{item.title}</h3><span className="journey-detail">{item.detail}</span><ArrowUpRight size={16} /></div>)}<a className="text-link" href="https://github.com/chandankumar25022009-beep/Data-Science" target="_blank" rel="noreferrer">View Data Science learning repository <ArrowUpRight size={15} /></a></div>
        </div></section>

        <section className="resume-section section-wrap" id="resume"><div className="resume-copy"><p className="eyebrow">RESUME</p><h2>My resume.</h2><p>Open the resume. Access depends on the document’s sharing settings.</p></div>{content.resume.isPublic && content.resume.url ? <a className="button button-primary" href={content.resume.url} target="_blank" rel="noreferrer" aria-label="Open resume in a new tab">{content.resume.label} <ExternalLink size={16} /></a> : <span className="email-note">Resume not currently public</span>}</section>

        <section className="contact-section" id="contact"><div className="section-wrap contact-inner"><div className="contact-top"><span className="eyebrow"><span className="status-dot" /> OPEN TO CONNECTING</span><span className="contact-index">07 / GET IN TOUCH</span></div><h2>Have a question<br />or an idea to share<span>?</span></h2><div className="contact-bottom"><p>I’m early in my journey, but always glad to meet people who enjoy learning and building.</p><a className="button button-light" href={content.profile.social.linkedin} target="_blank" rel="noreferrer">Connect on LinkedIn <ArrowUpRight size={17} /></a></div><div className="contact-socials"><a href={content.profile.social.github} target="_blank" rel="noreferrer"><Code2 size={17} /> GitHub <ExternalLink size={13} /></a><a href={content.profile.social.linkedin} target="_blank" rel="noreferrer"><Link2 size={17} /> LinkedIn <ExternalLink size={13} /></a>{content.contact.email ? <a href={`mailto:${content.contact.email}`}><Mail size={16} /> {content.contact.email}</a> : <span className="email-note"><Mail size={16} /> {content.contact.note}</span>}</div></div></section>
      </main>

      <footer className="site-footer"><div className="section-wrap footer-inner"><a className="wordmark footer-wordmark" href="#home"><span className="wordmark-mark">C<span>.</span></span><span className="wordmark-name">{content.profile.name}</span></a><span className="footer-note">Learning in public. Building at my own pace.</span><span className="copyright">© {new Date().getFullYear()} {content.profile.name}</span><a href="#home" className="back-top">BACK TO TOP <ArrowUpRight size={14} /></a></div></footer>
    </div>
  )
}

export default App