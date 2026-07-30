"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Suspense, lazy, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { GeofenceCheck } from "@/components/geofence-check";
import { useLanguage } from "@/components/language-provider";
import { NeonButton } from "@/components/neon-button";
import { createRepairTicket } from "@/lib/api";
import { STORE_COORDINATES, TRANSPORT_FEE_XAF } from "@/lib/geofence";
import type { GeofenceZone } from "@/lib/geofence";
import { cn } from "@/lib/utils";

const StoreMap = lazy(() => import("@/components/store-map").then((m) => ({ default: m.StoreMap })));

const baseSchema = z.object({
  customerName: z.string().min(2),
  customerPhone: z.string().min(6),
  customerEmail: z.string().email().optional().or(z.literal("")),
  deviceType: z.enum(["TELEPHONE", "ORDINATEUR", "AUTRE"]),
  brand: z.string().optional(),
  model: z.string().optional(),
  otherDevice: z.string().optional(),
  faultDesc: z.string().min(8),
  serviceType: z.enum(["IN_STORE", "AT_HOME"]),
  homeAddress: z.string().optional(),
  visitDate: z.string().min(1, "Date/time is required.")
});

const repairSchema = baseSchema.superRefine((data, context) => {
  if (data.serviceType === "AT_HOME" && !data.homeAddress) {
    context.addIssue({ code: "custom", path: ["homeAddress"], message: "Address is required for home visits." });
  }
  if (data.deviceType === "AUTRE") {
    if (!data.otherDevice) {
      context.addIssue({ code: "custom", path: ["otherDevice"], message: "Please specify the device." });
    }
  } else {
    if (!data.brand || data.brand.length < 2) {
      context.addIssue({ code: "custom", path: ["brand"], message: "Brand is required." });
    }
    if (!data.model) {
      context.addIssue({ code: "custom", path: ["model"], message: "Model is required." });
    }
  }
});

type RepairFormValues = z.infer<typeof repairSchema>;

