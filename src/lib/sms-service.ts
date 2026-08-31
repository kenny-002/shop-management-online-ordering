// Real Mobile SMS Gateway Service (Fast2SMS / Twilio / Custom API)

export interface SmsGatewayConfig {
  provider: 'fast2sms' | 'twilio' | 'simulation';
  apiKey?: string;
  accountSid?: string;
  authToken?: string;
  fromNumber?: string;
}

export interface SmsDeliveryResult {
  success: boolean;
  messageId: string;
  recipientPhone: string;
  timestamp: string;
  content: string;
  provider: string;
  isRealDelivery: boolean;
  error?: string;
}

// Default configuration (can be updated in Shop Settings)
let currentGatewayConfig: SmsGatewayConfig = {
  provider: 'simulation',
  apiKey: process.env.NEXT_PUBLIC_FAST2SMS_API_KEY || '',
};

export function setSmsGatewayConfig(config: SmsGatewayConfig) {
  currentGatewayConfig = config;
}

/**
 * Sends a real cellular SMS to a customer's physical mobile handset.
 * If Fast2SMS or Twilio API key is present, calls the official telecom API.
 */
export async function sendAutomatedMobileSms(
  recipientPhone: string,
  customerName: string,
  billNumber: string,
  totalAmount: number,
  shopName: string,
  itemCount: number,
  customConfig?: SmsGatewayConfig
): Promise<SmsDeliveryResult> {
  const config = customConfig || currentGatewayConfig;
  let cleanPhone = recipientPhone.replace(/\D/g, '');
  if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

  const content = `[${shopName}] Dear ${customerName}, your invoice ${billNumber} for ${itemCount} items (Total: Rs ${totalAmount}) has been processed successfully. Thank you for shopping with us!`;

  // 1. FAST2SMS INTEGRATION (India Real Cellular SMS)
  if (config.provider === 'fast2sms' && config.apiKey) {
    try {
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: config.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'q',
          message: content,
          language: 'english',
          flash: 0,
          numbers: cleanPhone.startsWith('91') ? cleanPhone.slice(2) : cleanPhone,
        }),
      });

      const data = await response.json();
      if (data.return) {
        return {
          success: true,
          messageId: `F2SMS-${data.request_id || Date.now()}`,
          recipientPhone: `+${cleanPhone}`,
          timestamp: new Date().toLocaleTimeString(),
          content,
          provider: 'Fast2SMS Gateway',
          isRealDelivery: true,
        };
      } else {
        return {
          success: false,
          messageId: `ERR-${Date.now()}`,
          recipientPhone: `+${cleanPhone}`,
          timestamp: new Date().toLocaleTimeString(),
          content,
          provider: 'Fast2SMS Gateway',
          isRealDelivery: false,
          error: data.message || 'Fast2SMS dispatch failed',
        };
      }
    } catch (err: any) {
      console.error('Fast2SMS Error:', err);
    }
  }

  // 2. TWILIO INTEGRATION (Global Real Cellular SMS)
  if (config.provider === 'twilio' && config.accountSid && config.authToken && config.fromNumber) {
    try {
      const auth = btoa(`${config.accountSid}:${config.authToken}`);
      const body = new URLSearchParams({
        To: `+${cleanPhone}`,
        From: config.fromNumber,
        Body: content,
      });

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body,
        }
      );

      const data = await response.json();
      if (data.sid) {
        return {
          success: true,
          messageId: data.sid,
          recipientPhone: `+${cleanPhone}`,
          timestamp: new Date().toLocaleTimeString(),
          content,
          provider: 'Twilio SMS Gateway',
          isRealDelivery: true,
        };
      }
    } catch (err: any) {
      console.error('Twilio SMS Error:', err);
    }
  }

  // 3. DEFAULT SIMULATION / PREVIEW
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        messageId: `SMS-${Math.floor(100000 + Math.random() * 900000)}`,
        recipientPhone: `+${cleanPhone}`,
        timestamp: new Date().toLocaleTimeString(),
        content,
        provider: 'System SMS Gateway Simulation (API Key needed for physical delivery)',
        isRealDelivery: false,
      });
    }, 500);
  });
}
