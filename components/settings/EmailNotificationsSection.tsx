"use client";

import { useState } from "react";
import { Bell, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateEmailPreferences } from "@/lib/actions/settings";
import ToggleRow from "./ToggleRow";

interface Props {
  emailPreferences: {
    notifyInterview: boolean;
    notifyFollowUp: boolean;
    notifyStale: boolean;
  };
}

export default function EmailNotificationsSection({ emailPreferences }: Props) {
  const [interview, setInterview] = useState(emailPreferences.notifyInterview);
  const [followUp, setFollowUp] = useState(emailPreferences.notifyFollowUp);
  const [stale, setStale] = useState(emailPreferences.notifyStale);
  const [saving, setSaving] = useState(false);

  const allDisabled = !interview && !followUp && !stale;

  async function handleSave() {
    setSaving(true);
    const result = await updateEmailPreferences({
      notifyInterview: interview,
      notifyFollowUp: followUp,
      notifyStale: stale,
    });
    setSaving(false);
    if (result.success) {
      toast.success("Email preferences updated!");
    } else {
      toast.error(result.error || "Failed to update preferences.");
    }
  }

  return (
    <section>
      {/* Section header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="p-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-md">
          <Bell className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Email Notifications
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Choose which emails JobPace sends you.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-1">
          {allDisabled && (
            <div className="flex items-start gap-2.5 p-3 my-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                <strong>All reminders are disabled.</strong> You may miss
                important interviews or follow-ups. We recommend keeping at
                least interview reminders on.
              </p>
            </div>
          )}

          <ToggleRow
            label="Interview Reminders"
            description="Get an email on the day of your scheduled interviews."
            checked={interview}
            onChange={setInterview}
          />
          <ToggleRow
            label="Follow-up Reminders"
            description="Receive an email on the date you set for following up."
            checked={followUp}
            onChange={setFollowUp}
          />
          <ToggleRow
            label="Stale Application Alerts"
            description="Get alerted when an application has had no updates for 20+ days."
            checked={stale}
            onChange={setStale}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800/40 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Preferences"
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
