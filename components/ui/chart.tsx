"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig
    children: React.ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
    >["children"]
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "Chart"

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([_, config]) => config.theme || config.color
  )

  if (!colorConfig.length) {
    return null
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
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
    React.ComponentProps<"div"> & {
      hideLabel?: boolean
      hideIndicator?: boolean
      indicator?: "line" | "dot" | "dashed"
      nameKey?: string
      labelKey?: string
    }
>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref
  ) => {
    const { config } = useChart()

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null
      }

      const [item] = payload
      const key = `${labelKey || item.dataKey || item.name || "value"}`
      const itemConfig = getPayloadConfigFromPayload(config, item, key)
      const value =
        !labelKey && typeof label === "string"
          ? config[label as keyof typeof config]?.label || label
          : itemConfig?.label

      if (labelFormatter) {
        return (
          <div className={cn("font-medium", labelClassName)}>
            {labelFormatter(value, payload)}
          </div>
        )
      }

      if (!value) {
        return null
      }

      return <div className={cn("font-medium", labelClassName)}>{value}</div>
    }, [
      label,
      labelFormatter,
      payload,
      hideLabel,
      labelClassName,
      config,
      labelKey,
    ])

    if (!active || !payload?.length) {
      return null
    }

    const nestLabel = payload.length === 1 && indicator !== "dot"

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className
        )}
      >
        {!nestLabel ? tooltipLabel : null}
        <div className="grid gap-1.5">
          {payload.map((item, index) => {
            const key = `${nameKey || item.name || item.dataKey || "value"}`
            const itemConfig = getPayloadConfigFromPayload(config, item, key)
            const indicatorColor = color || item.payload.fill || item.color

            return (
              <div
                key={item.dataKey}
                className={cn(
                  "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                  indicator === "dot" && "items-center"
                )}
              >
                {formatter && item?.value !== undefined && item.name ? (
                  <div className="flex flex-1 items-center gap-2">
                    {!hideIndicator && (
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor: indicatorColor,
                        }}
                      />
                    )}
                    <span className="flex-1 truncate">
                      {formatter(item.value, item.name, item, index, payload)}
                    </span>
                  </div>
                ) : (
                  <>
                    {!hideIndicator && (
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor: indicatorColor,
                        }}
                      />
                    )}
                    <span className="flex-1 truncate">
                      {itemConfig?.label || item.name}
                    </span>
                    <span className="font-medium">{item.value}</span>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = RechartsPrimitive.Legend

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> &
    Omit<React.ComponentProps<typeof RechartsPrimitive.Legend>, "content"> & {
      align?: "left" | "center" | "right"
      direction?: "row" | "column"
      hideIndicator?: boolean
      indicator?: "line" | "dot" | "dashed"
      nameKey?: string
      labelKey?: string
    }
>(
  (
    {
      className,
      align = "left",
      direction = "row",
      indicator = "dot",
      hideIndicator = false,
      nameKey,
      labelKey,
      payload,
      ...props
    },
    ref
  ) => {
    const { config } = useChart()

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-wrap items-center gap-4 text-xs",
          align === "left" && "justify-start",
          align === "center" && "justify-center",
          align === "right" && "justify-end",
          direction === "column" && "flex-col items-start justify-start",
          className
        )}
        {...props}
      >
        {payload?.map((entry, index) => {
          const key = `${nameKey || entry.dataKey || entry.value || "value"}`
          const itemConfig = getPayloadConfigFromPayload(config, entry, key)
          const indicatorColor = entry.payload?.fill || entry.color

          return (
            <div
              key={`item-${index}`}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap",
                direction === "column" && "w-full"
              )}
            >
              {!hideIndicator && (
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor: indicatorColor,
                  }}
                />
              )}
              <span>{itemConfig?.label || entry.value}</span>
            </div>
          )
        })}
      </div>
    )
  }
)
ChartLegendContent.displayName = "ChartLegendContent"

