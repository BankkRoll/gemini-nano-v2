"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/store/app-store";

const LANGUAGE_OPTIONS = [
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

export function LanguageSelect() {
  const value = useAppStore((s) => s.settings.targetLang);
  const onChange = useAppStore((s) => s.updateSettings);
  const selectedLanguage = LANGUAGE_OPTIONS.find(
    (lang) => lang.value === value,
  );

  return (
    <Select value={value} onValueChange={(v) => onChange({ targetLang: v })}>
      <SelectTrigger className="h-9 px-3 border-2 border-foreground shadow-sm bg-input text-foreground rounded-md hover:bg-muted/50 transition-colors">
        <SelectValue>
          {selectedLanguage ? (
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium">A</span>
              <span className="font-medium">{selectedLanguage.label}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">Select language</span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-[300px] border-2 border-foreground shadow-lg bg-card rounded-md">
        {LANGUAGE_OPTIONS.map((lang) => (
          <SelectItem
            key={lang.value}
            value={lang.value}
            className="text-foreground hover:bg-muted focus:bg-muted cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium">A</span>
              <span className="font-medium">{lang.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
