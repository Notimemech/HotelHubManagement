// Shared admin input style. Explicit bg/text so dark-mode CSS variables
// in globals.css can't bleed through and cause white-on-white text.
export const INPUT =
  "w-full px-3 py-2 text-sm rounded-md border border-zinc-300 bg-white text-zinc-900 " +
  "placeholder:text-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20";