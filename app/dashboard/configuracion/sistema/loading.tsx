import { HeaderSkeleton, TabsSkeleton, FormSkeleton } from "@/components/shared/LoadingSkeletons";

export default function SistemaConfigLoading() {
  return (
    <div className="space-y-6">
      <HeaderSkeleton />
      <TabsSkeleton />
      
      <div className="glass-card border border-blue-500/20 bg-gradient-to-br from-[#1e293b]/60 to-[#0f172a]/80 p-8 backdrop-blur-xl">
        <FormSkeleton />
      </div>
    </div>
  );
}
