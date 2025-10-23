interface PositioningMapProps {
  data?: {
    xyChart?: {
      xAxis: { label: string };
      yAxis: { label: string };
      points: Array<{
        id: string;
        x: number;
        y: number;
        label: string;
        color?: string;
        size?: number;
      }>;
      notes?: string;
    };
  };
}

export const PositioningMap = ({ data }: PositioningMapProps) => {
  const chartData = data?.xyChart;
  const points = chartData?.points || [];
  const ourBrand = points.find((p) => p.id === "our_brand");
  const competitors = points.filter((p) => p.id !== "our_brand");

  return (
    <div className="p-6 border dotted-border rounded-lg bg-card h-full">
      <h3 className="text-xl font-semibold mb-2">Mapa de mercado</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Posicionamiento frente a competidores
      </p>

      <svg viewBox="0 0 100 100" className="w-full h-64" preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        <line x1="10" y1="90" x2="95" y2="90" stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="2,2" />
        <line x1="10" y1="10" x2="10" y2="90" stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="2,2" />
        
        {/* Axes */}
        <line x1="10" y1="90" x2="95" y2="90" stroke="hsl(var(--foreground))" strokeWidth="1" />
        <line x1="10" y1="90" x2="10" y2="10" stroke="hsl(var(--foreground))" strokeWidth="1" />
        
        {/* Axis labels */}
        <text x="52.5" y="98" fontSize="3" fill="hsl(var(--muted-foreground))" textAnchor="middle">
          {chartData?.xAxis?.label || "Precio (bajo → alto)"}
        </text>
        <text x="3" y="50" fontSize="3" fill="hsl(var(--muted-foreground))" textAnchor="middle" transform="rotate(-90 3 50)">
          {chartData?.yAxis?.label || "Calidad (baja → alta)"}
        </text>

        {/* Competitors */}
        {competitors.map((comp) => (
          <g key={comp.id}>
            <circle
              cx={10 + comp.x * 85}
              cy={90 - comp.y * 80}
              r="2"
              fill="hsl(var(--muted-foreground))"
              opacity="0.6"
            />
            <text
              x={10 + comp.x * 85 + 3}
              y={90 - comp.y * 80 + 1}
              fontSize="2.5"
              fill="hsl(var(--muted-foreground))"
            >
              {comp.label}
            </text>
          </g>
        ))}

        {/* Our brand */}
        {ourBrand && (
          <>
            <circle
              cx={10 + ourBrand.x * 85}
              cy={90 - ourBrand.y * 80}
              r={ourBrand.size || 3}
              fill={ourBrand.color || "hsl(var(--primary))"}
            />
            <text
              x={10 + ourBrand.x * 85 + 4}
              y={90 - ourBrand.y * 80 - 2}
              fontSize="3"
              fill={ourBrand.color || "hsl(var(--primary))"}
              fontWeight="600"
            >
              {ourBrand.label}
            </text>
          </>
        )}
      </svg>

      {chartData?.notes && (
        <p className="text-xs text-muted-foreground mt-4 italic">{chartData.notes}</p>
      )}
    </div>
  );
};
