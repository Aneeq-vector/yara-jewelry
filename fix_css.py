with open('src/components/home/why-choose-yara.css', 'r') as f:
    c = f.read()

target = """.wy-card {
  position: relative;
  overflow: hidden;
  background: #ffffff;
  border-radius: 20px;
  padding: 2rem;
  height: 100%;
}"""

replacement = """.wy-card {
  position: relative;
  overflow: hidden;
  background: transparent;
  padding: 2rem;
  height: 100%;
}"""

c = c.replace(target, replacement)

with open('src/components/home/why-choose-yara.css', 'w') as f:
    f.write(c)
