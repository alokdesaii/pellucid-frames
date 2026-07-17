<?php
header('Content-Type: application/json');

// Set target email address
$to = "alok.desai@harbourandhills.com";

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['isSuccess' => false, 'error' => 'Method not allowed']);
    exit;
}

// Parse JSON input payload
$inputJSON = file_get_contents('php://input');
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

// Set mail headers
$headers = [
    "From: Pellucid Frames <no-reply@pellucidframes.com>",
    "Reply-To: $name <$email>",
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "X-Mailer: PHP/" . phpversion()
];
$headers_str = implode("\r\n", $headers);

// Dispatch the email
if (@mail($to, $subject, $email_message, $headers_str)) {
    echo json_encode(['isSuccess' => true]);
} else {
    http_response_code(500);
    echo json_encode([
        'isSuccess' => false,
        'error' => 'Failed to send email. Please try again or contact hello@pellucidframes.com directly.'
    ]);
}
?>
