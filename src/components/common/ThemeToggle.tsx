import { Sun, Moon, Monitor } from "lucide-react";
import { useUiStore } from "../../stores/uiStore";

export default function ThemeToggle() {
  const { theme, setTheme } = useUiStore();

  const options = [
    { value: "light" as const, icon: Sun },
    { value: "dark" as const, icon: Moon },
    { value: "system" as const, icon: Monitor },
  ];

  return (
    <div className="flex items-center bg-[var(--hover-bg)] rounded-[var(--radius-md)] p-[3px]">
      {options.map(({ value, icon: Icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`
            flex-1 flex items-center justify-center p-[5px] rounded-[var(--radius-sm)]
            transition-all duration-[var(--transition-fast)]
            ${theme === value
              ? "bg-[var(--notelist-bg)] text-[var(--accent)] shadow-[var(--shadow-sm)]"
              : "text-[var(--text-quaternary)] hover:text-[var(--text-tertiary)]"
            }
          `}
        >
          <Icon size={13} strokeWidth={theme === value ? 2.2 : 1.8} />
        </button>
      ))}
    </div>
  );
}
