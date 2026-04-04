import {
  FileText,
  Star,
  Trash2,
  Search,
  Settings,
} from "lucide-react";
import { useUiStore } from "../../stores/uiStore";
import type { NavigationView } from "../../types";
import { version as APP_VERSION } from "../../../package.json";

const navItems: {
  id: string;
  view: NavigationView;
  icon: typeof FileText;
  label: string;
}[] = [
  { id: "all", view: "all", icon: FileText, label: "All Notes" },
  { id: "favorites", view: "favorites", icon: Star, label: "Favorites" },
  { id: "trash", view: "trash", icon: Trash2, label: "Trash" },
];

export default function IconRail() {
  const { currentView, setCurrentView } = useUiStore();

  const isViewActive = (view: NavigationView) => {
    if (typeof view === "string" && typeof currentView === "string") {
      return view === currentView;
    }
    return false;
  };

  return (
    <div
      className="h-full flex flex-col items-center shrink-0"
      style={{ backgroundColor: "var(--icon-rail-bg)", width: 52, paddingTop: 10, paddingBottom: 8 }}
    >
      {/* Logo */}
      <div style={{ width: 32, height: 32, borderRadius: "var(--radius-md)", backgroundColor: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
        <span className="text-white font-bold text-[14px] leading-none">P</span>
      </div>

      {/* Search */}
      <button
        className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center mb-1 transition-all"
        style={{ color: "var(--icon-rail-text)" }}
        title="Search"
      >
        <Search size={18} strokeWidth={1.8} />
      </button>

      {/* Divider */}
      <div style={{ width: 20, height: 1, backgroundColor: "rgba(255,255,255,0.08)", marginTop: 8, marginBottom: 8 }} />

      {/* Nav items */}
      <div className="flex flex-col gap-1">
        {navItems.map(({ id, view, icon: Icon, label }) => {
          const active = isViewActive(view);
          return (
            <button
              key={id}
              onClick={() => setCurrentView(view)}
              className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center transition-all"
              style={{
                backgroundColor: active ? "var(--icon-rail-active)" : "transparent",
                color: active ? "var(--icon-rail-text-active)" : "var(--icon-rail-text)",
              }}
              title={label}
            >
              <Icon size={18} strokeWidth={active ? 2 : 1.8} />
            </button>
          );
        })}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Version */}
      <span style={{ fontSize: 9, fontWeight: 600, color: "var(--text-quaternary)", marginBottom: 6, fontFamily: "'SF Mono', 'Fira Code', monospace", letterSpacing: "0.02em" }}>
        v{APP_VERSION}
      </span>

      {/* Settings */}
      <button
        onClick={() => setCurrentView("settings")}
        className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center mb-2 transition-all"
        style={{
          backgroundColor: currentView === "settings" ? "var(--icon-rail-active)" : "transparent",
          color: currentView === "settings" ? "var(--icon-rail-text-active)" : "var(--icon-rail-text)",
        }}
        title="Settings"
      >
        <Settings size={18} strokeWidth={currentView === "settings" ? 2 : 1.8} />
      </button>
    </div>
  );
}
