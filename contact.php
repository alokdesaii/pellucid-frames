<?php
header('Content-Type: application/json');

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/libs/PHPMailer/src/Exception.php';
require_once __DIR__ . '/libs/PHPMailer/src/PHPMailer.php';
require_once __DIR__ . '/libs/PHPMailer/src/SMTP.php';

// Load SMTP configuration if available
$smtp_config = [];
if (file_exists(__DIR__ . '/smtp_config.php')) {
    $smtp_config = require __DIR__ . '/smtp_config.php';
}

// Recipient — from server config (smtp_config.php ToEmail), with a matching fallback.
$to = isset($smtp_config['ToEmail']) ? $smtp_config['ToEmail'] : "hello@pellucidframes.com";

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['isSuccess' => false, 'error' => 'Method not allowed']);
    exit;
}

// Parse JSON input payload
$inputJSON = file_get_contents('php://input');
if (empty($inputJSON) && php_sapi_name() === 'cli') {
    $inputJSON = file_get_contents('php://stdin');
}
$input = json_decode($inputJSON, true);

if ($input === null) {
    http_response_code(400);
    echo json_encode(['isSuccess' => false, 'error' => 'Invalid JSON input']);
    exit;
}

// Honeypot validation (website field is hidden from users; if filled, it's a bot)
if (!empty($input['website'])) {
    // Return silent success to the bot
    echo json_encode(['isSuccess' => true]);
    exit;
}

// Extract and sanitize input parameters
$name = isset($input['name']) ? strip_tags(trim($input['name'])) : '';
$email = isset($input['email']) ? filter_var(trim($input['email']), FILTER_VALIDATE_EMAIL) : '';
$phone = isset($input['phone']) ? strip_tags(trim($input['phone'])) : '';
$company = isset($input['company']) ? strip_tags(trim($input['company'])) : '';
$projectType = isset($input['projectType']) ? strip_tags(trim($input['projectType'])) : '';
$budget = isset($input['budget']) ? strip_tags(trim($input['budget'])) : '';
$timeline = isset($input['timeline']) ? strip_tags(trim($input['timeline'])) : '';
$message = isset($input['message']) ? strip_tags(trim($input['message'])) : '';
$referral = isset($input['referral']) ? strip_tags(trim($input['referral'])) : '';

// Check required fields
if (empty($name) || !$email || empty($projectType) || empty($message)) {
    http_response_code(400);
    $errorMsg = 'Missing or invalid required fields.';
    if (empty($name)) $errorMsg = 'Please add your name.';
    elseif (!$email) $errorMsg = 'That email looks off.';
    elseif (empty($projectType)) $errorMsg = 'Pick a project type.';
    elseif (empty($message)) $errorMsg = 'Tell us a little about your project.';
    
    echo json_encode(['isSuccess' => false, 'error' => $errorMsg]);
    exit;
}

// Format the email subject
$subject = "Pellucid Frames Enquiry - $name ($projectType)";

// Format the email content body
$email_message = "New Enquiry from Pellucid Frames Website\n";
$email_message .= "=======================================\n\n";
$email_message .= "Name: $name\n";
$email_message .= "Email: $email\n";
$email_message .= "Phone: " . ($phone ?: "Not provided") . "\n";
$email_message .= "Company: " . ($company ?: "Not provided") . "\n\n";
$email_message .= "Project Scope:\n";
$email_message .= "---------------------------------------\n";
$email_message .= "Project Type: $projectType\n";
$email_message .= "Budget: " . ($budget ?: "Not provided") . "\n";
$email_message .= "Timeline: " . ($timeline ?: "Not provided") . "\n\n";
$email_message .= "Message:\n";
$email_message .= "---------------------------------------\n";
$email_message .= "$message\n\n";
$email_message .= "Referral Source:\n";
$email_message .= "---------------------------------------\n";
$email_message .= ($referral ?: "Not provided") . "\n";

// Always save submission to local log file first so no lead is lost
$log_entry = date('[Y-m-d H:i:s] ') . "New Enquiry from $name ($email)\n$email_message\n---------------------------------------\n\n";
@file_put_contents(__DIR__ . '/enquiries.log', $log_entry, FILE_APPEND);

// Check if running in local environment (localhost, 127.0.0.1, CLI, or LocalDebug mode)
$is_local = (
    isset($_SERVER['HTTP_HOST']) && (
        strpos($_SERVER['HTTP_HOST'], 'localhost') !== false ||
        strpos($_SERVER['HTTP_HOST'], '127.0.0.1') !== false
    )
) || php_sapi_name() === 'cli' || !empty($smtp_config['LocalDebug']);

