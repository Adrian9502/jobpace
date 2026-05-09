"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  User,
  Bell,
  AlertTriangle,
  Camera,
  Loader2,
} from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import { updateProfile, updateEmailPreferences } from "@/lib/actions/settings";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface Props {
  profile: {
    name: string;
    email: string;
    username: string;
    image: string | null;
  };
  emailPreferences: {
    notifyInterview: boolean;
    notifyFollowUp: boolean;
    notifyStale: boolean;
  };
}

// ──────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────

export default function SettingsClient({ profile, emailPreferences }: Props) {
  // Profile state
  const [name, setName] = useState(profile.name);
  const [username, setUsername] = useState(profile.username);
  const [image, setImage] = useState<string | null>(profile.image);
  const [savingProfile, setSavingProfile] = useState(false);

  // Notification state
  const [interview, setInterview] = useState(emailPreferences.notifyInterview);
  const [followUp, setFollowUp] = useState(emailPreferences.notifyFollowUp);
  const [stale, setStale] = useState(emailPreferences.notifyStale);
  const [savingPrefs, setSavingPrefs] = useState(false);

  async function handleSaveProfile() {
    setSavingProfile(true);
    const result = await updateProfile({ name, username: username || null, image });
    setSavingProfile(false);
    if (result.success) {
      toast.success("Profile updated successfully!");
    } else {
      toast.error(result.error || "Failed to update profile.");
    }
  }

  async function handleSavePrefs() {
    setSavingPrefs(true);
    const result = await updateEmailPreferences({
      notifyInterview: interview,
      notifyFollowUp: followUp,
      notifyStale: stale,
    });
    setSavingPrefs(false);
    if (result.success) {
      toast.success("Email preferences updated!");
    } else {
      toast.error(result.error || "Failed to update preferences.");
    }
  }

  const allDisabled = !interview && !followUp && !stale;

  return (
    <div className="space-y-8 max-w-2xl">
      {/* ─── Profile Section ─── */}
      <section>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Profile
          </h3>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-5 shadow-sm">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative">
              {image ? (
                <img
                  src={image}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover border-2 border-zinc-200 dark:border-zinc-700"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-lg font-bold text-blue-600 dark:text-blue-400 border-2 border-zinc-200 dark:border-zinc-700">
                  {name?.charAt(0)?.toUpperCase() || "?"}
                </div>
              )}
              <CldUploadWidget
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                options={{
                  maxFiles: 1,
                  resourceType: "image",
                  cropping: true,
                  croppingAspectRatio: 1,
                  croppingShowDimensions: true,
                  maxFileSize: 5000000,
                  clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
                }}
                onSuccess={(result: any) => {
                  if (result?.info?.secure_url) {
                    setImage(result.info.secure_url);
                  }
                }}
              >
                {({ open }) => (
                  <button
                    onClick={() => open()}
                    type="button"
                    className="absolute -bottom-1 -right-1 p-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                    title="Change photo"
                  >
                    <Camera className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-300" />
                  </button>
                )}
              </CldUploadWidget>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {name || "User"}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {profile.email}
              </p>
            </div>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={30}
                className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                placeholder="Letters, numbers, _ and -"
              />
            </div>
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={profile.email}
              readOnly
              disabled
              className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-500 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-800/50 cursor-not-allowed"
            />
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
              Email is linked to your account and cannot be changed here.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {savingProfile ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Profile"
              )}
            </button>
          </div>
        </div>
      </section>

      {/* ─── Email Notifications Section ─── */}
      <section>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-md">
            <Bell className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Email Notifications
          </h3>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4 shadow-sm">
          {allDisabled && (
            <div className="flex items-start gap-2.5 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                <strong>All reminders are disabled.</strong> You may miss important
                interviews, follow-ups, or let stale applications pile up. We
                strongly recommend keeping at least interview reminders enabled.
              </p>
            </div>
          )}

          <ToggleRow
            label="Interview Reminders"
            description="Get notified on the day of your scheduled interviews."
            checked={interview}
            onChange={setInterview}
          />
          <ToggleRow
            label="Follow-up Reminders"
            description="Receive reminders on the date you set for follow-ups."
            checked={followUp}
            onChange={setFollowUp}
          />
          <ToggleRow
            label="Stale Application Alerts"
            description="Get alerted when applications have had no updates for 20+ days."
            checked={stale}
            onChange={setStale}
          />

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSavePrefs}
              disabled={savingPrefs}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {savingPrefs ? (
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
    </div>
  );
}

// ──────────────────────────────────────────────
// Toggle Sub-component
// ──────────────────────────────────────────────

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div>
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {label}
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          {description}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full shrink-0 transition-colors ${
          checked ? "bg-blue-600" : "bg-zinc-200 dark:bg-zinc-700"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
