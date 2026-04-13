import { useRef } from "react";
import { Crown, Hotel, Mail, Phone, User, type LucideIcon } from "lucide-react";

const RESORT_TYPES = [
  { value: "boutique", label: "Boutique Hotel", icon: Crown },
  { value: "resort", label: "Beach Resort", icon: Hotel },
  { value: "villa", label: "Private Villa", icon: User },
  { value: "hostel", label: "Hostel", icon: Hotel },
  { value: "hotel", label: "Hotel", icon: Hotel },
  { value: "eco-lodge", label: "Eco Lodge", icon: Hotel },
];

interface FieldConfig {
  label: string;
  sublabel?: string;
  placeholder?: string;
  icon?: LucideIcon;
  type?: "text" | "email" | "tel" | "textarea";
}

const FIELDS: FieldConfig[] = [
  {
    label: "Resort Name",
    placeholder: "e.g., Palawan Collective",
    icon: Crown,
  },
  {
    label: "Resort Owner",
    placeholder: "e.g., Juan dela Cruz",
    icon: User,
  },
  {
    label: "Contact Email",
    sublabel: "Where guests can reach you",
    placeholder: "hello@yourresort.com",
    icon: Mail,
    type: "email",
  },
  {
    label: "Phone Number",
    sublabel: "Include country code",
    placeholder: "+63 917 000 0000",
    icon: Phone,
    type: "tel",
  },
];

export default function Step1_Identity({
  form,
}: {
  form: {
    register: any;
    errors: Record<string, { message?: string }>;
    watch?: any;
    setValue?: any;
    getValues?: any;
  };
  selectedType: string;
  onTypeChange: (value: string) => void;
}) {
  const { register, errors } = form;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          Let's start with the essentials. This information will appear on your site.
        </p>
      </div>

      {/* Resort Type Selection */}
      <div>
        <label className="text-sm font-medium mb-3 block">
          What best describes your property?
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {RESORT_TYPES.map((t) => {
            const Icon = t.icon;
            const active = form.selectedType === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => form.onTypeChange(t.value)}
                className={`group flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  active
                    ? "border-primary bg-primary/5"
                    : "border-border bg-surface hover:border-primary/30 hover:bg-muted/30"
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                <span className={`text-xs font-semibold ${active ? "text-primary" : "text-foreground"}`}>
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
        {errors.resortType && (
          <p className="text-xs text-red-500 mt-2">{String(errors.resortType.message)}</p>
        )}
      </div>

      {/* Text Fields */}
      {FIELDS.map((f) => {
        const Icon = f.icon;
        return (
          <div key={f.label} className="space-y-2">
            <label className="text-sm font-medium">
              {Icon && <Icon className="w-3.5 h-3.5 inline mr-1.5 text-muted-foreground" />}
              {f.label}
            </label>
            {f.sublabel && (
              <p className="text-xs text-muted-foreground">{f.sublabel}</p>
            )}
            <input
              type={f.type || "text"}
              {...register(f.label.toLowerCase().replace(/\s+/g, ""))}
              placeholder={f.placeholder}
              className="w-full h-12 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            />
            {errors[f.label.toLowerCase().replace(/\s+/g, "")] && (
              <p className="text-xs text-red-500">
                {String(errors[f.label.toLowerCase().replace(/\s+/g, "")].message)}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