function sendSendGridApi($apiKey, $fromEmail, $fromName, $toEmail, $subject, $plainBody, $replyToEmail = null, $replyToName = null) {
    if (!function_exists('curl_init')) {
        return ['success' => false, 'error' => 'PHP cURL extension is not enabled'];
    }
    
    $payload = [
        'personalizations' => [
            [
                'to' => [
                    ['email' => $toEmail]
                ]
            ]
        ],
        'from' => [
            'email' => $fromEmail,
            'name' => $fromName
        ],
        'subject' => $subject,
        'content' => [
            [
                'type' => 'text/plain',
                'value' => $plainBody
            ]
        ]
    ];
    if (!empty($replyToEmail)) {
        $payload['reply_to'] = [
            'email' => $replyToEmail,
            'name' => $replyToName ?: $replyToEmail
        ];
    }

    $ch = curl_init('https://api.sendgrid.com/v3/mail/send');
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . trim($apiKey),
            'Content-Type: application/json'
        ],
        CURLOPT_POSTFIELDS => json_encode($payload),
        CURLOPT_TIMEOUT => 15,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => 0,
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlErr = curl_error($ch);

    if ($httpCode >= 200 && $httpCode < 300) {
        return ['success' => true];
    }
    return ['success' => false, 'error' => "SendGrid API HTTP $httpCode: " . ($curlErr ?: $response)];
}

// Extract sender details
$from_email = isset($smtp_config['FromEmail']) ? $smtp_config['FromEmail'] : 'info@pellucidframes.com';
$from_name  = isset($smtp_config['FromName']) ? $smtp_config['FromName'] : 'Pellucid Frames Website';

// 1. Try SendGrid Web API over HTTPS (Port 443) if API Key is configured
$api_key = isset($smtp_config['Password']) ? $smtp_config['Password'] : '';
if (!empty($api_key) && strpos($api_key, 'SG.') === 0) {
    $apiResult = sendSendGridApi($api_key, $from_email, $from_name, $to, $subject, $email_message, $email, $name);
    if ($apiResult['success']) {
        echo json_encode(['isSuccess' => true, 'sentVia' => 'SendGrid API']);
        exit;
    }
    @file_put_contents(__DIR__ . '/contact_error.log', date('[Y-m-d H:i:s] ') . 'SendGrid API Error: ' . $apiResult['error'] . "\n", FILE_APPEND);
}

// 2. Try PHPMailer SMTP
try {
    $mail = new PHPMailer(true);
    if (!empty($smtp_config['Host'])) {
        $mail->isSMTP();
        $mail->Host       = $smtp_config['Host'];
        $mail->SMTPAuth   = isset($smtp_config['SMTPAuth']) ? $smtp_config['SMTPAuth'] : true;
        $mail->Username   = isset($smtp_config['Username']) ? $smtp_config['Username'] : '';
        $mail->Password   = isset($smtp_config['Password']) ? $smtp_config['Password'] : '';
        
        if (isset($smtp_config['SMTPSecure'])) {
            if (strtolower($smtp_config['SMTPSecure']) === 'tls') {
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            } elseif (strtolower($smtp_config['SMTPSecure']) === 'ssl') {
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
            }
        }
        $mail->Port       = isset($smtp_config['Port']) ? $smtp_config['Port'] : 587;
    }

    // Sender and Recipient
    $mail->setFrom($from_email, $from_name);
    $mail->addAddress($to);
    $mail->addReplyTo($email, $name);

    // Content
    $mail->isHTML(false); // plain text body
    $mail->Subject = $subject;
    $mail->Body    = $email_message;
    $mail->CharSet = 'UTF-8';

    $mail->send();
    echo json_encode(['isSuccess' => true, 'sentVia' => 'PHPMailer SMTP']);
    exit;
} catch (Exception $e) {
    $errorDetails = $mail->ErrorInfo ?: $e->getMessage();
    @file_put_contents(__DIR__ . '/contact_error.log', date('[Y-m-d H:i:s] ') . 'PHPMailer Error: ' . $errorDetails . "\n", FILE_APPEND);
}

// 3. Fallback to native Linux PHP mail() function
$headers = "From: $from_name <$from_email>\r\n" .
           "Reply-To: $name <$email>\r\n" .
           "X-Mailer: PHP/" . phpversion();
if (@mail($to, $subject, $email_message, $headers)) {
    echo json_encode(['isSuccess' => true, 'sentVia' => 'Linux mail()']);
    exit;
}

// 4. Final Fallback: The enquiry was saved in enquiries.log above
echo json_encode([
    'isSuccess' => true,
    'note' => 'Enquiry saved to server log'
]);
?>
