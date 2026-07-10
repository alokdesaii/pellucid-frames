<?php
// Contact form handler — emails enquiries to the studio inbox. No third-party
// service: uses the server's own mailer. Classic cPanel/shared-host setup.
//
// The React contact form (src/contact.jsx) POSTs JSON here; we validate,
// guard against header injection + spam, then send. Returns JSON {ok:bool}.
//
// ─── CONFIG ────────────────────────────────────────────────────────────────
$TO      = 'alok.desai@harbourandhills.com';  // where enquiries land (test)
$FROM    = 'no-reply@pellucidframes.com';     // MUST be a @pellucidframes.com
                                              // address so SPF/DKIM pass
$SUBJECT = 'New enquiry via pellucidframes.com';

// Upgrade path (only if hello@ is on an EXTERNAL provider — Google Workspace,
// Zoho — and native mail() lands in spam): set USE_SMTP=true, drop PHPMailer
// into ./lib/, and fill these. Left off by default — native mail() is reliable
// for same-server delivery.
$USE_SMTP  = false;
$SMTP_HOST = 'localhost';
$SMTP_USER = 'hello@pellucidframes.com';
$SMTP_PASS = '';
$SMTP_PORT = 587;
// ─────────────────────────────────────────────────────────────────────────────

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

// Accept JSON (fetch) or classic form-encoded POST.
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) { $data = $_POST; }

$get = function ($k) use ($data) {
    return isset($data[$k]) ? trim((string) $data[$k]) : '';
};

// Honeypot: real users never fill this hidden field. Bots do → silently "succeed".
if ($get('website') !== '') {
    echo json_encode(['ok' => true]);
    exit;
}

$name    = $get('name');
$email   = $get('email');
$phone   = $get('phone');
$company = $get('company');
$ptype   = $get('projectType');
$budget  = $get('budget');
$timeline= $get('timeline');
$message = $get('message');
$referral= $get('referral');

// ── Server-side validation (never trust the client) ──
$errors = [];
if ($name === '')                                    $errors[] = 'name';
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'email';
if ($ptype === '')                                   $errors[] = 'projectType';
if ($message === '')                                 $errors[] = 'message';
if (strlen($message) > 8000)                         $errors[] = 'message';

if ($errors) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'Validation failed', 'fields' => $errors]);
    exit;
}

// ── Header-injection guard: strip CR/LF from anything used in headers ──
$clean = function ($v) { return str_replace(["\r", "\n", "%0a", "%0d"], ' ', $v); };
$safeName  = $clean($name);
$safeEmail = $clean($email);

$body =
    "New enquiry from the Pellucid Frames website\n" .
    "----------------------------------------\n\n" .
    "Name:      $name\n" .
    "Email:     $email\n" .
    "Phone:     " . ($phone   !== '' ? $phone   : '—') . "\n" .
    "Company:   " . ($company !== '' ? $company : '—') . "\n\n" .
    "Project:   $ptype\n" .
    "Budget:    " . ($budget   !== '' ? $budget   : '—') . "\n" .
    "Timeline:  " . ($timeline !== '' ? $timeline : '—') . "\n\n" .
    "About the project:\n$message\n\n" .
    "Heard about us via: " . ($referral !== '' ? $referral : '—') . "\n";

$subject = $SUBJECT . ' — ' . $safeName;

$ok = false;

if ($USE_SMTP) {
    // Authenticated SMTP via PHPMailer (self-hosted lib, no external service).
    // Only runs if you've placed PHPMailer in ./lib/ and set USE_SMTP=true.
    require __DIR__ . '/lib/PHPMailer/PHPMailer.php';
    require __DIR__ . '/lib/PHPMailer/SMTP.php';
    require __DIR__ . '/lib/PHPMailer/Exception.php';
    $mail = new PHPMailer\PHPMailer\PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host = $SMTP_HOST;
        $mail->SMTPAuth = true;
        $mail->Username = $SMTP_USER;
        $mail->Password = $SMTP_PASS;
        $mail->Port = $SMTP_PORT;
        $mail->SMTPSecure = 'tls';
        $mail->setFrom($FROM, 'Pellucid Frames Website');
        $mail->addAddress($TO);
        $mail->addReplyTo($safeEmail, $safeName);
        $mail->Subject = $subject;
        $mail->Body = $body;
        $ok = $mail->send();
    } catch (\Throwable $e) {
        $ok = false;
    }
} else {
    // Native mail() — reliable for same-server delivery to the studio mailbox.
    $headers  = "From: Pellucid Frames Website <$FROM>\r\n";
    $headers .= "Reply-To: $safeName <$safeEmail>\r\n";
    $headers .= "Content-Type: text/plain; charset=utf-8\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();
    // 5th arg sets the envelope sender so SPF aligns on cPanel.
    $ok = mail($TO, $subject, $body, $headers, "-f$FROM");
}

if ($ok) {
    echo json_encode(['ok' => true]);
} else {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Mail send failed']);
}
