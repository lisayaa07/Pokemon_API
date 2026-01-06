import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Barbell,Ruler } from "phosphor-react";

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
}

const getTypeColor = (type: string): string=> {
    const colors:Record<string,string> = {
      grass: 'bg-green-500',
      fire: 'bg-red-500',
      water: 'bg-blue-500',
      bug: 'bg-lime-600',
      normal: 'bg-gray-400',
      poison: 'bg-purple-600',
      electric: 'bg-yellow-400',
      ground: 'bg-amber-700',
      fairy: 'bg-pink-400',
      fighting: 'bg-orange-700',
      psychic: 'bg-pink-600',
      rock: 'bg-stone-600',
      ghost: 'bg-indigo-800',
      ice: 'bg-cyan-400',
      dragon: 'bg-indigo-600',
      steel: 'bg-slate-400',
      flying: 'bg-sky-400',
    };
    return colors[type] || 'bg-gray-500';
  };



function PokemonDetail() {
  const { id } = useParams();

  const [pokemon, setPokemon] = useState<PokemonDetail | null>(null);
  const [varieties, setVarieties] = useState<Variety[]>([]);
  const [evolutions, setEvolutions] = useState<Evolution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);



  useEffect(() => {
    const fetchPokemonDetail = async () => {
      try {
        setLoading(true);

      
        const pokemonRes = await axios.get(
          `https://pokeapi.co/api/v2/pokemon/${id}`
        );
        const data: PokemonDetail = pokemonRes.data;
        setPokemon(data);

        // 2️⃣ Species (Varieties + Evolution)
        if (data.species?.url) {
          const speciesRes = await axios.get(data.species.url);
          const speciesData = speciesRes.data;

          //  Varieties (ร่างอื่น)
          if (speciesData.varieties?.length > 1) {
            setVarieties(
              speciesData.varieties.map((v: any) => ({
                name: v.pokemon.name,
                is_default: v.is_default,
                id: v.pokemon.url.split("/").filter(Boolean).pop(),
              }))
            );
          }

          //  Evolution Chain
          if (speciesData.evolution_chain?.url) {
            const evoRes = await axios.get(
              speciesData.evolution_chain.url
            );
            const evoData = evoRes.data;

            const evoList: Evolution[] = [];

            const traverseChain = (chain: any) => {
              const evoId = chain.species.url
                .split("/")
                .filter(Boolean)
                .pop();

              evoList.push({
                name: chain.species.name,
                id: evoId,
                image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evoId}.png`,
              });

              chain.evolves_to.forEach((child: any) =>
                traverseChain(child)
              );
            };

            traverseChain(evoData.chain);
            setEvolutions(evoList);
          }
        }
      } catch (err: any) {
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
    return (
      <div className="text-center mt-10 text-red-500">
        {error}
      </div>
    );
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
           <Link to="/" className="text-red">Back</Link>

          <img
            src={
              pokemon.sprites.other?.["official-artwork"]?.front_default ||
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
                {pokemon.types.map((t) => (
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

        <div className="grid min-[600px]:grid-cols-2 lg:grid-cols-2">
         <div className="p-2">
          {evolutions.length > 0 && (
            <section className="mt-6">
              <h2 className="text-lg font-bold mb-3 text-center">
                Evolution Chain
              </h2>

          <div className="
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
          ">
            {evolutions.map((evo) => (
              <Link
                to={`/pokemon/${evo.id}`}
                key={evo.id}
                className={`
                  flex flex-col items-center
                  cursor-pointer
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
              </section>
            )}
          </div>
          </div>


          <div >
            <div className="grid min-[600px]:grid-cols-1 lg:grid-cols-2 gap-2">
              <div className="grid min-[300px]:grid-cols-2 lg:grid-cols-3 gap-2 p-2" >
                  {/* ===== Weight ===== */}
              <div className="
                bg-slate-50
                rounded-2xl
                border
                border-slate-100
                p-4
                flex
                flex-col
                justify-between
                h-28
               ">
                <div className="flex items-center gap-2 text-slate-600">
                  <Barbell size={22} color="#3b814d" weight="light" />
                  <span className="text-sm font-medium">น้ำหนัก</span>
                </div>

                <div className="self-end text-right">
                  <span className="text-xl font-bold text-slate-800">
                    {pokemon.weight / 10}
                  </span>
                  <span className="text-sm text-slate-500 ml-1">kg</span>
                </div>
              </div>

              {/* ===== Height ===== */}
              <div className="
                bg-slate-50
                rounded-2xl
                border
                border-slate-100
                p-4
                flex
                flex-col
                justify-between
                h-28
               ">
                <div className="flex items-center gap-2 text-slate-600">
                  <Ruler size={22} color="#3b814d" weight="light" />
                  <span className="text-sm font-medium">ส่วนสูง</span>
                </div>

                <div className="self-end text-right">
                  <span className="text-xl font-bold text-slate-800">
                    {pokemon.height / 10}
                  </span>
                  <span className="text-sm text-slate-500 ml-1">m</span>
                </div>
              </div>
               <div className="
                bg-slate-50
                rounded-2xl
                border
                border-slate-100
                p-4
                flex
                flex-col
                justify-between
                h-28
               ">
                <h1>1</h1>
              </div>
              </div>
              

            </div>

              

          </div>

        
 


      {/* ===== VARIETIES ===== */}
      {varieties.length > 0 && (
        <section className="mt-10">
          <h2 className="text-2xl font-bold mb-4">Other Forms</h2>
          <div className="flex gap-4 flex-wrap">
            {varieties.map((v) => (
              <Link
                key={v.id}
                to={`/pokemon/${v.id}`}
                className={`px-4 py-2 rounded border ${
                  v.is_default
                    ? "bg-black text-white"
                    : "hover:bg-gray-100"
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
