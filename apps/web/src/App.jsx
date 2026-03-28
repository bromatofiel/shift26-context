import { Link, Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { ShareTargetPage } from "./pages/ShareTargetPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/share-target" element={<ShareTargetPage />} />
      <Route
        path="*"
        element={
          <main className="shell">
            <section className="panel">
              <p className="eyebrow">Blind Spot</p>
              <h1>Page not found</h1>
              <p>This route does not exist.</p>
              <Link className="button" to="/">
                Back home
              </Link>
            </section>
          </main>
        }
      />
    </Routes>
  );
}
