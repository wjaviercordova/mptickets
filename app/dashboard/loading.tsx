import { HeaderSkeleton, StatsSkeleton, CardSkeleton } from "@/components/shared/LoadingSkeletons";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <HeaderSkeleton />
      <StatsSkeleton />
      <CardSkeleton />
    </div>
  );
}
