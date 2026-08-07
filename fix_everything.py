import re

# 1. CustomBoxBuilder.tsx
with open('src/components/shop/CustomBoxBuilder.tsx', 'r') as f:
    c = f.read()
# LazyMotion
c = c.replace("import { motion, AnimatePresence } from 'framer-motion';", "import { m as motion, LazyMotion, domAnimation, AnimatePresence } from 'framer-motion';")
c = c.replace('return (\n    <div', 'return (\n    <LazyMotion features={domAnimation}>\n    <div')
c = c.replace('    </div>\n  );\n}', '    </div>\n    </LazyMotion>\n  );\n}')
# missing-sizes
c = c.replace('fill\n                      className="object-cover"', 'fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"\n                      className="object-cover"')
# rerender-memo-with-default-value
c = c.replace('export default function CustomBoxBuilder({\n  baseBox,\n  initialSelectedItems = [],\n  categories = [],\n}: CustomBoxBuilderProps) {', 'const emptyArray: any[] = [];\nexport default function CustomBoxBuilder({\n  baseBox,\n  initialSelectedItems = emptyArray,\n  categories = emptyArray,\n}: CustomBoxBuilderProps) {')
# combine iterations line 54 and 62
c = c.replace('.filter((p) => p.is_active)\n      .map((p) => ({', '.reduce((acc: any[], p: any) => { if (p.is_active) acc.push({')
c = c.replace('category: p.category,\n      }))', 'category: p.category,\n      }); return acc; }, [])')
# transition-all
c = c.replace('transition-all', 'transition-colors')
# control-has-associated-label
c = c.replace('<button\n                          onClick={() => toggleColor(p.id, color)}', '<button\n                          aria-label="Toggle color"\n                          onClick={() => toggleColor(p.id, color)}')
with open('src/components/shop/CustomBoxBuilder.tsx', 'w') as f:
    f.write(c)

# 2. gift-boxes/page.tsx
with open('src/app/yara-admin/gift-boxes/page.tsx', 'r') as f:
    c = f.read()
# LazyMotion
c = c.replace("import { motion, AnimatePresence } from 'framer-motion';", "import { m as motion, LazyMotion, domAnimation, AnimatePresence } from 'framer-motion';")
c = c.replace('return (\n    <div className="space-y-6', 'return (\n    <LazyMotion features={domAnimation}>\n    <div className="space-y-6')
c = c.replace('    </div>\n  );\n}', '    </div>\n    </LazyMotion>\n  );\n}')
# missing-sizes
c = c.replace('fill\n                  className="object-cover"', 'fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"\n                  className="object-cover"')
c = c.replace('fill\n                            className="object-cover"', 'fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"\n                            className="object-cover"')
c = c.replace('fill\n                                className="object-cover"', 'fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"\n                                className="object-cover"')
with open('src/app/yara-admin/gift-boxes/page.tsx', 'w') as f:
    f.write(c)

# 3. CustomBoxSidebar.tsx
with open('src/components/shop/CustomBoxSidebar.tsx', 'r') as f:
    c = f.read()
c = c.replace('fill\n                    className="object-cover"', 'fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"\n                    className="object-cover"')
c = c.replace('<button\n                            onClick={() => handleRemoveItem(item.product.id, item.color)}', '<button\n                            aria-label="Remove item"\n                            onClick={() => handleRemoveItem(item.product.id, item.color)}')
c = c.replace('<button\n                            onClick={() => handleAddItem(item.product, item.color)}', '<button\n                            aria-label="Add item"\n                            onClick={() => handleAddItem(item.product, item.color)}')
c = c.replace('<AnimatePresence>', '<div>')
c = c.replace('</AnimatePresence>', '</div>')
with open('src/components/shop/CustomBoxSidebar.tsx', 'w') as f:
    f.write(c)

