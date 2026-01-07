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
                  absolute
                  top-4
                  left-4
                  z-30
                  bg-white/80
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
          <ArrowLeft />
        </button>

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
              -translate-x-1/2
              bottom-[-60px]
              w-72
              drop-shadow-xl
              z-20
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-stretch mx-10">
        <div className="p-2">
          {evolutions.length > 0 && (
            <div className="grids">
              <h2 className="text-lg font-bold mb-3 text-center">
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
                  bg-slate-50
                  rounded-2xl
                  border
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
            <div className="bg-slate-50 rounded-2xl border-slate-100 border p-4 flex flex-col justify-between h-28">
              <div className="flex items-center gap-2 text-slate-600">
                <Barbell size={22} />
                <span className="text-sm font-medium">Weight</span>
              </div>
              <div className="self-end font-bold">
                {pokemon.weight / 10} <span className="text-sm">kg</span>
              </div>
            </div>

            {/* Height */}
            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 flex flex-col justify-between h-28">
              <div className="flex items-center gap-2 text-slate-600">
                <Ruler size={22} />
                <span className="text-sm font-medium">Height</span>
              </div>
              <div className="self-end font-bold">
                {pokemon.height / 10} <span className="text-sm">m</span>
              </div>
            </div>

            {/* Abilities */}
            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 flex flex-col justify-between h-28">
              <div className="flex items-center gap-2 text-slate-600">
                <Ghost size={22} />
                <span className="text-sm font-medium">Abilities</span>
              </div>
              <div className="self-end text-right text-sm">
                {pokemon.abilities.map((a) => (
                  <div key={a.ability.name} className="capitalize">
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
            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 flex items-center justify-center h-28">
              <img
                src={
                  pokemon.sprites.other?.showdown?.front_default ||
                  pokemon.sprites.front_default ||
                  ""
                }
                alt={`${pokemon.name} gif`}
                className="h-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>

     <div className="mt-8 mx-10">
  <h2 className="text-lg font-bold mb-3 text-center">Base Stats</h2>

  <div
    className="
      bg-slate-50
      rounded-2xl
      border
      border-slate-100
      p-4
      grid
      grid-cols-1
      md:grid-cols-2
      gap-6
    "
  >
    {/* ===== LEFT COLUMN ===== */}
    <div className="space-y-3">
      {pokemon.stats.slice(0, 3).map((s) => (
        <div key={s.stat.name} className="flex items-center gap-3">
          <span className="w-24 text-sm font-medium text-slate-600">
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

          <span className="w-10 text-right text-sm font-bold text-slate-800">
            {s.base_stat}
          </span>
        </div>
      ))}
    </div>

    {/* ===== RIGHT COLUMN ===== */}
    <div className="space-y-3">
      {pokemon.stats.slice(3, 6).map((s) => (
        <div key={s.stat.name} className="flex items-center gap-3">
          <span className="w-24 text-sm font-medium text-slate-600">
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

          <span className="w-10 text-right text-sm font-bold text-slate-800">
            {s.base_stat}
          </span>
        </div>
      ))}
    </div>
  </div>
</div>


      {/* ===== VARIETIES ===== */}
      {varieties.length > 0 && (
        <section className="mt-10 mx-10 mb-5">
          <h2 className="text-2xl font-bold mb-4">Other Forms</h2>
          <div className="flex gap-4 flex-wrap">
            {varieties.map((v) => (
              <Link
                key={v.id}
                to={`/pokemon/${v.id}`}
                className={`px-4 py-2 rounded border ${
                  v.is_default ? "bg-black text-white" : "hover:bg-gray-100"
                }`}
              >
                {v.name}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default PokemonDetail;
