<?php
// SMTP Credentials configuration
// This file contains secrets and is gitignored. Do not commit it to Git.

return [
    'Host' => 'smtp.sendgrid.net',
    'SMTPAuth' => true,
    'Username' => 'apikey',
    'Password' => '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',
    'SMTPSecure' => 'tls', // 'tls' for STARTTLS (port 587) or 'ssl' for SMTPS (port 465)
    'Port' => 587,
    'FromEmail' => 'info@pellucidframes.com',
    'FromName' => 'Pellucid Frames Website',
    'ToEmail' => 'hello@pellucidframes.com'
];
