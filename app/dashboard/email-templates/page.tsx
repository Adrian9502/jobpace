import EmailTemplates from "@/components/EmailTemplates";

export const metadata = {
  title: "Email Templates - JobPace",
};

export default function EmailTemplatesPage() {
  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <EmailTemplates />
    </div>
  );
}
