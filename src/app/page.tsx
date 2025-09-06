import Game from '@/components/Game';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-4">Echoes of Dead</h1>
      <p className="mb-4 text-center">Use arrow keys or WASD to move the green player</p>
      <Game />
    </main>
  );
}
