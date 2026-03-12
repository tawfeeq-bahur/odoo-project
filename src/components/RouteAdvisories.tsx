'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertTriangle,
  ShieldAlert,
  PartyPopper,
  Construction,
  CloudRain,
  Clock,
  CheckCircle,
  MapPin,
  Ban,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';

interface RouteAdvisory {
  _id: string;
  type: 'political_rally' | 'festival' | 'road_block' | 'construction' | 'weather' | 'traffic_peak' | 'best_time';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  affectedAreas: string[];
  affectedStreets?: string[];
  startDate: string;
  endDate: string;
  timeSlot?: string;
  recommendation: string;
  source?: string;
}

interface RouteAdvisoriesProps {
  source?: string;
  destination?: string;
  travelDate?: string;
}

const typeConfig: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  political_rally: { icon: ShieldAlert, label: 'Political Rally / Protest', color: 'text-red-600' },
  festival: { icon: PartyPopper, label: 'Festival / Event', color: 'text-orange-600' },
  road_block: { icon: Ban, label: 'Road Block', color: 'text-red-700' },
  construction: { icon: Construction, label: 'Road Construction', color: 'text-yellow-600' },
  weather: { icon: CloudRain, label: 'Weather Alert', color: 'text-blue-600' },
  traffic_peak: { icon: Clock, label: 'Peak Traffic Hours', color: 'text-orange-500' },
  best_time: { icon: CheckCircle, label: 'Best Time to Travel', color: 'text-green-600' },
};

const severityConfig: Record<string, { badge: string; border: string; bg: string }> = {
  critical: {
    badge: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-700',
    border: 'border-red-300 dark:border-red-700',
    bg: 'bg-red-50/50 dark:bg-red-950/20',
  },
  warning: {
    badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700',
    border: 'border-yellow-300 dark:border-yellow-700',
    bg: 'bg-yellow-50/50 dark:bg-yellow-950/20',
  },
  info: {
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-700',
    border: 'border-blue-300 dark:border-blue-700',
    bg: 'bg-blue-50/50 dark:bg-blue-950/20',
  },
};

export function RouteAdvisories({ source, destination, travelDate }: RouteAdvisoriesProps) {
  const [advisories, setAdvisories] = useState<RouteAdvisory[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    if (!source && !destination) return;

    const fetchAdvisories = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (source) params.set('source', source);
        if (destination) params.set('destination', destination);
        if (travelDate) params.set('date', travelDate);

        const res = await fetch(`/api/route-advisories?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
          setAdvisories(data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch route advisories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdvisories();
  }, [source, destination, travelDate]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (advisories.length === 0) return null;

  const criticalCount = advisories.filter(a => a.severity === 'critical').length;
  const warningCount = advisories.filter(a => a.severity === 'warning').length;
  const bestTimes = advisories.filter(a => a.type === 'best_time');
  const warnings = advisories.filter(a => a.type !== 'best_time');

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Card className={`border-2 ${criticalCount > 0 ? 'border-red-400 dark:border-red-700' : 'border-orange-300 dark:border-orange-700'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className={`h-5 w-5 ${criticalCount > 0 ? 'text-red-600' : 'text-orange-500'}`} />
            <CardTitle className="text-base sm:text-lg">
              ⚠️ {t("Route Advisories & Disclaimers")}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <Badge className="bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">
                {criticalCount} {t("Critical")}
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300">
                {warningCount} {t("Warning")}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="h-8 w-8 p-0"
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <CardDescription>
          {t("Important travel advisories for your route. Please review before travelling.")}
        </CardDescription>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4">
          {/* Warnings & Alerts */}
          {warnings.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                {t("Alerts & Warnings")}
              </h4>
              {warnings.map((advisory) => {
                const config = typeConfig[advisory.type] || typeConfig.road_block;
                const sevConfig = severityConfig[advisory.severity] || severityConfig.warning;
                const Icon = config.icon;

                return (
                  <div
                    key={advisory._id}
                    className={`rounded-lg border p-4 ${sevConfig.border} ${sevConfig.bg}`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${config.color}`} />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{advisory.title}</span>
                            <Badge variant="outline" className={`text-[10px] ${sevConfig.badge}`}>
                              {advisory.severity.toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className="text-[10px]">
                              {config.label}
                            </Badge>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          {advisory.description}
                        </p>

                        {/* Affected streets */}
                        {advisory.affectedStreets && advisory.affectedStreets.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 text-xs">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground font-medium">{t("Affected Streets")}:</span>
                            {advisory.affectedStreets.map((street, idx) => (
                              <Badge key={idx} variant="outline" className="text-[10px] bg-background">
                                {street}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Date range & time */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(advisory.startDate)} – {formatDate(advisory.endDate)}
                          </span>
                          {advisory.timeSlot && (
                            <span className="flex items-center gap-1">
                              🕐 {advisory.timeSlot}
                            </span>
                          )}
                        </div>

                        {/* Recommendation */}
                        <Alert className="mt-2 py-2">
                          <Info className="h-4 w-4" />
                          <AlertTitle className="text-xs font-semibold">{t("Recommendation")}</AlertTitle>
                          <AlertDescription className="text-xs">
                            {advisory.recommendation}
                          </AlertDescription>
                        </Alert>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Best Times to Travel */}
          {bestTimes.length > 0 && (
            <>
              {warnings.length > 0 && <Separator />}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                  {t("Best Time to Travel This Route")}
                </h4>
                {bestTimes.map((bt) => (
                  <div
                    key={bt._id}
                    className="rounded-lg border border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-950/20 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 mt-0.5 shrink-0 text-green-600" />
                      <div className="flex-1 space-y-1.5">
                        <span className="font-semibold text-sm text-green-800 dark:text-green-300">
                          {bt.title}
                        </span>
                        <p className="text-sm text-green-700 dark:text-green-400">
                          {bt.description}
                        </p>
                        {bt.timeSlot && (
                          <p className="text-xs text-green-600 dark:text-green-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {t("Recommended Time")}: <strong>{bt.timeSlot}</strong>
                          </p>
                        )}
                        {bt.recommendation && (
                          <p className="text-xs text-green-600 dark:text-green-500 italic">
                            💡 {bt.recommendation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Disclaimer footer */}
          <Separator />
          <p className="text-[11px] text-muted-foreground italic text-center">
            {t("Disclaimer: These advisories are based on reported events and may change. Always check local news before travelling. Travel at your own discretion.")}
          </p>
        </CardContent>
      )}
    </Card>
  );
}
