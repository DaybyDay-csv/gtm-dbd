import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, ChevronDown, ChevronUp, Upload, FileText, X, Target, User, TrendingUp, Palette, Lightbulb } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface HeroProps {
  onRunAnalysis: (projectName: string, url: string, productDescription: string, competitors?: string, docs?: string, context?: string, vision?: string, mission?: string, values?: string) => void;
  isRunning: boolean;
}

export const Hero = ({ onRunAnalysis, isRunning }: HeroProps) => {
  const [url, setUrl] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [context, setContext] = useState("");
  const [competitors, setCompetitors] = useState("");
  const [vision, setVision] = useState("");
  const [mission, setMission] = useState("");
  const [values, setValues] = useState("");
  const [docs, setDocs] = useState("");
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter(file => {
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      return validTypes.includes(file.type);
    });

    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid file type",
        description: "Please upload only PDF, Word, PowerPoint, or Excel documents",
        variant: "destructive"
      });
      return;
    }

    setUploadedFiles(prev => [...prev, ...validFiles]);
    toast({
      title: "Files added",
      description: `${validFiles.length} document(s) added successfully`
    });
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && productDescription.trim()) {
      const projectName = `Analysis ${new Date().toISOString().split('T')[0]}`;
      
      // Combine manual docs text with uploaded files note
      let docsContent = docs.trim();
      if (uploadedFiles.length > 0) {
        const fileList = uploadedFiles.map(f => f.name).join(', ');
        docsContent = docsContent 
          ? `${docsContent}\n\n[Uploaded documents: ${fileList}]`
          : `[Uploaded documents: ${fileList}]`;
      }
      
      onRunAnalysis(
        projectName,
        url.trim(),
        productDescription.trim(),
        competitors.trim() || undefined,
        docsContent || undefined,
        context.trim() || undefined,
        vision.trim() || undefined,
        mission.trim() || undefined,
        values.trim() || undefined
      );
    }
  };

  return (
    <section className="w-full px-8 py-16 text-center">
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
          {t('hero.headline.line1')}
          <br />
          <span className="text-primary text-3xl md:text-4xl">{t('hero.headline.line2')}</span>
          <br />
          <span className="text-2xl md:text-3xl font-normal">{t('hero.headline.line3')}</span>
        </h1>
        
        <p className="text-sm text-muted-foreground italic">
          {t('hero.evidence')}
        </p>

        <div className="mb-8 p-4 bg-muted/30 rounded-lg border border-border max-w-2xl mx-auto">
          <p className="text-sm font-medium mb-3 text-muted-foreground text-center">
            {t('hero.includes.title')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-left text-xs">
            <div className="flex items-start gap-2">
              <User className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-muted-foreground">{t('hero.includes.persona')}</p>
            </div>
            <div className="flex items-start gap-2">
              <TrendingUp className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-muted-foreground">{t('hero.includes.offers')}</p>
            </div>
            <div className="flex items-start gap-2">
              <Palette className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-muted-foreground">{t('hero.includes.disc')}</p>
            </div>
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-muted-foreground">{t('hero.includes.variations')}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
          <div className="space-y-3">
            <Input
              type="url"
              placeholder={t('hero.placeholder.url')}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="text-lg h-14"
              disabled={isRunning}
              required
            />
            <div className="space-y-1">
              <Textarea
                placeholder={t('hero.placeholder.product')}
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                className="text-base min-h-[70px]"
                disabled={isRunning}
                required
                minLength={10}
              />
              {productDescription.trim().length > 0 && productDescription.trim().length < 10 && (
                <p className="text-xs text-destructive">
                  {t('hero.validation.min')} ({productDescription.trim().length}/10)
                </p>
              )}
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full h-14"
              disabled={isRunning || !url.trim() || productDescription.trim().length < 10}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              {t('hero.button.run')}
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
                {t('hero.advanced')}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="context">{t('hero.context.label')}</Label>
                <Textarea
                  id="context"
                  placeholder={t('hero.context.placeholder')}
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  disabled={isRunning}
                  className="min-h-[80px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="competitors">{t('hero.competitors.label')}</Label>
                <Input
                  id="competitors"
                  placeholder={t('hero.competitors.placeholder')}
                  value={competitors}
                  onChange={(e) => setCompetitors(e.target.value)}
                  disabled={isRunning}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vision">{t('hero.vision.label')}</Label>
                  <Textarea
                    id="vision"
                    placeholder={t('hero.vision.placeholder')}
                    value={vision}
                    onChange={(e) => setVision(e.target.value)}
                    disabled={isRunning}
                    className="min-h-[60px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mission">{t('hero.mission.label')}</Label>
                  <Textarea
                    id="mission"
                    placeholder={t('hero.mission.placeholder')}
                    value={mission}
                    onChange={(e) => setMission(e.target.value)}
                    disabled={isRunning}
                    className="min-h-[60px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="values">{t('hero.values.label')}</Label>
                  <Textarea
                    id="values"
                    placeholder={t('hero.values.placeholder')}
                    value={values}
                    onChange={(e) => setValues(e.target.value)}
                    disabled={isRunning}
                    className="min-h-[60px]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="docs">{t('hero.docs.label')}</Label>
                <div className="space-y-3">
                  <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      id="file-upload"
                      multiple
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                      onChange={handleFileUpload}
                      disabled={isRunning || isProcessing}
                      className="hidden"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Upload className="w-8 h-8 text-muted-foreground" />
                      <div className="text-sm">
                        <span className="font-semibold text-primary">{t('hero.docs.upload')}</span>
                        <span className="text-muted-foreground"> {t('hero.docs.drag')}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t('hero.docs.types')}
                      </p>
                    </label>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">{t('hero.docs.uploaded')}</p>
                      <div className="space-y-1">
                        {uploadedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-2 bg-muted rounded-md text-sm"
                          >
                            <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="flex-1 truncate">{file.name}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                              disabled={isRunning}
                              className="h-6 w-6 p-0"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Textarea
                    id="docs"
                    placeholder={t('hero.docs.placeholder')}
                    value={docs}
                    onChange={(e) => setDocs(e.target.value)}
                    disabled={isRunning}
                    className="min-h-[80px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('hero.docs.help')}
                  </p>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="text-muted-foreground">{t('hero.optional')}</span>
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-muted text-muted-foreground border border-border animate-fade-in">
              {t('hero.coming_soon')}
            </span>
          </div>
        </form>

        <div className="pt-8">
          <p className="text-xl font-semibold mb-4">{t('hero.how')}</p>
          <p className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: t('hero.method') }} />
        </div>
      </div>
    </section>
  );
};
