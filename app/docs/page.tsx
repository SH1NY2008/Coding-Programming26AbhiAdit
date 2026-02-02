"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Code,
  Users,
  Shield,
  Accessibility,
  Copyright,
  BookOpen,
  Lightbulb,
  Wrench,
  CheckCircle,
  ExternalLink,
} from "lucide-react";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 lg:px-12 py-12 lg:py-20">
        {/* Header */}
        <div className="mb-16 max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <FileText className="h-8 w-8 text-primary" aria-hidden="true" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
              Documentation
            </h1>
          </div>
          <p className="text-xl text-muted-foreground leading-relaxed font-light">
            Technical documentation, copyright information, and FBLA submission materials.
            Everything you need to understand the architecture and purpose of Byte-Sized Business Boost.
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          <TabsList className="w-full flex-wrap h-auto gap-3 bg-transparent p-0 justify-start">
            {["Overview", "Features", "Technical", "Accessibility", "Copyright"].map((tab) => (
              <TabsTrigger 
                key={tab} 
                value={tab.toLowerCase()}
                className="rounded-full px-6 py-3 border border-border text-base data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:border-foreground transition-all"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <Lightbulb className="h-6 w-6 text-primary" aria-hidden="true" />
                    Project Overview
                  </CardTitle>
                  <CardDescription className="text-base">
                    Byte-Sized Business Boost - Supporting Local Communities
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-foreground leading-relaxed text-lg font-light">
                    Byte-Sized Business Boost is a web application designed to help users discover, 
                    review, and support local small businesses in their community. The platform connects 
                    consumers with local entrepreneurs, fostering economic growth and community engagement.
                  </p>
                  
                  <div className="grid gap-6">
                    <div className="p-6 bg-secondary/30 rounded-2xl border border-border/50">
                      <h3 className="font-bold text-foreground mb-2 text-lg">Mission</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        To empower local small businesses by providing them visibility and connecting 
                        them with community members who want to support local entrepreneurs.
                      </p>
                    </div>
                    <div className="p-6 bg-secondary/30 rounded-2xl border border-border/50">
                      <h3 className="font-bold text-foreground mb-2 text-lg">Vision</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        A thriving local economy where small businesses flourish through 
                        community support and digital accessibility.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <Users className="h-6 w-6 text-primary" aria-hidden="true" />
                    Target Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    <div className="p-6 border border-border/50 rounded-2xl hover:bg-muted/30 transition-colors">
                      <h4 className="font-bold text-foreground mb-3 text-lg">Consumers</h4>
                      <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> Discover local businesses</li>
                        <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> Read and write reviews</li>
                        <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> Find deals and promotions</li>
                        <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> Bookmark favorites</li>
                      </ul>
                    </div>
                    <div className="p-6 border border-border/50 rounded-2xl hover:bg-muted/30 transition-colors">
                      <h4 className="font-bold text-foreground mb-3 text-lg">Business Owners</h4>
                      <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> Increase visibility</li>
                        <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> Engage with customers</li>
                        <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> Promote special offers</li>
                        <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> Build reputation</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "Search & Browse", badge: "Discovery", desc: "Search for businesses by name, browse by category, filter by rating, and sort results." },
                { title: "Community Feedback", badge: "Reviews", desc: "Leave star ratings and written reviews. Vote on helpful reviews and report content." },
                { title: "Save Favorites", badge: "Bookmarks", desc: "Bookmark businesses to easily find them later. Organize with custom folders." },
                { title: "Special Offers", badge: "Deals", desc: "Browse active deals from local businesses. Filter by deal type and expiration." },
                { title: "Community Insights", badge: "Analytics", desc: "View statistics about local businesses including category distribution and trends." },
                { title: "Interactive Support", badge: "Help", desc: "Built-in help chat with predefined FAQs and support topics. Contextual help." }
              ].map((feature, i) => (
                <div key={i} className="p-8 border border-border/50 rounded-2xl hover:shadow-lg transition-all hover:-translate-y-1 bg-background">
                  <Badge variant="secondary" className="mb-4">{feature.badge}</Badge>
                  <h4 className="font-bold text-xl mb-3">{feature.title}</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Technical Tab */}
          <TabsContent value="technical" className="space-y-8">
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Code className="h-6 w-6 text-primary" aria-hidden="true" />
                  Technology Stack
                </CardTitle>
                <CardDescription>
                  Modern frameworks and tools powering the application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-12">
                  <div>
                    <h4 className="font-bold text-lg mb-6 border-b pb-2">Frontend Core</h4>
                    <ul className="space-y-4">
                      <li className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                        <span className="font-medium">Next.js 16</span>
                        <Badge variant="outline">Framework</Badge>
                      </li>
                      <li className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                        <span className="font-medium">React 19</span>
                        <Badge variant="outline">UI Library</Badge>
                      </li>
                      <li className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                        <span className="font-medium">TypeScript</span>
                        <Badge variant="outline">Language</Badge>
                      </li>
                      <li className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                        <span className="font-medium">Tailwind CSS</span>
                        <Badge variant="outline">Styling</Badge>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-6 border-b pb-2">Libraries & Tools</h4>
                    <ul className="space-y-4">
                      <li className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                        <span className="font-medium">shadcn/ui</span>
                        <Badge variant="outline">Components</Badge>
                      </li>
                      <li className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                        <span className="font-medium">Recharts</span>
                        <Badge variant="outline">Charts</Badge>
                      </li>
                      <li className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                        <span className="font-medium">Lucide Icons</span>
                        <Badge variant="outline">Icons</Badge>
                      </li>
                      <li className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                        <span className="font-medium">Zod</span>
                        <Badge variant="outline">Validation</Badge>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-4 gap-6">
              {[
                { title: "Component-Based", desc: "Modular architecture for reusability" },
                { title: "Type Safety", desc: "Strict TypeScript configuration" },
                { title: "Responsive", desc: "Mobile-first adaptive layout" },
                { title: "Performance", desc: "Server components & optimization" }
              ].map((item, i) => (
                <div key={i} className="p-6 bg-secondary/10 rounded-2xl border border-border/50 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-bold mb-2">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Accessibility Tab */}
          <TabsContent value="accessibility" className="space-y-8">
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Accessibility className="h-6 w-6 text-primary" aria-hidden="true" />
                  WCAG 2.1 Compliance
                </CardTitle>
                <CardDescription>
                  Commitment to inclusive design and development
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <p className="text-xl text-foreground font-light leading-relaxed">
                  This application is rigorously designed to meet WCAG 2.1 Level AA standards, 
                  ensuring a seamless experience for users with diverse abilities.
                </p>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg">Perceivable</h3>
                    <ul className="space-y-3 text-muted-foreground">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>Text alternatives for non-text content</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>High contrast ratios (4.5:1 minimum)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>Adaptable layouts that don't lose info</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-bold text-lg">Operable</h3>
                    <ul className="space-y-3 text-muted-foreground">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>Full keyboard navigation support</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>Focus indicators for all interactive elements</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>Consistent navigation mechanisms</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Copyright Tab */}
          <TabsContent value="copyright" className="space-y-8">
            <Card className="border-border/50 shadow-sm text-center py-12">
              <CardContent className="max-w-2xl mx-auto space-y-8">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Copyright className="h-10 w-10 text-primary" />
                </div>
                
                <div>
                  <h2 className="text-3xl font-bold mb-4">Copyright & Licensing</h2>
                  <p className="text-xl text-muted-foreground font-light">
                    &copy; {new Date().getFullYear()} Byte-Sized Business Boost. All rights reserved.
                  </p>
                </div>

                <div className="text-left bg-muted/30 p-8 rounded-2xl border border-border/50">
                  <p className="text-muted-foreground mb-4">
                    This project is created for the FBLA Coding & Programming competition. 
                    The source code is available for educational and evaluation purposes.
                  </p>
                  <p className="text-muted-foreground">
                    All business data, images, and reviews used in this application are 
                    fictional and used solely for demonstration purposes. Any resemblance 
                    to actual businesses or persons is coincidental.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