function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string
) {
  if (!payload || typeof payload !== "object" || !key) {
    return undefined
  }

  // Check if payload has a key property.
  if ("key" in payload && typeof payload.key === "string") {
    return config[payload.key]
  }

  // Check if payload has a dataKey property.
  if ("dataKey" in payload && typeof payload.dataKey === "string") {
    return config[payload.dataKey]
  }

  // Check if key exists in config.
  if (key in config) {
    return config[key]
  }

  return undefined
}

// New components for LineChart and BarChart
const LineChart = ({
  data,
  className,
  ...props
}: React.ComponentProps<typeof RechartsPrimitive.LineChart>) => {
  return (
    <ChartContainer
      className={className}
      config={{
        // Default config for line chart
        primary: {
          theme: {
            light: "#0ea5e9",
            dark: "#0ea5e9",
          },
        },
        secondary: {
          theme: {
            light: "#10b981",
            dark: "#10b981",
          },
        },
      }}
    >
      <RechartsPrimitive.LineChart data={data} {...props}>
        <RechartsPrimitive.CartesianGrid strokeDasharray="3 3" />
        <RechartsPrimitive.XAxis dataKey="name" />
        <RechartsPrimitive.YAxis />
        <ChartTooltip
          content={<ChartTooltipContent />}
          cursor={false}
        />
        <ChartLegend
          content={<ChartLegendContent />}
          verticalAlign="top"
          height={36}
        />
        {data?.datasets?.map((dataset: any, index: number) => (
          <RechartsPrimitive.Line
            key={index}
            type="monotone"
            dataKey={dataset.label}
            stroke={dataset.borderColor}
            fill={dataset.backgroundColor}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </RechartsPrimitive.LineChart>
    </ChartContainer>
  )
}

const BarChart = ({
  data,
  className,
  ...props
}: React.ComponentProps<typeof RechartsPrimitive.BarChart>) => {
  // Transform the data format to what Recharts expects
  const transformedData = data?.labels?.map((label: string, index: number) => ({
    name: label,
    value: data.datasets[0].data[index],
    fill: data.datasets[0].backgroundColor?.[index] || data.datasets[0].backgroundColor,
  })) || [];
  
  return (
    <ChartContainer
      className={className}
      config={{
        // Default config for bar chart
        primary: {
          theme: {
            light: "#0ea5e9",
            dark: "#0ea5e9",
          },
        },
      }}
    >
      <RechartsPrimitive.BarChart 
        data={transformedData} 
        {...props}
        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
        barSize={50}
        layout="vertical"
      >
        <RechartsPrimitive.CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <RechartsPrimitive.XAxis type="number" />
        <RechartsPrimitive.YAxis 
          type="category" 
          dataKey="name" 
          width={100}
          tick={{ fontSize: 12 }}
        />
        <ChartTooltip
          content={<ChartTooltipContent />}
          cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
        />
        <RechartsPrimitive.Bar 
          dataKey="value" 
          radius={[0, 4, 4, 0]}
        />
      </RechartsPrimitive.BarChart>
    </ChartContainer>
  )
}

const PieChart = ({
  data,
  className,
  ...props
}: React.ComponentProps<typeof RechartsPrimitive.PieChart>) => {
  // Transform the data format to what Recharts expects
  const transformedData = data?.labels?.map((label: string, index: number) => ({
    name: label,
    value: data.datasets[0].data[index],
    fill: data.datasets[0].backgroundColor?.[index] || data.datasets[0].backgroundColor,
  })) || [];
  
  return (
    <ChartContainer
      className={cn("h-full", className)}
      config={{
        // Default config for pie chart
        primary: {
          theme: {
            light: "#0ea5e9",
            dark: "#0ea5e9",
          },
        },
      }}
    >
      <RechartsPrimitive.PieChart 
        {...props}
        margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
      >
        <RechartsPrimitive.Pie
          data={transformedData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          label
        >
          {transformedData.map((entry, index) => (
            <RechartsPrimitive.Cell 
              key={`cell-${index}`} 
              fill={entry.fill} 
            />
          ))}
        </RechartsPrimitive.Pie>
        <RechartsPrimitive.Tooltip content={<ChartTooltipContent />} />
        <RechartsPrimitive.Legend />
      </RechartsPrimitive.PieChart>
    </ChartContainer>
  )
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  LineChart,
  BarChart,
  PieChart,
}
