import LiveDateTime from "./LiveDateTime";
import AddApplicationButton from "@/components/ui/AddApplicationButton";

interface Props {
  firstName: string;
}

export default function WelcomeHeader({ firstName }: Props) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Welcome back, {firstName} 👋
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Here&apos;s a summary of your job search journey.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <LiveDateTime />
        <AddApplicationButton />
      </div>
    </div>
  );
}
