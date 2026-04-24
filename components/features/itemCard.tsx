import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Item } from "@/types";

interface ItemCardProps {
  item: Item;
  onAdd: (item: Item) => void;
}

export const ItemCard = ({ item, onAdd }: ItemCardProps) => {
  // Base URL bisa ditaruh di env nantinya
  const imageUrl = `http://localhost:3001/uploads/${item.image}`;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="aspect-video w-full overflow-hidden bg-slate-100">
        <img 
          src={imageUrl} 
          alt={item.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://via.placeholder.com/300x200?text=No+Image";
          }}
        />
      </div>
      <CardHeader>
        <CardTitle className="text-lg line-clamp-1">{item.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
          {item.description}
        </p>
        <div className="mt-4">
          <p className="text-xl font-bold text-green-700">
            Rp {item.price.toLocaleString('id-ID')}<span className="text-xs text-slate-400">/hari</span>
          </p>
          <p className="text-xs text-slate-500">Tersedia: {item.stock} unit</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          disabled={item.stock === 0}
          onClick={() => onAdd(item)}
        >
          {item.stock > 0 ? "Sewa Sekarang" : "Habis"}
        </Button>
      </CardFooter>
    </Card>
  );
};