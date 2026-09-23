"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { GeofenceCheck } from "@/components/geofence-check";
import { useLanguage } from "@/components/language-provider";
import { NeonButton } from "@/components/neon-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { createRepairTicket } from "@/lib/api";
import { STORE_COORDINATES, TRANSPORT_FEE_XAF } from "@/lib/geofence";
import type { GeofenceZone } from "@/lib/geofence";

const StoreMap = dynamic(() => import("@/components/store-map").then((m) => m.StoreMap), {
  ssr: false,
  loading: () => <div className="h-64 w-full animate-pulse rounded-2xl border border-buyCyan/20 bg-slatePanel/60" />
});

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
    <form className="glass-card grid gap-4 rounded-2xl p-4 sm:p-5" onSubmit={handleSubmit(submitRepairTicket)}>
      <ToggleGroup
        type="single"
        value={serviceType}
        onValueChange={(value) => {
          if (value) setValue("serviceType", value as RepairFormValues["serviceType"], { shouldValidate: true, shouldDirty: true });
        }}
        className="grid grid-cols-2 gap-2 rounded-full border border-borderTech bg-slatePanel p-1"
      >
        <ToggleGroupItem
          value="IN_STORE"
          className={`min-h-12 rounded-full px-4 text-sm font-black transition data-[state=on]:bg-gradient-to-r data-[state=on]:from-buyCyan data-[state=on]:to-buyBlue data-[state=on]:text-void ${
            serviceType === "IN_STORE" ? "" : "text-textMuted"
          }`}
        >
          {dictionary.repair.inStore}
        </ToggleGroupItem>
        <ToggleGroupItem
          value="AT_HOME"
          className={`min-h-12 rounded-full px-4 text-sm font-black transition data-[state=on]:bg-serviceOrange data-[state=on]:text-white ${
            serviceType === "AT_HOME" ? "" : "text-textMuted"
          }`}
        >
          {dictionary.repair.atHome}
        </ToggleGroupItem>
      </ToggleGroup>

      <input type="hidden" {...register("serviceType")} />

      <div className="grid gap-4 md:grid-cols-2">
        <Field label={dictionary.fields.name} error={errors.customerName?.message}>
          <Input className="border-borderTech bg-void text-textMain" {...register("customerName")} />
        </Field>
        <Field label={dictionary.fields.phone} error={errors.customerPhone?.message}>
          <Input className="border-borderTech bg-void text-textMain" {...register("customerPhone")} />
        </Field>
        <Field label={dictionary.fields.email} error={errors.customerEmail?.message}>
          <Input className="border-borderTech bg-void text-textMain" {...register("customerEmail")} />
        </Field>
        <Field label={dictionary.fields.deviceType} error={errors.deviceType?.message}>
          <Select
            value={deviceType}
            onValueChange={(value) => setValue("deviceType", value as RepairFormValues["deviceType"], { shouldValidate: true, shouldDirty: true })}
          >
            <SelectTrigger aria-label={dictionary.fields.deviceType} className="border-borderTech bg-void text-textMain">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TELEPHONE">{dictionary.categories.TELEPHONE}</SelectItem>
              <SelectItem value="ORDINATEUR">{dictionary.categories.ORDINATEUR}</SelectItem>
              <SelectItem value="AUTRE">{dictionary.repair.deviceOther}</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        {deviceType === "AUTRE" ? (
          <Field label={dictionary.repair.deviceOtherLabel} error={errors.otherDevice?.message}>
            <Input className="border-borderTech bg-void text-textMain" {...register("otherDevice")} />
          </Field>
        ) : (
          <>
            <Field label={dictionary.fields.brand} error={errors.brand?.message}>
              <Input className="border-borderTech bg-void text-textMain" {...register("brand")} />
            </Field>
            <Field label={dictionary.fields.model} error={errors.model?.message}>
              <Input className="border-borderTech bg-void text-textMain" {...register("model")} />
            </Field>
          </>
        )}
      </div>

      <Field label={dictionary.fields.fault} error={errors.faultDesc?.message}>
        <Textarea className="min-h-32 border-borderTech bg-void text-textMain" {...register("faultDesc")} />
      </Field>

      {serviceType === "IN_STORE" ? (
        <div className="grid gap-3 rounded-3xl border border-buyCyan/30 bg-buyCyan/5 p-5 text-center text-buyCyan shadow-cyanGlow">
          <StoreMap storeCoords={STORE_COORDINATES} storeLabel={dictionary.geofence.mapStoreLabel} />
          <p className="text-sm text-textMuted">{dictionary.repair.storeHint}</p>
          <Field label={dictionary.repair.storeVisitLabel} error={errors.visitDate?.message}>
            <Input type="datetime-local" className="border-borderTech bg-void text-textMain" {...register("visitDate")} />
          </Field>
        </div>
      ) : (
        <div className="grid gap-4">
          <p className="rounded-2xl border border-serviceOrange/30 bg-serviceOrange/10 p-3 text-sm font-bold text-serviceOrange">{dictionary.repair.homeHint}</p>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={dictionary.fields.address} error={errors.homeAddress?.message}>
              <Input className="border-borderTech bg-void text-textMain" {...register("homeAddress")} />
            </Field>
            <Field label={dictionary.repair.homeVisitLabel} error={errors.visitDate?.message}>
              <Input type="datetime-local" className="border-borderTech bg-void text-textMain" {...register("visitDate")} />
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
    <Label className="grid gap-2 text-sm font-bold text-textMain">
      <span>{label}</span>
      {children}
      {error ? <span className="text-xs font-normal text-serviceOrange">{error}</span> : null}
    </Label>
  );
}
