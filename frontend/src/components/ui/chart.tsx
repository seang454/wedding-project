'use client';

import * as React from 'react';
import * as RechartsPrimitive from 'recharts';
import { cn } from '@/lib/utils';

const THEMES = { light: '', dark: '.dark' } as const;

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error('useChart must be used within a <ChartContainer />');
  }
  return context;
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    config: ChartConfig;
    children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>['children'];
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, '')}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-[#5C6E57] [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-[#E8DFC9]/70 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-[#C59F54]/40 [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-[#E8DFC9] [&_.recharts-radial-bar-background-sector]:fill-[#F0EAE1] [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-[#C59F54]/10 [&_.recharts-reference-line_[stroke='#ccc']]:stroke-[#D8C7A8] [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = 'Chart';

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(([, cfg]) => cfg.theme || cfg.color);

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] || itemConfig.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .filter(Boolean)
  .join('\n')}
}
`,
          )
          .join('\n'),
      }}
    />
  );
};

const ChartTooltip = RechartsPrimitive.Tooltip;

type TooltipPayloadItem = {
  name?: string;
  dataKey?: string | number;
  value?: number | string;
  color?: string;
  payload?: Record<string, unknown>;
};

interface ChartTooltipContentProps extends React.ComponentProps<'div'> {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
  hideLabel?: boolean;
  hideIndicator?: boolean;
  indicator?: 'line' | 'dot' | 'dashed';
  nameKey?: string;
  labelKey?: string;
  valueFormatter?: (value: number | string, name: string, item: TooltipPayloadItem) => React.ReactNode;
}

const ChartTooltipContent = React.forwardRef<HTMLDivElement, ChartTooltipContentProps>(
  (
    {
      active,
      payload,
      className,
      indicator = 'dot',
      hideLabel = false,
      hideIndicator = false,
      label,
      nameKey,
      valueFormatter,
    },
    ref,
  ) => {
    const { config } = useChart();

    if (!active || !payload?.length) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn(
          'grid min-w-[9rem] items-start gap-1.5 rounded-xl border border-[#E8DFC9] bg-[#FFFEFA]/95 backdrop-blur-md px-3 py-2 text-xs shadow-xl font-khmer-body',
          className,
        )}
      >
        {!hideLabel && label !== undefined && label !== '' && (
          <div className="font-khmer-heading font-bold text-[#212E1E] border-b border-[#F0EAE1] pb-1 mb-0.5">
            {label}
          </div>
        )}
        <div className="grid gap-1.5">
          {payload.map((item, index) => {
            const key = `${nameKey || item.dataKey || item.name || 'value'}`;
            const itemConfig = config[key];
            const indicatorColor = item.color || (item.payload?.fill as string) || '#243521';
            const displayLabel = itemConfig?.label || item.name || key;
            const formattedValue = valueFormatter
              ? valueFormatter(item.value ?? 0, key, item)
              : typeof item.value === 'number'
              ? item.value.toLocaleString()
              : item.value;

            return (
              <div key={`${key}-${index}`} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-[#5C6E57]">
                  {!hideIndicator && (
                    <span
                      className={cn(
                        'shrink-0 rounded-[3px]',
                        indicator === 'dot' && 'h-2.5 w-2.5 rounded-full',
                        indicator === 'line' && 'h-2.5 w-1',
                        indicator === 'dashed' && 'h-2.5 w-0 border border-dashed',
                      )}
                      style={{ backgroundColor: indicatorColor, borderColor: indicatorColor }}
                    />
                  )}
                  <span className="font-medium">{displayLabel}</span>
                </div>
                <span className="font-mono font-bold text-[#212E1E] tabular-nums">
                  {formattedValue}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);
ChartTooltipContent.displayName = 'ChartTooltip';

const ChartLegend = RechartsPrimitive.Legend;

interface ChartLegendContentProps extends React.ComponentProps<'div'> {
  payload?: Array<{
    value?: string;
    dataKey?: string | number;
    color?: string;
  }>;
  nameKey?: string;
}

const ChartLegendContent = React.forwardRef<HTMLDivElement, ChartLegendContentProps>(
  ({ className, payload, nameKey }, ref) => {
    const { config } = useChart();

    if (!payload?.length) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn('flex flex-wrap items-center justify-center gap-4 pt-3 text-xs font-khmer-heading', className)}
      >
        {payload.map((item, idx) => {
          const key = `${nameKey || item.dataKey || item.value || 'value'}`;
          const itemConfig = config[key];
          return (
            <div key={`${key}-${idx}`} className="flex items-center gap-1.5 text-[#3E513A] font-medium">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
                style={{ backgroundColor: item.color }}
              />
              <span>{itemConfig?.label || item.value}</span>
            </div>
          );
        })}
      </div>
    );
  },
);
ChartLegendContent.displayName = 'ChartLegend';

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
};
