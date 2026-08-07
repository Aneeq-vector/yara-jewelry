import os

page_path = 'src/app/checkout/page.tsx'
with open(page_path, 'r') as f:
    content = f.read()

shipping_start = content.find('<motion.div\\n                    key="shipping"')
shipping_end = content.find('</motion.div>', shipping_start) + len('</motion.div>')
shipping_block = content[shipping_start:shipping_end]

delivery_start = content.find('<motion.div\\n                    key="delivery"')
delivery_end = content.find('</motion.div>', delivery_start) + len('</motion.div>')
delivery_block = content[delivery_start:delivery_end]

payment_start = content.find('<motion.div\\n                    key="payment"')
payment_end = content.find('</motion.div>', payment_start) + len('</motion.div>')
payment_block = content[payment_start:payment_end]

review_start = content.find('<motion.div\\n                    key="review"')
review_end = content.find('</motion.div>', review_start) + len('</motion.div>')
review_block = content[review_start:review_end]

summary_start = content.find('<div className="glass-card rounded-3xl p-6 sticky top-28">')
summary_end = content.find('</div>\\n            </div>\\n          </div>', summary_start) + len('</div>')
summary_block = content[summary_start:summary_end]

# For success, we just replace the whole if statement
success_start = content.find('if (orderPlaced) {')
success_end = content.find('if (items.length === 0 && !orderPlaced) {')
success_block = content[success_start:success_end].strip()

# Print blocks to verify
print("Shipping:", len(shipping_block))
print("Delivery:", len(delivery_block))
print("Payment:", len(payment_block))
print("Review:", len(review_block))
print("Summary:", len(summary_block))
print("Success:", len(success_block))
