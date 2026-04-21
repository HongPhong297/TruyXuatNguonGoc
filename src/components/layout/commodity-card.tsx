/**
 * Card hiển thị 1 loại mặt hàng nông sản trên landing page
 */
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

interface CommodityCardProps {
  id: string;
  name: string;
  icon: string;
  origin: string;
  description: string;
  stages: readonly string[];
  color?: string;
}

export default function CommodityCard({
  id,
  name,
  icon,
  origin,
  description,
  stages,
}: CommodityCardProps) {
  return (
    <Link
      href={`/trace?commodity=${id}`}
      className="group flex flex-col gap-4 bg-white rounded-2xl border border-gray-200 p-6 hover:border-green-400 hover:shadow-md transition-all duration-200"
    >
      {/* Icon + tên */}
      <div className="flex items-center gap-3">
        <span className="text-4xl">{icon}</span>
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">{name}</h3>
          <p className="text-xs text-gray-500">{origin}</p>
        </div>
      </div>

      {/* Mô tả */}
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>

      {/* Các bước sản xuất */}
      <div className="flex flex-wrap gap-1.5">
        {stages.map((stage, i) => (
          <Badge key={i} variant="secondary" className="text-xs font-normal">
            {i + 1}. {stage}
          </Badge>
        ))}
      </div>

      {/* Xem thêm */}
      <div className="flex items-center gap-1 text-sm text-green-700 font-medium group-hover:gap-2 transition-all">
        Xem lô hàng <ArrowRight className="w-4 h-4" />
      </div>
    </Link>
  );
}
