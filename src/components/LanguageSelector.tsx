'use client';

import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage, SUPPORTED_LANGUAGES } from '@/context/LanguageContext';
import { Badge } from '@/components/ui/badge';

export function LanguageSelector() {
  const { language, setLanguage, isTranslating } = useLanguage();
  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Globe className="h-5 w-5" />
          {language !== 'en' && (
            <span className="absolute -top-0.5 -right-0.5 text-[9px] font-bold bg-primary text-primary-foreground rounded-full h-4 w-4 flex items-center justify-center uppercase">
              {language}
            </span>
          )}
          {isTranslating && (
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-orange-500 rounded-full animate-pulse" />
          )}
          <span className="sr-only">Change Language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 max-h-80 overflow-y-auto">
        <DropdownMenuLabel className="flex items-center justify-between">
          Language
          {isTranslating && <Badge variant="secondary" className="text-[10px]">Translating...</Badge>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {SUPPORTED_LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={language === lang.code ? 'bg-accent font-semibold' : ''}
          >
            <span className="flex-1">{lang.nativeName}</span>
            <span className="text-xs text-muted-foreground">{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
