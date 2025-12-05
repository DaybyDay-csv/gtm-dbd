import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, ChevronDown, ChevronUp, Upload, FileText, X, Target, User, TrendingUp, Palette, Lightbulb, AlertCircle, Check, Loader2, Play } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface HeroProps {
  onRunAnalysis: (projectName: string, url: string, productDescription: string, competitors?: string, docs?: string, context?: string, vision?: string, mission?: string, values?: string, industry?: string, tone?: string, brandVoice?: string) => void;
  isRunning: boolean;
  onLoadDemo?: () => void;
}

type UrlValidationState = 'idle' | 'validating' | 'valid' | 'invalid';

const TONES = [
  { value: 'professional', labelKey: 'hero.tone.professional' },
  { value: 'friendly', labelKey: 'hero.tone.friendly' },
  { value: 'technical', labelKey: 'hero.tone.technical' },
  { value: 'inspirational', labelKey: 'hero.tone.inspirational' },
  { value: 'direct', labelKey: 'hero.tone.direct' },
  { value: 'empathetic', labelKey: 'hero.tone.empathetic' },
];

const INDUSTRIES = [
  { value: 'saas', labelKey: 'hero.industry.saas' },
  { value: 'ecommerce', labelKey: 'hero.industry.ecommerce' },
  { value: 'services', labelKey: 'hero.industry.services' },
  { value: 'education', labelKey: 'hero.industry.education' },
  { value: 'healthcare', labelKey: 'hero.industry.healthcare' },
  { value: 'finance', labelKey: 'hero.industry.finance' },
  { value: 'other', labelKey: 'hero.industry.other' },
];

