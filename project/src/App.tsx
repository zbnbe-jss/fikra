import { Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { LanguageProvider } from "./lib/language";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Quiz from "./pages/Quiz";
import Explore from "./pages/Explore";
import IdeaDetail from "./pages/IdeaDetail";
import Ai from "./pages/Ai";
import About from "./pages/About";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Result from "./pages/Result";
import MyIdea from "./pages/MyIdea";
import Compare from "./pages/Compare";
import SavedIdeas from "./pages/SavedIdeas";
import FikraAiWidget from "./components/FikraAiWidget";
import { ease } from "./components/motion";

// Recovered from the live bundle: login, signup, and quiz render as
// standalone full-page views (no header, footer, or floating AI pill).
// The /ai page keeps header+footer but hides the floating pill.
const HIDE_CHROME_ON = new Set(["/quiz", "/login"]);

function Shell() {
  const location = useLocation();
  const hideChrome = HIDE_CHROME_ON.has(location.pathname);
  const hideWidget = hideChrome || location.pathname === "/ai";
  const reduce = useReducedMotion();

  return (
    <div className="flex min-h-[100dvh] flex-col bg-gradient-to-b from-fikra-50/40 via-white to-ink-50/30 text-ink-900">
      {!hideChrome && <Navbar />}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 1 } : { opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease }}
          >
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/idea/:id" element={<IdeaDetail />} />
              <Route path="/ai" element={<Ai />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/result/latest" element={<Result />} />
              <Route path="/my-idea" element={<MyIdea />} />
              <Route path="/compare" element={<Compare />} />
              <Route path="/saved" element={<SavedIdeas />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      {!hideChrome && <Footer />}
      {!hideWidget && <FikraAiWidget />}
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <Shell />
    </LanguageProvider>
  );
}
