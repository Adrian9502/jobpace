import ProfileSection from "./ProfileSection";
import EmailNotificationsSection from "./EmailNotificationsSection";

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

export default function SettingsClient({ profile, emailPreferences }: Props) {
  return (
    <div className="space-y-8">
      <ProfileSection profile={profile} />
      <EmailNotificationsSection emailPreferences={emailPreferences} />
    </div>
  );
}
