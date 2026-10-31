import React from "react";

export interface AegisSectionHeadingProps {
  eyebrow?: string;
  eyebrowBadge?: React.ReactNode;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function AegisSectionHeading({
  eyebrow,
  eyebrowBadge,
  title,
  description,
  actions,
  className = "",
}: AegisSectionHeadingProps) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#252d40] ${className}`}
    >
      <div className="space-y-1">
        {/* Eyebrow / Tagline */}
        {(eyebrow || eyebrowBadge) && (
          <div className="flex items-center gap-2">
            {eyebrow && (
              <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-[#727f98]">
                {eyebrow}
              </span>
            )}
            {eyebrowBadge}
          </div>
        )}

        {/* Primary Heading */}
        <h2 className="text-base sm:text-lg font-semibold tracking-tight text-[#f1f4fb]">
          {title}
        </h2>

        {/* Description / Secondary Context */}
        {description && (
          <p className="text-xs text-[#a3adc2] max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Action Toolbar slot */}
      {actions && (
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          {actions}
        </div>
      )}
    </div>
  );
}

