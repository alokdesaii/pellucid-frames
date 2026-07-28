<?php
// SMTP configuration TEMPLATE. Copy to smtp_config.php (which is gitignored)
// and fill in the real SendGrid API key. Never commit the real key.

return [
    'Host' => 'smtp.sendgrid.net',
    'SMTPAuth' => true,
    'Username' => 'apikey',                 // literal string for SendGrid SMTP
    'Password' => 'SG.xxxxxxxxxxxxxxxxxxxxxx', // <-- real SendGrid API key here
    'SMTPSecure' => 'tls',                  // 'tls' = STARTTLS (587), 'ssl' = SMTPS (465)
    'Port' => 587,
    'FromEmail' => 'info@pellucidframes.com',   // must be a verified sender in SendGrid
    'FromName' => 'Pellucid Frames Website',
    'ToEmail' => 'hello@pellucidframes.com'
];
