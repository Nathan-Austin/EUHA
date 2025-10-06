import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, emailTemplates } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    // Verify request is from Supabase (basic auth check)
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`;

    if (authHeader !== expectedAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, data } = body;

    switch (type) {
      case 'payment_confirmation': {
        const { email, brandName, entryCount, amount } = data;
        await sendEmail({
          to: email,
          ...emailTemplates.supplierPaymentConfirmation(brandName, entryCount, amount)
        });
        break;
      }

      case 'tracking_confirmation': {
        const { email, brandName, trackingNumber, postalService } = data;
        await sendEmail({
          to: email,
          ...emailTemplates.supplierTrackingConfirmation(brandName, trackingNumber, postalService)
        });
        break;
      }

      case 'package_received': {
        const { email, brandName, sauceNames } = data;
        await sendEmail({
          to: email,
          ...emailTemplates.supplierPackageReceived(brandName, sauceNames)
        });
        break;
      }

      default:
        return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json(
      { error: 'Failed to send email', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
