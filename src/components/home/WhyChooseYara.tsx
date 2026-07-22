'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Gem, Feather, Sparkles, Crown } from 'lucide-react';

/* ─────────────────────── Data ─────────────────────── */
const features = [
  {
    num: '01',
    icon: Gem,
    title: 'Premium Craftsmanship',
    description:
      'Each piece is meticulously crafted with attention to the finest details, ensuring a premium finish that rivals fine jewelry.',
    accent: '#9b3a5a',
    light: '#f9ecef',
  },
  {
    num: '02',
    icon: Feather,
    title: 'Designed with Love',
    description:
      'Our designs are born from a passion for beauty and a deep understanding of modern women who appreciate elegance.',
    accent: '#c9856a',
    light: '#faf3ef',
  },
  {
    num: '03',
    icon: Sparkles,
    title: 'Trendsetting Style',
    description:
      'We stay ahead of global fashion trends, bringing you designs that are fresh, modern, and utterly fashion-forward.',
    accent: '#9b3a5a',
    light: '#f9ecef',
  },
  {
    num: '04',
    icon: Crown,
    title: 'Accessible Luxury',
    description:
      'We believe every woman deserves to feel luxurious. Our pricing makes premium jewelry accessible to all.',
    accent: '#c9856a',
    light: '#faf3ef',
  },
];

const ticker = ['10K+ Customers', '200+ Styles', '4.8★ Rated', 'Est. 2021', 'Worldwide Shipping', 'Handcrafted'];

