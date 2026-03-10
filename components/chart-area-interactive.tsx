"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

export const description = "An interactive area chart"

const chartConfig = {
  reviews: {
    label: "Reviews",
    color: "var(--primary)",
  },
  businesses: {
    label: "New Businesses",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

interface ChartAreaInteractiveProps {
  data?: {
    date: string
    reviews: number
    businesses: number
  }[]
}

const defaultData = [
  { date: "2024-04-01", reviews: 222, businesses: 150 },
  { date: "2024-04-02", reviews: 97, businesses: 180 },
  { date: "2024-04-03", reviews: 167, businesses: 120 },
  { date: "2024-04-04", reviews: 242, businesses: 260 },
  { date: "2024-04-05", reviews: 373, businesses: 290 },
  { date: "2024-04-06", reviews: 301, businesses: 340 },
  { date: "2024-04-07", reviews: 245, businesses: 180 },
  { date: "2024-04-08", reviews: 409, businesses: 320 },
  { date: "2024-04-09", reviews: 59, businesses: 110 },
  { date: "2024-04-10", reviews: 261, businesses: 190 },
  { date: "2024-04-11", reviews: 327, businesses: 350 },
  { date: "2024-04-12", reviews: 292, businesses: 210 },
  { date: "2024-04-13", reviews: 342, businesses: 380 },
  { date: "2024-04-14", reviews: 137, businesses: 220 },
  { date: "2024-04-15", reviews: 120, businesses: 170 },
  { date: "2024-04-16", reviews: 138, businesses: 190 },
  { date: "2024-04-17", reviews: 446, businesses: 360 },
  { date: "2024-04-18", reviews: 364, businesses: 410 },
  { date: "2024-04-19", reviews: 243, businesses: 180 },
  { date: "2024-04-20", reviews: 89, businesses: 150 },
  { date: "2024-04-21", reviews: 137, businesses: 200 },
  { date: "2024-04-22", reviews: 224, businesses: 170 },
  { date: "2024-04-23", reviews: 138, businesses: 230 },
  { date: "2024-04-24", reviews: 387, businesses: 290 },
  { date: "2024-04-25", reviews: 215, businesses: 250 },
  { date: "2024-04-26", reviews: 75, businesses: 130 },
  { date: "2024-04-27", reviews: 383, businesses: 420 },
  { date: "2024-04-28", reviews: 122, businesses: 180 },
  { date: "2024-04-29", reviews: 315, businesses: 240 },
  { date: "2024-04-30", reviews: 454, businesses: 380 },
  { date: "2024-05-01", reviews: 165, businesses: 220 },
  { date: "2024-05-02", reviews: 293, businesses: 310 },
  { date: "2024-05-03", reviews: 247, businesses: 190 },
  { date: "2024-05-04", reviews: 385, businesses: 420 },
  { date: "2024-05-05", reviews: 481, businesses: 390 },
  { date: "2024-05-06", reviews: 498, businesses: 520 },
  { date: "2024-05-07", reviews: 388, businesses: 300 },
  { date: "2024-05-08", reviews: 149, businesses: 210 },
  { date: "2024-05-09", reviews: 227, businesses: 180 },
  { date: "2024-05-10", reviews: 293, businesses: 330 },
  { date: "2024-05-11", reviews: 335, businesses: 270 },
  { date: "2024-05-12", reviews: 197, businesses: 240 },
  { date: "2024-05-13", reviews: 197, businesses: 160 },
  { date: "2024-05-14", reviews: 448, businesses: 490 },
  { date: "2024-05-15", reviews: 474, businesses: 380 },
  { date: "2024-05-16", reviews: 338, businesses: 400 },
  { date: "2024-05-17", reviews: 499, businesses: 420 },
  { date: "2024-05-18", reviews: 315, businesses: 350 },
  { date: "2024-05-19", reviews: 235, businesses: 180 },
  { date: "2024-05-20", reviews: 177, businesses: 230 },
  { date: "2024-05-21", reviews: 82, businesses: 140 },
  { date: "2024-05-22", reviews: 81, businesses: 120 },
  { date: "2024-05-23", reviews: 252, businesses: 290 },
  { date: "2024-05-24", reviews: 294, businesses: 220 },
  { date: "2024-05-25", reviews: 201, businesses: 250 },
  { date: "2024-05-26", reviews: 213, businesses: 170 },
  { date: "2024-05-27", reviews: 420, businesses: 460 },
  { date: "2024-05-28", reviews: 233, businesses: 190 },
  { date: "2024-05-29", reviews: 78, businesses: 130 },
  { date: "2024-05-30", reviews: 340, businesses: 280 },
  { date: "2024-05-31", reviews: 178, businesses: 230 },
  { date: "2024-06-01", reviews: 178, businesses: 200 },
  { date: "2024-06-02", reviews: 470, businesses: 410 },
  { date: "2024-06-03", reviews: 103, businesses: 160 },
  { date: "2024-06-04", reviews: 439, businesses: 380 },
  { date: "2024-06-05", reviews: 88, businesses: 140 },
  { date: "2024-06-06", reviews: 294, businesses: 250 },
  { date: "2024-06-07", reviews: 323, businesses: 370 },
  { date: "2024-06-08", reviews: 385, businesses: 320 },
  { date: "2024-06-09", reviews: 438, businesses: 480 },
  { date: "2024-06-10", reviews: 155, businesses: 200 },
  { date: "2024-06-11", reviews: 92, businesses: 150 },
  { date: "2024-06-12", reviews: 492, businesses: 420 },
  { date: "2024-06-13", reviews: 81, businesses: 130 },
  { date: "2024-06-14", reviews: 426, businesses: 380 },
  { date: "2024-06-15", reviews: 307, businesses: 350 },
  { date: "2024-06-16", reviews: 371, businesses: 310 },
  { date: "2024-06-17", reviews: 475, businesses: 520 },
  { date: "2024-06-18", reviews: 107, businesses: 170 },
  { date: "2024-06-19", reviews: 341, businesses: 290 },
  { date: "2024-06-20", reviews: 408, businesses: 450 },
  { date: "2024-06-21", reviews: 169, businesses: 210 },
  { date: "2024-06-22", reviews: 317, businesses: 270 },
  { date: "2024-06-23", reviews: 480, businesses: 530 },
  { date: "2024-06-24", reviews: 132, businesses: 180 },
  { date: "2024-06-25", reviews: 141, businesses: 190 },
  { date: "2024-06-26", reviews: 434, businesses: 380 },
  { date: "2024-06-27", reviews: 448, businesses: 490 },
  { date: "2024-06-28", reviews: 149, businesses: 200 },
  { date: "2024-06-29", reviews: 103, businesses: 160 },
  { date: "2024-06-30", reviews: 446, businesses: 400 },
]

export function ChartAreaInteractive({ data = defaultData }: ChartAreaInteractiveProps) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  const filteredData = React.useMemo(() => {
    if (!data || data.length === 0) return []
    
    // Sort data by date
    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    // Get the latest date from data or use today
    const latestDate = sortedData.length > 0 ? new Date(sortedData[sortedData.length - 1].date) : new Date()
    
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    
    const startDate = new Date(latestDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    
    return sortedData.filter((item) => {
      const date = new Date(item.date)
      return date >= startDate
    })
  }, [data, timeRange])

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Platform Activity</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Activity for the last 3 months
          </span>
          <span className="@[540px]/card:hidden">Last 3 months</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillReviews" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-reviews)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-reviews)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillBusinesses" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-businesses)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-businesses)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="businesses"
              type="natural"
              fill="url(#fillBusinesses)"
              stroke="var(--color-businesses)"
              stackId="a"
            />
            <Area
              dataKey="reviews"
              type="natural"
              fill="url(#fillReviews)"
              stroke="var(--color-reviews)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
