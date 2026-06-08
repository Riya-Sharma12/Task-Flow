import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<{ devUrl?: string }> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const url = `${baseUrl}/api/auth/verify?token=${token}`;

  if (!resend) {
    console.log(`\n[DEV] Verification link for ${email}:\n${url}\n`);
    return { devUrl: url };
  }

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM ?? 'Indexcard <onboarding@resend.dev>',
    to: email,
    subject: 'Confirm your Indexcard account',
    html: `
<!DOCTYPE html>
<html lang="en">
<body style="font-family:'Courier New',monospace;background:#f5f0e8;margin:0;padding:40px 20px;">
  <div style="max-width:480px;margin:0 auto;border:2px solid #1c1812;background:#fdfaf3;box-shadow:6px 6px 0 0 #1c1812;">
    <div style="background:#1c1812;color:#fdfaf3;padding:14px 24px;display:flex;justify-content:space-between;font-size:10px;text-transform:uppercase;letter-spacing:0.25em;">
      <span>INDEXCARD</span>
      <span style="color:#c8e620;">№001</span>
    </div>
    <div style="padding:32px 28px;">
      <p style="font-size:10px;text-transform:uppercase;letter-spacing:0.25em;color:#7a6a50;margin:0 0 10px;">New subscriber</p>
      <h1 style="font-family:Georgia,serif;font-size:34px;line-height:0.95;margin:0 0 24px;font-weight:400;color:#1c1812;">
        Confirm<br /><em>your email.</em>
      </h1>
      <p style="font-size:13px;color:#3a3020;margin:0 0 28px;line-height:1.7;">
        Click the button below to verify your address and open your first ledger. The link expires in <strong>24 hours</strong>.
      </p>
      <a href="${url}"
         style="display:inline-block;background:#c8e620;color:#1c1812;border:2px solid #1c1812;box-shadow:4px 4px 0 0 #1c1812;padding:14px 26px;font-family:'Courier New',monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.2em;text-decoration:none;">
        Verify email →
      </a>
      <p style="font-size:10px;color:#9a8a70;margin:28px 0 0;line-height:1.7;">
        Or copy this link:<br />
        <span style="word-break:break-all;color:#5a4a30;">${url}</span>
      </p>
    </div>
    <div style="border-top:2px solid #1c1812;padding:12px 24px;font-size:10px;text-transform:uppercase;letter-spacing:0.2em;color:#9a8a70;">
      A daily ledger for the determined.
    </div>
  </div>
</body>
</html>`,
  });

  if (error) {
    console.error('[Resend error]', error);
    // Fall back to dev link so the user is never completely stuck
    return { devUrl: url };
  }

  return {};
}
