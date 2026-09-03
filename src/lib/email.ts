import nodemailer from 'nodemailer';

// Configure the email transporter using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || '',
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

interface InvoiceDetails {
  orderId: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  paymentMethod: string;
  totalAmount: string;
  cartDetails: string;
}

function escapeHtml(unsafe: string) {
  return String(unsafe || '').replace(/[&<"'>]/g, function (match) {
    switch (match) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#039;';
      default: return match;
    }
  });
}

export async function sendInvoiceEmail(details: InvoiceDetails) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('Email skipped: SMTP credentials not configured.');
    return { success: false, error: 'SMTP not configured' };
  }

  // Parse cart details for the HTML template
  let itemsHtml = '';
  let computedSubtotal = 0;
  
  try {
    const items = JSON.parse(details.cartDetails);
    
    if (Array.isArray(items)) {
      items.forEach((item: any) => {
        let quantity = 1;
        let titleMain = '';
        let price = 0;
        let meta = '';
        
        // Handle metadata-only items (e.g. notes, source)
        if (item.type === 'metadata') {
          return; // Skip displaying internal metadata rows like "Source: admin" as line items
        }

        if (typeof item === 'string') {
          // Legacy string format
          quantity = 1;
          titleMain = item;
          
          const qtyMatch = item.match(/^(\d+)x\s+(.*)/);
          if (qtyMatch) {
            quantity = parseInt(qtyMatch[1], 10) || 1;
            titleMain = qtyMatch[2];
          }
          
          const priceMatch = titleMain.match(/(.*)\s+-\s+Rs\.\s+([\d,.]+)/);
          if (priceMatch) {
            titleMain = priceMatch[1];
            price = parseFloat(priceMatch[2].replace(/,/g, '')) || 0;
          }
          
          if (titleMain.includes('Custom Box')) {
             const boxMatch = titleMain.match(/(Custom Box.*?)\s+-\s+Items:\s+(.*)/);
             if (boxMatch) {
               titleMain = boxMatch[1];
               meta = boxMatch[2];
             }
          } else {
             const attrMatch = titleMain.match(/(.*?)\s+\[(.*?)\]$/);
             if (attrMatch) {
               titleMain = attrMatch[1];
               meta = attrMatch[2];
             }
          }
          
          // Legacy titles might contain the product code, we strip it out if it matches exactly at the end
          titleMain = titleMain.replace(/\s*\([^)]+\)$/, '').trim();
          
        } else if (typeof item === 'object' && item !== null) {
          // New structured format
          quantity = Number(item.quantity) || 1;
          titleMain = item.productName || 'Unknown Product';
          
          // Strip out the ID/code if it was appended (e.g. "(YR-362528)")
          titleMain = titleMain.replace(/\s*\([^)]+\)$/, '').trim();
          
          price = Number(item.unitPrice) || 0;
          
          if (item.type === 'fixed_box' || item.type === 'custom_box') {
             if (Array.isArray(item.boxItems) && item.boxItems.length > 0) {
               meta = item.boxItems.join('<br/>');
             }
          } else if (item.extras) {
             meta = item.extras;
          }
          
          if (item.color) {
             const colorStr = `Color: ${item.color}`;
             meta = meta ? `${meta} | ${colorStr}` : colorStr;
          }
        }
        
        const lineTotal = price * quantity;
        computedSubtotal += lineTotal;
        
        // Escape HTML for safety
        const safeTitle = escapeHtml(titleMain);
        // Do not escape meta if it contains <br/> from our own logic, but we must escape the raw content
        const safeMeta = typeof item === 'object' && Array.isArray(item.boxItems) 
          ? item.boxItems.map((b: string) => escapeHtml(b)).join('<br/>')
          : escapeHtml(meta);

        itemsHtml += `
          <tr>
            <td style="padding: 20px 0; border-bottom: 1px solid #eee;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td valign="top" style="padding-right: 15px;">
                    <p style="margin: 0; color: #4a1c27; font-size: 14px; font-weight: 600;">${safeTitle}</p>
                    <p style="margin: 5px 0 0 0; color: #4a1c27; font-size: 12px; font-weight: 500;">Qty: ${quantity}</p>
                    ${safeMeta ? `<p style="margin: 4px 0 0 0; color: #888888; font-size: 12px; line-height: 1.4;">${safeMeta}</p>` : ''}
                  </td>
                  <td width="90" valign="top" align="right">
                    <p style="margin: 0; color: #4a1c27; font-size: 14px; font-weight: 600;">Rs. ${price.toLocaleString()}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        `;
      });
    }
  } catch (e) {
    itemsHtml = `<tr><td style="padding: 12px 0; color: #4a1c27; font-family: sans-serif;">Failed to parse order items.</td></tr>`;
  }
  
  // Calculate Shipping
  const numericTotal = Number(details.totalAmount) || 0;
  const shippingFee = Math.max(0, numericTotal - computedSubtotal);
  const shippingDisplay = shippingFee > 0 ? `Rs. ${shippingFee.toLocaleString()}` : 'Free';
  const subtotalDisplay = computedSubtotal > 0 ? `Rs. ${computedSubtotal.toLocaleString()}` : `Rs. ${numericTotal.toLocaleString()}`;

  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice - Yara</title>
      <style>
        @media only screen and (max-width: 600px) {
          .main-container { width: 100% !important; border-radius: 0 !important; }
          .header-cell { padding: 30px 20px 25px 20px !important; }
          .content-cell { padding: 30px 20px !important; }
          .footer-cell { padding: 30px 20px !important; }
          .desktop-split { display: block !important; width: 100% !important; }
          .mobile-margin { padding-top: 25px !important; margin-top: 0 !important; }
          .totals-table { width: 100% !important; }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8f5f3; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-text-size-adjust: 100%;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8f5f3; padding: 20px 0;">
        <tr>
          <td align="center" style="padding: 0 10px;">
            <table class="main-container" width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 10px 30px rgba(74, 28, 39, 0.05); overflow: hidden; width: 100%; max-width: 600px; margin: 0 auto;">
              <!-- Header -->
              <tr>
                <td class="header-cell" style="background-color: #fdf9f6; padding: 30px 40px 25px 40px; text-align: center; border-bottom: 1px solid #eee;">
                  <img src="https://www.yarasl.shop/images/yara-logo.png" alt="Yara" width="140" style="display: block; margin: 0 auto; max-width: 100%;" />
                  <p style="color: #c9856a; margin: -10px 0 0 0; font-size: 13px; text-transform: uppercase; letter-spacing: 2px;">Official Invoice</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td class="content-cell" style="padding: 50px 40px;">
                  <p style="color: #4a1c27; font-size: 18px; margin-top: 0; font-weight: 300;">Dear ${details.customerName},</p>
                  <p style="color: #666666; font-size: 15px; line-height: 1.6;">Thank you for shopping with Yara. We are delighted to confirm that your order has been successfully placed. Please find your order details and official invoice below.</p>
                  
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 35px; margin-bottom: 35px; background-color: #fdf9f6; padding: 25px; border-radius: 6px;">
                    <tr>
                      <td class="desktop-split" width="50%" style="vertical-align: top; display: inline-block;">
                        <h3 style="color: #c9856a; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; margin-top: 0;">Order Number</h3>
                        <p style="color: #4a1c27; font-size: 14px; font-weight: 600; margin: 0;">${details.orderId}</p>
                        
                        <h3 style="color: #c9856a; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; margin-top: 25px;">Order Date</h3>
                        <p style="color: #4a1c27; font-size: 14px; font-weight: 500; margin: 0; padding-bottom: 25px;">${new Date(details.orderDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </td>
                      <td class="desktop-split mobile-margin" width="50%" style="vertical-align: top; display: inline-block;">
                        <h3 style="color: #c9856a; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; margin-top: 0;">Shipping Address</h3>
                        <p style="color: #4a1c27; font-size: 14px; margin: 0; line-height: 1.5;">${details.shippingAddress.replace(/, /g, '<br>')}</p>
                        
                        <h3 style="color: #c9856a; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; margin-top: 25px;">Payment Method</h3>
                        <p style="color: #4a1c27; font-size: 14px; font-weight: 500; margin: 0; text-transform: uppercase;">${details.paymentMethod.replace('_', ' ')}</p>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Items -->
                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td style="padding-bottom: 15px; border-bottom: 2px solid #f8f5f3;">
                        <h3 style="color: #c9856a; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0;">Order Summary</h3>
                      </td>
                    </tr>
                    ${itemsHtml}
                  </table>
                  
                  <!-- Total -->
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 0;">
                    <tr>
                      <td align="right" style="padding-top: 25px; border-top: 1px solid #eee;">
                        <table class="totals-table" border="0" cellspacing="0" cellpadding="0" style="display: inline-table; min-width: 200px;">
                          <tr>
                            <td align="left" style="padding-right: 20px; color: #666666; font-size: 14px;">Subtotal</td>
                            <td align="right" style="color: #4a1c27; font-size: 14px; font-weight: 500;">${subtotalDisplay}</td>
                          </tr>
                          <tr>
                            <td align="left" style="padding-right: 20px; color: #666666; font-size: 14px; padding-top: 10px;">Delivery Fee</td>
                            <td align="right" style="color: #4a1c27; font-size: 14px; font-weight: 500; padding-top: 10px;">${shippingDisplay}</td>
                          </tr>
                          <tr>
                            <td align="left" style="padding-right: 20px; color: #4a1c27; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; padding-top: 20px;">Total</td>
                            <td align="right" style="color: #4a1c27; font-size: 22px; font-weight: bold; padding-top: 20px;">Rs. ${numericTotal.toLocaleString()}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td class="footer-cell" style="background-color: #4a1c27; padding: 40px; text-align: center;">
                  <p style="color: #e8d9d0; font-size: 13px; margin: 0; letter-spacing: 0.5px;">YARA</p>
                  <p style="color: #e8d9d0; font-size: 12px; margin: 10px 0 0 0; opacity: 0.7;">Sri Lanka</p>
                  <p style="color: #e8d9d0; font-size: 12px; margin: 10px 0 0 0; opacity: 0.7;">WhatsApp / Contact: +94 70 733 7711</p>
                  <p style="color: #e8d9d0; font-size: 12px; margin: 10px 0 0 0; opacity: 0.7;">If you have any questions regarding your order, please reply directly to this email.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: '"Yara" <orders@yarasl.shop>',
      to: details.customerEmail,
      subject: `Invoice for Order ${details.orderId} - Yara`,
      html: htmlTemplate,
    });
    
    console.log('Invoice email sent successfully:', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('Error sending invoice email:', error);
    return { success: false, error };
  }
}

