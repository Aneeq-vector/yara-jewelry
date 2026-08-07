import re

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    lines = content.split('\n')
    for i in range(len(lines)):
        if 'transition-all' in lines[i]:
            # if it's the width animation
            if 'w-full' in lines[i] or 'w-0' in lines[i]:
                lines[i] = lines[i].replace('transition-all', 'transition-[width]')
            elif 'py-3' in lines[i] or 'py-5' in lines[i]:
                # The navbar background, shadow and padding animation
                lines[i] = lines[i].replace('transition-all', 'transition-[padding,background-color,box-shadow]')
            else:
                # Normal cases (colors, opacity, bg)
                lines[i] = lines[i].replace('transition-all', 'transition-colors')
                
    with open(filepath, 'w') as f:
        f.write('\n'.join(lines))

fix_file("src/app/checkout/components/CheckoutPaymentStep.tsx")
fix_file("src/components/layout/Navbar.tsx")