/* ─────────────────────── Ticker ─────────────────────── */
function MarqueeTicker() {
  const items = [...ticker, ...ticker, ...ticker];
  return (
    <div style={{ overflow: 'hidden', borderTop: '1px solid #9b3a5a20', borderBottom: '1px solid #9b3a5a20' }}>
      <motion.div
        animate={{ x: ['0%', '-33.33%'] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        style={{ display: 'flex', whiteSpace: 'nowrap', padding: '0.75rem 0' }}
      >
        {items.map((item, i) => (
          <span
            key={i}
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
            {item}
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#c9856a60', flexShrink: 0 }} />
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ─────────────────────── Single card ─────────────────────── */
function FeatureItem({ f, i }: { f: (typeof features)[0]; i: number }) {
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

      {/* Watermark number */}
      <div className="wy-watermark" style={{ color: f.accent }}>
        {f.num}
      </div>

      <div className="wy-item-body">
        {/* Icon circle */}
        <div className="wy-icon-circle" style={{ background: f.light, border: `1.5px solid ${f.accent}25` }}>
          <Icon size={18} style={{ color: f.accent }} strokeWidth={1.5} />
        </div>

        {/* Text */}
        <div className="wy-text">
          <h3 className="wy-item-title">{f.title}</h3>
          <p className="wy-item-desc">{f.description}</p>
        </div>
      </div>

    </motion.div>
  );
}

/* ─────────────────────── Section ─────────────────────── */
export default function WhyChooseYara() {
  const headRef = useRef(null);
  const headInView = useInView(headRef, { once: true, margin: '-80px' });

  return (
    <>
      <style>{`
        /* ── Section shell ── */
        .wy-section {
          position: relative;
          background: #fdf9f6;
          overflow: hidden;
        }

        /* ── Orb blobs ── */
        .wy-blob {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(90px);
        }

        /* ── Bento wrapper ── */
        .wy-bento {
          max-width: 1200px;
          margin: 0 auto;
          padding: 5.5rem 1.5rem 6rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: auto auto;
          gap: 2.5rem 5rem;
          align-items: center;
        }
        @media (max-width: 900px) {
          .wy-bento {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }
        }

        /* ── Left headline block ── */
        .wy-headline-block {
          grid-column: 1;
          grid-row: 1;
        }
        @media (max-width: 900px) {
          .wy-headline-block { grid-column: 1; grid-row: 1; }
        }

        .wy-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          margin-bottom: 1.5rem;
        }
        .wy-eyebrow-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #c9856a;
          flex-shrink: 0;
        }
        .wy-eyebrow-label {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.62rem;
          font-weight: 800;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: #c9856a;
        }

        .wy-heading {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.6rem, 4.8vw, 4.4rem);
          font-weight: 700;
          line-height: 1.04;
          color: #2e0e16;
          letter-spacing: -0.025em;
          margin-bottom: 1.4rem;
        }
        .wy-heading-italic {
          font-style: italic;
          color: #c9856a;
        }

        .wy-body-text {
          font-family: 'Lato', sans-serif;
          font-size: 0.875rem;
          color: #4a1c27;
          opacity: 0.52;
          line-height: 1.75;
          max-width: 23rem;
        }

        /* ── Stats strip (left col, row 2) ── */
        .wy-stats-strip {
          grid-column: 1;
          grid-row: 2;
          display: flex;
          gap: 1.75rem;
          flex-wrap: wrap;
        }
        @media (max-width: 900px) {
          .wy-stats-strip { grid-column: 1; grid-row: 2; }
        }

        .wy-stat {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }
        .wy-stat-val {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.2rem;
          font-weight: 700;
          line-height: 1;
          color: #9b3a5a;
          letter-spacing: -0.03em;
        }
        .wy-stat-label {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.58rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #4a1c27;
          opacity: 0.4;
        }
        .wy-stat-divider {
          width: 1px;
          height: 2.4rem;
          background: #9b3a5a20;
          align-self: center;
        }

        /* ── Cards stack (right col, spans both rows) ── */
        .wy-cards-col {
          grid-column: 2;
          grid-row: 1 / 3;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        @media (max-width: 900px) {
          .wy-cards-col { grid-column: 1; grid-row: 3; }
        }

        /* ── Individual card ── */
        .wy-item {
          position: relative;
          display: flex;
          flex-direction: column;
          border-radius: 20px;
          background: #fff;
          border: 1px solid #e8d5cc35;
          overflow: hidden;
          cursor: default;
          transition: box-shadow 0.35s ease, transform 0.35s cubic-bezier(0.22,1,0.36,1), border-color 0.3s ease;
        }
        .wy-item:hover {
          box-shadow: 0 16px 50px -10px rgba(155,58,90,0.13);
          transform: translateY(-6px);
          border-color: #c9856a28;
        }

        /* Number left stripe */
        .wy-num-stripe {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          transition: width 0.35s cubic-bezier(0.22,1,0.36,1);
          border-radius: 20px 0 0 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .wy-item:hover .wy-num-stripe {
          width: 5px;
        }
        .wy-watermark {
          position: absolute;
          bottom: -0.8rem;
          right: 0.5rem;
          font-family: 'Cormorant Garamond', serif;
          font-size: 5.5rem;
          font-weight: 900;
          line-height: 1;
          opacity: 0.05;
          user-select: none;
          pointer-events: none;
          transition: opacity 0.35s ease, transform 0.35s ease;
        }
        .wy-item:hover .wy-watermark {
          opacity: 0.12;
          transform: translateY(-5px);
        }

        .wy-item-body {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.35rem 1.5rem 1.4rem 1.5rem;
        }

        .wy-icon-circle {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.3s ease;
        }
        .wy-item:hover .wy-icon-circle {
          transform: scale(1.1) rotate(-5deg);
        }

        .wy-text {
          flex: 1;
        }
        .wy-item-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.22rem;
          font-weight: 700;
          color: #2e0e16;
          line-height: 1.2;
          margin-bottom: 0.45rem;
          letter-spacing: -0.01em;
        }
        .wy-item-desc {
          font-family: 'Lato', sans-serif;
          font-size: 0.8rem;
          color: #4a1c27;
          opacity: 0.5;
          line-height: 1.7;
        }
      `}</style>

      <section className="wy-section">
        {/* Soft background orbs */}
        <div
          className="wy-blob"
          style={{ top: '-15%', left: '-10%', width: 500, height: 500, background: 'radial-gradient(circle, #c9856a14, transparent 70%)' }}
        />
        <div
          className="wy-blob"
          style={{ bottom: '-12%', right: '-8%', width: 440, height: 440, background: 'radial-gradient(circle, #9b3a5a10, transparent 70%)' }}
        />

        {/* ── Marquee ticker ── */}
        <MarqueeTicker />

        {/* ── Bento grid ── */}
        <div className="wy-bento">

          {/* LEFT COL ROW 1 — Headline */}
          <motion.div
            className="wy-headline-block"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            ref={headRef}
          >
            <div className="wy-eyebrow">
              <span className="wy-eyebrow-dot" />
              <span className="wy-eyebrow-label">Why Yara</span>
            </div>

            <h2 className="wy-heading">
              What Sets Us<br />
              <span className="wy-heading-italic">Apart.</span>
            </h2>

            <p className="wy-body-text">
              We believe luxury jewelry should be accessible, comfortable, and designed for the modern woman — without compromise.
            </p>
          </motion.div>

          {/* LEFT COL ROW 2 — Stats */}
          <motion.div
            className="wy-stats-strip"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.65, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            {[
              { val: '10K+', label: 'Happy Customers' },
              { val: '200+', label: 'Unique Styles' },
              { val: '4.8★', label: 'Avg. Rating' },
            ].map((s, i) => (
              <React.Fragment key={s.label}>
                {i > 0 && <div className="wy-stat-divider" />}
                <div className="wy-stat">
                  <span className="wy-stat-val">{s.val}</span>
                  <span className="wy-stat-label">{s.label}</span>
                </div>
              </React.Fragment>
            ))}
          </motion.div>

          {/* RIGHT COL — Feature cards */}
          <div className="wy-cards-col">
            {features.map((f, i) => (
              <FeatureItem key={f.num} f={f} i={i} />
            ))}
          </div>

        </div>
      </section>
    </>
  );
}
