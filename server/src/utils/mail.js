import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';

function buildTransportOptions() {
  if (process.env.SMTP_HOST) {
    return {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true' || false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: process.env.SMTP_REJECT_UNAUTHORIZED === 'false' ? { rejectUnauthorized: false } : undefined,
    };
  }

  if (process.env.EMAIL_SERVICE) {
    return {
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    };
  }

  return {
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  };
}

let transporter;

if (process.env.SENDGRID_ONLY === 'true') {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SENDGRID_ONLY is true but SENDGRID_API_KEY is not set. Email send will fail.');
  } else {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    console.log('SendGrid configured as primary mail transport (SENDGRID_ONLY=true)');
  }
} else {
  transporter = nodemailer.createTransport(buildTransportOptions());

  transporter.verify()
    .then(() => {
      console.log('Email transporter verified');
    })
    .catch((err) => {
      console.warn('Email transporter verification failed. Emails may not be sent.');
      console.warn(err && err.message ? err.message : err);
    });

  if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    console.log('SendGrid configured as fallback mail transport');
  }
}

export async function sendResetPasswordEmail(to, name, link) {
  let from = process.env.EMAIL_FROM;
  const hasEmailLike = (str) => typeof str === 'string' && /@/.test(str);
  if (!from || !hasEmailLike(from)) {
    from = `"AI Resume Evaluator" <${process.env.EMAIL_USER}>`;
    if (!process.env.EMAIL_USER) {
      console.warn('No valid EMAIL_FROM or EMAIL_USER found; email sends will likely fail.');
    } else if (process.env.EMAIL_FROM) {
      console.warn('EMAIL_FROM does not contain an address; falling back to EMAIL_USER for the sender address.');
    }
  }

  const mailOptions = {
    from,
    to,
    subject: 'Reset Your Password - AI Resume Evaluator',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
        <div style="max-width: 600px; margin: auto; background: white; border-radius: 10px; padding: 25px;">
          <h2 style="color: #1e40af;">AI Resume Evaluator</h2>
          <p style="font-size: 16px; color: #333;">Hi <strong>${name}</strong>,</p>
          <p style="font-size: 15px; color: #333;">We received a request to reset your password. Click the button below to set a new password:</p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${link}" target="_blank" style="background-color: #2563eb; color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px;">Reset Password</a>
          </div>
          <p style="font-size: 14px; color: #555;">If you didn’t request this, you can safely ignore this email.</p>
          <p style="font-size: 13px; color: #777; margin-top: 25px;">— The AI Resume Evaluator Team</p>
        </div>
      </div>
    `,
  };

  try {
    console.log(`sendResetPasswordEmail: preparing to send to=${to}`);

    if (process.env.SENDGRID_ONLY === 'true') {
      if (!process.env.SENDGRID_API_KEY) {
        console.error('SENDGRID_ONLY=true but SENDGRID_API_KEY is not set. Cannot send email.');
        throw new Error('SendGrid API key missing');
      }
      const msg = { to, from, subject: mailOptions.subject, html: mailOptions.html };
      console.log('sendResetPasswordEmail: using SendGrid (SENDGRID_ONLY=true)');
      const [response] = await sgMail.send(msg);
      console.log('sendResetPasswordEmail: SendGrid response', { statusCode: response.statusCode, headers: response.headers });
      return { transport: 'sendgrid', result: { statusCode: response.statusCode, headers: response.headers } };
    }

    console.log(`sendResetPasswordEmail: attempting SMTP send to ${to} using host=${process.env.SMTP_HOST || process.env.EMAIL_SERVICE || 'default'}`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`sendResetPasswordEmail: SMTP send success; messageId=${info.messageId}`);
    return { transport: 'smtp', result: info };
  } catch (err) {
    console.error('Email send failed:', err && err.message ? err.message : err);
    console.error(err && err.stack ? err.stack : err);

    if (process.env.SENDGRID_API_KEY) {
      try {
        console.log('sendResetPasswordEmail: attempting SendGrid fallback');
        const msg = { to, from, subject: mailOptions.subject, html: mailOptions.html };
        const [response] = await sgMail.send(msg);
        console.log('sendResetPasswordEmail: SendGrid fallback response', { statusCode: response.statusCode, headers: response.headers });
        return { transport: 'sendgrid', result: { statusCode: response.statusCode, headers: response.headers } };
      } catch (sgErr) {
        console.error('SendGrid send failed:', sgErr && sgErr.message ? sgErr.message : sgErr);
        if (sgErr && sgErr.response && sgErr.response.body) {
          console.error('SendGrid response body:', JSON.stringify(sgErr.response.body));
        }
        console.error(sgErr && sgErr.stack ? sgErr.stack : sgErr);
      }
    }

    throw new Error('Failed to send reset email');
  }
}