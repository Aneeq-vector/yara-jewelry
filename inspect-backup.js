const Database = require('better-sqlite3');
const db = new Database('/tmp/yara-pb-backup/data.db', { readonly: true });

try {
  // Check orders table
  const countRow = db.prepare("SELECT count(*) as count FROM orders").get();
  console.log("BACKUP ORDER COUNT:", countRow.count);

  if (countRow.count > 0) {
    const earliest = db.prepare("SELECT created FROM orders ORDER BY created ASC LIMIT 1").get();
    const latest = db.prepare("SELECT created FROM orders ORDER BY created DESC LIMIT 1").get();
    console.log("EARLIEST ORDER:", earliest.created);
    console.log("LATEST ORDER:", latest.created);
    
    const schema = db.prepare("PRAGMA table_info(orders)").all();
    console.log("ORDERS SCHEMA:");
    schema.forEach(col => console.log(`${col.name}: ${col.type}`));
  }
} catch (e) {
  console.error("Error inspecting backup:", e.message);
} finally {
  db.close();
}
