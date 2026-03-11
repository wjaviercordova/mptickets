import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ReportesForm } from "@/components/dashboard/reportes/ReportesForm";

export const revalidate = 0; // No cachear reportes

export default async function ReportesPage() {
  const cookieStore = await cookies();
  const negocioId = cookieStore.get("mp_negocio_id")?.value;
  const usuarioId = cookieStore.get("mp_user_id")?.value;

  if (!negocioId || !usuarioId) {
    redirect("/");
  }

  return (
    <div className="space-y-6">
      <ReportesForm negocioId={negocioId} />
    </div>
  );
}
