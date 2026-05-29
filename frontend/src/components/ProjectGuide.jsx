import { useState } from "react";

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
  const [activeTab, setActiveTab] = useState("home");
  const active = text.guide[activeTab];

  return (
    <section className="guide-page">
      <div className="guide-hero">
        <p>{text.guide.eyebrow}</p>
        <h2>{text.guide.title}</h2>
        <span>{text.guide.intro}</span>
      </div>

      <div className="guide-tabs" role="tablist" aria-label={text.guide.title}>
        {Object.entries(text.guide.tabs).map(([key, label]) => (
          <button key={key} className={activeTab === key ? "active" : ""} onClick={() => setActiveTab(key)}>
            {label}
          </button>
        ))}
      </div>

      <section className="guide-section guide-section-wide">
        <h3>{active.overviewTitle}</h3>
        <p className="guide-paragraph">{active.overview}</p>
      </section>

      <div className="guide-grid">
        <section className="guide-section">
          <h3>{active.dataTitle || active.linksTitle}</h3>
          {active.dataSources ? <LinkList items={active.dataSources} /> : <LinkList items={active.links} />}
        </section>

        <section className="guide-section">
          <h3>{active.processTitle || active.flowTitle}</h3>
          <ol className="guide-list guide-list-numbered">
            {(active.process || active.flow).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </section>
      </div>

      <section className="guide-section guide-section-wide">
        <h3>{active.notesTitle || active.outputsTitle}</h3>
        <ul className="guide-list">
          {(active.notes || active.outputs).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      {active.scoring ? (
        <section className="guide-section guide-section-wide">
          <h3>{active.scoring.title}</h3>
          <p className="guide-paragraph">{active.scoring.intro}</p>
          <table>
            <thead>
              <tr>
                <th>{active.scoring.dimensionLabel}</th>
                <th>{active.scoring.weightLabel}</th>
                <th>{active.scoring.criteriaLabel}</th>
              </tr>
            </thead>
            <tbody>
              {active.scoring.criteria.map((item) => (
                <tr key={item.dimension}>
                  <td>{item.dimension}</td>
                  <td>{item.weight}</td>
                  <td>{item.criteria}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <ul className="guide-list">
            {active.scoring.limitations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </section>
  );
}