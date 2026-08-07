'use client';

import React, { useRef } from 'react';
import { m as motion, useInView } from 'framer-motion';
import { Gem, Feather, Sparkles, Crown } from 'lucide-react';

import { features, ticker } from './why-choose-yara-data';

/* ─────────────────────── Ticker ─────────────────────── */
export function MarqueeTicker() {
  const items = [...ticker, ...ticker, ...ticker].map((text, idx) => ({ id: `${text}-${idx}`, text }));
  return (
    <div style={{ overflow: 'hidden', borderTop: '1px solid #9b3a5a20', borderBottom: '1px solid #9b3a5a20' }}>
      <motion.div
        animate={{ x: ['0%', '-33.33%'] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        style={{ display: 'flex', whiteSpace: 'nowrap', padding: '0.75rem 0' }}
      >
        {items.map((item, i) => (
          <span
            key={item.id}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0 2rem',
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: i % 2 === 0 ? '#9b3a5a' : '#c9856a',
              fontFamily: 'Montserrat, sans-serif',
            }}
          >
            {item.text}
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#c9856a60', flexShrink: 0 }} />
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ─────────────────────── Single card ─────────────────────── */
export function FeatureItem({ f, i }: { f: (typeof features)[0]; i: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const Icon = f.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 44 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay: i * 0.11, ease: [0.22, 1, 0.36, 1] }}
      className="wy-item"
    >
      {/* Number stripe */}
      <div className="wy-num-stripe" style={{ background: f.accent }} />

      {/* Main card box */}
      <div className="wy-card">
        {/* Subtle radial gradient layer */}
        <div
          className="wy-card-bg-gradient"
          style={{
            background: `radial-gradient(120% 120% at top left, ${f.light} 0%, rgba(255,255,255,0) 100%)`,
          }}
        />

        {/* Content wrap */}
        <div className="wy-card-inner">
          <div className="wy-icon-box" style={{ background: f.accent }}>
            <Icon size={20} className="text-white" strokeWidth={1.8} />
          </div>

          <div className="wy-title-row">
            <h3 className="wy-title">{f.title}</h3>
            <span className="wy-num" style={{ color: f.accent }}>
              {f.num}
            </span>
          </div>

          <p className="wy-desc">{f.description}</p>
        </div>
      </div>
    </motion.div>
  );
}
