-- Create email templates table for admin-editable email campaigns
CREATE TABLE email_templates (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    template_key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    subject TEXT NOT NULL,
    html_body TEXT NOT NULL,
    text_body TEXT,
    variables JSONB, -- Array of variable names that can be used in template
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add RLS policies
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Admins can manage templates
CREATE POLICY "Admins can view templates"
    ON email_templates FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM judges
            WHERE judges.email = auth.jwt()->>'email'
            AND judges.type = 'admin'
        )
    );

CREATE POLICY "Admins can insert templates"
    ON email_templates FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM judges
            WHERE judges.email = auth.jwt()->>'email'
            AND judges.type = 'admin'
        )
    );

CREATE POLICY "Admins can update templates"
    ON email_templates FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM judges
            WHERE judges.email = auth.jwt()->>'email'
            AND judges.type = 'admin'
        )
    );

-- Insert default templates
INSERT INTO email_templates (template_key, name, description, subject, html_body, text_body, variables) VALUES
(
    'supplier_2026_invitation',
    'Supplier 2026 Invitation',
    'Email template for inviting previous suppliers to participate in 2026',
    'Join Us Again - EU Hot Sauce Awards 2026 Now Open!',
    '<div style="background-color: #fabf14; padding: 20px 0; text-align: center;"><img src="https://awards.heatawards.eu/cropped-banner-website.png" alt="European Hot Sauce Awards" style="max-width: 600px; width: 100%; height: auto;" /></div>
<div style="padding: 20px; font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #ff4d00;">We''d Love to See You Back in 2026!</h1>
  <p>Dear {{brandName}},</p>
  <p>Thank you for being part of the European Hot Sauce Awards community. We''re excited to announce that entries for the 2026 competition are now open!</p>

  <h2 style="color: #ff4d00;">Why Enter Again?</h2>
  <ul>
    <li>Showcase your latest creations to Europe''s spice-loving community</li>
    <li>Gain valuable feedback from professional and community judges</li>
    <li>Increase brand visibility and credibility in the European market</li>
    <li>Network with fellow hot sauce makers and industry professionals</li>
  </ul>

  <h2 style="color: #ff4d00;">Important Dates:</h2>
  <ul>
    <li><strong>Registration Deadline:</strong> January 31, 2026</li>
    <li><strong>Samples Deadline:</strong> February 28, 2026</li>
    <li><strong>Judging Period:</strong> March 2026</li>
    <li><strong>Results Announcement:</strong> April 2026</li>
  </ul>

  <p style="text-align: center; margin: 30px 0;">
    <a href="https://awards.heatawards.eu/apply/supplier" style="background-color: #ff4d00; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Enter Your Sauces Now</a>
  </p>

  <p>Have questions? We''re here to help at heataward@gmail.com</p>

  <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 15px;">
    You''re receiving this email because you participated in a previous EU Hot Sauce Awards competition. If you''d prefer not to receive these invitations, please reply and let us know.
  </p>
</div>',
    'Dear {{brandName}}, entries for the EU Hot Sauce Awards 2026 are now open! Enter your sauces at https://awards.heatawards.eu/apply/supplier. Registration deadline: January 31, 2026. Samples deadline: February 28, 2026.',
    '["brandName"]'::jsonb
),
(
    'judge_2026_invitation',
    'Judge 2026 Invitation',
    'Email template for inviting previous judges to participate in 2026',
    'Be a Judge Again - EU Hot Sauce Awards 2026!',
    '<div style="background-color: #fabf14; padding: 20px 0; text-align: center;"><img src="https://awards.heatawards.eu/cropped-banner-website.png" alt="European Hot Sauce Awards" style="max-width: 600px; width: 100%; height: auto;" /></div>
<div style="padding: 20px; font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #ff4d00;">Your Expertise is Needed in 2026!</h1>
  <p>Dear {{name}},</p>
  <p>Thank you for your valuable contribution as a {{judgeType}} Judge in past EU Hot Sauce Awards competitions. We''d be honored to have you back for the 2026 awards!</p>

  <h2 style="color: #ff4d00;">Why Judge Again?</h2>
  <ul>
    <li>Taste and evaluate Europe''s finest hot sauces before anyone else</li>
    <li>Help shape the future of the European hot sauce industry</li>
    <li>Connect with fellow spice enthusiasts and industry professionals</li>
    <li>Be part of the most prestigious hot sauce competition in Europe</li>
  </ul>

  <h2 style="color: #ff4d00;">What to Expect:</h2>
  <ul>
    <li><strong>Judging Period:</strong> March 2026</li>
    <li><strong>Format:</strong> Blind tasting with standardized scoring criteria</li>
    <li><strong>Commitment:</strong> Approximately 2-4 hours of your time</li>
  </ul>

  <p style="text-align: center; margin: 30px 0;">
    <a href="https://awards.heatawards.eu/apply/judge" style="background-color: #ff4d00; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Register to Judge in 2026</a>
  </p>

  <p><strong>Application Deadline:</strong> February 15, 2026</p>

  <p>Questions? Contact us at heataward@gmail.com</p>

  <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 15px;">
    You''re receiving this email because you judged in a previous EU Hot Sauce Awards competition. If you''d prefer not to receive these invitations, please reply and let us know.
  </p>
</div>',
    'Dear {{name}}, we''d love to have you back as a {{judgeType}} Judge for the EU Hot Sauce Awards 2026! Register at https://awards.heatawards.eu/apply/judge. Application deadline: February 15, 2026.',
    '["name", "judgeType"]'::jsonb
);

-- Add index for faster lookups
CREATE INDEX idx_email_templates_key ON email_templates(template_key);

COMMENT ON TABLE email_templates IS 'Admin-editable email templates for campaigns and notifications';
COMMENT ON COLUMN email_templates.template_key IS 'Unique identifier for the template (e.g., supplier_2026_invitation)';
COMMENT ON COLUMN email_templates.variables IS 'JSON array of variable names that can be used in the template (e.g., ["brandName", "name"])';
