import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  es: {
    // Header
    'header.title': 'AI GTM Factory',
    'header.projects': 'Mis Proyectos',
    'header.signOut': 'Cerrar Sesión',
    'header.signIn': 'Iniciar Sesión',
    
    // Hero
    'hero.title': 'De producto a sistema vivo que vende',
    'hero.subtitle': 'Convierte tu producto en un sistema GTM basado en evidencia con IA',
    'hero.inputPlaceholder': 'Pega la URL de tu sitio web o landing...',
    'hero.button': 'Analizar & Crear Sistema',
    'hero.buttonRunning': 'Analizando...',
    
    // Dev Mode
    'dev.title': 'Modo Desarrollo',
    'dev.description': 'Carga datos mock para ver el resultado completo sin gastar créditos',
    'dev.loadButton': 'Cargar Datos Mock',
    
    // Footer
    'footer.text': '© 2025 AI GTM Factory. Basado en evidencia, no en opiniones.',
    
    // Phase Ribbon
    'phase.1': 'Fase 1: Análisis de Mercado',
    'phase.2': 'Fase 2: Buyer Persona',
    'phase.3': 'Fase 3: Ecuación de Valor',
    'phase.4': 'Fase 4: Traductor DISC',
    'phase.5': 'Fase 5: Triggers Emocionales',
    'phase.6': 'Fase 6: Estrategia de Canales',
    'phase.7': 'Fase 7: Variaciones Creativas',
    
    // Product Understanding
    'product.title': 'Entendimiento del Producto',
    'product.from': 'Mercado + Análisis Competitivo',
    
    // Positioning Map
    'positioning.title': 'Mapa de Posicionamiento',
    'positioning.category': 'Categoría',
    'positioning.competitors': 'Competidores',
    'positioning.differentiators': 'Diferenciadores',
    
    // Product Nucleus
    'nucleus.title': 'Núcleo del Producto',
    'nucleus.coreValue': 'Valor Central',
    'nucleus.emotionalHook': 'Gancho Emocional',
    'nucleus.mechanism': 'Mecanismo',
    
    // Buyer Persona
    'persona.title': 'Buyer Persona',
    'persona.from': 'Mercado + Producto + Posicionamiento',
    'persona.objections': 'Posibles Objeciones',
    'persona.source.competitor_advantage': 'Ventaja competidora',
    'persona.source.market_gap': 'Brecha de mercado',
    'persona.source.price_concern': 'Precio',
    'persona.source.trust_barrier': 'Barrera de confianza',
    
    // Offer Factory
    'offer.title': 'Fábrica de Ofertas',
    'offer.from': 'Buyer Persona + Núcleo del Producto',
    'offer.valueGauge': 'Medidor de Valor',
    
    // DISC Translator
    'disc.title': 'Traductor DISC',
    'disc.from': 'Ofertas + Perfil del Buyer + 4 Estilos DISC',
    'disc.red': 'Rojo',
    'disc.yellow': 'Amarillo',
    'disc.green': 'Verde',
    'disc.blue': 'Azul',
    
    // Channel Strategy
    'channel.title': 'Estrategia de Canales',
    'channel.recommendation': 'Recomendación',
    'channel.primary': 'Primario',
    'channel.secondary': 'Secundario',
    'channel.tertiary': 'Terciario',
    'channel.score': 'Puntuación',
    'channel.costPerLead': 'Coste por Lead',
    'channel.estimatedROI': 'ROI Estimado',
    
    // Validation Map
    'validation.title': 'Mapa de Validación',
    'validation.experiments': 'Experimentos',
    'validation.filterAll': 'Todos los canales',
    'validation.filterDisc': 'Todos los perfiles',
    'validation.objective': 'Objetivo',
    'validation.kpi': 'KPI',
    'validation.trigger': 'Trigger',
    'validation.state.draft': 'Borrador',
    'validation.state.ready': 'Listo',
    'validation.state.running': 'En Curso',
    'validation.state.completed': 'Completado',
    
    // Status Badge
    'status.theoretical': 'Teórico',
    'status.live': 'En Vivo',
    'status.validated': 'Validado',
    'status.theoretical.short': '¿Qué es un Sistema Vivo?',
    'status.theoretical.description': 'Ahora mismo estás viendo datos teóricos generados por IA basados en análisis de mercado. Un Sistema Vivo aprende de datos reales.',
    'status.theoretical.details': 'Ver detalles',
    'status.theoretical.dialog.title': '¿Qué es un Sistema Vivo?',
    'status.theoretical.dialog.subtitle': 'De Hipótesis a Sistema que Aprende',
    'status.theoretical.dialog.current': 'Situación Actual: Sistema Teórico',
    'status.theoretical.dialog.currentDesc': 'Los datos que ves son hipótesis generadas por IA basadas en análisis de mercado, competidores y tu producto. Son un excelente punto de partida, pero aún no han sido validados con datos reales.',
    'status.theoretical.dialog.next': 'Siguiente Paso: Convertir en Sistema Vivo',
    'status.theoretical.dialog.nextDesc': 'Un Sistema Vivo se conecta a tus plataformas de marketing y aprende continuamente de datos reales. Cada campaña, cada conversión, cada interacción alimenta el sistema para refinarse automáticamente.',
    'status.theoretical.dialog.benefits': 'Beneficios del Sistema Vivo:',
    'status.theoretical.dialog.benefit1': 'Validación automática: Las hipótesis se validan o descartan con datos reales',
    'status.theoretical.dialog.benefit2': 'Aprendizaje continuo: El sistema mejora sus recomendaciones con cada campaña',
    'status.theoretical.dialog.benefit3': 'Optimización automática: Identifica qué mensajes, canales y ofertas funcionan mejor',
    'status.theoretical.dialog.benefit4': 'ROI medible: Todas las decisiones se basan en rendimiento real, no en intuición',
    
    // Client Readiness
    'readiness.title': 'Evaluación de Preparación del Cliente',
    'readiness.score': 'Puntuación',
    'readiness.maturity': 'Madurez',
    'readiness.signals': 'Señales de Presupuesto',
    'readiness.reasoning': 'Razonamiento',
    'readiness.recommendation': 'Recomendación',
    
    // Product Metrics
    'metrics.avatarReliability': 'Fiabilidad del Avatar',
    'metrics.hypothesesValidated': 'Hipótesis Validadas',
    'metrics.topMessages': 'Mejores Mensajes',
    'metrics.topOffers': 'Mejores Ofertas',
    'metrics.nextAction': 'Próxima Acción',
    
    // Budget Input
    'budget.title': 'Configuración de Presupuesto',
    'budget.description': 'Para continuar con el análisis de canales, necesitamos conocer tu presupuesto mensual de marketing',
    'budget.low': 'Bajo',
    'budget.medium': 'Medio',
    'budget.high': 'Alto',
    'budget.custom': 'Personalizado',
    'budget.amount': 'Cantidad de Presupuesto',
    'budget.submit': 'Continuar Análisis',
    
    // Signup Gate
    'signup.title': 'Desbloquea Tu Sistema GTM Completo',
    'signup.subtitle': 'Crea una cuenta gratuita para ver todas las fases y descargar tus resultados',
    'signup.email': 'Email',
    'signup.password': 'Contraseña',
    'signup.button': 'Crear Cuenta Gratis',
    'signup.alreadyHave': '¿Ya tienes cuenta?',
    'signup.signIn': 'Iniciar sesión',
    'signup.or': 'O',
    'signup.google': 'Continuar con Google',
    
    // Projects
    'projects.title': 'Mis Proyectos',
    'projects.new': 'Nuevo Análisis',
    'projects.loading': 'Cargando proyectos...',
    'projects.empty': 'No tienes proyectos todavía',
    'projects.emptyDesc': 'Comienza creando tu primer análisis GTM',
    'projects.phase': 'Fase',
    
    // Language Switcher
    'language.switch': 'Cambiar idioma',
    'language.spanish': 'Español',
    'language.english': 'English',
  },
  en: {
    // Header
    'header.title': 'AI GTM Factory',
    'header.projects': 'My Projects',
    'header.signOut': 'Sign Out',
    'header.signIn': 'Sign In',
    
    // Hero
    'hero.title': 'From product to living system that sells',
    'hero.subtitle': 'Turn your product into an evidence-based GTM system with AI',
    'hero.inputPlaceholder': 'Paste your website or landing page URL...',
    'hero.button': 'Analyze & Create System',
    'hero.buttonRunning': 'Analyzing...',
    
    // Dev Mode
    'dev.title': 'Development Mode',
    'dev.description': 'Load mock data to see the full result without spending credits',
    'dev.loadButton': 'Load Mock Data',
    
    // Footer
    'footer.text': '© 2025 AI GTM Factory. Built on evidence, not opinions.',
    
    // Phase Ribbon
    'phase.1': 'Phase 1: Market Analysis',
    'phase.2': 'Phase 2: Buyer Persona',
    'phase.3': 'Phase 3: Value Equation',
    'phase.4': 'Phase 4: DISC Translator',
    'phase.5': 'Phase 5: Emotional Triggers',
    'phase.6': 'Phase 6: Channel Strategy',
    'phase.7': 'Phase 7: Creative Variations',
    
    // Product Understanding
    'product.title': 'Product Understanding',
    'product.from': 'Market + Competitive Analysis',
    
    // Positioning Map
    'positioning.title': 'Positioning Map',
    'positioning.category': 'Category',
    'positioning.competitors': 'Competitors',
    'positioning.differentiators': 'Differentiators',
    
    // Product Nucleus
    'nucleus.title': 'Product Nucleus',
    'nucleus.coreValue': 'Core Value',
    'nucleus.emotionalHook': 'Emotional Hook',
    'nucleus.mechanism': 'Mechanism',
    
    // Buyer Persona
    'persona.title': 'Buyer Persona',
    'persona.from': 'Market + Product + Positioning',
    'persona.objections': 'Possible Objections',
    'persona.source.competitor_advantage': 'Competitor advantage',
    'persona.source.market_gap': 'Market gap',
    'persona.source.price_concern': 'Price',
    'persona.source.trust_barrier': 'Trust barrier',
    
    // Offer Factory
    'offer.title': 'Offer Factory',
    'offer.from': 'Buyer Persona + Product Nucleus',
    'offer.valueGauge': 'Value Gauge',
    
    // DISC Translator
    'disc.title': 'DISC Translator',
    'disc.from': 'Offers + Buyer Profile + 4 DISC Styles',
    'disc.red': 'Red',
    'disc.yellow': 'Yellow',
    'disc.green': 'Green',
    'disc.blue': 'Blue',
    
    // Channel Strategy
    'channel.title': 'Channel Strategy',
    'channel.recommendation': 'Recommendation',
    'channel.primary': 'Primary',
    'channel.secondary': 'Secondary',
    'channel.tertiary': 'Tertiary',
    'channel.score': 'Score',
    'channel.costPerLead': 'Cost per Lead',
    'channel.estimatedROI': 'Estimated ROI',
    
    // Validation Map
    'validation.title': 'Validation Map',
    'validation.experiments': 'Experiments',
    'validation.filterAll': 'All channels',
    'validation.filterDisc': 'All profiles',
    'validation.objective': 'Objective',
    'validation.kpi': 'KPI',
    'validation.trigger': 'Trigger',
    'validation.state.draft': 'Draft',
    'validation.state.ready': 'Ready',
    'validation.state.running': 'Running',
    'validation.state.completed': 'Completed',
    
    // Status Badge
    'status.theoretical': 'Theoretical',
    'status.live': 'Live',
    'status.validated': 'Validated',
    'status.theoretical.short': 'What is a Living System?',
    'status.theoretical.description': 'You are currently viewing theoretical data generated by AI based on market analysis. A Living System learns from real data.',
    'status.theoretical.details': 'See details',
    'status.theoretical.dialog.title': 'What is a Living System?',
    'status.theoretical.dialog.subtitle': 'From Hypothesis to Learning System',
    'status.theoretical.dialog.current': 'Current Situation: Theoretical System',
    'status.theoretical.dialog.currentDesc': 'The data you see are AI-generated hypotheses based on market analysis, competitors, and your product. They are an excellent starting point but have not yet been validated with real data.',
    'status.theoretical.dialog.next': 'Next Step: Convert to Living System',
    'status.theoretical.dialog.nextDesc': 'A Living System connects to your marketing platforms and continuously learns from real data. Every campaign, every conversion, every interaction feeds the system to automatically refine itself.',
    'status.theoretical.dialog.benefits': 'Benefits of a Living System:',
    'status.theoretical.dialog.benefit1': 'Automatic validation: Hypotheses are validated or discarded with real data',
    'status.theoretical.dialog.benefit2': 'Continuous learning: The system improves its recommendations with each campaign',
    'status.theoretical.dialog.benefit3': 'Automatic optimization: Identifies which messages, channels, and offers work best',
    'status.theoretical.dialog.benefit4': 'Measurable ROI: All decisions are based on real performance, not intuition',
    
    // Client Readiness
    'readiness.title': 'Client Readiness Assessment',
    'readiness.score': 'Score',
    'readiness.maturity': 'Maturity',
    'readiness.signals': 'Budget Signals',
    'readiness.reasoning': 'Reasoning',
    'readiness.recommendation': 'Recommendation',
    
    // Product Metrics
    'metrics.avatarReliability': 'Avatar Reliability',
    'metrics.hypothesesValidated': 'Hypotheses Validated',
    'metrics.topMessages': 'Top Messages',
    'metrics.topOffers': 'Top Offers',
    'metrics.nextAction': 'Next Action',
    
    // Budget Input
    'budget.title': 'Budget Configuration',
    'budget.description': 'To continue with the channel analysis, we need to know your monthly marketing budget',
    'budget.low': 'Low',
    'budget.medium': 'Medium',
    'budget.high': 'High',
    'budget.custom': 'Custom',
    'budget.amount': 'Budget Amount',
    'budget.submit': 'Continue Analysis',
    
    // Signup Gate
    'signup.title': 'Unlock Your Complete GTM System',
    'signup.subtitle': 'Create a free account to see all phases and download your results',
    'signup.email': 'Email',
    'signup.password': 'Password',
    'signup.button': 'Create Free Account',
    'signup.alreadyHave': 'Already have an account?',
    'signup.signIn': 'Sign in',
    'signup.or': 'Or',
    'signup.google': 'Continue with Google',
    
    // Projects
    'projects.title': 'My Projects',
    'projects.new': 'New Analysis',
    'projects.loading': 'Loading projects...',
    'projects.empty': "You don't have any projects yet",
    'projects.emptyDesc': 'Start by creating your first GTM analysis',
    'projects.phase': 'Phase',
    
    // Language Switcher
    'language.switch': 'Switch language',
    'language.spanish': 'Español',
    'language.english': 'English',
  }
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'es'; // Spanish as default
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
