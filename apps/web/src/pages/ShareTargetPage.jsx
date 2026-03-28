import { useEffect, useMemo, useState } from "react";

export function ShareTargetPage() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const [state, setState] = useState("loading");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const url = params.get("url");
    const title = params.get("title");
    const text = params.get("text");

    if (!url) {
      setError("No article URL was received from the share action.");
      setState("error");
      return;
    }

    fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url,
        title_hint: title,
        text_hint: text,
        locale: navigator.language,
        source: "pwa_share_target"
      })
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Analysis failed.");
        }
        return data;
      })
      .then((data) => {
        setResult(data);
        setState("done");
      })
      .catch((err) => {
        setError(err.message);
        setState("error");
      });
  }, [params]);

  if (state === "loading") {
    return (
      <main className="shell">
        <section className="panel">
          <p className="eyebrow">Blind Spot</p>
          <h1>Scanning the article</h1>
          <p className="lede">Finding the source, comparing coverage, and building context.</p>
          <div className="loader" />
        </section>
      </main>
    );
  }

  if (state === "error") {
    return (
      <main className="shell">
        <section className="panel">
          <p className="eyebrow">Blind Spot</p>
          <h1>Analysis unavailable</h1>
          <p className="lede">{error}</p>
        </section>
      </main>
    );
  }

  const color = result.source_article.bias.color;
  const colorClass = `badge ${color}`;

  return (
    <main className="shell">
      <section className="panel">
        <p className="eyebrow">Blind Spot</p>
        <h1>{result.source_article.title}</h1>
        <div className="summary-row">
          <span className={colorClass}>{color}</span>
          <span className="meta">{result.source_article.media}</span>
        </div>
        <p className="lede">{result.global_context}</p>
      </section>

      <section className="panel">
        <h2>Why this score</h2>
        <ul className="tags">
          {result.source_article.bias.main_signals.map((signal) => (
            <li key={signal}>{signal}</li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <h2>Other angles</h2>
        <div className="card-list">
          {result.counter_perspectives.map((item) => (
            <article className="card" key={item.url}>
              <p className="card-kicker">{item.media}</p>
              <h3>{item.stance}</h3>
              <p>{item.missing_fact}</p>
              <a className="text-link" href={item.url} target="_blank" rel="noreferrer">
                Open source
              </a>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
