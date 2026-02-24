import Sidebar from './Sidebar';

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="flex flex-col md:pl-64">
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
