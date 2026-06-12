"use client";

import { useState, useEffect, useRef } from "react";

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
type SortKey =
  | "puntaje"
  | "precio"
  | "precioPorPulgada"
  | "descuentoPorcentaje"
  | "pulgadas"
  | "nombre"
  | "tienda";
type SortDir = "asc" | "desc";

interface Oferta {
  _id: string;
  nombre: string;
  tienda: string;
  categoria: string;
  precio: number;
  precioOriginal: number;
  descuentoPorcentaje: number;
  pulgadas?: number;
  url?: string;
  precioPorPulgada: number;
  puntaje: number;
}

// â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const CATS = [
  { key: "", label: "Todos" },
  { key: "tv", label: "TV 📺" },
  { key: "celular", label: "Celulares 📱" },
  { key: "laptop", label: "Laptops 💻" },
  { key: "parlante", label: "Parlantes 🔊" },
  { key: "licuadora", label: "Licuadoras 🫙" },
  { key: "hidrolavadora", label: "Hidrolavadoras 🧼" },
];

const SORT_OPTS: { key: SortKey; label: string }[] = [
  { key: "puntaje", label: "Puntaje ★" },
  { key: "precio", label: "Precio" },
  { key: "precioPorPulgada", label: "S/×pulgada" },
  { key: "descuentoPorcentaje", label: "Descuento" },
];

const COL_HEADERS: { col: SortKey; label: string }[] = [
  { col: "nombre", label: "Producto" },
  { col: "tienda", label: "Tienda" },
  { col: "precio", label: "Precio" },
  { col: "descuentoPorcentaje", label: "Desc %" },
  { col: "pulgadas", label: "Pulgadas" },
  { col: "precioPorPulgada", label: "S/ × pulgada" },
  { col: "puntaje", label: "Puntaje" },
];

const TIENDA_CLS: Record<string, string> = {
  Falabella: "bg-blue-950 text-blue-400",
  Sodimac: "bg-green-950 text-green-400",
  Linio: "bg-purple-950 text-purple-400",
  PlazaVea: "bg-red-950 text-red-400",
  Ripley: "bg-sky-950 text-sky-400",
};

const PAGE_SIZE = 100;

