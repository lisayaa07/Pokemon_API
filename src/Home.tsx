import { MagnifyingGlass } from "phosphor-react";
import "./index.css";
import { useEffect, useState } from "react";
import axios from "axios";

function Home() {
  const [pokemon, setPokemon] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("https://pokeapi.co/api/v2/pokemon/pikachu")
      .then((res) => {
        setPokemon(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading || !pokemon) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <header className="h-40 w-80 m-auto mb-8">
        <img src="/Logo.jpg" alt="Logo" />
      </header>

      <section>
        <label className="input flex justify-center">
          <MagnifyingGlass size={24} weight="bold" />
          <input
            type="search"
            required
            placeholder="Search"
            className="border rounded-lg px-4 mx-2 focus:outline-none"
          />
        </label>
      </section>

      <main className="max-w-sm p-3 mb-4 mx-auto">
        <div className="grid min-[600px]:grid-cols-2 lg:grid-cols-5 gap-10 text-center">
          <div>
            <h1 className="capitalize">{pokemon.name}</h1>
            <img
              src={pokemon.sprites.front_default}
              alt={pokemon.name}
            />
            <p>Height: {pokemon.height}</p>
            <p>Weight: {pokemon.weight}</p>
          </div>
        </div>
      </main>
    </>
  );
}

export default Home;
