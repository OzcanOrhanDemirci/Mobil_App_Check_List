/* Combined data array.

   The 14 categories are authored one per file (js/03a-data-01-idea-planning.js
   through js/03n-data-14-cicd.js). Each file pushes its category record onto
   window.DATA, so by the time this script runs the array is fully populated.
   The split was introduced in 1.1.0 to lower the merge-conflict surface for
   content contributors; behavior is identical to the old single-file build.

   Load order is fixed by the numbered prefixes (03a..03n run before 03-data
   in the <script defer> queue and in tests/_setup.js's SCRIPT_FILES).

   The `|| []` guard keeps the constant defined even if the 14 category files
   have not been loaded (e.g. a smoke test that only wants the resolver). */

const DATA = (typeof window !== "undefined" && window.DATA) || [];
