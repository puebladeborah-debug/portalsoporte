// Simple pass-through layout — hides the Navigation for the attendance page
// The root layout (html/body/AuthProvider) still applies
export default function AsistenciaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
