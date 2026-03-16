/**
 * MessagesCompatLayout — Kept for backwards compatibility only.
 * The /messages and /messages/[id] routes redirect to role-scoped messaging areas.
 * This layout is a transparent passthrough so redirect logic runs in page components.
 */
export default function MessagesCompatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
