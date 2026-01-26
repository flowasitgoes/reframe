"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Key, Check, ExternalLink } from "lucide-react";

const API_KEY_STORAGE_KEY = "prayforYou_openrouter_key";

export function getStoredApiKey(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(API_KEY_STORAGE_KEY);
}

export function ApiKeyModal() {
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    const storedKey = getStoredApiKey();
    if (storedKey) {
      setApiKey(storedKey);
      setHasKey(true);
    }
  }, []);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem(API_KEY_STORAGE_KEY, apiKey.trim());
      setHasKey(true);
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        setOpen(false);
      }, 1500);
    }
  };

  const handleClear = () => {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
    setApiKey("");
    setHasKey(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="API 設定"
        >
          <Settings className="h-5 w-5" />
          {hasKey && (
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            OpenRouter API Key
          </DialogTitle>
          <DialogDescription>
            輸入你的 OpenRouter API Key 來啟用禱告生成功能。你的 Key
            只會儲存在本機瀏覽器中，不會傳送到我們的伺服器。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="sk-or-v1-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="font-mono text-sm"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={!apiKey.trim()}
              className="flex-1"
            >
              {saved ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  已儲存
                </>
              ) : (
                "儲存"
              )}
            </Button>
            {hasKey && (
              <Button variant="outline" onClick={handleClear}>
                清除
              </Button>
            )}
          </div>

          <div className="pt-2 border-t border-border">
            <p className="text-sm text-muted-foreground mb-2">
              還沒有 API Key？
            </p>
            <a
              href="https://openrouter.ai/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              前往 OpenRouter 申請
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
