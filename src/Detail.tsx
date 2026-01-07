import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Barbell, Ruler, ArrowLeft, Ghost } from "phosphor-react";

interface Variety {
  name: string;
  id: string;
  is_default: boolean;
}

interface Evolution {
  name: string;
  id: string;
  image: string;
}
interface SpeciesVariety {
  is_default: boolean;
  pokemon: {
    name: string;
    url: string;
  };
}

interface EvolutionChain {
  species: {
    name: string;
    url: string;
  };
  evolves_to: EvolutionChain[];
}

interface PokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string | null;
    other?: {
      home?: {
        front_default: string | null;
      };
      "official-artwork"?: {
        front_default: string | null;
      };
      showdown?: {
        front_default: string | null;
        back_default: string | null;
      };
    };
  };
  species: {
    url: string;
  };
  types: {
    type: {
      name: string;
    };
  }[];
  abilities: {
    ability: {
      name: string;
      url: string;
    };
    is_hidden: boolean;
    slot: number;
  }[];
  stats: {
    base_stat: number;
    stat: {
      name: string;
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
const statNameMap: Record<string, string> = {
  hp: "HP",
  attack: "Attack",
  defense: "Defense",
  "special-attack": "Sp. Atk",
  "special-defense": "Sp. Def",
  speed: "Speed",
};

const statColorMap: Record<string, string> = {
  hp: "bg-red-500",
  attack: "bg-orange-500",
  defense: "bg-yellow-500",
  "special-attack": "bg-purple-500",
  "special-defense": "bg-blue-500",
  speed: "bg-green-500",
};

function PokemonDetail() {
  const { id = "" } = useParams<{ id: string }>();
  const [pokemon, setPokemon] = useState<PokemonDetail | null>(null);
  const navigate = useNavigate();
  const [varieties, setVarieties] = useState<Variety[]>([]);
  const [evolutions, setEvolutions] = useState<Evolution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    setIsDark(savedTheme === "dark");
  }, []);

  useEffect(() => {
    const fetchPokemonDetail = async () => {
      try {
        setLoading(true);

        const pokemonRes = await axios.get<PokemonDetail>(
          `https://pokeapi.co/api/v2/pokemon/${id}`
        );
        const data = pokemonRes.data;
        setPokemon(data);

        // Species
        const speciesRes = await axios.get(data.species.url);
        const speciesData = speciesRes.data;

        // Varieties
        if (speciesData.varieties?.length > 1) {
          setVarieties(
            speciesData.varieties.map((v: SpeciesVariety) => ({
              name: v.pokemon.name,
              is_default: v.is_default,
              id: v.pokemon.url.split("/").filter(Boolean).pop()!,
            }))
          );
        }

        // Evolution
        if (speciesData.evolution_chain?.url) {
          const evoRes = await axios.get(speciesData.evolution_chain.url);
          const evoData = evoRes.data;

          const evoList: Evolution[] = [];

          const traverseChain = (chain: EvolutionChain) => {
            const evoId = chain.species.url.split("/").filter(Boolean).pop()!;

            evoList.push({
              name: chain.species.name,
              id: evoId,
              image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evoId}.png`,
            });

            chain.evolves_to.forEach(traverseChain);
          };

          traverseChain(evoData.chain);
          setEvolutions(evoList);
        }
      } catch (err) {
        console.error(err);
        setError("ไม่สามารถโหลดข้อมูล Pokémon ได้");
      } finally {
        setLoading(false);
      }
    };

    fetchPokemonDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error || !pokemon) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  const mainType = pokemon.types[0].type.name;

  return (
    <div>
      <header
        className={`
            relative
            cursor-pointer
            rounded-2xl
            p-36
            pb-24
            shadow-lg
            ${getTypeColor(pokemon.types[0].type.name)}
          `}
      >
        <button
          onClick={() => navigate("/")}
          className="
            fixed
            top-4
            left-4
            z-50
            bg-base-content/50
            backdrop-blur
            px-4
            py-2
            rounded-full
            text-sm
            font-medium
            shadow
            hover:bg-white
            transition
          "
        >
          <ArrowLeft className="text-white" />
        </button>
        <label
          className="swap swap-rotate fixed
            top-4
            right-4
            transition"
        >
          {/* this hidden checkbox controls the state */}
          <input
            type="checkbox"
            className="theme-controller"
            value="dark"
            checked={isDark}
            onChange={(e) => {
              const theme = e.target.checked ? "dark" : "light";
              setIsDark(e.target.checked);
              localStorage.setItem("theme", theme);
              document.documentElement.setAttribute("data-theme", theme);
            }}
          />

          {/* sun icon */}
          <svg
            className="swap-off h-10 w-10 fill-current"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
          </svg>

          {/* moon icon */}
          <svg
            className="swap-on h-10 w-10 fill-current"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
          </svg>
        </label>

        <img
          src={
            pokemon.sprites.other?.home?.front_default ||
            pokemon.sprites.front_default ||
            ""
          }
          alt={pokemon.name}
          className="
              absolute
              left-1/2  
              bottom-[-60px]
              w-72
              drop-shadow-xl
              z-20
              animate-float
            "
        />
      </header>

      <div className="flex items-end">
        <h1 className="capitalize text-4xl font-bold mt-8 mx-4">
          {pokemon.name}
        </h1>
        <div className="flex items-center gap-1 ">
          {pokemon.types.map((t: PokemonDetail["types"][number]) => (
            <span
              key={t.type.name}
              className={`
                      text-[9px] sm:text-[10px]
                      px-1.5 py-0.5
                      rounded-full
                     
                      capitalize
                      ${getTypeColor(t.type.name)}
                    `}
            >
              {t.type.name}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-stretch mx-10">
        <div className="p-2">
          {evolutions.length > 0 && (
            <div className="grids">
              <h2 className="text-lg font-bold mb-3 text-center ">
                Evolution Chain
              </h2>

              <div
                className="
                  flex-1
                  flex
                  flex-wrap
                  items-center
                  justify-center
                  gap-6
                  bg-base-200
                  rounded-2xl
                 
                  border-slate-100
                  p-4
                "
              >
                {evolutions.map((evo) => (
                  <Link
                    key={evo.id}
                    to={`/pokemon/${evo.id}`}
                    className={`
                      flex flex-col items-center
                      transition
                      hover:scale-110
                      ${
                        evo.name === pokemon.name
                          ? "opacity-100 scale-110"
                          : "opacity-60 hover:opacity-100"
                      }
                    `}
                  >
                    <img
                      src={evo.image}
                      alt={evo.name}
                      className="w-16 h-16 object-contain"
                    />
                    <span className="text-xs font-medium capitalize mt-1">
                      {evo.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-2">
          {/* ===== Title Row (แนวนอน) ===== */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <h2 className="text-lg font-bold">General Information</h2>
          </div>

          {/* ===== Cards Row ===== */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {/* Weight */}
            <div className=" bg-base-200 rounded-2xl border-slate-100  p-4 flex flex-col justify-between h-28">
              <div className="flex items-center gap-2 text-slate-600">
                <Barbell size={22} className="text-base-content/70" />
                <span className="text-sm font-medium text-base-content/70">
                  Weight
                </span>
              </div>
              <div className="self-end font-bold text-base-content/70">
                {pokemon.weight / 10} <span className="text-sm ">kg</span>
              </div>
            </div>

            {/* Height */}
            <div className=" bg-base-200 rounded-2xl  border-slate-100 p-4 flex flex-col justify-between h-28">
              <div className="flex items-center gap-2 text-slate-600">
                <Ruler size={22} className="text-base-content/70" />
                <span className="text-sm font-medium text-base-content/70">
                  Height
                </span>
              </div>
              <div className="self-end font-bold text-base-content/70">
                {pokemon.height / 10} <span className="text-sm">m</span>
              </div>
            </div>

            {/* Abilities */}
            <div className=" bg-base-200 rounded-2xl  border-slate-100 p-4 flex flex-col justify-between h-28">
              <div className="flex items-center gap-2 text-slate-600">
                <Ghost size={22} className="text-base-content/70" />
                <span className="text-sm font-medium text-base-content/70">
                  Abilities
                </span>
              </div>
              <div className="self-end text-right text-sm">
                {pokemon.abilities.map((a) => (
                  <div
                    key={a.ability.name}
                    className="capitalize text-base-content/70"
                  >
                    {a.ability.name}
                    {a.is_hidden && (
                      <span className="text-xs text-slate-400 ml-1">
                        (Hidden)
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* GIF */}
            <div className=" bg-base-200 rounded-2xl  border-slate-100 p-4 flex items-center justify-center h-28">
              <figure className="hover-gallery max-w-60">
                <img
                  src={
                    pokemon.sprites.other?.showdown?.front_default ||
                    pokemon.sprites.front_default ||
                    ""
                  }
                  alt={`${pokemon.name} front`}
                  className="h-20 object-contain"
                />
                {pokemon.sprites.other?.showdown?.back_default && (
                  <img
                    src={pokemon.sprites.other.showdown.back_default}
                    alt={`${pokemon.name} back`}
                    className="h-20 object-contain"
                  />
                )}
                <img
                  src={
                    pokemon.sprites.other?.showdown?.front_default ||
                    pokemon.sprites.front_default ||
                    ""
                  }
                  alt={`${pokemon.name} front`}
                  className="h-20 object-contain"
                />
                {pokemon.sprites.other?.showdown?.back_default && (
                  <img
                    src={pokemon.sprites.other.showdown.back_default}
                    alt={`${pokemon.name} back`}
                    className="h-20 object-contain"
                  />
                )}
              </figure>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 mx-10 ">
        <h2 className="text-lg font-bold mb-3 text-center">Base Stats</h2>

        <div
          className="
       bg-base-200
      rounded-2xl
      
      border-slate-100
      p-4
      grid
      grid-cols-1
      md:grid-cols-2
      gap-6
    "
        >
          {/* ===== LEFT COLUMN ===== */}
          <div className="space-y-3 ">
            {pokemon.stats.slice(0, 3).map((s) => (
              <div key={s.stat.name} className="flex items-center gap-3">
                <span className="w-24 text-sm font-medium text-base-content/70 ">
                  {statNameMap[s.stat.name] || s.stat.name}
                </span>

                <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden ">
                  <div
                    className={`
                h-full
                rounded-full
                transition-all
                
                ${statColorMap[s.stat.name] || "bg-slate-800"}
              `}
                    style={{
                      width: `${(Math.min(s.base_stat, 150) / 150) * 100}%`,
                    }}
                  />
                </div>

                <span className="w-10 text-right text-sm font-bold text-base-content/70 ">
                  {s.base_stat}
                </span>
              </div>
            ))}
          </div>

          {/* ===== RIGHT COLUMN ===== */}
          <div className="space-y-3">
            {pokemon.stats.slice(3, 6).map((s) => (
              <div key={s.stat.name} className="flex items-center gap-3">
                <span className="w-24 text-sm font-medium text-base-content/70 ">
                  {statNameMap[s.stat.name] || s.stat.name}
                </span>

                <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`
                h-full
                rounded-full
                transition-all
                ${statColorMap[s.stat.name] || "bg-slate-800"}
              `}
                    style={{
                      width: `${(Math.min(s.base_stat, 150) / 150) * 100}%`,
                    }}
                  />
                </div>

                <span className="w-10 text-right text-sm font-bold text-base-content/70">
                  {s.base_stat}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {varieties.length > 0 && (
        <section className="mt-12 mx-10">
          <h2 className="text-2xl font-bold mb-4 text-base-content">
            Other Forms
          </h2>

          <div className="bg-base-200 rounded-2xl border border-base-300 p-4 flex flex-wrap gap-3 ">
            {varieties.map((v) => {
              const isActive = id === v.id;

              return (
                <Link
                  key={v.id}
                  to={`/pokemon/${v.id}`}
                  className={`
        px-4
        text-base-content/70
        py-2
        rounded-full
        text-sm
        font-medium
        capitalize
        transition-all
        duration-200
        ${
          isActive
            ? `${getTypeColor(mainType)} text-white shadow-lg scale-105`
            : "bg-base-100 text-base-content hover:bg-base-300 hover:scale-105"
        }
      `}
                >
                  {v.name}
                  {isActive && <span className="ml-2 text-xs  ">★</span>}
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

export default PokemonDetail;
