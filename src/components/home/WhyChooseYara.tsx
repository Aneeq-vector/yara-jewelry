'use client';

import React, { useRef } from 'react';
import { m as motion, useInView } from 'framer-motion';
import './why-choose-yara.css';
import { MarqueeTicker, FeatureItem } from './WhyChooseYaraFeatures';
import { features } from './why-choose-yara-data';

/* ─────────────────────── Section ─────────────────────── */
export default function WhyChooseYara() {
  const headRef = useRef(null);
  const headInView = useInView(headRef, { once: true, margin: '-80px' });

  return (
    <>
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

          {/* LEFT COL */}
          <div className="wy-left-col flex flex-col justify-center gap-16 lg:gap-24">
            {/* Headline */}
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
                <span className="wy-eyebrow-label">Why Yara Jewellery</span>
              </div>

              <h2 className="wy-heading">
                What Sets Us<br />
                <span className="wy-heading-italic">Apart.</span>
              </h2>

              <p className="wy-body-text">
                We believe luxury jewelry should be accessible, comfortable, and designed for the modern woman — without compromise.
              </p>
            </motion.div>

            {/* Stats */}
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
          </div>

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
