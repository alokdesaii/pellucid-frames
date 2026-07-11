<?php
// Contact form handler — emails enquiries to the studio inbox. No third-party
// service: uses the server's own mailer. Classic cPanel/shared-host setup.
//
// The React contact form (src/contact.jsx) POSTs JSON here; we validate,
// guard against header injection + spam, then send. Returns JSON {ok:bool}.
//
// ─── CONFIG ────────────────────────────────────────────────────────────────
$TO = 'hello@pellucidframes.com';          // where enquiries land

// Email transport:
//   USE_SMTP = false → native mail()       (cPanel: hello@ is a same-server mailbox)
//   USE_SMTP = true  → authenticated SMTP  (only if the mailbox is off-server, e.g. Workspace)
$USE_SMTP    = false;                             // native mail() on cPanel
$SMTP_HOST   = 'mail.pellucidframes.com';         // used only if USE_SMTP = true
$SMTP_PORT   = 465;                               // 465 = SSL, 587 = STARTTLS
$SMTP_SECURE = 'ssl';                             // 'ssl' for 465, 'tls' for 587
$SMTP_USER   = 'hello@pellucidframes.com';        // full mailbox to log in with
$SMTP_PASS   = getenv('SMTP_PASS') ?: '';         // via env var, never committed

// "From" is a pellucidframes.com address so SPF/DKIM align on the domain.
$FROM      = 'no-reply@pellucidframes.com';
$FROM_NAME = 'Pellucid Frames Website';
$SUBJECT   = 'New enquiry via pellucidframes.com';
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
    $ok = smtp_send([
        'host' => $SMTP_HOST, 'port' => $SMTP_PORT, 'secure' => $SMTP_SECURE,
        'user' => $SMTP_USER, 'pass' => $SMTP_PASS,
        'from' => $FROM, 'fromName' => $FROM_NAME,
    ], $TO, $subject, $body, $safeName, $safeEmail);
} else {
    // Native mail() — reliable for same-server delivery on cPanel.
    $headers  = "From: $FROM_NAME <$FROM>\r\n";
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

// ── Minimal authenticated SMTP client (no external library) ──────────────────
// Speaks just enough SMTP to log in and send one plain-text message. Handles
// both implicit SSL (port 465) and STARTTLS (port 587).
function smtp_send($cfg, $to, $subject, $body, $replyName, $replyEmail) {
    $eol = "\r\n";
    $remote = ($cfg['secure'] === 'ssl' ? 'ssl://' : '') . $cfg['host'] . ':' . $cfg['port'];
    $ctx = stream_context_create(['ssl' => [
        'verify_peer' => false, 'verify_peer_name' => false, 'allow_self_signed' => true,
    ]]);
    $fp = @stream_socket_client($remote, $errno, $errstr, 15, STREAM_CLIENT_CONNECT, $ctx);
    if (!$fp) return false;
    stream_set_timeout($fp, 15);

    $read = function () use ($fp) {
        $data = '';
        while (($line = fgets($fp, 515)) !== false) {
            $data .= $line;
            if (isset($line[3]) && $line[3] === ' ') break; // final line of reply
        }
        return $data;
    };
    $cmd = function ($line, $expect) use ($fp, $read, $eol) {
        if ($line !== null) fwrite($fp, $line . $eol);
        return substr($read(), 0, 3) === $expect;
    };

    $fail = function () use ($fp) { fclose($fp); return false; };

    if (!$cmd(null, '220')) return $fail();               // server greeting
    if (!$cmd('EHLO localhost', '250')) return $fail();

    if ($cfg['secure'] === 'tls') {                        // STARTTLS upgrade
        if (!$cmd('STARTTLS', '220')) return $fail();
        if (!stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) return $fail();
        if (!$cmd('EHLO localhost', '250')) return $fail();
    }

    if (!$cmd('AUTH LOGIN', '334')) return $fail();
    if (!$cmd(base64_encode($cfg['user']), '334')) return $fail();
    if (!$cmd(base64_encode($cfg['pass']), '235')) return $fail();

    if (!$cmd('MAIL FROM:<' . $cfg['from'] . '>', '250')) return $fail();
    if (!$cmd('RCPT TO:<' . $to . '>', '250')) return $fail();
    if (!$cmd('DATA', '354')) return $fail();

    $encSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    $headers =
        'From: ' . $cfg['fromName'] . ' <' . $cfg['from'] . '>' . $eol .
        'To: <' . $to . '>' . $eol .
        'Reply-To: ' . $replyName . ' <' . $replyEmail . '>' . $eol .
        'Subject: ' . $encSubject . $eol .
        'MIME-Version: 1.0' . $eol .
        'Content-Type: text/plain; charset=utf-8' . $eol .
        'Content-Transfer-Encoding: 8bit' . $eol;
    // Normalise newlines + dot-stuff lines starting with '.'
    $safeBody = preg_replace('/^\./m', '..', str_replace("\n", $eol, $body));
    fwrite($fp, $headers . $eol . $safeBody . $eol . '.' . $eol);
    $sent = $cmd(null, '250');
    $cmd('QUIT', '221');
    fclose($fp);
    return $sent;
}
