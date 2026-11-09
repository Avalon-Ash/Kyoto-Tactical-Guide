import { useEffect, useState } from 'react';
import { AnimatePresence, MotionConfig } from 'motion/react';
import { useKyotoEngine } from './hooks/useKyotoEngine';
import { HomeView } from './components/HomeView';
import { DetailView } from './components/DetailView';
import type { BunkoPreferences } from './components/BunkoEntrance';

/** Matches --entry-paper in theme.css so the browser chrome blends with the page. */
const THEME_COLOR = { dark: '#1b2228', light: '#eee8db' };

export default function App() {
  const engine = useKyotoEngine();
  const [cabinetWard, setCabinetWard] = useState('W_MINAMI');
  const [preferences, setPreferences] = useState<BunkoPreferences>({ night: true, paused: false });
  const theme = preferences.night ? 'dark' : 'light';
  const lang = engine.lang === 'zh' ? 'zh-Hant' : 'ja';

  // The root carries theme and language too, so overscroll, scrollbars and the browser chrome follow the app.
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme]);
  }, [theme]);

  return (
    <MotionConfig reducedMotion={preferences.paused ? 'always' : 'user'}>
      <div className="kyoto-app" data-theme={theme} data-reduced-motion={preferences.paused} lang={lang}>
        <div className="app-shell">
          <AnimatePresence mode="wait">
            {!engine.activeId ? (
              <HomeView engine={engine} cabinetWard={cabinetWard} onCabinetWardChange={setCabinetWard}
                cabinetPreferences={preferences} onCabinetPreferencesChange={setPreferences} />
            ) : (
              <DetailView engine={engine} preferences={preferences} onPreferencesChange={setPreferences} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </MotionConfig>
  );
}
