import re

with open("src/app/yara-admin/gift-boxes/page.tsx", "r") as f:
    content = f.read()

save_button_component = """
const SaveButton = ({ saveStatus, handleSave }: { saveStatus: SaveStatus; handleSave: () => void }) => (
  <AnimatePresence mode="wait">
    {saveStatus === 'success' ? (
      <motion.div
        key="success"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-white font-ui font-semibold"
      >
        <CheckCircle2 size={16} />
        Saved successfully!
      </motion.div>
    ) : saveStatus === 'error' ? (
      <motion.div
        key="error"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500 text-white font-ui font-semibold"
      >
        <AlertCircle size={16} />
        Error saving. Try again.
      </motion.div>
    ) : (
      <motion.button
        key="save"
        whileTap={{ scale: 0.97 }}
        onClick={handleSave}
        disabled={saveStatus === 'saving'}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-burgundy text-white font-ui font-semibold hover:bg-wine transition-colors shadow-md shadow-burgundy/20 disabled:opacity-60"
      >
        {saveStatus === 'saving' ? (
          <Loader size={16} className="animate-spin" />
        ) : (
          <Save size={16} />
        )}
        Save Box
      </motion.button>
    )}
  </AnimatePresence>
);

export default function GiftBoxesAdminPage() {"""

content = content.replace("export default function GiftBoxesAdminPage() {", save_button_component)

old_save_button_usage = """              <div className="flex items-center gap-4">
                <AnimatePresence mode="wait">
                  {saveStatus === 'success' ? (
                    <motion.div
                      key="success"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-white font-ui font-semibold"
                    >
                      <CheckCircle2 size={16} />
                      Saved successfully!
                    </motion.div>
                  ) : saveStatus === 'error' ? (
                    <motion.div
                      key="error"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500 text-white font-ui font-semibold"
                    >
                      <AlertCircle size={16} />
                      Error saving. Try again.
                    </motion.div>
                  ) : (
                    <motion.button
                      key="save"
                      whileTap={{ scale: 0.97 }}
                      onClick={handleSave}
                      disabled={saveStatus === 'saving'}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-burgundy text-white font-ui font-semibold hover:bg-wine transition-colors shadow-md shadow-burgundy/20 disabled:opacity-60"
                    >
                      {saveStatus === 'saving' ? (
                        <Loader size={16} className="animate-spin" />
                      ) : (
                        <Save size={16} />
                      )}
                      Save Box
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>"""

new_save_button_usage = """              <div className="flex items-center gap-4">
                <SaveButton saveStatus={saveStatus} handleSave={handleSave} />
              </div>"""

content = content.replace(old_save_button_usage, new_save_button_usage)

with open("src/app/yara-admin/gift-boxes/page.tsx", "w") as f:
    f.write(content)
