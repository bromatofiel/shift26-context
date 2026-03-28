import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <main className="shell">
      <section className="panel hero">
        <p className="eyebrow">Blind Spot</p>
        <h1>Open a news article from mobile share and scan its missing context.</h1>
        <p className="lede">
          Install the web app, then use your mobile browser share menu to send an
          article into Blind Spot.
        </p>
        <div className="actions">
          <Link className="button" to="/share-target?url=https://example.com/news-story">
            Try the share flow
          </Link>
        </div>
      </section>

      <section className="panel">
        <h2>How the MVP works</h2>
        <ol className="steps">
          <li>Install Blind Spot as a PWA on Android.</li>
          <li>Read a news article in Chrome.</li>
          <li>Tap Share and choose Blind Spot.</li>
          <li>Blind Spot receives the URL and requests an analysis from the Node API.</li>
          <li>The app shows a simple bias color and two counter perspectives.</li>
        </ol>
      </section>
    </main>
  );
}
