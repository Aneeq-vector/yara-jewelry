with open('src/app/yara-admin/orders/page.tsx', 'r') as f:
    c = f.read()

target = """    getAllOrdersAction().then(res => {
      if (res.success && res.orders) {
        setOrders(res.orders);
      }
      setLoading(false);
    });"""

replacement = """    getAllOrdersAction().then(res => {
      if (res.success && res.orders) {
        setOrders(res.orders);
      } else if (res.error) {
        console.error("Orders fetch error:", res.error);
        alert("Orders Error: " + res.error);
      }
      setLoading(false);
    }).catch(err => {
      alert("Network Error: " + err);
      setLoading(false);
    });"""

c = c.replace(target, replacement)

with open('src/app/yara-admin/orders/page.tsx', 'w') as f:
    f.write(c)

