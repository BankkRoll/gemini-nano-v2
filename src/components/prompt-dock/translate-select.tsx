"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppStore } from "@/store/app-store";
import { Languages } from "lucide-react";
import { memo } from "react";

const LANGS = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "ru", label: "Russian" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "zh", label: "Chinese (Simplified)" },
  { value: "zh-TW", label: "Chinese (Traditional)" },
  { value: "ar", label: "Arabic" },
  { value: "hi", label: "Hindi" },
  { value: "nl", label: "Dutch" },
  { value: "sv", label: "Swedish" },
  { value: "da", label: "Danish" },
  { value: "no", label: "Norwegian" },
  { value: "fi", label: "Finnish" },
  { value: "pl", label: "Polish" },
  { value: "tr", label: "Turkish" },
  { value: "he", label: "Hebrew" },
  { value: "th", label: "Thai" },
  { value: "vi", label: "Vietnamese" },
  { value: "id", label: "Indonesian" },
  { value: "ms", label: "Malay" },
  { value: "fa", label: "Persian" },
  { value: "ur", label: "Urdu" },
  { value: "bn", label: "Bengali" },
  { value: "ta", label: "Tamil" },
  { value: "te", label: "Telugu" },
  { value: "mr", label: "Marathi" },
  { value: "gu", label: "Gujarati" },
  { value: "kn", label: "Kannada" },
  { value: "ml", label: "Malayalam" },
  { value: "pa", label: "Punjabi" },
  { value: "or", label: "Odia" },
  { value: "as", label: "Assamese" },
  { value: "ne", label: "Nepali" },
  { value: "si", label: "Sinhala" },
  { value: "my", label: "Burmese" },
  { value: "km", label: "Khmer" },
  { value: "lo", label: "Lao" },
  { value: "ka", label: "Georgian" },
  { value: "am", label: "Amharic" },
  { value: "sw", label: "Swahili" },
  { value: "zu", label: "Zulu" },
  { value: "yi", label: "Yiddish" },
];

function TranslateSelectBase() {
  const targetLang = useAppStore((s) => s.settings.targetLang);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const selectedLanguage = LANGS.find((lang) => lang.value === targetLang);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="secondary"
          className="h-7 gap-2 px-2 border shadow-sm"
        >
          <Languages className="h-3.5 w-3.5" />
          <span className="max-sm:hidden">
            {selectedLanguage?.label || "Language"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Language</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-56 overflow-y-auto">
          {LANGS.map((lang) => (
            <DropdownMenuItem
              key={lang.value}
              onClick={() => updateSettings({ targetLang: lang.value })}
            >
              {lang.label}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const TranslateSelect = memo(TranslateSelectBase);
