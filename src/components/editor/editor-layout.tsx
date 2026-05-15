"use client"

import { useState } from "react"
import { Menu, Settings, Download, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { EditableInline, EditableBlock } from "./editable-text"

export function EditorLayout() {
  const [leftOpen, setLeftOpen] = useState(false)
  const [rightOpen, setRightOpen] = useState(false)
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false)
  const [isRightCollapsed, setIsRightCollapsed] = useState(false)

  // Top Bar Content
  const TopBar = () => (
    <header className="h-14 border-b bg-background flex items-center justify-between px-4 shrink-0 transition-all z-10 relative shadow-sm">
      <div className="flex items-center gap-2">
        {/* Mobile Left Toggle */}
        <Sheet open={leftOpen} onOpenChange={setLeftOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] p-0 sm:max-w-sm">
            <LeftPanelContent />
          </SheetContent>
        </Sheet>
        {/* Desktop Left Toggle */}
        <Button variant="ghost" size="icon" className="hidden md:flex ml-1" onClick={() => setIsLeftCollapsed(!isLeftCollapsed)}>
          <Menu className="w-5 h-5" />
        </Button>
        <span className="font-semibold text-lg md:text-xl tracking-tight">Focus Resume</span>
        <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400 ml-3">
          Saved
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="hidden sm:flex transition-all hover:bg-muted font-medium">
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </Button>
        <Button variant="ghost" size="icon" className="hidden sm:flex ml-2">
          <User className="w-5 h-5" />
        </Button>
        {/* Desktop Right Toggle */}
        <Button variant="ghost" size="icon" className="hidden lg:flex ml-1" onClick={() => setIsRightCollapsed(!isRightCollapsed)}>
          <Settings className="w-5 h-5" />
        </Button>
        {/* Mobile Right Toggle */}
        <Sheet open={rightOpen} onOpenChange={setRightOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden ml-1">
              <Settings className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] p-0 sm:max-w-sm">
            <RightPanelContent />
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )

  // Left Panel Content (Sections & AI Suggestions)
  const LeftPanelContent = () => (
    <div className="flex flex-col h-full bg-background min-h-0">
      <div className="p-5 border-b">
        <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Document Outline</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {['Personal Info', 'Summary', 'Experience', 'Education', 'Skills', 'Projects'].map(section => (
          <Button key={section} variant="ghost" className="w-full justify-start text-sm font-medium">
            {section}
          </Button>
        ))}
      </div>
    </div>
  )

  // Right Panel Content (Template, Theme, Actions)
  const RightPanelContent = () => (
    <div className="flex flex-col h-full bg-background min-h-0">
      <div className="p-5 border-b">
        <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Design Details</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-8">
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center justify-between">
            Templates
            <span className="text-xs font-normal text-muted-foreground cursor-pointer hover:underline">View all</span>
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="aspect-[1/1.414] bg-muted/50 rounded-lg border-2 border-primary cursor-pointer shadow-sm relative overflow-hidden flex items-center justify-center group transition-all">
              <div className="w-16 h-20 bg-background shadow-sm border border-black/5 dark:border-white/5 rounded-sm p-2 flex flex-col gap-1">
                <div className="w-full h-1 bg-primary/20 rounded-full"></div>
                <div className="w-2/3 h-1 bg-primary/20 rounded-full"></div>
                <div className="w-full h-1 bg-muted rounded-full mt-2"></div>
                <div className="w-full h-1 bg-muted rounded-full"></div>
              </div>
              <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
            </div>
            <div className="aspect-[1/1.414] bg-muted/30 rounded-lg border cursor-pointer hover:border-primary/50 hover:shadow-sm transition-all flex items-center justify-center">
              <div className="w-16 h-20 bg-background shadow-sm border border-black/5 dark:border-white/5 rounded-sm p-2 flex flex-col gap-1.5">
                <div className="w-1/2 mx-auto h-1.5 bg-primary/20 rounded-full"></div>
                <div className="w-full h-1 bg-muted rounded-full mt-1.5"></div>
                <div className="w-full h-1 bg-muted rounded-full"></div>
                <div className="w-full h-1 bg-muted rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
        <Separator />
        <div>
          <h3 className="text-sm font-semibold mb-4">Color Palette</h3>
          <div className="flex flex-wrap gap-2.5">
            <button className="w-8 h-8 rounded-full bg-blue-600 shadow-sm ring-2 ring-primary ring-offset-2 ring-offset-background transition-all" />
            <button className="w-8 h-8 rounded-full border bg-slate-900 dark:bg-zinc-100 dark:border-zinc-800 shadow-sm hover:scale-105 transition-all" />
            <button className="w-8 h-8 rounded-full border bg-emerald-600 shadow-sm hover:scale-105 transition-all" />
            <button className="w-8 h-8 rounded-full border bg-violet-600 shadow-sm hover:scale-105 transition-all" />
            <button className="w-8 h-8 rounded-full border bg-rose-600 shadow-sm hover:scale-105 transition-all" />
          </div>
        </div>
        <Separator />
        <div>
          <h3 className="text-sm font-semibold mb-4">Typography</h3>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-between font-serif h-10">
              Merriweather
              <span className="text-xs text-muted-foreground tracking-widest uppercase">aa</span>
            </Button>
            <Button variant="outline" className="w-full justify-between font-sans border-primary bg-primary/5 h-10">
              Inter
              <span className="text-xs text-muted-foreground tracking-widest uppercase">aa</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  // Canvas Content wrapped in Tiptap Editables
  const CanvasContent = () => (
    <div className="max-w-[850px] mx-auto bg-white text-black dark:bg-slate-50 dark:text-slate-900 border shadow-md min-h-[1100px] w-full p-10 sm:p-14 lg:p-16 transition-all duration-300">
      <header className="mb-8 border-b-2 border-black/10 pb-6 text-center group relative">
        <div className="text-4xl sm:text-5xl font-black tracking-tight mb-2">
          <EditableInline initialContent="Jane Doe" />
        </div>
        <div className="text-lg text-slate-500 font-medium tracking-wide">
          <EditableInline initialContent="Product Engineer & UI/UX Designer" />
        </div>
        <div className="flex justify-center gap-4 mt-4 text-sm font-medium text-slate-500">
          <span>hello@janedoe.com</span>
          <span>•</span>
          <span>(555) 123-4567</span>
          <span>•</span>
          <span>New York, NY</span>
        </div>
      </header>
      
      <section className="mb-8 group">
        <h2 className="text-lg sm:text-xl font-bold uppercase tracking-widest text-blue-600 mb-4 flex items-center">
          Professional Experience
        </h2>
        <div className="mb-6 relative rounded-md p-2 -mx-2 transition-colors hover:bg-slate-100/50">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-2 mt-1">
            <div className="text-lg font-bold text-slate-800">
              <EditableInline initialContent="Acme Technologies" />
            </div>
            <span className="text-sm font-semibold text-slate-500 whitespace-nowrap">Jan 2021 - Present</span>
          </div>
          <div className="text-sm font-medium text-blue-600 mb-3 block">
            <EditableInline initialContent="Senior Frontend Developer" />
          </div>
          <div className="text-[15px] text-slate-700 leading-relaxed ml-1 prose-sm max-w-none">
            <EditableBlock initialContent={`
              <ul>
                <li>Led the migration of a legacy monolithic application to a modern micro-frontend architecture using Next.js and React, improving page load speeds by 45%.</li>
                <li>Mentored a team of 4 junior developers and established CI/CD pipelines that reduced deployment times from hours to minutes.</li>
                <li>Designed and implemented a comprehensive UI component library utilizing Tailwind CSS, increasing cross-team development velocity by 30%.</li>
              </ul>
            `} />
          </div>
        </div>

        <div className="mb-6 relative rounded-md p-2 -mx-2 transition-colors hover:bg-slate-100/50">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-2 mt-1">
            <div className="text-lg font-bold text-slate-800">
              <EditableInline initialContent="Stark Industries" />
            </div>
            <span className="text-sm font-semibold text-slate-500 whitespace-nowrap">Mar 2018 - Dec 2020</span>
          </div>
          <div className="text-sm font-medium text-blue-600 mb-3 block">
            <EditableInline initialContent="Software Engineer" />
          </div>
          <div className="text-[15px] text-slate-700 leading-relaxed ml-1 prose-sm max-w-none">
            <EditableBlock initialContent={`
              <ul>
                <li>Developed critical features for the internal analytics dashboard using Vue.js and D3.js.</li>
                <li>Optimized database query performance, resulting in a 20% reduction in average API response time.</li>
              </ul>
            `} />
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg sm:text-xl font-bold uppercase tracking-widest text-blue-600 mb-4 flex items-center">
          Education
        </h2>
        <div className="rounded-md p-2 -mx-2 transition-colors hover:bg-slate-100/50">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
            <div className="text-lg font-bold text-slate-800">
              <EditableInline initialContent="University of Technology" />
            </div>
            <span className="text-sm font-semibold text-slate-500">Graduated May 2018</span>
          </div>
          <div className="text-[15px] text-slate-700">
            <EditableInline initialContent="Bachelor of Science in Computer Science" />
          </div>
        </div>
      </section>
    </div>
  )

  return (
    <div className="h-screen w-full flex flex-col bg-background text-foreground overflow-hidden font-sans">
      <TopBar />
      <div className="flex-1 flex overflow-hidden lg:gap-0">
        {/* Desktop Left Panel */}
        <div className={`hidden md:block transition-all duration-300 ease-in-out h-full overflow-hidden shrink-0 border-r bg-background/50 backdrop-blur-sm z-0 ${isLeftCollapsed ? "w-0 border-transparent opacity-0" : "w-64 opacity-100"}`}>
          <div className="w-64 h-full">
            <LeftPanelContent />
          </div>
        </div>
        
        {/* Center Canvas */}
        <main className="flex-1 bg-muted/30 dark:bg-zinc-950/50 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <CanvasContent />
        </main>
        
        {/* Desktop Right Panel */}
        <div className={`hidden lg:block transition-all duration-300 ease-in-out h-full overflow-hidden shrink-0 border-l bg-background/50 backdrop-blur-sm z-0 ${isRightCollapsed ? "w-0 border-transparent opacity-0" : "w-72 opacity-100"}`}>
          <div className="w-72 h-full">
            <RightPanelContent />
          </div>
        </div>
      </div>
    </div>
  )
}
