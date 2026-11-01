"use client";

import React, { useEffect, useState } from "react";
import {
  FileText,
  AlertTriangle,
  Database,
  Clock,
  Layers,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

export interface TocSection {
  id: string;
  number: number;
  title: string;
  icon: React.ElementType;
}

export const REPORT_SECTIONS: TocSection[] = [
  { id: "section-1", number: 1, title: "Executive Summary", icon: FileText },
  { id: "section-2", number: 2, title: "Incident Overview", icon: AlertTriangle },
  { id: "section-3", number: 3, title: "Evidence Inventory", icon: Database },
  { id: "section-4", number: 4, title: "Timeline of Events", icon: Clock },
  { id: "section-5", number: 5, title: "Service Impact", icon: Layers },
  { id: "section-6", number: 6, title: "Hypotheses & Assessment", icon: Sparkles },
  { id: "section-7", number: 7, title: "Root-Cause Assessment", icon: ShieldCheck },
  { id: "section-8", number: 8, title: "Counterfactual Analysis", icon: Layers },
  { id: "section-9", number: 9, title: "Uncertainty & Limitations", icon: HelpCircle },
  { id: "section-10", number: 10, title: "Recommended Next Steps", icon: CheckCircle2 },
];

interface ReportTocProps {
  activeSectionId?: string;
}

export function ReportToc({ activeSectionId }: ReportTocProps) {
  const [currentActive, setCurrentActive] = useState<string>(activeSectionId || "section-1");

  useEffect(() => {
    if (activeSectionId) {
      setCurrentActive(activeSectionId);
    }
  }, [activeSectionId]);

  // Set up intersection observer for scrollspy
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140;
      for (let i = REPORT_SECTIONS.length - 1; i >= 0; i--) {
        const section = document.getElementById(REPORT_SECTIONS[i].id);
        if (section) {
          const top = section.offsetTop;
          if (scrollPosition >= top) {
            setCurrentActive(REPORT_SECTIONS[i].id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setCurrentActive(id);
    }
  };

  return (
    <nav
      aria-label="Table of Contents"
      className="no-print sticky top-4 rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl p-3.5 space-y-2 shadow-sm text-xs"
    >
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <span className="font-mono text-[10px] tracking-wider uppercase font-semibold text-white/50">
          Table of Contents
        </span>
        <span className="font-mono text-[10px] text-white/40">10 Sections</span>
      </div>

      <ul className="space-y-0.5">
        {REPORT_SECTIONS.map((sec) => {
          const Icon = sec.icon;
          const isActive = currentActive === sec.id;
          return (
            <li key={sec.id}>
              <a
                href={`#${sec.id}`}
                onClick={(e) => scrollToSection(e, sec.id)}
                className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors font-medium ${
                  isActive
                    ? "bg-white/10 text-white font-semibold border border-white/20"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className={`font-mono text-[10px] w-4 text-center ${
                      isActive ? "text-[#22c55e] font-bold" : "text-white/40"
                    }`}
                  >
                    {sec.number}.
                  </span>
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isActive ? "text-[#22c55e]" : "text-white/50 group-hover:text-white"
                    }`}
                  />
                  <span className="truncate">{sec.title}</span>
                </div>
                <ChevronRight
                  className={`w-3 h-3 shrink-0 transition-transform ${
                    isActive ? "text-[#22c55e] translate-x-0.5" : "text-white/30 opacity-0 group-hover:opacity-100"
                  }`}
                />
              </a>
            </li>
          );
        })}
      </ul>

      <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono">
        AEGIS Forensic Standard
      </div>
    </nav>
  );
}

