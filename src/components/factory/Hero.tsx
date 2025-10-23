import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles } from "lucide-react";
import { useState } from "react";

interface HeroProps {
  onRunAnalysis: (projectName: string, url: string, competitors?: string, docs?: string) => void;
  isRunning: boolean;
}

export const Hero = ({ onRunAnalysis, isRunning }: HeroProps) => {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      const projectName = `Analysis ${new Date().toISOString().split('T')[0]}`;
      onRunAnalysis(projectName, url);
    }
  };

  return (
    <section className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
          Paste your website.
          <br />
          <span className="text-primary">We'll give you your customer</span>,
          <br />
          what to say, and how to say it.
        </h1>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
          <div className="flex gap-3">
            <Input
              type="url"
              placeholder="https://yourwebsite.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="text-lg h-14"
              disabled={isRunning}
            />
            <Button
              type="submit"
              size="lg"
              className="h-14 px-8"
              disabled={isRunning || !url.trim()}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Run Analysis
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Optional: Connect data later for validation & learning
          </p>
        </form>

        <div className="pt-8">
          <p className="text-xl font-semibold mb-4">How do we know?</p>
          <p className="text-muted-foreground">
            No guessing. We <strong>Read + Cross-Reference + Verify</strong>
          </p>
        </div>
      </div>
    </section>
  );
};
