export function AuthDivider() {
  return (
    <div className="relative flex items-center gap-3 py-1">
      <div className="flex-1 border-t border-gray-200" />
      <span className="text-xs font-bold uppercase tracking-wide text-rm-trip-text-muted">or</span>
      <div className="flex-1 border-t border-gray-200" />
    </div>
  );
}
