import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star } from 'lucide-react';
import { TouristAttraction } from '@/ai/flows/attractions';

interface AttractionCardProps {
    attraction: TouristAttraction;
}

export function AttractionCard({ attraction }: AttractionCardProps) {
    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h3 className="font-semibold text-lg line-clamp-1">{attraction.name}</h3>
                        <Badge variant="secondary" className="mt-1">
                            {attraction.type}
                        </Badge>
                    </div>
                    {attraction.mustVisit && (
                        <Badge variant="default" className="ml-2 bg-orange-500">
                            Must Visit
                        </Badge>
                    )}
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">
                    {attraction.description}
                </p>

                <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{attraction.rating.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="text-xs">View on Map</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
