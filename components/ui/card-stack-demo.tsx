"use client";

import { CardStack, CardStackItem } from "@/components/ui/card-stack";

const items: CardStackItem[] = [
  {
    id: 1,
    title: "Valentina",
    description: "El dueño muy atento, dispuesto a contestar todas mis consultas. La cabaña espectacular, equipada con lo necesario y con una ubicación inmejorable.",
    imageSrc: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
    href: "https://www.google.com/maps/place/Caba%C3%B1as+El+Jard%C3%ADn",
  },
  {
    id: 2,
    title: "Yanina",
    description: "La ubicación es excelente, no movés el auto para ir a la playa. Las instalaciones están impecables, muy limpio y bien mantenido.",
    imageSrc: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80",
    href: "https://www.google.com/maps/place/Caba%C3%B1as+El+Jard%C3%ADn",
  },
  {
    id: 3,
    title: "Mariano R.",
    description: "Excelente lugar para ir en familia. El parque y los juegos son hermosos para los chicos, cada cabaña tiene su asador individual.",
    imageSrc: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    href: "https://www.google.com/maps/place/Caba%C3%B1as+El+Jard%C3%ADn",
  },
  {
    id: 4,
    title: "Carolina G.",
    description: "Paz absoluta entre los pinos y el mar. Las cabañas son amplias, cómodas y súper luminosas. La calidez en la atención es perfecta.",
    imageSrc: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80",
    href: "https://www.google.com/maps/place/Caba%C3%B1as+El+Jard%C3%ADn",
  },
];

export default function CardStackDemoPage() {
  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-5xl p-8">
        <CardStack
          items={items}
          initialIndex={0}
          autoAdvance
          intervalMs={2800}
          pauseOnHover
          showDots
        />
      </div>
    </div>
  );
}
