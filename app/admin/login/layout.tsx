/**
 * Layout específico para la página de login
 * Previene que el layout padre muestre sidebar y navbar
 */

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
