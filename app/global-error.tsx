"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
            <h2 className="text-2xl font-bold text-zinc-900 mb-2">Critical Error</h2>
            <p className="text-zinc-500 mb-8">
              A fatal error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={() => reset()}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
