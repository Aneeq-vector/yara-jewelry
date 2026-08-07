with open('src/app/actions/orders.ts', 'r') as f:
    c = f.read()

target = """    const records = await pb.collection('orders').getFullList({
      sort: '-orderDate',
      expand: 'user,items'
    });"""

replacement = """    const records = await pb.collection('orders').getFullList({
      sort: '-created',
      expand: 'user'
    });"""

c = c.replace(target, replacement)

with open('src/app/actions/orders.ts', 'w') as f:
    f.write(c)

