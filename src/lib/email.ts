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
    <body style="margin: 0; padding: 0; background-color: #fdf9f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fdf9f6; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); overflow: hidden;">
              <!-- Header -->
              <tr>
                <td style="background-color: #4a1c27; padding: 40px 40px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px;">YARA</h1>
                  <p style="color: #e8d9d0; margin: 10px 0 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Official Invoice</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <p style="color: #4a1c27; font-size: 16px; margin-top: 0;">Hi ${details.customerName},</p>
                  <p style="color: #4a1c27; font-size: 15px; line-height: 1.6; color: #666;">Thank you for your elegant purchase. Your order has been confirmed. Below is your official invoice.</p>
                  
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 30px; margin-bottom: 30px;">
                    <tr>
                      <td width="50%" style="vertical-align: top;">
                        <h3 style="color: #c9856a; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Order Number</h3>
                        <p style="color: #4a1c27; font-size: 14px; font-weight: 600; margin: 0;">${details.orderId}</p>
                        
                        <h3 style="color: #c9856a; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; margin-top: 20px;">Date</h3>
                        <p style="color: #4a1c27; font-size: 14px; font-weight: 600; margin: 0;">${new Date(details.orderDate).toLocaleDateString()}</p>
                      </td>
                      <td width="50%" style="vertical-align: top;">
                        <h3 style="color: #c9856a; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Shipping Address</h3>
                        <p style="color: #4a1c27; font-size: 14px; margin: 0; line-height: 1.5;">${details.shippingAddress.replace(/, /g, '<br>')}</p>
                        
                        <h3 style="color: #c9856a; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; margin-top: 20px;">Payment Method</h3>
                        <p style="color: #4a1c27; font-size: 14px; margin: 0; text-transform: uppercase;">${details.paymentMethod.replace('_', ' ')}</p>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Items -->
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-top: 2px solid #fdf9f6; padding-top: 20px;">
                    <tr>
                      <td style="padding-bottom: 15px;">
                        <h3 style="color: #c9856a; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0;">Order Summary</h3>
                      </td>
                    </tr>
                    ${itemsHtml}
                  </table>
                  
                  <!-- Total -->
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 20px;">
                    <tr>
                      <td align="right" style="padding-top: 20px;">
                        <span style="color: #c9856a; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-right: 15px;">Total Amount</span>
                        <span style="color: #4a1c27; font-size: 24px; font-weight: 600;">Rs. ${Number(details.totalAmount).toLocaleString()}</span>
                      </td>
                    </tr>
                  </table>
                  
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #fdf9f6; padding: 30px 40px; text-align: center; border-top: 1px solid #e8d9d0;">
                  <p style="color: #4a1c27; font-size: 12px; margin: 0; opacity: 0.7;">Yara Jewelry, Sri Lanka</p>
                  <p style="color: #4a1c27; font-size: 12px; margin: 5px 0 0 0; opacity: 0.7;">If you have any questions, reply to this email.</p>
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
