import { Navbar } from "./components/Navbar";
import { LandingHero } from "./components/LandingHero";
import { LandingRooms } from "./components/LandingRooms";
import { LandingServices } from "./components/LandingServices";
import { Footer } from "./components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">
        <LandingHero />
        <LandingRooms />
        <LandingServices />
      </main>
      <Footer />
    </>
  );
}