export async function sendWelcomeEmail(customerEmail: string, customerName: string) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('Email skipped: SMTP credentials not configured.');
    return { success: false, error: 'SMTP not configured' };
  }

  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Yara</title>
      <style>
        @media only screen and (max-width: 600px) {
          .main-container { width: 100% !important; border-radius: 0 !important; }
          .header-cell { padding: 30px 20px 25px 20px !important; }
          .content-cell { padding: 30px 20px !important; }
          .footer-cell { padding: 30px 20px !important; }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8f5f3; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-text-size-adjust: 100%;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8f5f3; padding: 20px 0;">
        <tr>
          <td align="center" style="padding: 0 10px;">
            <table class="main-container" width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 10px 30px rgba(74, 28, 39, 0.05); overflow: hidden; width: 100%; max-width: 600px; margin: 0 auto;">
              <!-- Header -->
              <tr>
                <td class="header-cell" style="background-color: #fdf9f6; padding: 30px 40px 25px 40px; text-align: center; border-bottom: 1px solid #eee;">
                  <img src="https://www.yarasl.shop/images/yara-logo.png" alt="Yara" width="140" style="display: block; margin: 0 auto; max-width: 100%;" />
                  <p style="color: #c9856a; margin: 5px 0 0 0; font-size: 13px; text-transform: uppercase; letter-spacing: 2px;">Welcome to the Family</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td class="content-cell" style="padding: 40px; color: #4a1c27;">
                  <h1 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 400; font-family: 'Georgia', serif;">Hello ${customerName},</h1>
                  <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #555555;">
                    Thank you for creating an account with Yara. We are thrilled to welcome you to our exclusive community of jewelry lovers!
                  </p>
                  <p style="margin: 0 0 30px 0; font-size: 15px; line-height: 1.6; color: #555555;">
                    Your account unlocks a seamless shopping experience, allowing you to easily track your orders, save your favorite pieces to your wishlist, and check out faster.
                  </p>
                  
                  <div style="text-align: center; margin-bottom: 30px;">
                    <a href="https://www.yarasl.shop/shop" style="background-color: #4a1c27; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 30px; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">Explore Our Collection</a>
                  </div>
                  
                  <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #555555;">
                    If you have any questions, our support team is always here to help. Just reply directly to this email.
                  </p>
                  <p style="margin: 20px 0 0 0; font-size: 15px; color: #4a1c27; font-weight: bold;">
                    Warmly,<br>The Yara Team
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td class="footer-cell" style="background-color: #4a1c27; padding: 40px; text-align: center;">
                  <p style="color: #e8d9d0; font-size: 13px; margin: 0; letter-spacing: 0.5px;">YARA</p>
                  <p style="color: #e8d9d0; font-size: 12px; margin: 10px 0 0 0; opacity: 0.7;">Sri Lanka</p>
                  <p style="color: #e8d9d0; font-size: 12px; margin: 10px 0 0 0; opacity: 0.7;">WhatsApp / Contact: +94 70 733 7711</p>
                  <p style="color: #e8d9d0; font-size: 12px; margin: 10px 0 0 0; opacity: 0.7;">support@yarasl.shop</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: '"Yara" <support@yarasl.shop>',
      to: customerEmail,
      subject: 'Welcome to Yara Jewelry',
      html: htmlTemplate,
    });
    
    console.log('Welcome email sent successfully:', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error };
  }
}

