with open('src/app/shop/page.tsx', 'r') as f:
    c = f.read()

target = """    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };"""

replacement = """    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };"""

c = c.replace(target, replacement)

with open('src/app/shop/page.tsx', 'w') as f:
    f.write(c)

