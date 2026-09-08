import { Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { LanguageProvider } from "./lib/language";
import { PreferencesProvider, useAppReducedMotion } from "./lib/preferences";
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
import Settings from "./pages/Settings";
import FikraAiWidget from "./components/FikraAiWidget";
import { ease } from "./components/motion";
import { useLang } from "./lib/language";

const HIDE_CHROME_ON = new Set(["/quiz", "/login"]);

function Shell() {
  const location = useLocation();
  const hideChrome = HIDE_CHROME_ON.has(location.pathname);
  const hideWidget = hideChrome || location.pathname === "/ai";
  const reduce = useAppReducedMotion();
  const { t } = useLang();

  return (
    <div className="flex min-h-[100dvh] flex-col bg-page text-fg">
      <a href="#main" className="skip-link">
        {t("تخطي إلى المحتوى", "Skip to content")}
      </a>
      {!hideChrome && <Navbar />}
      <main id="main" className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.22, ease }}
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
              <Route path="/settings" element={<Settings />} />
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
      <PreferencesProvider>
        <Shell />
      </PreferencesProvider>
    </LanguageProvider>
  );
}
