import nodemailer from 'nodemailer';

// Check if email credentials are set (not placeholders)
const hasValidEmailConfig = process.env.EMAIL_USER && 
                           !process.env.EMAIL_USER?.includes('your-') &&
                           process.env.EMAIL_PASSWORD &&
                           !process.env.EMAIL_PASSWORD?.includes('your-');

// Configure your email service here
// Using SendGrid, Gmail, or any SMTP service
const transporter = hasValidEmailConfig ? nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
}) : null;

// Alternative: SendGrid configuration
// const transporter = nodemailer.createTransport({
//   host: 'smtp.sendgrid.net',
//   port: 587,
//   auth: {
//     user: 'apikey',
//     pass: process.env.SENDGRID_API_KEY,
//   },
// });

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (options: EmailOptions) => {
  try {
    // Development mode: log emails instead of sending
    if (!hasValidEmailConfig) {
      console.log('[Email] ⚠️  DEV MODE - Email credentials not configured');
      console.log('[Email] To:', options.to);
      console.log('[Email] Subject:', options.subject);
      console.log('[Email] Message sent to console (configure EMAIL_USER and EMAIL_PASSWORD for real sending)');
      return { messageId: 'dev-mode-' + Date.now() };
    }

    if (!transporter) {
      throw new Error('Email transporter not initialized');
    }

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@highhikers.com',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    console.log('[Email] ✅ Sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('[Email] ❌ Error:', error instanceof Error ? error.message : error);
    throw error;
  }
};

// Newsletter templates
export const getTrailNotificationEmail = (trailName: string, trailDescription: string, trailUrl: string) => {
  return {
    subject: `🥾 New Trail Added: ${trailName}`,
    html: `
      <h2>New Trail on High Hikers!</h2>
      <h3>${trailName}</h3>
      <p>${trailDescription.substring(0, 200)}...</p>
      <a href="${trailUrl}" style="display:inline-block; padding:10px 20px; background-color:#10b981; color:white; text-decoration:none; border-radius:5px;">View Trail</a>
      <hr />
      <p>Happy hiking!<br/>The High Hikers Team</p>
    `,
    text: `New Trail: ${trailName}\n\n${trailDescription.substring(0, 200)}...\n\nView it at: ${trailUrl}`,
  };
};

export const getEventNotificationEmail = (eventTitle: string, eventDescription: string, eventDate: string, eventUrl: string) => {
  return {
    subject: `📅 New Event: ${eventTitle}`,
    html: `
      <h2>New Event on High Hikers!</h2>
      <h3>${eventTitle}</h3>
      <p><strong>Date:</strong> ${eventDate}</p>
      <p>${eventDescription.substring(0, 200)}...</p>
      <a href="${eventUrl}" style="display:inline-block; padding:10px 20px; background-color:#10b981; color:white; text-decoration:none; border-radius:5px;">View Event</a>
      <hr />
      <p>See you on the trail!<br/>The High Hikers Team</p>
    `,
    text: `New Event: ${eventTitle}\n\nDate: ${eventDate}\n\n${eventDescription.substring(0, 200)}...\n\nView it at: ${eventUrl}`,
  };
};

export const getBlogNotificationEmail = (blogTitle: string, blogExcerpt: string, blogUrl: string) => {
  return {
    subject: `📝 New Blog Post: ${blogTitle}`,
    html: `
      <h2>New Blog Post on High Hikers!</h2>
      <h3>${blogTitle}</h3>
      <p>${blogExcerpt || 'Check out our latest article.'}</p>
      <a href="${blogUrl}" style="display:inline-block; padding:10px 20px; background-color:#10b981; color:white; text-decoration:none; border-radius:5px;">Read Article</a>
      <hr />
      <p>Keep exploring!<br/>The High Hikers Team</p>
    `,
    text: `New Blog Post: ${blogTitle}\n\n${blogExcerpt || 'Check out our latest article.'}\n\nRead it at: ${blogUrl}`,
  };
};

export const getEventSuggestionApprovedEmail = (eventTitle: string, eventDescription: string, eventDate: string, eventUrl: string) => {
  return {
    subject: `✅ Your Event Suggestion Was Approved!`,
    html: `
      <h2>Great News! Your Event Suggestion Was Approved!</h2>
      <p>Hi there,</p>
      <p>We're excited to let you know that your event suggestion has been approved and is now live on High Hikers!</p>
      <h3>${eventTitle}</h3>
      <p><strong>Date:</strong> ${eventDate}</p>
      <p>${eventDescription.substring(0, 300)}${eventDescription.length > 300 ? '...' : ''}</p>
      <a href="${eventUrl}" style="display:inline-block; padding:10px 20px; background-color:#10b981; color:white; text-decoration:none; border-radius:5px; margin-top:10px;">View Your Event</a>
      <hr />
      <p>Thank you for helping build our community!<br/>The High Hikers Team</p>
    `,
    text: `Your event suggestion "${eventTitle}" has been approved!\n\nDate: ${eventDate}\n\n${eventDescription}\n\nView it at: ${eventUrl}`,
  };
};

export const getEventSuggestionRejectedEmail = (eventTitle: string, reason?: string) => {
  return {
    subject: `ℹ️ Your Event Suggestion Update`,
    html: `
      <h2>Your Event Suggestion Update</h2>
      <p>Hi there,</p>
      <p>Thank you for suggesting the event "<strong>${eventTitle}</strong>" to High Hikers!</p>
      <p>After careful review, we weren't able to approve this suggestion at this time.</p>
      ${reason ? `<p><strong>Feedback:</strong></p><p>${reason}</p>` : '<p>We appreciate your enthusiasm and encourage you to suggest more events in the future!</p>'}
      <p>If you have any questions, feel free to reach out to our team.</p>
      <hr />
      <p>Keep exploring!<br/>The High Hikers Team</p>
    `,
    text: `Your event suggestion "${eventTitle}" was not approved.\n${reason ? `\nFeedback: ${reason}` : ''}`,
  };
};

export const getOTPEmail = (otp: string) => {
  return {
    subject: `🔐 Your High Hikers Email Verification Code`,
    html: `
      <h2>Verify Your Email</h2>
      <p>Hi there!</p>
      <p>Thank you for joining High Hikers! To complete your account registration, please verify your email using the code below.</p>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <p style="font-size: 14px; color: #666; margin: 0;">Your verification code:</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 3px; color: #10b981; margin: 10px 0;">${otp}</p>
      </div>
      <p style="color: #888; font-size: 14px;">This code will expire in 10 minutes.</p>
      <p style="color: #888; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
      <hr />
      <p>Happy hiking!<br/>The High Hikers Team</p>
    `,
    text: `Your High Hikers verification code is: ${otp}\n\nThis code will expire in 10 minutes.`,
  };
};
