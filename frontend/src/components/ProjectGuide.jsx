function LinkList({ items }) {
  return (
    <div className="guide-link-list">
      {items.map((item) => (
        <article key={`${item.label}-${item.url}`} className="guide-link-item">
          <h4>{item.label}</h4>
          <p>{item.note}</p>
          <a href={item.url} target="_blank" rel="noreferrer">
            {item.url}
          </a>
        </article>
      ))}
    </div>
  );
}

export default function ProjectGuide({ text }) {
  return (
    <section className="guide-page">
      <div className="guide-hero">
        <p>{text.guide.eyebrow}</p>
        <h2>{text.guide.title}</h2>
        <span>{text.guide.intro}</span>
      </div>

      <section className="guide-section guide-section-wide">
        <h3>{text.guide.aboutTitle}</h3>
        <p className="guide-paragraph">{text.guide.about}</p>
      </section>

      <div className="guide-grid">
        <section className="guide-section">
          <h3>{text.guide.purposeTitle}</h3>
          <ul className="guide-list">
            {text.guide.purposes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="guide-section">
          <h3>{text.guide.linksTitle}</h3>
          <LinkList items={text.guide.links} />
        </section>
      </div>

      <section className="guide-section guide-section-wide">
        <h3>{text.guide.creditTitle}</h3>
        <p className="guide-paragraph">{text.guide.credit}</p>
        <p className="guide-paragraph">{text.guide.attribution}</p>
      </section>

      <section className="guide-section guide-section-wide">
        <h3>{text.guide.notesTitle}</h3>
        <ul className="guide-list">
          {text.guide.notes.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </section>
  );
}