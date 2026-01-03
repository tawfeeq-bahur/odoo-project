import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlaceInfo } from '@/ai/flows/place-search';
import { MapPin, Star, Calendar, DollarSign, Info, Route, Plane } from 'lucide-react';
import Link from 'next/link';

interface PlaceCardProps {
    place: PlaceInfo;
}

export function PlaceCard({ place }: PlaceCardProps) {
    return (
        <Card className="hover:shadow-xl transition-all duration-300 border-2">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-2xl mb-1">{place.name}</CardTitle>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {place.location}
                        </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                        {place.type}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Description */}
                <p className="text-sm leading-relaxed">{place.description}</p>

                {/* Best For */}
                <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                        <Star className="h-3 w-3" /> Best For
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {place.bestFor.map((item, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                                {item}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Famous For */}
                <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Famous For:</p>
                    <ul className="text-sm space-y-1">
                        {place.famousFor.slice(0, 3).map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                                <span className="text-primary">•</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> Best Time
                        </p>
                        <p className="text-sm font-medium">{place.bestTimeToVisit}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <DollarSign className="h-3 w-3" /> Budget
                        </p>
                        <p className="text-sm font-medium">{place.estimatedBudget}</p>
                    </div>
                </div>

                {/* Travel Tip */}
                {place.travelTip && (
                    <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                            <Info className="h-3 w-3" /> Travel Tip
                        </p>
                        <p className="text-sm">{place.travelTip}</p>
                    </div>
                )}

                {/* Nearby Places */}
                {place.nearbyPlaces.length > 0 && (
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-2">Nearby:</p>
                        <div className="flex flex-wrap gap-1">
                            {place.nearbyPlaces.map((nearby, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                    {nearby}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="flex gap-2 pt-2">
                    <Button asChild size="sm" className="flex-1">
                        <Link href={`/guide?destination=${encodeURIComponent(place.name)}`}>
                            <Route className="mr-2 h-4 w-4" />
                            Plan Route
                        </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="flex-1">
                        <Link href={`/guide?source=${encodeURIComponent(place.name)}`}>
                            <Plane className="mr-2 h-4 w-4" />
                            Start Here
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
