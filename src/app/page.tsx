import Image from "next/image";
import Search from "@/components/Search";
import Results from "@/components/Results";

export default async function Home() {
  return (
    <main className="min-h-screen p-24">
      <Search />
      <br />
      <Results />
    </main>
  );
}
