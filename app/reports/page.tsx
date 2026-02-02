"use client"

import React, { useMemo } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { useApp } from "@/lib/context"

export default function Page() {
  const { businesses, reviews, deals } = useApp()

  const metrics = useMemo(() => {
    const totalBusinesses = businesses.length
    const totalReviews = reviews.length
    const activeDeals = deals.filter((d) => d.isActive).length
    const averageRating =
      totalBusinesses > 0
        ? businesses.reduce((acc, b) => acc + b.averageRating, 0) / totalBusinesses
        : 0

    return {
      totalBusinesses,
      totalReviews,
      activeDeals,
      averageRating,
    }
  }, [businesses, reviews, deals])

  const chartData = useMemo(() => {
    const dataMap = new Map<string, { reviews: number; businesses: number }>()

    const processDate = (dateStr: string, type: "reviews" | "businesses") => {
      if (!dateStr) return
      const date = new Date(dateStr).toISOString().split("T")[0]
      if (!dataMap.has(date)) {
        dataMap.set(date, { reviews: 0, businesses: 0 })
      }
      const entry = dataMap.get(date)!
      entry[type]++
    }

    reviews.forEach((r) => processDate(r.createdAt, "reviews"))
    businesses.forEach((b) => processDate(b.createdAt, "businesses"))

    return Array.from(dataMap.entries())
      .map(([date, counts]) => ({
        date,
        ...counts,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [businesses, reviews])

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards {...metrics} />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive data={chartData} />
              </div>
              <DataTable data={businesses} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
