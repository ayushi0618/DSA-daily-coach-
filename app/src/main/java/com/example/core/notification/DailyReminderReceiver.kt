package com.example.core.notification

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class DailyReminderReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        // If device rebooted, restore reminder schedule
        if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            if (ReminderManager.isReminderEnabled(context)) {
                val (hour, minute) = ReminderManager.getReminderTime(context)
                ReminderManager.scheduleDailyReminder(context, hour, minute)
            }
            return
        }

        // Fire daily challenge notification
        ReminderManager.showNotification(
            context = context,
            title = "🔥 Daily DSA Challenge Waiting!",
            message = "Protect your streak! Solve today's assigned algorithm problem to gain XP."
        )

        // Reschedule for next day if still enabled
        if (ReminderManager.isReminderEnabled(context)) {
            val (hour, minute) = ReminderManager.getReminderTime(context)
            ReminderManager.scheduleDailyReminder(context, hour, minute)
        }
    }
}
