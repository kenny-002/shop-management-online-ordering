import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      recipientPhone,
      customerName,
      billNumber,
      orderNumber,
      totalAmount,
      invoiceUrl,
      deliveryMethod = 'WHATSAPP',
      shopName = 'FreshMart Local Supermarket',
    } = body;

    // Validate phone number
    if (!recipientPhone || recipientPhone.trim().length < 10) {
      return NextResponse.json(
        {
          success: false,
          status: 'FAILED',
          error: 'Invalid customer mobile number. Must be a valid 10-digit mobile number.',
        },
        { status: 400 }
      );
    }

    let cleanPhone = recipientPhone.replace(/\D/g, '');
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

    // Read server-side environment variables or passed API keys
    const smsApiKey =
      body.smsApiKey ||
      process.env.NEXT_PUBLIC_FAST2SMS_API_KEY ||
      process.env.FAST2SMS_API_KEY ||
      process.env.SMS_API_KEY ||
      '';
    const whatsappApiKey =
      body.whatsappApiKey ||
      process.env.NEXT_PUBLIC_WHATSAPP_API_KEY ||
      process.env.WHATSAPP_BUSINESS_TOKEN ||
      process.env.WHATSAPP_API_KEY ||
      '';

    // 1. Dispatch via WhatsApp Business API if available
    if ((deliveryMethod === 'WHATSAPP' || deliveryMethod === 'BOTH') && whatsappApiKey) {
      try {
        const messageText = `🧾 *Your Bill from ${shopName}*\n\nOrder: #${orderNumber || billNumber}\nAmount: ₹${totalAmount}\nCustomer: ${customerName}\n\nThank you for shopping with us!\n\nView Invoice:\n${invoiceUrl}`;

        // Call WhatsApp Business API (e.g. Meta Cloud API / Provider)
        const waRes = await fetch(
          `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID || '1000000'}/messages`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${whatsappApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              to: cleanPhone,
              type: 'text',
              text: { body: messageText },
            }),
          }
        );

        const waData = await waRes.json();
        if (waData.messages && waData.messages[0]?.id) {
          return NextResponse.json({
            success: true,
            status: 'DELIVERED',
            deliveryMethod: 'WHATSAPP',
            messageId: waData.messages[0].id,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (err: unknown) {
        console.error('[WhatsApp Business API Error]', err);
      }
    }

    // 2. SMS Dispatch via Fast2SMS (or configured SMS Gateway)
    if (smsApiKey) {
      try {
        const smsContent = `[${shopName}] Bill: Order #${orderNumber || billNumber}, Total Rs ${totalAmount}. View digital invoice: ${invoiceUrl}`;
        const raw10DigitPhone = cleanPhone.startsWith('91') && cleanPhone.length === 12 ? cleanPhone.slice(2) : cleanPhone;

        // Try POST first
        const smsRes = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            authorization: smsApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            route: 'q',
            message: smsContent,
            language: 'english',
            flash: 0,
            numbers: raw10DigitPhone,
          }),
        });

        let smsData = await smsRes.json();

        // If POST failed, try GET method fallback
        if (!smsData.return) {
          const getUrl = `https://www.fast2sms.com/dev/bulkV2?authorization=${encodeURIComponent(smsApiKey)}&route=q&message=${encodeURIComponent(smsContent)}&language=english&flash=0&numbers=${raw10DigitPhone}`;
          const getRes = await fetch(getUrl);
          const getData = await getRes.json();
          if (getData.return) {
            smsData = getData;
          }
        }

        if (smsData.return) {
          return NextResponse.json({
            success: true,
            status: 'SENT',
            deliveryMethod: 'SMS',
            messageId: `SMS-${smsData.request_id || Date.now()}`,
            timestamp: new Date().toISOString(),
          });
        } else {
          const errorMsg = Array.isArray(smsData.message)
            ? smsData.message.join(', ')
            : typeof smsData.message === 'string'
            ? smsData.message
            : 'Fast2SMS dispatch failed';
          return NextResponse.json({
            success: false,
            status: 'FAILED',
            deliveryMethod: 'SMS',
            error: `Fast2SMS Error: ${errorMsg}`,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (err: unknown) {
        console.error('[SMS API Error]', err);
        return NextResponse.json({
          success: false,
          status: 'FAILED',
          deliveryMethod: 'SMS',
          error: err instanceof Error ? err.message : 'Network error reaching Fast2SMS gateway',
          timestamp: new Date().toISOString(),
        });
      }
    }

    // 3. Fallback when no live API key is configured
    return NextResponse.json({
      success: true,
      status: 'SENT',
      deliveryMethod: deliveryMethod,
      isSimulation: true,
      messageId: `SIM-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toISOString(),
      warning: 'No live SMS API key configured. SMS was simulated locally.',
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Internal Server Notification Error';
    return NextResponse.json(
      {
        success: false,
        status: 'FAILED',
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
