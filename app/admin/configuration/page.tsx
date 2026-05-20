"use client";

import { useState, useEffect, useRef } from "react";
import { z } from "zod";

const configuracionSchema = z.object({
  nombreCooperativa: z.string().min(3, "Mínimo 3 caracteres").max(150, "Máximo 150 caracteres"),
  logoUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  colorPrimario: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color hexadecimal inválido (ej. #FFFFFF)").optional().or(z.literal("")),
  colorSecundario: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color hexadecimal inválido (ej. #FFFFFF)").optional().or(z.literal("")),
  facebook: z.string().url("URL inválida").optional().or(z.literal("")),
  instagram: z.string().url("URL inválida").optional().or(z.literal("")),
  twitter: z.string().url("URL inválida").optional().or(z.literal("")),
  whatsapp: z.string().max(20, "Muy largo").optional().or(z.literal("")),
  emailSoporte: z.string().email("Correo inválido").optional().or(z.literal("")),
  telefonoSoporte: z.string().max(20, "Muy largo").optional().or(z.literal("")),
  direccion: z.string().max(255, "Muy larga").optional().or(z.literal("")),
});

type ConfigForm = z.infer<typeof configuracionSchema>;

const ORANGE = "#F97316";
const ORANGE_DARK = "#EA6C0A";
const ORANGE_LIGHT = "#FFF7ED";

const Icon = {
  Building: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22V12h6v10"/><path d="M8 7h.01M12 7h.01M16 7h.01M8 11h.01M16 11h.01"/>
    </svg>
  ),
  Palette: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
    </svg>
  ),
  Share: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  ),
  Headphones: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>
    </svg>
  ),
  Save: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
      <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
    </svg>
  ),
  Check: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  AlertCircle: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  Loader: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  ),
};

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,.06)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "16px 20px", borderBottom: "1px solid #f3f4f6", background: "#fafafa" }}>
        <span style={{ color: ORANGE }}>{icon}</span>
        <h2 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#111827" }}>{title}</h2>
      </div>
      <div style={{ padding: "20px", display: "grid", gap: "16px" }}>{children}</div>
    </div>
  );
}

function Field({ label, error, children, hint }: { label: string; error?: string; children: React.ReactNode; hint?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>{label}</label>
      {children}
      {hint && !error && <span style={{ fontSize: "12px", color: "#9ca3af" }}>{hint}</span>}
      {error && (
        <span style={{ fontSize: "12px", color: "#ef4444", display: "flex", alignItems: "center", gap: "4px" }}>
          <Icon.AlertCircle />{error}
        </span>
      )}
    </div>
  );
}

const inputStyle = (hasError?: boolean): React.CSSProperties => ({
  width: "100%",
  padding: "10px 14px",
  fontSize: "14px",
  border: `1.5px solid ${hasError ? "#fca5a5" : "#d1d5db"}`,
  borderRadius: "12px",
  outline: "none",
  background: hasError ? "#fff5f5" : "white",
  color: "#111827",
  boxSizing: "border-box",
  transition: "border-color .15s, box-shadow .15s",
});

