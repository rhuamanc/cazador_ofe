"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { SortField, SortDir } from "@/lib/types";

interface FiltrosProps {
  tiendas: string[];
  categorias: string[];
  currentSort: SortField;
  currentDir: SortDir;
  currentTienda: string;
  currentCategoria: string;
  currentQ: string;
}

export default function Filtros({
  tiendas,
  categorias,
  currentSort,
  currentDir,
  currentTienda,
  currentCategoria,
  currentQ,
}: FiltrosProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const buildQuery = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      return params.toString();
    },
    [searchParams]
  );

  const navigate = (updates: Record<string, string>) => {
    startTransition(() => {
      router.push(`/?${buildQuery(updates)}`);
    });
  };

  const limpiar = () => {
    startTransition(() => router.push("/"));
  };

  const hayFiltros =
    currentQ || currentTienda || currentCategoria || currentSort !== "puntaje";

  return (
    <div
      className={`bg-gray-900 border rounded-xl p-4 transition-colors ${
        isPending ? "border-orange-400/40" : "border-gray-800"
      }`}
    >
      <div className="flex flex-wrap gap-3 items-end">
        {/* Búsqueda */}
        <div className="flex-1 min-w-48">
          <label className="block text-xs text-gray-400 mb-1">Buscar</label>
          <input
            type="search"
            defaultValue={currentQ}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                navigate({ q: (e.target as HTMLInputElement).value });
              }
            }}
            onBlur={(e) => navigate({ q: e.target.value })}
            placeholder="Samsung, laptop, parlante..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 placeholder-gray-600"
          />
        </div>

        {/* Tienda */}
        <div className="min-w-36">
          <label className="block text-xs text-gray-400 mb-1">Tienda</label>
          <select
            value={currentTienda}
            onChange={(e) => navigate({ tienda: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
          >
            <option value="">Todas</option>
            {tiendas.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Categoría */}
        <div className="min-w-36">
          <label className="block text-xs text-gray-400 mb-1">Categoría</label>
          <select
            value={currentCategoria}
            onChange={(e) => navigate({ categoria: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
          >
            <option value="">Todas</option>
            {categorias.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Ordenar */}
        <div className="min-w-40">
          <label className="block text-xs text-gray-400 mb-1">Ordenar por</label>
          <select
            value={currentSort}
            onChange={(e) => navigate({ sort: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
          >
            <option value="puntaje">Puntaje</option>
            <option value="precio">Precio</option>
            <option value="descuentoPorcentaje">Descuento %</option>
            <option value="precioPorPulgada">S/ por pulgada</option>
          </select>
        </div>

        {/* Dirección */}
        <div className="min-w-32">
          <label className="block text-xs text-gray-400 mb-1">Orden</label>
          <select
            value={currentDir}
            onChange={(e) => navigate({ dir: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
          >
            <option value="desc">Mayor → Menor</option>
            <option value="asc">Menor → Mayor</option>
          </select>
        </div>

        {/* Limpiar */}
        {hayFiltros && (
          <button
            onClick={limpiar}
            className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
          >
            Limpiar
          </button>
        )}
      </div>
    </div>
  );
}
