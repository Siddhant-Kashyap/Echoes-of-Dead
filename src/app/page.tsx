import Game from '@/components/Game';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-4">Echoes of Dead</h1>
      <Game />
      <footer className="mt-8 text-sm text-gray-500">
        <p>Developed by Sid with Love</p>   
        </footer>
    </main>
  );
}
