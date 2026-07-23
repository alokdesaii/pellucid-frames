export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ isSuccess: false, error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { name, email, phone, company, projectType, budget, timeline, message, referral, website } = body || {};

    // Honeypot validation for spam bots
    if (website) {
      return res.status(200).json({ isSuccess: true });
    }

    // Input validation
    if (!name || !email || !projectType || !message) {
      return res.status(400).json({ isSuccess: false, error: 'Missing required fields' });
    }

    // Format email content
    const emailSubject = `Pellucid Frames Enquiry - ${name} (${projectType})`;
    const emailContent = `New Enquiry from Pellucid Frames Website
=======================================

Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Company: ${company || 'Not provided'}

Project Scope:
---------------------------------------
Project Type: ${projectType}
Budget: ${budget || 'Not provided'}
Timeline: ${timeline || 'Not provided'}

Message:
---------------------------------------
${message}

Referral Source:
---------------------------------------
${referral || 'Not provided'}
`;

    // Send via SendGrid REST API
    const apiKey = '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';
    const sgRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: 'alok.desai@harbourandhills.com' }] }],
        from: { email: 'info@pellucidframes.com', name: 'Pellucid Frames Website' },
        reply_to: { email, name },
        subject: emailSubject,
        content: [{ type: 'text/plain', value: emailContent }]
      })
    });

    if (sgRes.status >= 200 && sgRes.status < 300) {
      return res.status(200).json({ isSuccess: true });
    }

    const errorText = await sgRes.text();
    console.error('SendGrid Error:', sgRes.status, errorText);
    return res.status(500).json({ isSuccess: false, error: `SendGrid error (${sgRes.status}): ${errorText}` });

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ isSuccess: false, error: err.message });
  }
}
