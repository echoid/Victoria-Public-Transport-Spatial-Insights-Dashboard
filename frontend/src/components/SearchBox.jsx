export default function SearchBox({
  query,
  setQuery,
  onSearch,
  results,
  onSelectResult,
  loading,
  error,
  text
}) {
  return (
    <section className="search-panel" aria-label="Location search">
      <div>
        <label htmlFor="location-search">{text.search.label}</label>
        <div className="search-row">
          <input
            id="location-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") onSearch();
            }}
            placeholder={text.search.placeholder}
          />
          <button onClick={onSearch} disabled={loading || query.trim().length < 2}>
            {loading ? text.search.searching : text.search.button}
          </button>
        </div>
      </div>
      <p className="helper">{text.search.helper}</p>
      {error ? <p className="error">{error}</p> : null}
      {results.length > 0 ? (
        <div className="suggestions">
          {results.map((result) => (
            <button key={`${result.lat}-${result.lon}-${result.display_name}`} onClick={() => onSelectResult(result)}>
              <span>{result.display_name}</span>
              <small>{result.type}</small>
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
