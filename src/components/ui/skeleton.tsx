import { cn } from "@/lib/utils/cn";

interface SkeletonProps {
  className?: string;
  variant?: "default" | "card" | "text" | "avatar" | "image";
}

export function Skeleton({ className, variant = "default" }: SkeletonProps) {
  const baseStyles = "animate-pulse rounded bg-zinc-800";

  const variants = {
    default: "",
    card: "h-64 w-full",
    text: "h-4 w-full",
    avatar: "h-12 w-12 rounded-full",
    image: "aspect-[2/3] w-full",
  };

  return (
    <div
      className={cn(baseStyles, variants[variant], className)}
      aria-label="Loading..."
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="space-y-4 rounded-xl bg-zinc-900 p-6">
      <Skeleton variant="image" className="rounded-lg" />
      <div className="space-y-2">
        <Skeleton variant="text" className="h-6 w-3/4" />
        <Skeleton variant="text" className="h-4 w-1/2" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}




