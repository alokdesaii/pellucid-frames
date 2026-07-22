<?php
// SMTP Credentials configuration

return [
    'Host' => 'smtp.sendgrid.net',
    'SMTPAuth' => true,
    'Username' => 'apikey',
    'Password' => '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',
    'SMTPSecure' => 'tls', // 'tls' for STARTTLS (port 587) or 'ssl' for SMTPS (port 465)
    'Port' => 587,
    'FromEmail' => 'info@pellucidframes.com',
    'FromName' => 'Pellucid Frames Website',
    'ToEmail' => 'alok.desai@harbourandhills.com'
];
