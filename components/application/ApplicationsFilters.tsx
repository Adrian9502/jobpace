import { Search } from "lucide-react";
import { STAGE_CONFIG } from "@/lib/constants";

interface Props {
  search: string;
  stageFilter: string;
  showArchived: boolean;
  onSearch: (val: string) => void;
  onStageFilter: (val: string) => void;
  onShowArchived: (val: boolean) => void;
}

export default function ApplicationsFilters({
  search,
  stageFilter,
  showArchived,
  onSearch,
  onStageFilter,
  onShowArchived,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-5">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          placeholder="Search by company, position, or location..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full pl-10 pr-3 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-white dark:bg-zinc-900 transition-all"
        />
      </div>
      <select
        value={stageFilter}
        onChange={(e) => onStageFilter(e.target.value)}
        className="px-3 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all min-w-40"
      >
        <option value="all">All Stages</option>
        {Object.entries(STAGE_CONFIG).map(([val, cfg]) => (
          <option key={val} value={val}>
            {cfg.label}
          </option>
        ))}
      </select>
      <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 px-2 mt-2 sm:mt-0">
        <input
          type="checkbox"
          checked={showArchived}
          onChange={(e) => onShowArchived(e.target.checked)}
          className="w-3 h-3 sm:w-4 sm:h-4 rounded border-zinc-300 dark:border-zinc-700 text-blue-600 focus:ring-blue-500/30"
        />
        Show Archived
      </label>
    </div>
  );
}