function ColorField({ label, value, onChange, error }: { label: string; value: string; onChange: (v: string) => void; error?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <Field label={label} error={error} hint="Ej: #1D4ED8">
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <div
          onClick={() => ref.current?.click()}
          style={{ width: "40px", height: "40px", borderRadius: "10px", border: "1.5px solid #d1d5db", background: /^#[0-9A-Fa-f]{6}$/.test(value) ? value : "#e5e7eb", cursor: "pointer", flexShrink: 0 }}
        />
        <input ref={ref} type="color" value={/^#[0-9A-Fa-f]{6}$/.test(value) ? value : "#ffffff"} onChange={(e) => onChange(e.target.value)} style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 0, height: 0 }} />
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder="#000000" style={inputStyle(!!error)} maxLength={7} />
      </div>
    </Field>
  );
}

function Toast({ type, message, onClose }: { type: "success" | "error"; message: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{
      position: "fixed", bottom: "24px", right: "24px", zIndex: 9999,
      display: "flex", alignItems: "center", gap: "10px",
      padding: "12px 18px", borderRadius: "12px",
      background: type === "success" ? "#ecfdf5" : "#fef2f2",
      border: `1.5px solid ${type === "success" ? "#6ee7b7" : "#fca5a5"}`,
      color: type === "success" ? "#065f46" : "#991b1b",
      fontSize: "14px", fontWeight: 600,
      boxShadow: "0 4px 20px rgba(0,0,0,.12)",
      animation: "slideUp .25s ease",
    }}>
      {type === "success" ? <Icon.Check /> : <Icon.AlertCircle />}
      {message}
    </div>
  );
}

const EMPTY: ConfigForm = {
  nombreCooperativa: "", logoUrl: "", colorPrimario: "", colorSecundario: "",
  facebook: "", instagram: "", twitter: "", whatsapp: "",
  emailSoporte: "", telefonoSoporte: "", direccion: "",
};

export default function ConfigCooperativaPage() {
  const [form, setForm] = useState<ConfigForm>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof ConfigForm, string>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch("/api/configuracion");
        const json = await res.json();
        if (json.data) {
          setForm({
            nombreCooperativa: json.data.nombreCooperativa ?? "",
            logoUrl: json.data.logoUrl ?? "",
            colorPrimario: json.data.colorPrimario ?? "",
            colorSecundario: json.data.colorSecundario ?? "",
            facebook: json.data.facebook ?? "",
            instagram: json.data.instagram ?? "",
            twitter: json.data.twitter ?? "",
            whatsapp: json.data.whatsapp ?? "",
            emailSoporte: json.data.emailSoporte ?? "",
            telefonoSoporte: json.data.telefonoSoporte ?? "",
            direccion: json.data.direccion ?? "",
          });
        }
      } catch {
        setToast({ type: "error", message: "No se pudo cargar la configuración." });
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, []);

  const set = (field: keyof ConfigForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const setColor = (field: keyof ConfigForm) => (v: string) => {
    setForm((prev) => ({ ...prev, [field]: v }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    const result = configuracionSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ConfigForm, string>> = {};
      for (const [key, msgs] of Object.entries(result.error.flatten().fieldErrors)) {
        fieldErrors[key as keyof ConfigForm] = (msgs as string[])[0];
      }
      setErrors(fieldErrors);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/configuracion", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Error desconocido");
      setToast({ type: "success", message: "¡Configuración guardada correctamente!" });
    } catch (err: unknown) {
      setToast({ type: "error", message: err instanceof Error ? err.message : "Error al guardar" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", gap: "12px", color: "#9ca3af" }}>
        <Icon.Loader /><span style={{ fontSize: "15px" }}>Cargando configuración…</span>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        input:focus, textarea:focus { border-color: ${ORANGE} !important; box-shadow: 0 0 0 3px rgba(249,115,22,.15) !important; }
        .save-btn:hover:not(:disabled) { background: ${ORANGE_DARK} !important; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(249,115,22,.4) !important; }
        .save-btn:active:not(:disabled) { transform: translateY(0) !important; }
        .save-btn:disabled { opacity: .65; cursor: not-allowed; }
        .save-btn { transition: background .15s, transform .15s, box-shadow .15s !important; }
      `}</style>

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "32px 24px", fontFamily: "system-ui, -apple-system, sans-serif" }}>

        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: ORANGE_LIGHT, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: ORANGE }}><Icon.Building /></span>
            </div>
            <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#111827" }}>
              Configuración de la Cooperativa
            </h1>
          </div>
          <p style={{ margin: "0 0 0 52px", fontSize: "14px", color: "#6b7280" }}>
            Personaliza la identidad visual, redes sociales y datos de contacto.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Sección 1: Información general */}
          <SectionCard title="Información general" icon={<Icon.Building />}>
            <Field label="Nombre de la cooperativa *" error={errors.nombreCooperativa}>
              <input type="text" value={form.nombreCooperativa} onChange={set("nombreCooperativa")} placeholder="Ej: Cooperativa Amazonas" style={inputStyle(!!errors.nombreCooperativa)} maxLength={150} />
            </Field>
            <Field label="URL del logo" error={errors.logoUrl} hint="Enlace público a la imagen del logo (https://...)">
              <input type="url" value={form.logoUrl} onChange={set("logoUrl")} placeholder="https://ejemplo.com/logo.png" style={inputStyle(!!errors.logoUrl)} />
            </Field>
            {form.logoUrl && /^https?:\/\/.+/.test(form.logoUrl) && (
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.logoUrl} alt="Vista previa" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                  style={{ height: "56px", maxWidth: "160px", objectFit: "contain", border: "1.5px solid #e5e7eb", borderRadius: "10px", padding: "6px", background: "white" }} />
                <span style={{ fontSize: "12px", color: "#9ca3af" }}>Vista previa del logo</span>
              </div>
            )}
            <Field label="Dirección" error={errors.direccion}>
              <textarea value={form.direccion} onChange={set("direccion")} placeholder="Ej: Av. Principal 123, Ambato, Ecuador" rows={2} maxLength={255} style={{ ...inputStyle(!!errors.direccion), resize: "vertical" }} />
            </Field>
          </SectionCard>

          {/* Sección 2: Identidad visual */}
          <SectionCard title="Identidad visual" icon={<Icon.Palette />}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <ColorField label="Color primario" value={form.colorPrimario ?? ""} onChange={setColor("colorPrimario")} error={errors.colorPrimario} />
              <ColorField label="Color secundario" value={form.colorSecundario ?? ""} onChange={setColor("colorSecundario")} error={errors.colorSecundario} />
            </div>
            {(form.colorPrimario || form.colorSecundario) && (
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                {form.colorPrimario && /^#[0-9A-Fa-f]{6}$/.test(form.colorPrimario) && (
                  <div style={{ height: "32px", flex: 1, borderRadius: "8px", background: form.colorPrimario, border: "1px solid rgba(0,0,0,.08)" }} />
                )}
                {form.colorSecundario && /^#[0-9A-Fa-f]{6}$/.test(form.colorSecundario) && (
                  <div style={{ height: "32px", flex: 1, borderRadius: "8px", background: form.colorSecundario, border: "1px solid rgba(0,0,0,.08)" }} />
                )}
                <span style={{ fontSize: "12px", color: "#9ca3af", whiteSpace: "nowrap" }}>Paleta</span>
              </div>
            )}
          </SectionCard>

          {/* Sección 3: Redes sociales */}
          <SectionCard title="Redes sociales" icon={<Icon.Share />}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <Field label="Facebook" error={errors.facebook}>
                <input type="url" value={form.facebook} onChange={set("facebook")} placeholder="https://facebook.com/..." style={inputStyle(!!errors.facebook)} />
              </Field>
              <Field label="Instagram" error={errors.instagram}>
                <input type="url" value={form.instagram} onChange={set("instagram")} placeholder="https://instagram.com/..." style={inputStyle(!!errors.instagram)} />
              </Field>
              <Field label="Twitter / X" error={errors.twitter}>
                <input type="url" value={form.twitter} onChange={set("twitter")} placeholder="https://twitter.com/..." style={inputStyle(!!errors.twitter)} />
              </Field>
              <Field label="WhatsApp" error={errors.whatsapp} hint="Solo el número, ej: 0991234567">
                <input type="tel" value={form.whatsapp} onChange={set("whatsapp")} placeholder="0991234567" style={inputStyle(!!errors.whatsapp)} maxLength={20} />
              </Field>
            </div>
          </SectionCard>

          {/* Sección 4: Soporte */}
          <SectionCard title="Datos de soporte" icon={<Icon.Headphones />}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <Field label="Correo de soporte" error={errors.emailSoporte}>
                <input type="email" value={form.emailSoporte} onChange={set("emailSoporte")} placeholder="soporte@cooperativa.com" style={inputStyle(!!errors.emailSoporte)} />
              </Field>
              <Field label="Teléfono de soporte" error={errors.telefonoSoporte}>
                <input type="tel" value={form.telefonoSoporte} onChange={set("telefonoSoporte")} placeholder="032 123 4567" style={inputStyle(!!errors.telefonoSoporte)} maxLength={20} />
              </Field>
            </div>
          </SectionCard>

          {/* Botón guardar */}
          <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "4px" }}>
            <button
              type="submit"
              disabled={saving}
              className="save-btn"
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "12px 28px",
                background: ORANGE,
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(249,115,22,.3)",
              }}
            >
              {saving ? <Icon.Loader /> : <Icon.Save />}
              {saving ? "Guardando…" : "Guardar configuración"}
            </button>
          </div>
        </form>
      </div>

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </>
  );
}