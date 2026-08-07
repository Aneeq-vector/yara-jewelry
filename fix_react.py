with open('src/components/home/WhyChooseYara.tsx', 'r') as f:
    c = f.read()

target = """          {/* LEFT COL ROW 1 — Headline */}
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
          >"""

replacement = """          {/* LEFT COL */}
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

            {/* Stats */}
            <motion.div
              className="wy-stats-strip"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.65, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            >"""

c = c.replace(target, replacement)

target2 = """            ))}
          </motion.div>

          {/* RIGHT COL — Feature cards */}
          <div className="wy-cards-col">"""

replacement2 = """            ))}
            </motion.div>
          </div>

          {/* RIGHT COL — Feature cards */}
          <div className="wy-cards-col">"""

c = c.replace(target2, replacement2)

with open('src/components/home/WhyChooseYara.tsx', 'w') as f:
    f.write(c)

