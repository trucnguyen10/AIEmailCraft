# Set headers
$headers = @{
    "Content-Type" = "application/json"
}

# Set data
$data = @{
    email_content = @"
    Hello how are you, Mai
"@

    email_subject = "Now Open: Discover DreamWorks Land and Exciting New Shows"
    email_sender = "Universal Orlando Resort <noreply@marketing.universalorlando.com>"
    email_timestamp = "Jun 14, 2024, 5:20 PM"
}

# Convert data to JSON
$dataJson = $data | ConvertTo-Json -Compress

# Invoke web request
$response = Invoke-WebRequest -Uri http://127.0.0.1:5000/api/generate_email_response -Method POST -Headers $headers -Body $dataJson

# Output the response
$response.Content
