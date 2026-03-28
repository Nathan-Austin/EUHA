'use client';

import { useEffect, useState } from 'react';

const UTM = 'utm_source=euha&utm_medium=judging_app&utm_campaign=euha_2026';

const SETS = [
  {
    name: 'Sweet & Savage',
    price: '€28.00',
    heat: '🌶️🌶️🌶️',
    image: 'https://rmegclfgfzilmouylpio.supabase.co/storage/v1/object/public/special-box-images/Sweet_Savage-1771871009985.webp',
    url: `https://republicofheat.com/en/hot-sauce-sets/sweet-savage?${UTM}&utm_content=sweet-savage`,
  },
  {
    name: 'Daily Drizzle',
    price: '€19.95',
    heat: '🌶️',
    image: 'https://rmegclfgfzilmouylpio.supabase.co/storage/v1/object/public/special-box-images/Daily_Drizzle_Product_shot-1771869750332.webp',
    url: `https://republicofheat.com/en/hot-sauce-sets/daily-drizzle?${UTM}&utm_content=daily-drizzle`,
  },
  {
    name: 'The Everyday Heat Box',
    price: '€24.95',
    heat: '🌶️🌶️',
    image: 'https://rmegclfgfzilmouylpio.supabase.co/storage/v1/object/public/special-box-images/Everyday_Heat-1771870698972.webp',
    url: `https://republicofheat.com/en/hot-sauce-sets/the-everyday-heat-box?${UTM}&utm_content=everyday-heat-box`,
  },
  {
    name: 'Ferment & Fire',
    price: '€28.00',
    heat: '🌶️🌶️🌶️',
    image: 'https://rmegclfgfzilmouylpio.supabase.co/storage/v1/object/public/special-box-images/Ferment_and_Fire-1771871813368.webp',
    url: `https://republicofheat.com/en/hot-sauce-sets/ferment-fire?${UTM}&utm_content=ferment-fire`,
  },
  {
    name: 'Hot Discovery Set #06',
    price: '€35.00',
    heat: '🌶️🌶️🌶️',
    image: 'https://republicofheat.com/subscription_page_box.jpeg',
    url: `https://republicofheat.com/en/trial-box?heat=hot&${UTM}&utm_content=discovery-hot`,
  },
  {
    name: 'Medium Discovery Set #04',
    price: '€35.00',
    heat: '🌶️🌶️',
    image: 'https://republicofheat.com/subscription_page_box.jpeg',
    url: `https://republicofheat.com/en/trial-box?heat=medium&${UTM}&utm_content=discovery-medium`,
  },
  {
    name: 'Mild Discovery Set #03',
    price: '€35.00',
    heat: '🌶️',
    image: 'https://republicofheat.com/subscription_page_box.jpeg',
    url: `https://republicofheat.com/en/trial-box?heat=mild&${UTM}&utm_content=discovery-mild`,
  },
];

export default function RohAd() {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * SETS.length));

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(i => (i + 1) % SETS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const set = SETS[index];

  return (
    <div className="my-6 rounded-lg border border-orange-200 bg-orange-50 overflow-hidden">
      <div className="flex items-center justify-between px-3 pt-2 pb-1">
        <span className="text-xs font-medium text-orange-400 uppercase tracking-wide">Presented by Republic of Heat</span>
        <div className="flex gap-1">
          {SETS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${i === index ? 'bg-orange-500' : 'bg-orange-200'}`}
              aria-label={`Show set ${i + 1}`}
            />
          ))}
        </div>
      </div>
      <a
        href={set.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 px-3 pb-3 group"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={set.image}
          alt={set.name}
          loading="lazy"
          className="w-16 h-16 object-cover rounded-md flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm leading-tight truncate group-hover:text-orange-700 transition-colors">
            {set.name}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{set.heat}</p>
          <p className="text-sm font-bold text-orange-700 mt-1">{set.price}</p>
        </div>
        <span className="text-xs font-semibold text-orange-600 group-hover:text-orange-800 flex-shrink-0 transition-colors">
          Shop →
        </span>
      </a>
    </div>
  );
}
