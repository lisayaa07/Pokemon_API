import { MagnifyingGlass } from "phosphor-react";
import "./index.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface PokemonItem {
  name: string;
  url: string;
}

interface PokemonDetail {
  id: number;
  name: string;
  sprites: {
    front_default: string | null;
    other?: {
      home?: {
        front_default: string | null;
      };
      "official-artwork"?: {
        front_shiny: string | null;
      };
    };
  };
  types: {
    slot: number;
    type: {
      name: string;
      url: string;
    };
  }[];
}

const getTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    grass: "bg-green-500",
    fire: "bg-red-500",
    water: "bg-blue-500",
    bug: "bg-lime-600",
    normal: "bg-gray-400",
    poison: "bg-purple-600",
    electric: "bg-yellow-400",
    ground: "bg-amber-700",
    fairy: "bg-pink-400",
    fighting: "bg-orange-700",
    psychic: "bg-pink-600",
    rock: "bg-stone-600",
    ghost: "bg-indigo-800",
    ice: "bg-cyan-400",
    dragon: "bg-indigo-600",
    steel: "bg-slate-400",
    flying: "bg-sky-400",
  };

  return colors[type] ?? "bg-gray-500";
};

const pokemonTypes = [
  "all",
  "grass",
  "fire",
  "water",
  "bug",
  "normal",
  "poison",
  "electric",
  "ground",
  "fairy",
  "fighting",
  "psychic",
  "rock",
  "ghost",
  "ice",
  "dragon",
  "steel",
  "flying",
];

function Home() {
  const [pokemons, setPokemons] = useState<PokemonDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [allPokemons, setAllPokemons] = useState<PokemonItem[]>([]);
  const [suggestions, setSuggestions] = useState<PokemonItem[]>([]);
  const [selectedType, setSelectedType] = useState<string>("all");

  const getPages = () => {
    const pages: (number | string)[] = [];

    if (page > 2) pages.push(1);
    if (page > 3) pages.push("...");

    for (let i = page - 1; i <= page + 1; i++) {
      if (i > 0 && i <= totalPages) {
        pages.push(i);
      }
    }

    if (page < totalPages - 2) pages.push("...");
    if (page < totalPages - 1) pages.push(totalPages);

    return pages;
  };

  const limit = 48;

  useEffect(() => {
    const fetchPokemons = async () => {
      try {
        setLoading(true);
        const offset = (page - 1) * limit;

        const res = await axios.get(
          `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
        );

        setTotalPages(Math.ceil(res.data.count / limit));

        const pokemonData = await Promise.all(
          res.data.results.map((p: PokemonItem) => axios.get(p.url))
        );

        setPokemons(pokemonData.map((r) => r.data));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPokemons();
  }, [page]);

  useEffect(() => {
    axios.get("https://pokeapi.co/api/v2/pokemon?limit=2000").then((res) => {
      setAllPokemons(res.data.results);
    });
  }, []);

  const handleSearch = (value: string) => {
    setQuery(value);

    if (!value.trim()) {
      setSuggestions([]);
      return;
    }

    const filtered = allPokemons
      .filter((p) => p.name.startsWith(value.toLowerCase()))
      .slice(0, 8); // จำกัด 8 รายการ

    setSuggestions(filtered);
  };

  const filteredPokemons = pokemons.filter((p) => {
    if (selectedType === "all") return true;

    return p.types.some((t) => t.type.name === selectedType);
  });

  return (
    <>
      <header className="h-40 w-80 m-auto mb-8">
        <img
          src="/Logo.jpg"
          alt="Logo"
          className="object-contain h-full w-full"
        />
      </header>

      <section className="mb-6">
        <label className=" flex justify-center items-center gap-2">
          <MagnifyingGlass size={24} weight="bold" />
          <div className="relative max-w-sm ">
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search Pokémon..."
              className="
                  w-full
                  border
                  rounded-lg
                  px-4
                  py-2
                  focus:outline-none
                "
            />

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <ul
                className="
                    absolute
                    z-50
                    w-full
                    bg-white
                    border
                    rounded-lg
                    mt-1
                    shadow-lg
                    overflow-hidden
                  "
              >
                {suggestions.map((p) => {
                  const id = p.url.split("/").filter(Boolean).pop();

                  return (
                    <li
                      key={p.name}
                      onClick={() => navigate(`/pokemon/${id}`)}
                      className="
                          px-4
                          py-2
                          cursor-pointer
                          hover:bg-slate-100
                          capitalize
                        "
                    >
                      {p.name}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="
              border
              rounded-lg
              px-4
              py-2
              capitalize
              focus:outline-none
            "
          >
            {pokemonTypes.map((type) => (
              <option key={type} value={type} className="capitalize">
                {type}
              </option>
            ))}
          </select>
        </label>
      </section>

      <main className="max-w-5xl mx-auto p-4 min-h-[400px]">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : filteredPokemons.length === 0 ? (
          // ✅ กรณีไม่มี Pokémon
          <div className="flex justify-center items-center h-40">
            <p className="text-slate-400 text-sm text-center">
              No Pokémon found for the selected type.
            </p>
          </div>
        ) : (
          // ✅ กรณีมี Pokémon
          <div className="grid min-[300px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 text-center">
            {filteredPokemons.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/pokemon/${p.id}`)}
                className="
          bg-gray-900
          cursor-pointer
          rounded-2xl
          p-4
          shadow-lg
          flex
          flex-col
        "
              >
                <div className="hover-3d">
                  <figure className="w-full">
                    <img
                      src={p.sprites.other?.home?.front_default || ""}
                      alt={p.name}
                      className="mx-auto w-full h-auto object-contain max-h-[200px]"
                    />
                  </figure>

                  {/* 3D helper divs */}
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                </div>

                <div className="flex items-center justify-between mt-3 px-1">
                  <h2 className="capitalize text-white text-xs sm:text-sm font-medium truncate">
                    {p.name}
                  </h2>

                  <div className="flex items-center gap-1 shrink-0">
                    {p.types.map((t) => (
                      <span
                        key={t.type.name}
                        className={`
                  text-[9px] sm:text-[10px]
                  px-1.5 py-0.5
                  rounded-full
                  text-white
                  capitalize
                  ${getTypeColor(t.type.name)}
                `}
                      >
                        {t.type.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-2 border rounded disabled:opacity-50"
          >
            Prev
          </button>

          {getPages().map((p, index) =>
            p === "..." ? (
              <span key={index} className="px-2">
                ...
              </span>
            ) : (
              <button
                key={p}
                onClick={() => setPage(p as number)}
                className={`px-3 py-2 border rounded
          ${page === p ? "bg-black text-white" : "hover:bg-gray-100"}
        `}
              >
                {p}
              </button>
            )
          )}

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </main>
    </>
  );
}

export default Home;