export function RepairForm() {
  const { dictionary } = useLanguage();
  const [toast, setToast] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    resetField,
    formState: { errors }
  } = useForm<RepairFormValues>({
    resolver: zodResolver(repairSchema),
    defaultValues: {
      serviceType: "IN_STORE",
      deviceType: "TELEPHONE"
    }
  });

  const [transportZone, setTransportZone] = useState<GeofenceZone>("UNKNOWN");
  const [transportFee, setTransportFee] = useState(TRANSPORT_FEE_XAF);

  const serviceType = watch("serviceType");
  const deviceType = watch("deviceType");

  useEffect(() => {
    if (serviceType === "IN_STORE") {
      resetField("homeAddress");
    }
  }, [resetField, serviceType]);

  useEffect(() => {
    if (deviceType === "AUTRE") {
      resetField("brand");
      resetField("model");
    } else {
      resetField("otherDevice");
    }
  }, [deviceType, resetField]);

  function chooseServiceType(nextType: RepairFormValues["serviceType"]) {
    setValue("serviceType", nextType, { shouldValidate: true, shouldDirty: true });
  }

  async function submitRepairTicket(values: RepairFormValues) {
    const isOther = values.deviceType === "AUTRE";
    const isAtHome = values.serviceType === "AT_HOME";

    setSubmitting(true);
    try {
      await createRepairTicket({
        deviceType: isOther ? "AUTRE" : values.deviceType,
        brand: isOther ? dictionary.repair.deviceOther : (values.brand ?? ""),
        model: isOther ? (values.otherDevice ?? "") : (values.model ?? ""),
        faultDesc: values.faultDesc,
        serviceType: values.serviceType,
        homeAddress: isAtHome ? values.homeAddress : null,
        visitDate: values.visitDate,
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        customerEmail: values.customerEmail || undefined,
        transportZone: isAtHome ? transportZone : null,
        transportFee: isAtHome ? transportFee : null
      });
      setToast(dictionary.repair.sent);
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Request failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="glass-card grid gap-5 rounded-3xl p-5 lg:p-7" onSubmit={handleSubmit(submitRepairTicket)}>
      <div className="grid grid-cols-2 gap-2 rounded-full border border-borderTech bg-slatePanel p-1">
        <button
          type="button"
          onClick={() => chooseServiceType("IN_STORE")}
          className={cn(
            "min-h-12 rounded-full px-4 text-sm font-black transition",
            serviceType === "IN_STORE" ? "bg-gradient-to-r from-buyCyan to-buyBlue text-void" : "text-textMuted"
          )}
        >
          {dictionary.repair.inStore}
        </button>
        <button
          type="button"
          onClick={() => chooseServiceType("AT_HOME")}
          className={cn(
            "min-h-12 rounded-full px-4 text-sm font-black transition",
            serviceType === "AT_HOME" ? "bg-serviceOrange text-white" : "text-textMuted"
          )}
        >
          {dictionary.repair.atHome}
        </button>
      </div>

      <input type="hidden" {...register("serviceType")} />

      <div className="grid gap-4 md:grid-cols-2">
        <Field label={dictionary.fields.name} error={errors.customerName?.message}>
          <input className="cyan-focus rounded-2xl border border-borderTech bg-void px-4 py-3 text-textMain" {...register("customerName")} />
        </Field>
        <Field label={dictionary.fields.phone} error={errors.customerPhone?.message}>
          <input className="cyan-focus rounded-2xl border border-borderTech bg-void px-4 py-3 text-textMain" {...register("customerPhone")} />
        </Field>
        <Field label={dictionary.fields.email} error={errors.customerEmail?.message}>
          <input className="cyan-focus rounded-2xl border border-borderTech bg-void px-4 py-3 text-textMain" {...register("customerEmail")} />
        </Field>
        <Field label={dictionary.fields.deviceType} error={errors.deviceType?.message}>
          <select className="cyan-focus rounded-2xl border border-borderTech bg-void px-4 py-3 text-textMain" {...register("deviceType")}>
            <option value="TELEPHONE">{dictionary.categories.TELEPHONE}</option>
            <option value="ORDINATEUR">{dictionary.categories.ORDINATEUR}</option>
            <option value="AUTRE">{dictionary.repair.deviceOther}</option>
          </select>
        </Field>
        {deviceType === "AUTRE" ? (
          <Field label={dictionary.repair.deviceOtherLabel} error={errors.otherDevice?.message}>
            <input className="cyan-focus rounded-2xl border border-borderTech bg-void px-4 py-3 text-textMain" {...register("otherDevice")} />
          </Field>
        ) : (
          <>
            <Field label={dictionary.fields.brand} error={errors.brand?.message}>
              <input className="cyan-focus rounded-2xl border border-borderTech bg-void px-4 py-3 text-textMain" {...register("brand")} />
            </Field>
            <Field label={dictionary.fields.model} error={errors.model?.message}>
              <input className="cyan-focus rounded-2xl border border-borderTech bg-void px-4 py-3 text-textMain" {...register("model")} />
            </Field>
          </>
        )}
      </div>

      <Field label={dictionary.fields.fault} error={errors.faultDesc?.message}>
        <textarea className="cyan-focus min-h-32 rounded-2xl border border-borderTech bg-void px-4 py-3 text-textMain" {...register("faultDesc")} />
      </Field>

      {serviceType === "IN_STORE" ? (
        <div className="grid gap-3 rounded-3xl border border-buyCyan/30 bg-buyCyan/5 p-5 text-center text-buyCyan shadow-cyanGlow">
          <Suspense fallback={<div className="h-64 w-full animate-pulse rounded-2xl border border-buyCyan/20 bg-slatePanel/60" />}>
            <StoreMap storeCoords={STORE_COORDINATES} storeLabel={dictionary.geofence.mapStoreLabel} />
          </Suspense>
          <p className="text-sm text-textMuted">{dictionary.repair.storeHint}</p>
          <Field label={dictionary.repair.storeVisitLabel} error={errors.visitDate?.message}>
            <input type="datetime-local" className="cyan-focus rounded-2xl border border-borderTech bg-void px-4 py-3 text-textMain" {...register("visitDate")} />
          </Field>
        </div>
      ) : (
        <div className="grid gap-4">
          <p className="rounded-2xl border border-serviceOrange/30 bg-serviceOrange/10 p-3 text-sm font-bold text-serviceOrange">{dictionary.repair.homeHint}</p>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={dictionary.fields.address} error={errors.homeAddress?.message}>
              <input className="cyan-focus rounded-2xl border border-borderTech bg-void px-4 py-3 text-textMain" {...register("homeAddress")} />
            </Field>
            <Field label={dictionary.repair.homeVisitLabel} error={errors.visitDate?.message}>
              <input type="datetime-local" className="cyan-focus rounded-2xl border border-borderTech bg-void px-4 py-3 text-textMain" {...register("visitDate")} />
            </Field>
          </div>
          <GeofenceCheck
            onChange={(zone, fee) => {
              setTransportZone(zone);
              setTransportFee(fee);
            }}
          />
        </div>
      )}

      <NeonButton intent="service" className="w-full disabled:cursor-not-allowed disabled:opacity-50" type="submit" disabled={submitting}>
        {dictionary.repair.submit}
      </NeonButton>

      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm rounded-2xl border border-serviceOrange bg-slatePanel/95 p-4 text-sm font-bold text-textMain shadow-orangeGlow">
          {toast}
        </div>
      ) : null}
    </form>
  );
}

function Field({
  label,
  error,
  children
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-textMain">
      <span>{label}</span>
      {children}
      {error ? <span className="text-xs text-serviceOrange">{error}</span> : null}
    </label>
  );
}
