import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { AutomationService } from "@/lib/automation";

// This route should be triggered by a Cron Job (e.g., Vercel Cron or GitHub Actions) daily or hourly.
export async function GET(request: Request) {
    try {
        // Authenticate the cron request (Optional but recommended in production)
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            // Uncomment in production with real env variable
            // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const today = new Date().toISOString().split("T")[0];

        // 1. Fetch appointments scheduled for today
        const appointmentsRef = collection(db, "appointments");
        const q = query(
            appointmentsRef,
            where("date", "==", today),
            where("status", "==", "confirmed")
        );
        
        const snapshot = await getDocs(q);
        
        let sentCount = 0;

        snapshot.forEach((doc) => {
            const appt = doc.data();
            
            // Trigger automated SMS/Email reminder
            if (appt.phone && appt.customerName) {
                AutomationService.sendAppointmentReminder(
                    appt.phone, 
                    appt.customerName, 
                    appt.time
                );
                sentCount++;
            }
        });

        return NextResponse.json({ 
            success: true, 
            message: `Processed ${sentCount} reminders for ${today}` 
        });

    } catch (error) {
        console.error("Cron Job Error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
