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
  try {
    const items = JSON.parse(details.cartDetails);
    items.forEach((itemStr: string) => {
      itemsHtml += `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #4a1c27; font-family: sans-serif; font-size: 14px;">${itemStr}</td>
        </tr>
      `;
    });
  } catch (e) {
    itemsHtml = `<tr><td style="padding: 12px 0; color: #4a1c27; font-family: sans-serif;">${details.cartDetails}</td></tr>`;
  }

  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice - Yara Jewelry</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8f5f3; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8f5f3; padding: 50px 0;">
        <tr>
          <td align="center">
            <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 10px 30px rgba(74, 28, 39, 0.05); overflow: hidden;">
              <!-- Header -->
              <tr>
                <td style="background-color: #fdf9f6; padding: 40px 40px; text-align: center; border-bottom: 1px solid #eee;">
                  <img src="https://www.yarasl.shop/images/yara-logo.png" alt="Yara Jewelry" width="160" style="display: block; margin: 0 auto; margin-bottom: 15px;" />
                  <p style="color: #c9856a; margin: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Official Invoice</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 50px 40px;">
                  <p style="color: #4a1c27; font-size: 18px; margin-top: 0; font-weight: 300;">Dear ${details.customerName},</p>
                  <p style="color: #666666; font-size: 15px; line-height: 1.6;">Thank you for shopping with Yara Jewelry. We are delighted to confirm that your order has been successfully placed. Please find your order details and official invoice below.</p>
                  
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 40px; margin-bottom: 40px; background-color: #fdf9f6; padding: 25px; border-radius: 6px;">
                    <tr>
                      <td width="50%" style="vertical-align: top;">
                        <h3 style="color: #c9856a; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; margin-top: 0;">Order Number</h3>
                        <p style="color: #4a1c27; font-size: 14px; font-weight: 600; margin: 0;">${details.orderId}</p>
                        
                        <h3 style="color: #c9856a; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; margin-top: 25px;">Order Date</h3>
                        <p style="color: #4a1c27; font-size: 14px; font-weight: 500; margin: 0;">${new Date(details.orderDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </td>
                      <td width="50%" style="vertical-align: top;">
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
                        <table border="0" cellspacing="0" cellpadding="0" style="display: inline-table;">
                          <tr>
                            <td align="right" style="padding-right: 20px; color: #666666; font-size: 14px;">Subtotal</td>
                            <td align="right" style="color: #4a1c27; font-size: 14px; font-weight: 500;">Rs. ${Number(details.totalAmount).toLocaleString()}</td>
                          </tr>
                          <tr>
                            <td align="right" style="padding-right: 20px; color: #666666; font-size: 14px; padding-top: 10px;">Shipping</td>
                            <td align="right" style="color: #4a1c27; font-size: 14px; font-weight: 500; padding-top: 10px;">Calculated at checkout</td>
                          </tr>
                          <tr>
                            <td align="right" style="padding-right: 20px; color: #4a1c27; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; padding-top: 20px;">Total</td>
                            <td align="right" style="color: #4a1c27; font-size: 22px; font-weight: bold; padding-top: 20px;">Rs. ${Number(details.totalAmount).toLocaleString()}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #4a1c27; padding: 40px; text-align: center;">
                  <p style="color: #e8d9d0; font-size: 13px; margin: 0; letter-spacing: 0.5px;">YARA JEWELRY</p>
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
      from: '"Yara Jewelry" <orders@yarasl.shop>',
      to: details.customerEmail,
      subject: `Invoice for Order ${details.orderId} - Yara Jewelry`,
      html: htmlTemplate,
    });
    
    console.log('Invoice email sent successfully:', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('Error sending invoice email:', error);
    return { success: false, error };
  }
}
