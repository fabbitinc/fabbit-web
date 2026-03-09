export function AppLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex items-center gap-3 rounded-full border border-border/70 bg-card px-5 py-3 text-sm text-muted-foreground shadow-sm">
        <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary" />
        세션을 준비하고 있습니다...
      </div>
    </div>
  );
}
