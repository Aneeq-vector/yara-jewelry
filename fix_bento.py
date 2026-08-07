with open('src/components/home/why-choose-yara.css', 'r') as f:
    c = f.read()

target1 = """  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 2.5rem 5rem;
  align-items: center;"""

replacement1 = """  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2.5rem 5rem;
  align-items: center;"""

c = c.replace(target1, replacement1)

target2 = """.wy-headline-block {
  grid-column: 1;
  grid-row: 1;
}
@media (max-width: 900px) {
  .wy-headline-block { grid-column: 1; grid-row: 1; }
}"""

replacement2 = """.wy-headline-block {
}"""

c = c.replace(target2, replacement2)

target3 = """.wy-stats-strip {
  grid-column: 1;
  grid-row: 2;
  display: flex;
  gap: 1.75rem;
  flex-wrap: wrap;
}
@media (max-width: 900px) {
  .wy-stats-strip { grid-column: 1; grid-row: 2; }
}"""

replacement3 = """.wy-stats-strip {
  display: flex;
  gap: 1.75rem;
  flex-wrap: wrap;
}"""

c = c.replace(target3, replacement3)

target4 = """.wy-cards-col {
  grid-column: 2;
  grid-row: 1 / 3;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
@media (max-width: 900px) {
  .wy-cards-col { grid-column: 1; grid-row: 3; }
}"""

replacement4 = """.wy-cards-col {
  grid-column: 2;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
@media (max-width: 900px) {
  .wy-cards-col { grid-column: 1; }
}"""

c = c.replace(target4, replacement4)

with open('src/components/home/why-choose-yara.css', 'w') as f:
    f.write(c)

