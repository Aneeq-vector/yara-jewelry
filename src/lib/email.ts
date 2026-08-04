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
    items.forEach((itemStr: string) => {
      let quantity = '1';
      let title = itemStr;
      let price = '';
      
      // Parse quantity: "1x ..."
      const qtyMatch = itemStr.match(/^(\d+)x\s+(.*)/);
      if (qtyMatch) {
        quantity = qtyMatch[1];
        title = qtyMatch[2];
      }
      
      // Parse price: "... - Rs. 1200"
      const priceMatch = title.match(/(.*)\s+-\s+Rs\.\s+([\d,.]+)/);
      if (priceMatch) {
        title = priceMatch[1];
        price = priceMatch[2];
        
        // Add to computed subtotal
        const numericPrice = parseFloat(price.replace(/,/g, ''));
        if (!isNaN(numericPrice)) {
          computedSubtotal += numericPrice * parseInt(quantity, 10);
        }
      }
      
      // Parse attributes
      let titleMain = title;
      let meta = '';
      if (title.includes('Custom Box')) {
         const boxMatch = title.match(/(Custom Box.*?)\s+-\s+Items:\s+(.*)/);
         if (boxMatch) {
           titleMain = boxMatch[1];
           meta = boxMatch[2];
         }
      } else {
         const attrMatch = title.match(/(.*?)\s+\[(.*?)\]$/);
         if (attrMatch) {
           titleMain = attrMatch[1];
           meta = attrMatch[2];
         }
      }

      itemsHtml += `
        <tr>
          <td style="padding: 20px 0; border-bottom: 1px solid #eee;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td width="40" valign="top">
                  <div style="background-color: #fdf9f6; border: 1px solid #e8d9d0; color: #4a1c27; font-size: 11px; font-weight: bold; width: 26px; height: 26px; border-radius: 50%; text-align: center; line-height: 26px;">${quantity}</div>
                </td>
                <td valign="top" style="padding-right: 15px;">
                  <p style="margin: 0; color: #4a1c27; font-size: 14px; font-weight: 600;">${titleMain}</p>
                  ${meta ? `<p style="margin: 5px 0 0 0; color: #888888; font-size: 12px; line-height: 1.4;">${meta}</p>` : ''}
                </td>
                <td width="90" valign="top" align="right">
                  <p style="margin: 0; color: #4a1c27; font-size: 14px; font-weight: 600;">Rs. ${price}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `;
    });
  } catch (e) {
    itemsHtml = `<tr><td style="padding: 12px 0; color: #4a1c27; font-family: sans-serif;">${details.cartDetails}</td></tr>`;
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
          .mobile-margin { margin-top: 25px !important; }
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
                        <p style="color: #4a1c27; font-size: 14px; font-weight: 500; margin: 0;">${new Date(details.orderDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
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
                            <td align="left" style="padding-right: 20px; color: #666666; font-size: 14px; padding-top: 10px;">Shipping</td>
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
