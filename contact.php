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

// Set target email address
$to = isset($smtp_config['ToEmail']) ? $smtp_config['ToEmail'] : "alok.desai@harbourandhills.com";

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

// Dispatch the email using PHPMailer (with SMTP if host configured)
$mail = new PHPMailer(true);

try {
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
    $from_email = isset($smtp_config['FromEmail']) ? $smtp_config['FromEmail'] : 'no-reply@pellucidframes.com';
    $from_name  = isset($smtp_config['FromName']) ? $smtp_config['FromName'] : 'Pellucid Frames Website';
    $mail->setFrom($from_email, $from_name);
    $mail->addAddress($to);
    $mail->addReplyTo($email, $name);

    // Content
    $mail->isHTML(false); // plain text body
    $mail->Subject = $subject;
    $mail->Body    = $email_message;
    $mail->CharSet = 'UTF-8';

    $mail->send();
    echo json_encode(['isSuccess' => true]);
} catch (Exception $e) {
    $errorDetails = $mail->ErrorInfo ?: $e->getMessage();
    @file_put_contents(__DIR__ . '/contact_error.log', date('[Y-m-d H:i:s] ') . $errorDetails . "\n", FILE_APPEND);
    http_response_code(500);
    echo json_encode([
        'isSuccess' => false,
        'error' => 'Failed to send email: ' . $errorDetails
    ]);
}
?>