function fmt(n: number) {
  return Number(n).toLocaleString("es-PE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

// â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function Home() {
  const [sortKey, setSortKey] = useState<SortKey>("puntaje");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [categoria, setCategoria] = useState("");
  const [tienda, setTienda] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState(""); // debounced
  const [page, setPage] = useState(0);
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState("");
  const [refreshToken, setRefreshToken] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // â”€â”€ Fetch effect â€” fires on any filter/sort/page change â”€â”€
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    const params = new URLSearchParams({
      top: String(PAGE_SIZE),
      page: String(page),
      sort: sortKey,
      dir: sortDir,
    });
    if (categoria) params.set("categoria", categoria);
    if (tienda) params.set("tienda", tienda);
    if (search) params.set("q", search);

    fetch(`/api/ofertas?${params}`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setOfertas(data.ofertas ?? []);
        setTotal(data.totalOfertas ?? 0);
        setLastUpdate(new Date().toLocaleTimeString("es-PE"));
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error(err);
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [sortKey, sortDir, categoria, tienda, search, page, refreshToken]);

  // â”€â”€ Auto-refresh cada 10 min â”€â”€
  useEffect(() => {
    const iv = setInterval(() => setRefreshToken((t) => t + 1), 600_000);
    return () => clearInterval(iv);
  }, []);

  // â”€â”€ Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleSearchInput = (val: string) => {
    setSearchInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(0);
      setSearch(val);
    }, 300);
  };

  const handleCat = (cat: string) => {
    setCategoria(cat);
    setPage(0);
  };
  const handleTienda = (t: string) => {
    setTienda(t);
    setPage(0);
  };
  const handleSort = (key: SortKey) => {
    setSortKey(key);
    setPage(0);
  };
  const handleDir = (d: SortDir) => {
    setSortDir(d);
    setPage(0);
  };
  const handleColSort = (col: SortKey) => {
    if (col === sortKey) handleDir(sortDir === "asc" ? "desc" : "asc");
    else handleSort(col);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const from = total === 0 ? 0 : page * PAGE_SIZE + 1;
  const to = Math.min((page + 1) * PAGE_SIZE, total);

  return (
    <main
      className="min-h-screen bg-[#0f1117] text-[#e2e8f0]"
      style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}
    >
      {/* â”€â”€ Header â”€â”€ */}
      <header className="bg-[#1a1d27] border-b border-[#2e3348] px-8 py-[18px] flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-xl font-bold tracking-tight">
          🎯 Cazador de <span className="text-blue-400">Ofertas</span>
        </h1>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs text-[#7c8399]">
            {lastUpdate
              ? `Última consulta: ${lastUpdate} · ${total} ofertas`
              : "Cargando..."}
          </span>
          <button
            onClick={() => setRefreshToken((t) => t + 1)}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-[10px] transition-opacity"
          >
            🔄 Recargar datos
          </button>
        </div>
      </header>

      {/* â”€â”€ Category tabs â”€â”€ */}
      <div className="flex border-b border-[#2e3348] bg-[#1a1d27] overflow-x-auto">
        {CATS.map((c) => (
          <button
            key={c.key}
            onClick={() => handleCat(c.key)}
            className={`px-[18px] pb-[9px] pt-[10px] text-[0.85rem] font-semibold border-b-[3px] whitespace-nowrap transition-colors ${
              categoria === c.key
                ? "text-blue-400 border-blue-400"
                : "text-[#7c8399] border-transparent hover:text-[#e2e8f0]"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* â”€â”€ Controls bar â”€â”€ */}
      <div className="flex items-center gap-3 px-8 py-4 flex-wrap">
        {/* Sort key */}
        <div className="flex bg-[#1a1d27] border border-[#2e3348] rounded-[10px] overflow-hidden">
          <span className="px-3 py-[7px] text-[0.78rem] text-[#7c8399] border-r border-[#2e3348] flex items-center">
            Ordenar por
          </span>
          {SORT_OPTS.map((o) => (
            <button
              key={o.key}
              onClick={() => handleSort(o.key)}
              className={`px-4 py-[7px] text-[0.82rem] font-medium border-r border-[#2e3348] last:border-0 transition-colors ${
                sortKey === o.key
                  ? "bg-blue-500 text-white"
                  : "text-[#e2e8f0] hover:bg-[#22263a]"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>

        {/* Direction */}
        <div className="flex bg-[#1a1d27] border border-[#2e3348] rounded-[10px] overflow-hidden">
          <span className="px-3 py-[7px] text-[0.78rem] text-[#7c8399] border-r border-[#2e3348] flex items-center">
            Orden
          </span>
          {(["asc", "desc"] as SortDir[]).map((d) => (
            <button
              key={d}
              onClick={() => handleDir(d)}
              className={`px-4 py-[7px] text-[0.82rem] font-medium border-r border-[#2e3348] last:border-0 transition-colors ${
                sortDir === d
                  ? "bg-blue-500 text-white"
                  : "text-[#e2e8f0] hover:bg-[#22263a]"
              }`}
            >
              {d === "asc" ? "↑ Asc" : "↓ Desc"}
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          type="search"
          value={searchInput}
          onChange={(e) => handleSearchInput(e.target.value)}
          placeholder="Buscar marca, modelo…"
          className="bg-[#1a1d27] border border-[#2e3348] text-[#e2e8f0] placeholder-[#7c8399] rounded-[10px] px-3 py-[7px] text-[0.82rem] w-52 focus:outline-none focus:border-blue-500"
        />

        {/* Tienda */}
        <select
          value={tienda}
          onChange={(e) => handleTienda(e.target.value)}
          className="bg-[#1a1d27] border border-[#2e3348] text-[#e2e8f0] rounded-[10px] px-3 py-[7px] text-[0.82rem] focus:outline-none focus:border-blue-500 cursor-pointer"
        >
          <option value="">Todas las tiendas</option>
          {["Falabella", "Sodimac", "Linio", "PlazaVea", "Ripley"].map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <span className="text-[0.78rem] text-[#7c8399] whitespace-nowrap ml-auto">
          {loading
            ? "Cargando..."
            : `${ofertas.length} en página · ${total} total`}
        </span>
      </div>

      {/* â”€â”€ Table â”€â”€ */}
      <div className="px-8 pb-4 overflow-x-auto">
        {/* Loading spinner */}
        {loading && (
          <div className="text-center py-20 text-[#7c8399] text-[0.95rem]">
            <div className="w-9 h-9 border-[3px] border-[#2e3348] border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
            Cargando ofertas…
          </div>
        )}

        {/* Empty */}
        {!loading && ofertas.length === 0 && (
          <div className="text-center py-20 text-[#7c8399] text-[0.95rem]">
            Sin resultados. Intenta una nueva búsqueda.
          </div>
        )}

        {/* Data table */}
        {!loading && ofertas.length > 0 && (
          <table className="w-full border-collapse text-[0.85rem]">
            <thead>
              <tr>
                <th className="bg-[#1a1d27] px-3 py-3 text-left text-[0.75rem] font-semibold text-[#7c8399] uppercase tracking-[0.5px] border-b border-[#2e3348] w-9">
                  #
                </th>
                {COL_HEADERS.map((h) => (
                  <th
                    key={h.col}
                    onClick={() => handleColSort(h.col)}
                    className={`bg-[#1a1d27] px-3 py-3 text-left text-[0.75rem] font-semibold uppercase tracking-[0.5px] border-b border-[#2e3348] whitespace-nowrap cursor-pointer select-none hover:text-[#e2e8f0] transition-colors ${
                      sortKey === h.col ? "text-blue-400" : "text-[#7c8399]"
                    }`}
                  >
                    {h.label}
                    {sortKey === h.col && (
                      <span className="ml-1 opacity-70">
                        {sortDir === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ofertas.map((o, i) => {
                const pct = Math.round((o.puntaje || 0) * 100);
                const tc = TIENDA_CLS[o.tienda] || "bg-[#22263a] text-[#7c8399]";
                const desc = o.descuentoPorcentaje > 0.5;

                return (
                  <tr
                    key={o._id}
                    className="border-b border-[#2e3348] hover:bg-[#22263a] transition-colors"
                  >
                    {/* Rank */}
                    <td className="px-3 py-3 text-center text-[0.75rem] font-bold text-[#7c8399]">
                      {page * PAGE_SIZE + i + 1}
                    </td>

                    {/* Nombre */}
                    <td className="px-3 py-3 max-w-xs">
                      {o.url ? (
                        <a
                          href={o.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-[#e2e8f0] hover:text-blue-400 hover:underline leading-snug block"
                        >
                          {o.nombre}
                        </a>
                      ) : (
                        <span className="font-medium leading-snug block">
                          {o.nombre}
                        </span>
                      )}
                      <span className="text-[0.72rem] text-[#7c8399]">
                        {o.tienda}
                      </span>
                    </td>

                    {/* Tienda badge */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-[0.72rem] font-semibold ${tc}`}
                      >
                        {o.tienda}
                      </span>
                    </td>

                    {/* Precio */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="font-bold text-[0.95rem]">
                        S/ {fmt(o.precio)}
                      </div>
                      {o.precioOriginal > o.precio && (
                        <div className="line-through text-[#7c8399] text-[0.75rem]">
                          S/ {fmt(o.precioOriginal)}
                        </div>
                      )}
                    </td>

                    {/* Descuento */}
                    <td className="px-3 py-3">
                      {desc ? (
                        <span className="bg-[#2d1515] text-red-400 font-bold text-[0.72rem] px-2 py-1 rounded-full whitespace-nowrap">
                          -{Math.round(o.descuentoPorcentaje)}%
                        </span>
                      ) : (
                        <span className="text-[#7c8399]">—</span>
                      )}
                    </td>

                    {/* Pulgadas */}
                    <td className="px-3 py-3">
                      <span className="bg-[#22263a] border border-[#2e3348] px-2 py-1 rounded text-[0.8rem] font-semibold whitespace-nowrap">
                        {o.pulgadas ? `${o.pulgadas}"` : "—"}
                      </span>
                    </td>

                    {/* Precio por pulgada */}
                    <td className="px-3 py-3 font-semibold text-[0.88rem] whitespace-nowrap">
                      {o.precioPorPulgada > 0
                        ? `S/ ${fmt(o.precioPorPulgada)}`
                        : "—"}
                    </td>

                    {/* Puntaje bar */}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2 min-w-[90px]">
                        <div className="flex-1 h-[6px] bg-[#2e3348] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-green-400"
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <span className="text-[0.72rem] text-[#7c8399] whitespace-nowrap tabular-nums">
                          {pct}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* â”€â”€ Pager â”€â”€ */}
      {!loading && total > 0 && (
        <div className="flex justify-end items-center gap-3 px-8 pb-8 flex-wrap">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="bg-[#1a1d27] border border-[#2e3348] text-[#e2e8f0] rounded-[10px] px-3 py-[7px] text-[0.82rem] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#22263a] transition-colors"
          >
            Anterior
          </button>
          <span className="text-[0.8rem] text-[#7c8399] min-w-[140px] text-center">
            Página {page + 1} de {totalPages} · {from}—{to}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={to >= total}
            className="bg-[#1a1d27] border border-[#2e3348] text-[#e2e8f0] rounded-[10px] px-3 py-[7px] text-[0.82rem] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#22263a] transition-colors"
          >
            Siguiente
          </button>
        </div>
      )}
    </main>
  );
}

