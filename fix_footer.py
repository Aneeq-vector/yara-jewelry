with open('src/components/layout/Footer.tsx', 'r') as f:
    c = f.read()

old_form = """            <div className="flex w-full max-w-md">
              <input aria-label="Your email address"
                type="email"
                placeholder="Your email address"
                className="flex-1 min-w-0 bg-ivory/10 border border-ivory/20 rounded-l-full px-4 sm:px-6 py-3.5 text-sm font-body text-ivory placeholder:text-ivory/40 focus:outline-none focus:border-rose-gold/50 transition-colors"
              />
              <button className="bg-gradient-to-r from-rose-gold to-rose-gold-light text-burgundy border border-transparent px-4 sm:px-6 py-3.5 rounded-r-full font-ui font-semibold text-sm uppercase tracking-wider hover:opacity-90 transition-opacity whitespace-nowrap">
                Subscribe
              </button>
            </div>"""

new_form = """            <div className="flex w-full max-w-md border border-ivory/20 rounded-full overflow-hidden focus-within:border-rose-gold/50 transition-colors bg-ivory/10">
              <input aria-label="Your email address"
                type="email"
                placeholder="Your email address"
                className="flex-1 min-w-0 bg-transparent px-4 sm:px-6 py-3.5 text-sm font-body text-ivory placeholder:text-ivory/40 focus:outline-none"
              />
              <button className="bg-gradient-to-r from-rose-gold to-rose-gold-light text-burgundy px-5 sm:px-8 py-3.5 font-ui font-semibold text-sm uppercase tracking-wider hover:opacity-90 transition-opacity whitespace-nowrap">
                Subscribe
              </button>
            </div>"""

c = c.replace(old_form, new_form)

with open('src/components/layout/Footer.tsx', 'w') as f:
    f.write(c)

