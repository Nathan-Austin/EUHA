-- Fix the judging reminder template to use the correct login URL
UPDATE email_templates
SET
  html_body = REPLACE(html_body, 'https://awards.euhotsauce.com/dashboard', 'https://heatawards.eu/login'),
  text_body = REPLACE(text_body, 'https://awards.euhotsauce.com/dashboard', 'https://heatawards.eu/login')
WHERE template_key = 'judging_reminder_2026';
