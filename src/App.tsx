import React, { useEffect, useMemo } from 'react';
import { AnimatePresence } from 'motion/react';
import { useKyotoEngine } from './hooks/useKyotoEngine';
import { WARD_STATS } from './data/index';
import { useWindowSize } from './hooks/useWindowSize';
import { HomeView } from './components/HomeView';
import { DetailView } from './components/DetailView';

export default function App() {
  const engine = useKyotoEngine();
  const { activeId } = engine;
  const { width } = useWindowSize();

  // 使用全域統計快取來加速
  const totalCount = useMemo(() => Object.values(WARD_STATS).reduce((a, b) => a + b, 0), []);

  // Scroll to top when entering detail view
  useEffect(() => {
    if (activeId) {
      const scrollContainer = document.querySelector('.overflow-y-auto');
      if (scrollContainer) {
        scrollContainer.scrollTop = 0;
      }
    }
  }, [activeId]);

  return (
    <div className="flex justify-center h-full bg-[#050505]">
      <div className="w-full h-full bg-[#0c0b0a] text-[#f0ead6] relative overflow-hidden shadow-2xl urushi-panel border-x border-gold/20">
        <AnimatePresence mode="wait">
          {!activeId ? (
            <HomeView engine={engine} width={width} totalCount={totalCount} />
          ) : (
            <DetailView engine={engine} width={width} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
