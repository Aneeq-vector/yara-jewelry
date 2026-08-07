import os
with open('src/app/checkout/page.tsx', 'r') as f:
    lines = f.readlines()

print("Shipping start:", lines[377].strip())
print("Shipping end:", lines[460].strip())

print("Delivery start:", lines[465].strip())
print("Delivery end:", lines[505].strip())

print("Payment start:", lines[510].strip())
print("Payment end:", lines[589].strip())

print("Review start:", lines[594].strip())
print("Review end:", lines[669].strip())

print("Success start:", lines[283].strip())
print("Success end:", lines[306].strip())

print("Summary start:", lines[706].strip())
print("Summary end:", lines[757].strip())
