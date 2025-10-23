import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, ChevronDown, ChevronUp, Upload } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";

interface HeroProps {
  onRunAnalysis: (projectName: string, url: string, competitors?: string, docs?: string, context?: string, vision?: string, mission?: string, values?: string) => void;
  isRunning: boolean;
}

export const Hero = ({ onRunAnalysis, isRunning }: HeroProps) => {
  const [url, setUrl] = useState("");
  const [context, setContext] = useState("");
  const [competitors, setCompetitors] = useState("");
  const [vision, setVision] = useState("");
  const [mission, setMission] = useState("");
  const [values, setValues] = useState("");
  const [docs, setDocs] = useState("");
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      const projectName = `Analysis ${new Date().toISOString().split('T')[0]}`;
      onRunAnalysis(
        projectName,
        url.trim(),
        competitors.trim() || undefined,
        docs.trim() || undefined,
        context.trim() || undefined,
        vision.trim() || undefined,
        mission.trim() || undefined,
        values.trim() || undefined
      );
    }
  };

  return (
    <section className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
          Paste your website.
          <br />
          Get <span className="text-primary">your customer</span>, messaging, and a validation system.
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

          <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                className="w-full gap-2"
                disabled={isRunning}
              >
                {isAdvancedOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                Add Context, Competitors & Documents (Optional)
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="context">Additional Context</Label>
                <Textarea
                  id="context"
                  placeholder="Any specific context, goals, or information about your business..."
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  disabled={isRunning}
                  className="min-h-[80px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="competitors">Known Competitors</Label>
                <Input
                  id="competitors"
                  placeholder="competitor1.com, competitor2.com..."
                  value={competitors}
                  onChange={(e) => setCompetitors(e.target.value)}
                  disabled={isRunning}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vision">Vision</Label>
                  <Textarea
                    id="vision"
                    placeholder="Your vision..."
                    value={vision}
                    onChange={(e) => setVision(e.target.value)}
                    disabled={isRunning}
                    className="min-h-[60px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mission">Mission</Label>
                  <Textarea
                    id="mission"
                    placeholder="Your mission..."
                    value={mission}
                    onChange={(e) => setMission(e.target.value)}
                    disabled={isRunning}
                    className="min-h-[60px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="values">Values</Label>
                  <Textarea
                    id="values"
                    placeholder="Your core values..."
                    value={values}
                    onChange={(e) => setValues(e.target.value)}
                    disabled={isRunning}
                    className="min-h-[60px]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="docs">Documents/Additional Info</Label>
                <Textarea
                  id="docs"
                  placeholder="Paste any additional documents, descriptions, or information here..."
                  value={docs}
                  onChange={(e) => setDocs(e.target.value)}
                  disabled={isRunning}
                  className="min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground">
                  <Upload className="w-3 h-3 inline mr-1" />
                  Paste content from your documents, PDFs, or any relevant information
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>

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
