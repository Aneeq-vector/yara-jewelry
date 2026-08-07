import { m as motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export function SizeGuideModal({ isSizeGuideOpen, setIsSizeGuideOpen }: any) {
  return (
      <AnimatePresence>
        {isSizeGuideOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.button
              type="button"
              aria-label="Close size guide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSizeGuideOpen(false)}
              className="absolute inset-0 w-full h-full bg-burgundy/40 backdrop-blur-sm cursor-default border-0 p-0 m-0"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-ivory rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 sm:px-10 sm:py-6 border-b border-burgundy/10 shrink-0 bg-ivory z-10">
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-burgundy">Size Guide</h2>
                <button
                  onClick={() => setIsSizeGuideOpen(false)}
                  aria-label="Interactive control" className="p-2 rounded-full bg-champagne text-burgundy hover:bg-rose-gold/20 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 sm:px-10 sm:py-8 overflow-y-auto flex-1">
                <p className="font-body text-sm text-burgundy/60 mb-8">
                  Use this guide to find your perfect fit. Measurements are approximate and may vary slightly by style.
                </p>
              
              <div className="space-y-8">
                <div>
                  <h3 className="font-ui font-bold text-sm uppercase tracking-wider text-rose-gold mb-4">Necklaces</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm font-body text-left border-collapse">
                      <thead>
                        <tr className="border-b border-burgundy/10 text-burgundy/80">
                          <th className="pb-3 font-semibold">Style</th>
                          <th className="pb-3 font-semibold">Length (inches)</th>
                          <th className="pb-3 font-semibold">Length (cm)</th>
                        </tr>
                      </thead>
                      <tbody className="text-burgundy/60">
                        <tr className="border-b border-burgundy/5">
                          <td className="py-3">Choker</td>
                          <td className="py-3">14&quot; - 16&quot;</td>
                          <td className="py-3">35 - 40 cm</td>
                        </tr>
                        <tr className="border-b border-burgundy/5">
                          <td className="py-3">Princess</td>
                          <td className="py-3">18&quot;</td>
                          <td className="py-3">45 cm</td>
                        </tr>
                        <tr className="border-b border-burgundy/5">
                          <td className="py-3">Matinee</td>
                          <td className="py-3">20&quot; - 24&quot;</td>
                          <td className="py-3">50 - 60 cm</td>
                        </tr>
                        <tr>
                          <td className="py-3">Opera</td>
                          <td className="py-3">28&quot; - 36&quot;</td>
                          <td className="py-3">71 - 91 cm</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h3 className="font-ui font-bold text-sm uppercase tracking-wider text-rose-gold mb-4">Rings</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm font-body text-left border-collapse">
                      <thead>
                        <tr className="border-b border-burgundy/10 text-burgundy/80">
                          <th className="pb-3 font-semibold">US Size</th>
                          <th className="pb-3 font-semibold">UK/AU Size</th>
                          <th className="pb-3 font-semibold">Inner Circumference (mm)</th>
                        </tr>
                      </thead>
                      <tbody className="text-burgundy/60">
                        <tr className="border-b border-burgundy/5">
                          <td className="py-3">5</td>
                          <td className="py-3">J 1/2</td>
                          <td className="py-3">49.3</td>
                        </tr>
                        <tr className="border-b border-burgundy/5">
                          <td className="py-3">6</td>
                          <td className="py-3">M</td>
                          <td className="py-3">51.9</td>
                        </tr>
                        <tr className="border-b border-burgundy/5">
                          <td className="py-3">7</td>
                          <td className="py-3">O</td>
                          <td className="py-3">54.4</td>
                        </tr>
                        <tr>
                          <td className="py-3">8</td>
                          <td className="py-3">Q</td>
                          <td className="py-3">57.0</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

  );
}
