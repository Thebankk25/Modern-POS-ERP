import generatePayload from 'promptpay-qr';
import QRCode from 'qrcode';

// IMPORTANT: This should be configured in a settings page in a real app.
// It can be a mobile number (e.g., '0812345678') or a 13-digit National ID / Tax ID.
const MERCHANT_PROMPTPAY_ID = '0987654321'; 

/**
 * Generates a PromptPay QR code as a Data URL.
 * @param amount The payment amount in THB.
 * @returns A promise that resolves to a base64 Data URL of the QR code image, or null on error.
 */
export const generatePromptPayQR = async (amount: number): Promise<string | null> => {
    if (!MERCHANT_PROMPTPAY_ID || amount <= 0) {
        console.warn("Merchant PromptPay ID is not set or amount is invalid.");
        return null;
    }

    try {
        // Generate the payload string for the QR code
        const payload = generatePayload(MERCHANT_PROMPTPAY_ID, { amount });

        // Generate the QR code image as a Data URL
        const qrCodeUrl = await QRCode.toDataURL(payload, {
            errorCorrectionLevel: 'M',
            margin: 2,
            width: 256,
        });
        
        return qrCodeUrl;
    } catch (error) {
        console.error("Error generating PromptPay QR code:", error);
        return null;
    }
};
