import { AppShell } from "@/components/layout/app-shell";

export default async function WorkspaceLayout({ children, params }: LayoutProps<"/w/[workspace]">) {
  const { workspace } = await params;
  return <AppShell slug={workspace}>{children}</AppShell>;
}
