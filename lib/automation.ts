// Eshaare Automation System
// Handles automated emails, SMS, and reminders using Resend or Twilio/Wassenger webhooks.

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || ""; // Webhook URL (e.g. Wassenger/Twilio)
const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY || "";

export const AutomationService = {
    /**
     * Sends an email via Resend API
     */
    sendEmail: async ({ to, subject, html }: { to: string; subject: string; html: string }) => {
        if (!RESEND_API_KEY) {
            console.warn(
                `[AUTOMATION - EMAIL MOCK] ✉️\nTo: ${to}\nSubject: ${subject}\nContent: ${html.replace(/<[^>]*>/g, "")}\n(Set RESEND_API_KEY in environment to send real emails.)`
            );
            return true;
        }

        try {
            const res = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${RESEND_API_KEY}`,
                },
                body: JSON.stringify({
                    from: "Eshaare Tourism <onboarding@resend.dev>", // Or verified domain
                    to: [to],
                    subject,
                    html,
                }),
            });

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`Resend API Error: ${errText}`);
            }

            console.log(`[AUTOMATION] ✉️ Real Email successfully sent to ${to} (Subject: "${subject}")`);
            return true;
        } catch (error) {
            console.error("[AUTOMATION] ❌ Failed to send email via Resend:", error);
            return false;
        }
    },

    /**
     * Sends a welcome email when a new lead is captured
     */
    sendWelcomeEmail: async (email: string, name: string) => {
        const subject = "Welcome to ESHAARE TOUR!";
        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #e68932; text-align: center;">Welcome to ESHAARE TOUR</h2>
                <p>Hi <strong>${name}</strong>,</p>
                <p>Thank you for submitting your travel inquiry! Our expert consultants are already reviewing your details and will get in touch with you shortly.</p>
                <p>If you have any urgent documents to upload, you can always coordinate with our support team.</p>
                <br />
                <hr style="border: 0; border-top: 1px solid #eee;" />
                <p style="font-size: 12px; color: #666; text-align: center;">ESHAARE TOUR & EVENTS - Dubai, UAE</p>
            </div>
        `;
        return AutomationService.sendEmail({ to: email, subject, html });
    },

    /**
     * Sends a booking confirmation email
     */
    sendBookingConfirmation: async (email: string, name: string, date: string, time: string) => {
        const subject = "Consultation Booking Confirmed - ESHAARE TOUR";
        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #e68932;">Booking Confirmed</h2>
                <p>Hi <strong>${name}</strong>,</p>
                <p>Your appointment has been successfully scheduled for <strong>${date}</strong> at <strong>${time}</strong>.</p>
                <p>Our visa expert will contact you at your chosen time.</p>
                <br />
                <p>Best regards,<br/>ESHAARE TOUR Team</p>
            </div>
        `;
        return AutomationService.sendEmail({ to: email, subject, html });
    },

    /**
     * Sends an appointment reminder (Email / SMS)
     */
    sendAppointmentReminder: async (phone: string, name: string, time: string) => {
        console.log(`[AUTOMATION] 📱 Sending SMS Reminder to ${phone}: Hi ${name}, you have a consultation at ${time}.`);
        return true;
    },

    /**
     * Sends a visa status update notification
     */
    sendVisaStatusUpdate: async (email: string, status: string, reason?: string) => {
        const subject = `Visa Application Status Update: ${status.toUpperCase()}`;
        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #e68932;">Visa Application Update</h2>
                <p>Your visa application status has been updated to: <strong style="text-transform: uppercase; color: #00C2FF;">${status}</strong></p>
                ${reason ? `<p style="padding: 10px; background-color: #fff5f5; border-left: 4px solid #f56565; color: #c53030;">Reason: ${reason}</p>` : ""}
                <p>Please log in to your portal or check the mobile app to see updated case files and download your documents.</p>
                <br />
                <p>Best regards,<br/>ESHAARE TOUR Team</p>
            </div>
        `;
        return AutomationService.sendEmail({ to: email, subject, html });
    },

    /**
     * Triggers an automated WhatsApp message through webhooks/APIs
     */
    sendWhatsAppNotification: async (phone: string, text: string) => {
        const formattedPhone = phone.replace(/[^0-9]/g, "");
        if (!WHATSAPP_API_URL || !WHATSAPP_API_KEY) {
            console.log(
                `[AUTOMATION - WHATSAPP MOCK] 📱\nTo: +${formattedPhone}\nMessage: "${text}"\n(Set WHATSAPP_API_URL & WHATSAPP_API_KEY in env to trigger automated messaging APIs.)`
            );
            return true;
        }

        try {
            const res = await fetch(WHATSAPP_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${WHATSAPP_API_KEY}`,
                },
                body: JSON.stringify({
                    phone: formattedPhone,
                    message: text,
                }),
            });

            if (!res.ok) {
                throw new Error(`WhatsApp API response not OK: ${res.statusText}`);
            }

            console.log(`[AUTOMATION] 📱 WhatsApp message successfully sent to +${formattedPhone}`);
            return true;
        } catch (error) {
            console.error("[AUTOMATION] ❌ Failed to send WhatsApp notification:", error);
            return false;
        }
    },
};
