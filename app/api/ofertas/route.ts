import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

const VALID_SORT = new Set([
  "puntaje",
  "precio",
  "precioPorPulgada",
  "descuentoPorcentaje",
  "pulgadas",
  "nombre",
  "tienda",
]);

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  const top = Math.min(Math.max(parseInt(sp.get("top") || "100"), 1), 500);
  const page = Math.max(parseInt(sp.get("page") || "0"), 0);
  const sortRaw = sp.get("sort") || "puntaje";
  const sortField = VALID_SORT.has(sortRaw) ? sortRaw : "puntaje";
  const sortDir: 1 | -1 = sp.get("dir") === "asc" ? 1 : -1;
  const categoria = sp.get("categoria") || null;
  const tienda = sp.get("tienda") || null;
  const q = sp.get("q") || null;

  const filter: Record<string, unknown> = {};
  if (categoria) filter.categoria = categoria;
  if (tienda) filter.tienda = tienda;
  if (q) filter.nombre = { $regex: escapeRegex(q), $options: "i" };

  try {
    const client = await clientPromise;
    const col = client.db("cazador").collection("ofertas");

    const [totalOfertas, docs] = await Promise.all([
      col.countDocuments(filter),
      col
        .find(filter)
        .sort({ [sortField]: sortDir })
        .skip(page * top)
        .limit(top)
        .toArray(),
    ]);

    const ofertas = docs.map((d) => ({ ...d, _id: String(d._id) }));
    return NextResponse.json({ ofertas, totalOfertas });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Error conectando a MongoDB" },
      { status: 500 }
    );
  }
}
