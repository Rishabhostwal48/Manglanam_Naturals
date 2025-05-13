import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Twilio client with credentials from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const twilioWhatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER || `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`;

let client;

// Initialize the Twilio client if credentials are available
if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
} else {
  console.warn('Twilio credentials not found in environment variables. Messaging functionality will be disabled.');
}

/**
 * Send an SMS notification
 * @param {string} to - Recipient phone number (with country code, e.g., +1234567890)
 * @param {string} message - SMS message content
 * @returns {Promise} - Promise that resolves with the message SID or rejects with an error
 */
export const sendSMS = async (to, message) => {
  try {
    // Check if Twilio is configured
    if (!client) {
      console.warn('SMS not sent: Twilio client not initialized');
      return { success: false, error: 'SMS service not configured' };
    }

    // Validate phone number format (basic validation)
    if (!to || !to.startsWith('+')) {
      console.warn(`Invalid phone number format: ${to}. Number should start with + and country code.`);
      return { success: false, error: 'Invalid phone number format' };
    }

    // Send the SMS
    const result = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: to
    });

    console.log(`SMS sent successfully to ${to}. SID: ${result.sid}`);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('Error sending SMS:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send a WhatsApp message
 * @param {string} to - Recipient WhatsApp number (with country code, e.g., +1234567890)
 * @param {string} message - WhatsApp message content
 * @param {boolean} useWhatsApp - Whether to use WhatsApp instead of SMS
 * @returns {Promise} - Promise that resolves with the message SID or rejects with an error
 */
export const sendWhatsApp = async (to, message) => {
  try {
    // Check if Twilio is configured
    if (!client) {
      console.warn('WhatsApp message not sent: Twilio client not initialized');
      return { success: false, error: 'WhatsApp service not configured' };
    }

    // Validate phone number format (basic validation)
    if (!to || !to.startsWith('+')) {
      console.warn(`Invalid WhatsApp number format: ${to}. Number should start with + and country code.`);
      return { success: false, error: 'Invalid WhatsApp number format' };
    }

    // Format the recipient number for WhatsApp
    const whatsappRecipient = `whatsapp:${to}`;
    
    // Send the WhatsApp message
    const result = await client.messages.create({
      body: message,
      from: `whatsapp:${twilioWhatsappNumber.replace('whatsapp:', '')}`,
      to: whatsappRecipient
    });

    console.log(`WhatsApp message sent successfully to ${to}. SID: ${result.sid}`);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send order confirmation notification (SMS or WhatsApp)
 * @param {string} phoneNumber - Customer's phone number
 * @param {string} orderNumber - Order reference number
 * @param {string} trackingId - Order tracking ID
 * @param {boolean} useWhatsApp - Whether to use WhatsApp instead of SMS
 * @returns {Promise} - Result of the messaging operation
 */
export const sendOrderConfirmationMessage = async (phoneNumber, orderNumber, trackingId, useWhatsApp = false) => {
  const message = `Thank you for your order with Manglanam! Your order #${orderNumber} has been confirmed. Track your order with tracking ID: ${trackingId}`;
  
  if (useWhatsApp) {
    return await sendWhatsApp(phoneNumber, message);
  } else {
    return await sendSMS(phoneNumber, message);
  }
};

/**
 * Send order status update notification (SMS or Whatnotification (SMS or WhatsApp)
 * @param {string} phoneNumber - Customer's phone number
 * @param {string} orderNumber - Order reference number
 * @param {string} status - New order status
 * @param {boolean} useWhatsApp - Whether to use WhatsApp instead of SMS
 * @param {boolean} useWhatsApp - Whether to use WhatsApp instead of SMS
 * @returns {Promise} - Result of the messaging operation
 */
export const sendOrderStatusUpdateMessage = async (phoneNumber, orderNumber, status, useWhatsApp = false) => {
  const message = `Manglanam order update: Your order #${orderNumber} is now ${status}. Track your order with your order number.`;
  
  if (useWhatsApp) {
    return await sendWhatsApp(phoneNumber, message);
  } else {
    return await sendSMS(phoneNumber, message);
  }
};

// Legacy functions for backward compatibility
export const sendOrderConfirmationSMS = async (phoneNumber, orderNumber, trackingId) => {
  return await sendOrderConfirmationMessage(phoneNumber, orderNumber, trackingId, false);
};



export default {
  sendSMS,
  sendWhatsApp,
  sendOrderConfirmationMessage,
  sendOrderStatusUpdateMessage,
};

export const sendOrderStatusUpdateSMS = async (phoneNumber, orderNumber, status) => {
  return await sendOrderStatusUpdateMessage(phoneNumber, orderNumber, status, false);
};

