import React, { useEffect, useState } from 'react';
import { AnimatePresence, MotionConfig } from 'motion/react';
import { useKyotoEngine } from './hooks/useKyotoEngine';
import { useWindowSize } from './hooks/useWindowSize';
import { HomeView } from './components/HomeView';
import { DetailView } from './components/DetailView';

export default function App() {
  const engine = useKyotoEngine();
  const { activeId, totalCount } = engine;
  const { width } = useWindowSize();
  const [cabinetWard,setCabinetWard]=useState('W_MINAMI');
  const [cabinetPreferences,setCabinetPreferences]=useState({night:true,paused:false});
  useEffect(()=>{document.documentElement.lang=engine.lang==='zh'?'zh-Hant':'ja';},[engine.lang]);

  useEffect(() => {
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', cabinetPreferences.night ? '#1b2228' : '#eee8db');
  }, [cabinetPreferences.night]);

  return (
    <MotionConfig reducedMotion={cabinetPreferences.paused ? "always" : "user"}>
    <div className="kyoto-app" data-theme={cabinetPreferences.night ? "dark" : "light"} data-reduced-motion={cabinetPreferences.paused} lang={engine.lang === "zh" ? "zh-Hant" : "ja"}>
      <div className="app-shell">
        <AnimatePresence mode="wait">
          {!activeId ? (
            <HomeView engine={engine} width={width} totalCount={totalCount}
              cabinetWard={cabinetWard} onCabinetWardChange={setCabinetWard}
              cabinetPreferences={cabinetPreferences} onCabinetPreferencesChange={setCabinetPreferences} />
          ) : (
            <DetailView engine={engine} width={width} preferences={cabinetPreferences} onPreferencesChange={setCabinetPreferences} />
          )}
        </AnimatePresence>
      </div>
    </div>
    </MotionConfig>
  );
}
