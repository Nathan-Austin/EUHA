-- RPC to get distinct judge_ids that have submitted at least one score
-- (avoids PostgREST row cap when querying judging_scores directly)
CREATE OR REPLACE FUNCTION get_judge_ids_with_scores()
RETURNS TABLE(judge_id uuid)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT DISTINCT js.judge_id FROM judging_scores js;
$$;

-- Email template for judging deadline reminder
INSERT INTO email_templates (template_key, name, description, subject, html_body, text_body, variables, is_active)
VALUES (
  'judging_reminder_2026',
  '2026 Judging Deadline Reminder',
  'Reminder to current 2026 judges that judging closes Thursday 23 April',
  'Reminder: EU Hot Sauce Awards judging closes Thursday 23 April',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Judging Deadline Reminder</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background-color: #c2410c; padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">EU Hot Sauce Awards 2026</h1>
              <p style="margin: 8px 0 0; color: #fed7aa; font-size: 14px;">Judging Deadline Reminder</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 16px; color: #374151; font-size: 16px;">Hi {{name}},</p>
              <p style="margin: 0 0 16px; color: #374151; font-size: 16px;">
                Just a quick reminder that judging for the <strong>EU Hot Sauce Awards 2026</strong> closes on <strong>Thursday, 23 April</strong>.
              </p>
              <p style="margin: 0 0 24px; color: #374151; font-size: 16px;">
                If you have already submitted your scores, thank you &mdash; you can safely ignore this email.
              </p>
              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" style="margin: 0 auto 32px;">
                <tr>
                  <td style="background-color: #c2410c; border-radius: 6px; text-align: center;">
                    <a href="https://heatawards.eu/login" style="display: inline-block; padding: 14px 32px; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none;">
                      Submit My Scores
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 16px; color: #374151; font-size: 15px;">
                If you need any help accessing the judging platform or have any questions, just reply to this email and we''ll get back to you.
              </p>
              <p style="margin: 0; color: #374151; font-size: 15px;">
                Thanks for being part of the awards!
              </p>
              <p style="margin: 16px 0 0; color: #374151; font-size: 15px;">
                The EU Hot Sauce Awards Team
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                You are receiving this because you are registered as a {{judgeType}} judge for the EU Hot Sauce Awards 2026.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>',
  'Hi {{name}},

Just a quick reminder that judging for the EU Hot Sauce Awards 2026 closes on Thursday, 23 April.

If you have already submitted your scores, thank you — you can safely ignore this email.

To submit your scores, visit: https://heatawards.eu/login

If you need any help, just reply to this email.

Thanks for being part of the awards!
The EU Hot Sauce Awards Team',
  '["name", "judgeType"]'::jsonb,
  true
)
ON CONFLICT (template_key) DO NOTHING;
