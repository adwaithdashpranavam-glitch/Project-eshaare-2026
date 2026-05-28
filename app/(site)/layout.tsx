import Navbar from "@/components/layout/Navbar";
import DeferredShell from "@/components/layout/DeferredShell";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <DeferredShell />
    </>
  );
}
