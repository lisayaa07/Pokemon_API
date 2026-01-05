import React, { useState, useEffect, useRef } from 'react';
import { Search, Volume2, Shield, Sword, Heart, Zap, Activity, Footprints, Ruler, Weight } from 'lucide-react';


import './App.css'

export default function App() {
  const [query, setQuery] = useState('bulbasaur'); // ค่าเริ่มต้น
  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [species, setSpecies] = useState(null);

  // ฟังก์ชันดึงข้อมูล API
  const fetchPokemon = async (searchQuery) => {
    if (!searchQuery) return;
    setLoading(true);
    setError(null);
    setPokemon(null);
    setSpecies(null);

    try {
      // 1. ดึงข้อมูลหลัก
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${searchQuery.toLowerCase()}`);
      if (!response.ok) {
        throw new Error('ไม่พบโปเกมอนตัวนี้ (ตรวจสอบชื่อหรือ ID)');
      }
      const data = await response.json();
      setPokemon(data);

      // 2. ดึงข้อมูล Species (เพื่อเอาคำอธิบาย Flavor text ถ้าต้องการในอนาคต)
      // ในที่นี้เราจะใช้แค่ข้อมูลหลักก่อนตาม Requirement
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPokemon('bulbasaur');
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPokemon(query);
  };

  // ฟังก์ชันเล่นเสียง
  const playCry = () => {
    if (pokemon?.cries?.latest) {
      const audio = new Audio(pokemon.cries.latest);
      audio.volume = 0.5;
      audio.play();
    }
  };

  // แปลงหน่วย
  const formatHeight = (h) => (h / 10).toFixed(1) + ' m'; // decimetres -> meters
  const formatWeight = (w) => (w / 10).toFixed(1) + ' kg'; // hectograms -> kg
  const formatId = (id) => '#' + id.toString().padStart(3, '0');

  // สีตามประเภทธาตุ
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

type StatIcon = 'hp' | 'attack'|'defense' | 'special-attack' | 'special-defense' |'speed'
  // ไอคอนตาม Stat
  const getStatIcon = (name:StatIcon) => {
    switch(name) {
      case 'hp': return <Heart size={16} className="text-red-500" />;
      case 'attack': return <Sword size={16} className="text-orange-500" />;
      case 'defense': return <Shield size={16} className="text-blue-500" />;
      case 'special-attack': return <Zap size={16} className="text-yellow-500" />;
      case 'special-defense': return <Shield size={16} className="text-green-500" />;
      case 'speed': return <Footprints size={16} className="text-pink-500" />;
      default: return <Activity size={16} />;
    }
  };


  // ชื่อ Stat ภาษาไทย (ย่อ)
  const getStatNameAI = (name:string) => {
    const map = {
      'hp': 'HP',
      'attack': 'ATK',
      'defense': 'DEF',
      'special-attack': 'Sp.ATK',
      'special-defense': 'Sp.DEF',
      'speed': 'SPD'
    };
    return map[name] || name;
  };

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 font-sans text-slate-800">
      <div className="max-w-md mx-auto">
        
        {/* Header Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
            Pokédex Lite
          </h1>
          <p className="text-slate-500 mt-2">ค้นหาข้อมูลโปเกมอนที่คุณต้องการ</p>
        </div>

        {/* Search Box */}
        <form onSubmit={handleSearch} className="relative mb-6 shadow-lg rounded-full">
          <input
            type="text"
            placeholder="ชื่อโปเกมอน (เช่น pikachu) หรือ ID..."
            className="w-full py-4 pl-6 pr-14 rounded-full border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button 
            type="submit"
            className="absolute right-2 top-2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
          >
            <Search size={24} />
          </button>
        </form>

        {/* Content Area */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500">กำลังโหลดข้อมูล...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md text-red-700 shadow-sm">
            <p className="font-bold">เกิดข้อผิดพลาด</p>
            <p>{error}</p>
          </div>
        )}

        {pokemon && !loading && !error && (
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl transform transition-all hover:scale-[1.01]">
            
            {/* Card Header (Background color based on Type) */}
            <div className={`relative p-6 pb-24 ${getTypeColor(pokemon.types[0].type.name)} text-white`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-3xl font-bold capitalize drop-shadow-md">{pokemon.name}</h2>
                  <div className="flex gap-2 mt-2">
                    {pokemon.types.map((t) => (
                      <span key={t.type.name} className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-sm font-medium capitalize shadow-sm border border-white/10">
                        {t.type.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold opacity-80">{formatId(pokemon.id)}</span>
                   {pokemon.cries.latest && (
                    <button 
                      onClick={playCry}
                      className="block mt-2 p-2 bg-white/20 rounded-full hover:bg-white/40 transition-colors"
                      title="Play Cry"
                    >
                      <Volume2 size={20} />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Background Decoration */}
              <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
                 <svg width="200" height="200" viewBox="0 0 100 100" fill="white">
                    <path d="M50 50m-40 0a40 40 0 1 0 80 0a40 40 0 1 0 -80 0" />
                 </svg>
              </div>
            </div>

            {/* Image (Overlapping) */}
            <div className="relative -mt-24 flex justify-center z-10">
              <img 
                src={
                  pokemon.sprites.other.showdown.front_default || 
                  pokemon.sprites.versions?.['generation-v']?.['black-white']?.animated?.front_default ||
                  pokemon.sprites.other['official-artwork'].front_default || 
                  pokemon.sprites.front_default
                } 
                alt={pokemon.name}
                className="w-32 h-32 object-contain drop-shadow-2xl"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>

            {/* Info Body */}
            <div className="px-6 pt-2 pb-8">
              
              {/* Physical Stats */}
              <div className="grid grid-cols-2 gap-4 mb-8 mt-4">
                <div className="flex flex-col items-center p-3 bg-slate-50 rounded-xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Weight size={18} />
                    <span className="text-sm">น้ำหนัก</span>
                  </div>
                  <span className="text-lg font-bold text-slate-800">{formatWeight(pokemon.weight)}</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-slate-50 rounded-xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Ruler size={18} />
                    <span className="text-sm">ส่วนสูง</span>
                  </div>
                  <span className="text-lg font-bold text-slate-800">{formatHeight(pokemon.height)}</span>
                </div>
              </div>

              {/* Base Stats */}
              <h3 className="text-xl font-bold text-slate-800 mb-4 border-l-4 border-blue-500 pl-3">Base Stats</h3>
              <div className="space-y-3">
                {pokemon.stats.map((stat) => (
                  <div key={stat.stat.name} className="flex items-center text-sm">
                    <div className="w-24 font-bold text-slate-600 uppercase flex items-center gap-2">
                      {getStatIcon(stat.stat.name)}
                      {getStatNameAI(stat.stat.name)}
                    </div>
                    <div className="w-10 text-right font-bold text-slate-800 mr-3">{stat.base_stat}</div>
                    <div className="flex-1 bg-slate-200 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${stat.base_stat >= 100 ? 'bg-green-500' : stat.base_stat >= 60 ? 'bg-blue-500' : 'bg-orange-500'}`}
                        style={{ width: `${Math.min(stat.base_stat, 150) / 1.5}%` }} 
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Abilities */}
              <h3 className="text-xl font-bold text-slate-800 mt-8 mb-4 border-l-4 border-purple-500 pl-3">Abilities</h3>
              <div className="flex flex-wrap gap-2">
                {pokemon.abilities.map((entry) => (
                  <span 
                    key={entry.ability.name}
                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize border ${entry.is_hidden ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}
                  >
                    {entry.ability.name.replace('-', ' ')}
                    {entry.is_hidden && <span className="ml-1 text-xs opacity-70">(Hidden)</span>}
                  </span>
                ))}
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}