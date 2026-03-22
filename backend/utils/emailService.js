import crypto from 'crypto';

// Simple email service for development
// In production, you'd use services like SendGrid, AWS SES, or Nodemailer

export const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const createPasswordResetLink = (token) => {
  // In development, return a local URL
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || 'https://your-domain.com'
    : 'http://localhost:3000';
  
  return `${baseUrl}/reset-password?token=${token}`;
};

export const sendPasswordResetEmail = async (user, resetToken) => {
  try {
    const resetLink = createPasswordResetLink(resetToken);
    
    // For development, just log the email and reset link
    console.log('='.repeat(50));
    console.log('PASSWORD RESET EMAIL');
    console.log('='.repeat(50));
    console.log(`To: ${user.email}`);
    console.log(`Name: ${user.name}`);
    console.log(`Reset Link: ${resetLink}`);
    console.log('='.repeat(50));
    
    // In production, you would send actual email here
    // Example with Nodemailer:
    /*
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'CampusX - Password Reset Request',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="background: #003366; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">CampusX</h1>
            <p style="margin: 5px 0 0; opacity: 0.9;">Bennett University Social Platform</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px;">
            <h2 style="color: #003366; margin-top: 0;">Password Reset Request</h2>
            
            <p>Hi ${user.name},</p>
            
            <p>We received a request to reset your password for your CampusX account. Click the button below to reset your password:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background: #003366; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">This link will expire in 1 hour for security reasons.</p>
            
            <p style="color: #666; font-size: 14px;">If you didn't request this password reset, you can safely ignore this email.</p>
            
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
            
            <p style="color: #666; font-size: 12px; text-align: center;">
              This is an automated message from CampusX, Bennett University's social platform.
            </p>
          </div>
        </div>
      `
    });
    */
    
    return { success: true, resetLink };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};

export const sendPasswordResetConfirmationEmail = async (user) => {
  try {
    console.log('='.repeat(50));
    console.log('PASSWORD RESET CONFIRMATION EMAIL');
    console.log('='.repeat(50));
    console.log(`To: ${user.email}`);
    console.log(`Name: ${user.name}`);
    console.log('Your password has been successfully reset.');
    console.log('='.repeat(50));
    
    // In production, send actual confirmation email
    
    return { success: true };
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return { success: false, error: error.message };
  }
};
