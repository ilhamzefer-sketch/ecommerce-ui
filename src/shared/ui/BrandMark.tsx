type BrandMarkProps = {
  compact?: boolean;
};

export function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <div className={compact ? "brand-mark brand-mark--compact" : "brand-mark"}>
      <img src="/assets/mizan-logo-professional.png" alt="MIZAN.AZ" />
    </div>
  );
}
