import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { recipientPhone, apiKey, provider = 'fast2sms' } = body;

    const testApiKey = apiKey || process.env.NEXT_PUBLIC_FAST2SMS_API_KEY || process.env.FAST2SMS_API_KEY || '';

    if (!testApiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'No SMS API key provided. Please enter your Fast2SMS API Key in Shop Settings.',
        },
        { status: 400 }
      );
    }

    if (!recipientPhone || recipientPhone.trim().length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please enter a valid 10-digit mobile number for testing.',
        },
        { status: 400 }
      );
    }

    let cleanPhone = recipientPhone.replace(/\D/g, '');
    if (cleanPhone.length > 10 && cleanPhone.startsWith('91')) {
      cleanPhone = cleanPhone.slice(2);
    }
    if (cleanPhone.length !== 10) {
      return NextResponse.json(
        {
          success: false,
          error: 'Phone number must be a valid 10-digit Indian mobile number (e.g. 9876543210).',
        },
        { status: 400 }
      );
    }

    const testMessage = `[FreshMart Test] Real cellular SMS dispatch test successful! Time: ${new Date().toLocaleTimeString()}`;

    if (provider === 'fast2sms') {
      // Try POST first
      const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: testApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'q',
          message: testMessage,
          language: 'english',
          flash: 0,
          numbers: cleanPhone,
        }),
      });

      let data = await res.json();

      // If POST failed, try GET method fallback
      if (!data.return) {
        const getUrl = `https://www.fast2sms.com/dev/bulkV2?authorization=${encodeURIComponent(testApiKey)}&route=q&message=${encodeURIComponent(testMessage)}&language=english&flash=0&numbers=${cleanPhone}`;
        const getRes = await fetch(getUrl);
        const getData = await getRes.json();
        if (getData.return) {
          data = getData;
        }
      }

      if (data.return) {
        return NextResponse.json({
          success: true,
          provider: 'Fast2SMS',
          requestId: data.request_id || `REQ-${Date.now()}`,
          message: `SMS dispatched successfully to +91${cleanPhone} via Fast2SMS!`,
          rawResponse: data,
        });
      } else {
        const errMsg = Array.isArray(data.message)
          ? data.message.join(', ')
          : typeof data.message === 'string'
          ? data.message
          : 'Fast2SMS API rejected the request';
        return NextResponse.json({
          success: false,
          provider: 'Fast2SMS',
          error: `Fast2SMS Error: ${errMsg}`,
          rawResponse: data,
        });
      }
    }

    return NextResponse.json({
      success: false,
      error: `Unsupported provider: ${provider}`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to test SMS dispatch';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
