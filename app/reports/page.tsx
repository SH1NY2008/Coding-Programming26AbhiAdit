"use client"

import React, { useMemo } from "react"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
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
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="@container/main flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground mt-2">
            Analyze business performance, reviews, and engagement metrics.
          </p>
        </div>
        
        <SectionCards {...metrics} />
        <ChartAreaInteractive data={chartData} />
        <DataTable data={businesses} />
      </div>
    </div>
  )
}
