import { Button } from "@fabbit/ui";

export function SiteNotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <section className="app-panel max-w-xl rounded-lg p-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Workspace</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
          워크스페이스를 찾을 수 없습니다
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          입력한 주소에 해당하는 워크스페이스가 없거나 더 이상 사용되지 않습니다.
        </p>
        <div className="mt-6">
          <Button asChild>
            <a href="/">루트로 이동</a>
          </Button>
        </div>
      </section>
    </div>
  );
}