export const Hero = ({ onRunAnalysis, isRunning, onLoadDemo }: HeroProps) => {
  const [url, setUrl] = useState("");
  const [urlValidation, setUrlValidation] = useState<UrlValidationState>('idle');
  const [tone, setTone] = useState("");
  const [industry, setIndustry] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [context, setContext] = useState("");
  const [competitors, setCompetitors] = useState("");
  const [brandVoice, setBrandVoice] = useState("");
  const [vision, setVision] = useState("");
  const [mission, setMission] = useState("");
  const [values, setValues] = useState("");
  const [docs, setDocs] = useState("");
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  // Debounced URL validation
  const validateUrl = useCallback((urlToValidate: string) => {
    if (!urlToValidate.trim()) {
      setUrlValidation('idle');
      return;
    }

    setUrlValidation('validating');

    // Simulate validation delay for UX
    const timer = setTimeout(() => {
      try {
        const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
        if (urlPattern.test(urlToValidate)) {
          setUrlValidation('valid');
        } else {
          setUrlValidation('invalid');
        }
      } catch {
        setUrlValidation('invalid');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const cleanup = validateUrl(url);
    return cleanup;
  }, [url, validateUrl]);

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
        title: t('hero.upload.invalid'),
        description: t('hero.upload.invalidDesc'),
        variant: "destructive"
      });
      return;
    }

    setUploadedFiles(prev => [...prev, ...validFiles]);
    toast({
      title: t('hero.upload.success'),
      description: t('hero.upload.successDesc').replace('{count}', validFiles.length.toString())
    });
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate context length
    if (context.trim().length > 5000) {
      toast({
        title: t('hero.context.error'),
        description: t('hero.context.errorDesc'),
        variant: "destructive"
      });
      return;
    }

    // Validate tone is selected (required)
    if (!tone) {
      toast({
        title: t('hero.tone.required'),
        description: t('hero.tone.requiredDesc'),
        variant: "destructive"
      });
      return;
    }
    
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
        values.trim() || undefined,
        industry || undefined,
        tone,
        brandVoice.trim() || undefined
      );
    }
  };

  const getUrlValidationIcon = () => {
    switch (urlValidation) {
      case 'validating':
        return <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />;
      case 'valid':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'invalid':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return null;
    }
  };

  return (
    <section className="w-full max-w-full px-4 sm:px-6 md:px-8 py-8 md:py-16 text-center overflow-x-hidden">
      <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
          {t('hero.headline.line1')}
          <br />
          <span className="text-primary text-xl sm:text-2xl md:text-3xl lg:text-4xl">{t('hero.headline.line2')}</span>
          <br />
          <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-normal">{t('hero.headline.line3')}</span>
        </h1>
        
        <p className="text-sm text-muted-foreground italic">
          {t('hero.evidence')}
        </p>

        <div className="mb-6 md:mb-8 p-3 md:p-4 bg-muted/30 rounded-lg border border-border max-w-2xl mx-auto">
          <p className="text-xs md:text-sm font-medium mb-2 md:mb-3 text-muted-foreground text-center">
            {t('hero.includes.title')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 md:gap-2 text-left text-[11px] md:text-xs">
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

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-3 md:space-y-4">
          <div className="space-y-2 md:space-y-3">
            {/* 1. URL Input - Website first */}
            <div className="relative">
              <Input
                type="url"
                placeholder={t('hero.placeholder.url')}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="text-sm md:text-base lg:text-lg h-11 md:h-14 pr-10"
                disabled={isRunning}
                required
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {getUrlValidationIcon()}
              </div>
            </div>
            {urlValidation === 'valid' && url && (
              <p className="text-xs text-green-600 text-left flex items-center gap-1">
                <Check className="w-3 h-3" />
                {t('hero.url.valid')}
              </p>
            )}
            {urlValidation === 'invalid' && url && (
              <p className="text-xs text-destructive text-left flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {t('hero.url.invalid')}
              </p>
            )}

            {/* 2. Product Description - What do you sell */}
            <div className="space-y-1">
              <Textarea
                placeholder={t('hero.placeholder.product')}
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                className="text-sm md:text-base min-h-[60px] md:min-h-[70px]"
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

            {/* 3. Tone & Industry - Side by side on larger screens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Tone Selector - Required */}
              <div className="space-y-1">
                <Select value={tone} onValueChange={setTone} disabled={isRunning} required>
                  <SelectTrigger className={`text-sm md:text-base h-11 md:h-12 ${!tone ? 'border-primary' : ''}`}>
                    <SelectValue placeholder={t('hero.tone.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {TONES.map((t_item) => (
                      <SelectItem key={t_item.value} value={t_item.value}>
                        {t(t_item.labelKey)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!tone && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {t('hero.tone.hint')}
                  </p>
                )}
              </div>

              {/* Industry Selector */}
              <Select value={industry} onValueChange={setIndustry} disabled={isRunning}>
                <SelectTrigger className="text-sm md:text-base h-11 md:h-12">
                  <SelectValue placeholder={t('hero.industry.placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((ind) => (
                    <SelectItem key={ind.value} value={ind.value}>
                      {t(ind.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 4. Disclaimer - context hint */}
            <p className="text-xs text-muted-foreground/70 italic text-center">
              {t('hero.tone.disclaimer')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                type="submit"
                size="lg"
                className="flex-1 h-11 md:h-14 text-sm md:text-base"
                disabled={isRunning || !tone || !url.trim() || productDescription.trim().length < 10 || urlValidation === 'invalid'}
              >
                <Sparkles className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                {t('hero.button.run')}
              </Button>
              
              {onLoadDemo && (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="h-11 md:h-14 text-sm md:text-base"
                  onClick={onLoadDemo}
                  disabled={isRunning}
                >
                  <Play className="mr-2 h-4 w-4" />
                  {t('hero.button.demo')}
                </Button>
              )}
            </div>
          </div>

          <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <Button 
                type="button" 
                variant="outline" 
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
                  className={`min-h-[80px] ${context.length > 5000 ? 'border-destructive' : ''}`}
                  maxLength={5500}
                />
                <div className="flex justify-between items-center">
                  <p className={`text-xs ${context.length > 5000 ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                    {context.length}/5000 {t('hero.characters')}
                  </p>
                </div>
                {context.length > 5000 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {t('hero.context.errorDesc')}
                    </AlertDescription>
                  </Alert>
                )}
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

              <div className="space-y-2">
                <Label htmlFor="brandVoice">{t('hero.brandVoice.label')}</Label>
                <Textarea
                  id="brandVoice"
                  placeholder={t('hero.brandVoice.placeholder')}
                  value={brandVoice}
                  onChange={(e) => setBrandVoice(e.target.value)}
                  disabled={isRunning}
                  className="min-h-[80px]"
                  maxLength={2000}
                />
                <p className="text-xs text-muted-foreground">
                  {t('hero.brandVoice.hint')}
                </p>
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

          <div className="flex flex-col items-center justify-center gap-1 text-sm">
            <span className="text-muted-foreground">{t('hero.optional')}</span>
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-muted text-muted-foreground border border-border animate-fade-in">
              {t('hero.coming_soon')}
            </span>
          </div>
        </form>

        <div className="pt-8">
          <p className="text-xl font-semibold mb-4">{t('hero.how')}</p>
          <p className="text-muted-foreground">
            {t('hero.method.part1')} <strong className="text-foreground">{t('hero.method.part2')}</strong>
          </p>
        </div>
      </div>
    </section>
  );
};