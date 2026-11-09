import Image from "next/image";
import { formatRupiah, type Menu } from "@/lib/types";

export default function MenuCard({ menu, index }: { menu: Menu; index: number }) {
  const staggerClass = `stagger-${(index % 8) + 1}`;

  return (
    <div
      className={`group animate-fade-up ${staggerClass} relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200/70 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-warung-hijau/10 hover:ring-warung-emas/60`}
    >
      {/* Foto Menu */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-warung-krem to-amber-50">
        {menu.foto_url ? (
          <Image
            src={menu.foto_url}
            alt={menu.nama}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover transition-all duration-500 group-hover:scale-108 ${
              !menu.is_ready && "grayscale"
            }`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-5xl opacity-50 transition-transform duration-500 group-hover:scale-125 group-hover:rotate-6">
              🍛
            </span>
          </div>
        )}

        {/* Badge Status */}
        {menu.is_ready ? (
          <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-warung-hijau/95 px-3 py-1 text-[11px] font-bold tracking-wide text-warung-emas shadow-md backdrop-blur-sm">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-warung-emas opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-warung-emas" />
            </span>
            READY
          </span>
          ) : (
          <span className="absolute left-3 top-3 rounded-full bg-warung-coklat/95 px-3 py-1 text-[11px] font-bold tracking-wide text-white shadow-md backdrop-blur-sm">
            HABIS
          </span>
        )}

        {/* Garis aksen emas di bawah foto — muncul saat hover */}
        <div className="absolute bottom-0 left-0 h-1 w-full origin-left scale-x-0 bg-gradient-to-r from-warung-emas via-warung-emas-tua to-warung-coklat transition-transform duration-500 group-hover:scale-x-100" />
      </div>

      {/* Info Menu */}
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="text-sm font-bold text-warung-hijau-tua line-clamp-2 sm:text-base">
          {menu.nama}
        </h3>
        {menu.deskripsi && (
          <p className="text-xs text-stone-500 line-clamp-2 sm:text-sm">
            {menu.deskripsi}
          </p>
        )}
        <div className="mt-auto pt-2">
          <p
            className={`text-lg font-extrabold ${
              menu.is_ready ? "gold-shimmer" : "price-muted"
            }`}
          >
            {formatRupiah(menu.harga)}
          </p>
        </div>
      </div>
    </div>
  );
}
