import { Navbar } from '@/components/navbar';
import UserPrefs from '@/components/user-prefs';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <UserPrefs />
      </main>
    </div>
  );
}