import { Oferta } from "@/lib/types";

interface OfertaCardProps {
  oferta: Oferta;
}

function formatPrecio(precio: number) {
  return `S/ ${precio.toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const TIENDA_COLORS: Record<string, string> = {
  Falabella: "bg-green-900/50 text-green-400",
  Sodimac: "bg-orange-900/50 text-orange-400",
  Linio: "bg-yellow-900/50 text-yellow-400",
  PlazaVea: "bg-red-900/50 text-red-400",
  Ripley: "bg-purple-900/50 text-purple-400",
};

export default function OfertaCard({ oferta }: OfertaCardProps) {
  const descuento = Math.round(oferta.descuentoPorcentaje);
  const puntaje = Math.round(oferta.puntaje * 100);
  const tiendaColor =
    TIENDA_COLORS[oferta.tienda] ?? "bg-gray-800 text-gray-300";

  return (
    <a
      href={oferta.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-3 hover:border-orange-400/60 hover:shadow-xl hover:shadow-orange-950/30 transition-all duration-200"
    >
      {/* Tienda + descuento */}
      <div className="flex items-start justify-between gap-2">
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${tiendaColor}`}
        >
          {oferta.tienda}
        </span>
        {descuento > 0 && (
          <span className="text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">
            -{descuento}%
          </span>
        )}
      </div>

      {/* Nombre */}
      <p className="text-sm text-gray-200 font-medium leading-snug line-clamp-3 group-hover:text-white transition-colors flex-1">
        {oferta.nombre}
      </p>

      {/* Precio */}
      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-white">
            {formatPrecio(oferta.precio)}
          </span>
          {oferta.precioOriginal > oferta.precio && (
            <span className="text-xs text-gray-500 line-through">
              {formatPrecio(oferta.precioOriginal)}
            </span>
          )}
        </div>

        {/* Meta info */}
        <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
          <span className="capitalize">{oferta.categoria}</span>
          <div className="flex items-center gap-2">
            {oferta.pulgadas ? (
              <span>{oferta.pulgadas}&quot;</span>
            ) : null}
            {oferta.precioPorPulgada > 0 && oferta.pulgadas ? (
              <span>{formatPrecio(oferta.precioPorPulgada)}/&quot;</span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Barra de puntaje */}
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-orange-500 to-orange-400 h-1.5 rounded-full transition-all"
            style={{ width: `${Math.min(puntaje, 100)}%` }}
          />
        </div>
        <span className="text-xs text-orange-400 font-semibold tabular-nums w-10 text-right">
          {puntaje}pts
        </span>
      </div>
    </a>
  );
}