export async function sendContactEmail(name: string, email: string, subject: string, message: string) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('Email skipped: SMTP credentials not configured.');
    return { success: false, error: 'SMTP not configured' };
  }

  const htmlTemplate = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #4B0F12;">
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #4B0F12;">
        <p style="white-space: pre-wrap; margin: 0;">${message}</p>
      </div>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: '"Yara Contact Form" <support@yarasl.shop>',
      to: 'contactyarasl@gmail.com',
      replyTo: email,
      subject: `[Contact Form] ${subject}`,
      html: htmlTemplate,
    });
    
    console.log('Contact email sent successfully:', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('Error sending contact email:', error);
    return { success: false, error };
  }
}

export async function sendOtpEmail(toEmail: string, name: string, otp: string) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('Email skipped: SMTP credentials not configured.');
    return { success: false, error: 'SMTP not configured' };
  }

  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
    <body style="margin:0;padding:0;background-color:#FAF7F4;font-family:'Georgia',serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF7F4;padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 40px rgba(0,0,0,0.06);">
              
              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#4B0F12 0%,#7B1F23 100%);padding:40px 48px;text-align:center;">
                  <p style="margin:0;font-size:28px;font-weight:bold;color:#fff;letter-spacing:4px;font-family:Georgia,serif;">YARA</p>
                  <p style="margin:8px 0 0;font-size:11px;color:rgba(255,255,255,0.65);letter-spacing:3px;text-transform:uppercase;">Luxury Jewelry</p>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:48px 48px 36px;">
                  <p style="margin:0 0 8px;font-size:22px;font-weight:bold;color:#4B0F12;">Hello, ${name} 👋</p>
                  <p style="margin:0 0 32px;font-size:15px;color:#888;line-height:1.6;">
                    Thank you for joining Yara. Please use the verification code below to confirm your email address and complete your registration.
                  </p>

                  <!-- OTP Box -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding:32px 0;background:#FAF7F4;border-radius:16px;">
                        <p style="margin:0 0 8px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:2px;">Your Verification Code</p>
                        <p style="margin:0;font-size:48px;font-weight:bold;color:#4B0F12;letter-spacing:12px;font-family:'Courier New',monospace;">${otp}</p>
                        <p style="margin:12px 0 0;font-size:12px;color:#bbb;">This code expires in <strong>10 minutes</strong></p>
                      </td>
                    </tr>
                  </table>

                  <p style="margin:32px 0 0;font-size:13px;color:#bbb;line-height:1.6;">
                    If you did not attempt to create a Yara account, please ignore this email. No account will be created without verification.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding:24px 48px;border-top:1px solid #f0ebe6;text-align:center;">
                  <p style="margin:0;font-size:12px;color:#ccc;">© 2025 Yara Jewelry · support@yarasl.shop</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: '"Yara" <support@yarasl.shop>',
      to: toEmail,
      subject: `${otp} is your Yara verification code`,
      html: htmlTemplate,
    });
    console.log('OTP email sent:', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { success: false, error };
  }
}
