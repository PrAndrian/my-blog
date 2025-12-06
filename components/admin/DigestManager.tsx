"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { handleMutationError } from "@/lib/errors";
import { showError, showSuccess } from "@/lib/toast";
import { useAction, useMutation, useQuery } from "convex/react";
import { Loader2, Play, Save } from "lucide-react";
import { useEffect, useState } from "react";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export function DigestManager() {
  const config = useQuery(api.digest.getDigestConfig);
  const saveConfig = useMutation(api.digest.saveDigestConfig);
  const generateDigest = useAction(api.digest.generateWeeklyDigest);

  const [formData, setFormData] = useState({
    newsApiEndpoint: "",
    newsApiParams: "",
    aiSystemPrompt: "",
    scheduleDay: "Monday",
    enabled: true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (config) {
      setFormData({
        newsApiEndpoint: config.newsApiEndpoint || "",
        newsApiParams: config.newsApiParams || "{}",
        aiSystemPrompt: config.aiSystemPrompt || "",
        scheduleDay: config.scheduleDay || "Monday",
        enabled: config.enabled ?? true,
      });
    }
  }, [config]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Validate JSON
      try {
        JSON.parse(formData.newsApiParams);
      } catch (e) {
        showError("Invalid JSON in News API Params");
        setIsSaving(false);
        return;
      }

      await saveConfig(formData);
      showSuccess("Configuration saved successfully");
    } catch (error) {
      showError(handleMutationError(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleRunNow = async () => {
    setIsRunning(true);
    try {
      await generateDigest({ force: true });
      showSuccess("Digest generation triggered successfully");
    } catch (error) {
      showError(handleMutationError(error));
    } finally {
      setIsRunning(false);
    }
  };

  if (!config) {
    return (
      <Card>
        <CardContent className="py-10 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Digest Configuration</CardTitle>
              <CardDescription>
                Configure the automated weekly news digest
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="enabled-mode">Enabled</Label>
              <Switch
                id="enabled-mode"
                checked={formData.enabled}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, enabled: checked })
                }
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Schedule Day</Label>
              <Select
                value={formData.scheduleDay}
                onValueChange={(val) =>
                  setFormData({ ...formData, scheduleDay: val })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((day) => (
                    <SelectItem key={day} value={day}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                The digest will automatically run on this day at 00:00 UTC.
              </p>
            </div>

            <div className="space-y-2">
              <Label>News API Endpoint</Label>
              <Input
                value={formData.newsApiEndpoint}
                onChange={(e) =>
                  setFormData({ ...formData, newsApiEndpoint: e.target.value })
                }
                placeholder="https://newsapi.org/v2/top-headlines"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>News API Parameters (JSON)</Label>
            <Textarea
              className="font-mono text-xs"
              rows={4}
              value={formData.newsApiParams}
              onChange={(e) =>
                setFormData({ ...formData, newsApiParams: e.target.value })
              }
            />
            <p className="text-sm text-muted-foreground">
              JSON object for query parameters (e.g., category, language).
            </p>
          </div>

          <div className="space-y-2">
            <Label>AI System Prompt</Label>
            <Textarea
              className="min-h-[200px]"
              value={formData.aiSystemPrompt}
              onChange={(e) =>
                setFormData({ ...formData, aiSystemPrompt: e.target.value })
              }
            />
            <p className="text-sm text-muted-foreground">
              Instructions for the AI to generate the digest content.
            </p>
          </div>

          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="default"
              onClick={handleSave}
              disabled={isSaving}
              className="w-32"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save
            </Button>

            <Button
              variant="secondary"
              onClick={handleRunNow}
              disabled={isRunning}
            >
              {isRunning ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Run Digest Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
