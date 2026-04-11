export function GlobalLoadingScreen() {
  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-bg text-text relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.45]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, var(--color-edge) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(91,156,245,0.14),transparent_55%)]" />
      <div className="pointer-events-none absolute top-[-100px] left-[-80px] h-[340px] w-[340px] rounded-full bg-primary/14 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-[-120px] right-[-60px] h-[380px] w-[380px] rounded-full bg-primary/8 blur-[110px]" />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-10 px-6">
        <div className="relative flex w-full flex-col items-center pt-4">
          <div className="relative flex justify-center">
            <div className="relative z-10 w-[200px] rounded-t-2xl border border-border border-b-0 bg-surface-raised px-4 pb-3 pt-4 shadow-[0_16px_48px_rgba(0,0,0,0.35)]">
              <div className="mx-auto mb-3 flex h-2 w-[72%] items-center justify-center rounded-full bg-black/35 shadow-inner" />
              <div className="mx-auto h-1 w-[88%] rounded-full bg-primary/25" />

              <div className="relative -mb-1 mt-0 flex justify-center">
                <div className="animate-loading-receipt-feed relative w-[78%] origin-top">
                  <div className="relative overflow-hidden rounded-b-lg border border-black/10 border-t-0 bg-[#eceae4] px-3 pb-5 pt-3 shadow-[0_8px_24px_rgba(0,0,0,0.2)]">
                    <div
                      className="pointer-events-none absolute inset-0 animate-loading-receipt-shine opacity-90"
                      aria-hidden
                    />
                    <div className="relative space-y-2">
                      <div className="mx-auto h-1 w-[55%] rounded-full bg-black/15" />
                      <div className="h-1 w-full rounded-full bg-black/10" />
                      <div className="h-1 w-[92%] rounded-full bg-black/10" />
                      <div className="h-1 w-[78%] rounded-full bg-black/10" />
                      <div className="h-1 w-[88%] rounded-full bg-black/10" />
                      <div className="pt-1">
                        <div className="mx-auto h-6 w-[70%] rounded border border-dashed border-black/15 bg-black/5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="relative z-0 -mt-1 h-3 w-[220px] max-w-full rounded-full bg-gradient-to-b from-surface to-bg shadow-inner ring-1 ring-edge"
            aria-hidden
          />
        </div>

        <div className="flex flex-col items-center text-center gap-2">
          <p className="text-sm font-medium leading-normal text-text-muted">
            Carregando
          </p>
          <div className="h-1 w-40 shrink-0 overflow-hidden rounded-full bg-surface-inset ring-1 ring-edge">
            <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-primary/20 via-primary to-primary/60 animate-loading-bar-slide" />
          </div>
        </div>
      </div>
    </div>
  );
}
