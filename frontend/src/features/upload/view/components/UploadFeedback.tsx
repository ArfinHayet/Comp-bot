import { CheckCircle2, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  value: number;
  color?: string;
}

export function ProgressBar({ value, color = "bg-rm-trip-brand" }: ProgressBarProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-rm-trip-text-muted font-medium">
        <span>Processing...</span>
        <span>{value}%</span>
      </div>
      <Progress value={value} className={`h-1.5 bg-gray-100 [&>div]:${color}`} />
    </div>
  );
}

export function SuccessBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-rm-trip-smooth bg-emerald-50 border border-emerald-200 p-4">
      <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
      {children}
    </div>
  );
}

export function ErrorBanner({ msg }: { msg: string }) {
  return (
    <div className="flex items-center gap-3 rounded-rm-trip-smooth bg-red-50 border border-red-200 p-4">
      <XCircle className="h-5 w-5 text-rm-trip-state-error shrink-0" />
      <p className="text-sm text-rm-trip-state-error">{msg}</p>
    </div>
  );
}
