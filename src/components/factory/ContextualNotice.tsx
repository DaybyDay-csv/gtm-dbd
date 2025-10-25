import { Button } from "@/components/ui/button";

interface ContextualNoticeProps {
  status: 'theoretical' | 'partial' | 'validated' | 'stale';
  componentType: 'offer' | 'disc' | 'channel' | 'persona' | 'validation';
  confidenceScore?: number;
  freshnessScore?: number;
  connectedPlatforms?: string[];
}

export const ContextualNotice = ({ 
  status, 
  componentType,
  confidenceScore = 0,
  freshnessScore = 0,
  connectedPlatforms = []
}: ContextualNoticeProps) => {
  
  const getNoticeContent = () => {
    switch (status) {
      case 'theoretical':
        return getTheoreticalNotice();
      case 'partial':
        return getPartialNotice();
      case 'stale':
        return getStaleNotice();
      case 'validated':
        return getValidatedNotice();
      default:
        return null;
    }
  };

  const getTheoreticalNotice = () => {
    const messages = {
      offer: {
        title: '💡 Estos datos son hipótesis teóricas',
        description: 'Este score se basa en la fórmula de Hormozi aplicada a tus ofertas, pero NO está validado con datos reales.',
        futureText: '🔜 Cuando conectes tus campañas:',
        bullets: [
          'El score se ajustará según CPL y conversión reales',
          'Verás qué ofertas funcionan mejor en cada canal',
          'Se actualizará automáticamente cada 30 min'
        ]
      },
      disc: {
        title: '💡 Perfiles DISC Teóricos',
        description: 'Estos mensajes están adaptados a cada perfil según el modelo de Tomas Erikson, pero NO están validados con tu audiencia real.',
        futureText: '🔜 Al conectar datos externos:',
        bullets: [
          'Identificaremos qué perfil DISC convierte mejor',
          'Ajustaremos los pesos según engagement real',
          'Los colores se saturarán según confianza'
        ]
      },
      channel: {
        title: '💡 Canal Recomendado Basado en Análisis Teórico',
        description: 'Este canal tiene un alto score según tu buyer persona y presupuesto, pero esto NO está validado con datos reales de tu producto.',
        futureText: '🔜 Al lanzar campañas y conectar datos:',
        bullets: [
          'El ranking se actualizará según CPL real',
          'Verás qué canal genera mejores resultados',
          'Se ajustará el presupuesto recomendado'
        ]
      },
      persona: {
        title: '💡 Buyer Persona Teórico',
        description: 'Este perfil está basado en análisis de mercado e IA, pero NO está validado con datos reales de tus clientes.',
        futureText: '🔜 Al validar hipótesis:',
        bullets: [
          'El perfil se ajustará según comportamiento real',
          'Podrás conversar con un avatar basado en datos',
          'La confianza aumentará con cada test validado'
        ]
      },
      validation: {
        title: '💡 Experimentos en Modo Manual',
        description: 'Estas variaciones están listas para probar, pero los resultados deberán registrarse manualmente.',
        futureText: '🔜 Con conexiones automáticas:',
        bullets: [
          'Los resultados se sincronizarán automáticamente',
          'El sistema aprenderá de cada campaña',
          'Se optimizarán las variaciones en tiempo real'
        ]
      }
    };

    const content = messages[componentType];

    return (
      <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
          {content.title}
        </p>
        <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
          {content.description}
        </p>
        <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-2">
          {content.futureText}
        </p>
        <ul className="space-y-1 text-xs text-blue-700 dark:text-blue-300 mb-3">
          {content.bullets.map((bullet, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
        <Button variant="outline" size="sm" className="text-xs" disabled>
          🔗 Próximamente: Conectar plataformas
        </Button>
      </div>
    );
  };

  const getPartialNotice = () => (
    <div className="p-4 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
      <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
        ✅ Sistema parcialmente conectado
      </p>
      <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
        Conectado: {connectedPlatforms.join(' | ')}
      </p>
      <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
        Confianza actual: {confidenceScore}% (basada en {connectedPlatforms.length} plataformas)
      </p>
      <p className="text-xs text-yellow-700 dark:text-yellow-300">
        💡 Conecta más plataformas para aumentar la precisión de estos insights.
      </p>
    </div>
  );

  const getStaleNotice = () => (
    <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
      <p className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">
        ⚠️ Datos con bajo freshness
      </p>
      <p className="text-sm text-red-800 dark:text-red-200 mb-3">
        Este componente se basa en hipótesis antiguas. Para mantener insights actualizados, 
        es recomendable lanzar nuevos tests.
      </p>
      <Button variant="outline" size="sm" className="text-xs">
        🧪 Crear nuevo experimento
      </Button>
    </div>
  );

  const getValidatedNotice = () => (
    <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
      <p className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">
        ✅ Sistema validado con datos recientes
      </p>
      <div className="grid grid-cols-2 gap-2 text-xs text-green-800 dark:text-green-200 mb-2">
        <div>Confianza: <span className="font-semibold">{confidenceScore}%</span></div>
        <div>Freshness: <span className="font-semibold">{freshnessScore}%</span></div>
      </div>
      <p className="text-xs text-green-700 dark:text-green-300 mb-2">
        Balance Mercado/Ego: 73% / 27% ✅
      </p>
      <Button variant="outline" size="sm" className="text-xs">
        Ver detalles de validación
      </Button>
    </div>
  );

  return getNoticeContent();
};
