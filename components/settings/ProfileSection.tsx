"use client";

import { useState } from "react";
import { User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateProfile } from "@/lib/actions/settings";
import AvatarUpload from "./AvatarUpload";

interface Props {
  profile: {
    name: string;
    email: string;
    username: string;
    image: string | null;
  };
}

export default function ProfileSection({ profile }: Props) {
  const [name, setName] = useState(profile.name);
  const [username, setUsername] = useState(profile.username ?? "");
  const [image, setImage] = useState<string | null>(profile.image);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const result = await updateProfile({
      name,
      username: username || null,
      image,
    });
    setSaving(false);
    if (result.success) {
      toast.success("Profile updated successfully!");
    } else {
      toast.error(result.error || "Failed to update profile.");
    }
  }

  return (
    <section>
      {/* Section header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Profile
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Update your display name, username, and photo.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
        {/* Avatar row */}
        <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-5">
          <AvatarUpload
            name={name}
            image={image}
            onUpload={(url) => setImage(url)}
          />
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {name || "User"}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {profile.email}
            </p>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-2">
              JPG, PNG or WebP · Max 5MB
            </p>
          </div>
        </div>

        {/* Fields */}
        <div className="px-6 py-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                className="w-full px-3 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
                  @
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  maxLength={30}
                  className="w-full pl-7 pr-3 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  placeholder="yourhandle"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={profile.email}
              readOnly
              disabled
              className="w-full px-3 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-500 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-800/50 cursor-not-allowed"
            />
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1.5">
              Email is linked to your account and cannot be changed here.
            </p>
          </div>
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
              "Save Profile"
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
