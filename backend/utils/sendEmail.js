import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

export const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html });
};

export const orderConfirmHtml = (order) => `
<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px">
  <h2 style="color:#4f46e5">Order Confirmed 🎉</h2>
  <p>Hi <strong>${order.shippingAddress.fullName}</strong>, your order <strong>#${String(order._id).slice(-8).toUpperCase()}</strong> is placed!</p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0">
    ${order.orderItems.map(i => `<tr><td style="padding:8px;border-bottom:1px solid #eee">${i.name} ×${i.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">₹${i.price * i.quantity}</td></tr>`).join('')}
    <tr><td style="padding:8px;font-weight:bold">Total</td><td style="padding:8px;font-weight:bold;text-align:right">₹${order.totalPrice}</td></tr>
  </table>
  <p style="color:#6b7280">Payment: ${order.paymentMethod.toUpperCase()} · ${order.isPaid ? 'Paid' : 'Pay on delivery'}</p>
</div>`;

export const resetPasswordHtml = (name, url) => `
<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px">
  <h2 style="color:#4f46e5">Reset your password</h2>
  <p>Hi ${name}, click below to reset your password (valid 15 min):</p>
  <a href="${url}" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0">Reset Password</a>
  <p style="color:#6b7280;font-size:13px">If you didn't request this, ignore this email.</p>
</div>`;
