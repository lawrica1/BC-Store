"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import type { RepairTicketDto, TicketStatus } from "@bc-store/shared-types";
import { Breadcrumb } from "@/components/breadcrumb";
import { SiteHeader } from "@/components/site-header";
import { NeonButton } from "@/components/neon-button";
import { useLanguage } from "@/components/language-provider";
import { useRole } from "@/components/role-provider";
import { assignRepairTicket, fetchRepairTickets } from "@/lib/api";

const STATUSES: TicketStatus[] = ["PENDING", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

const WS_URL = import.meta.env.VITE_WS_URL ?? "ws://localhost:4000";

const fallbackTickets: RepairTicketDto[] = [
  {
    id: "demo-1",
    ticketNumber: "BCR-001",
    deviceType: "TELEPHONE",
    brand: "Samsung",
    model: "A14",
    faultDesc: "Screen broken",
    serviceType: "AT_HOME",
    homeAddress: "Bonamoussadi",
    visitDate: new Date().toISOString(),
    customerName: "Lawrica",
    customerPhone: "+237650000000",
    status: "PENDING"
  },
  {
    id: "demo-2",
    ticketNumber: "BCR-002",
    deviceType: "ORDINATEUR",
    brand: "HP",
    model: "EliteBook",
    faultDesc: "Battery does not charge",
    serviceType: "IN_STORE",
    storeAddress: "BC Store Douala",
    customerName: "Demo Client",
    customerPhone: "+237650000001",
    status: "ASSIGNED"
  }
];

export default function AdminPage() {
  const { dictionary, locale } = useLanguage();
  const { role, isAuthenticated } = useRole();
  const queryClient = useQueryClient();
  const [assigningId, setAssigningId] = useState("");
  const [feeInputs, setFeeInputs] = useState<Record<string, string>>({});
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const { data } = useQuery({
    queryKey: ["repair-tickets"],
    queryFn: () => fetchRepairTickets(),
    enabled: isAuthenticated
  });
  const tickets = data?.length ? data : fallbackTickets;

  const filteredTickets = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return tickets.filter((ticket) => {
      const matchesStatus = statusFilter === "ALL" || ticket.status === statusFilter;
      const matchesQuery =
        !query || ticket.ticketNumber.toLowerCase().includes(query) || ticket.customerName.toLowerCase().includes(query);
      return matchesStatus && matchesQuery;
    });
  }, [tickets, statusFilter, searchQuery]);

  function feeInputValue(ticket: RepairTicketDto) {
    if (feeInputs[ticket.id] !== undefined) return feeInputs[ticket.id];
    const fallback = ticket.transportFee ?? ticket.estimatedTransportFee;
    return fallback !== null && fallback !== undefined ? String(fallback) : "";
  }

  useEffect(() => {
    const socket = io(WS_URL, { transports: ["websocket"] });
    socket.emit("join-admin-room");
    socket.on("ticket-created", (ticket: RepairTicketDto) => {
      queryClient.setQueryData<RepairTicketDto[]>(["repair-tickets"], (current = []) => [ticket, ...current]);
    });
    socket.on("ticket-updated", (ticket: RepairTicketDto) => {
      queryClient.setQueryData<RepairTicketDto[]>(["repair-tickets"], (current = []) => current.map((item) => (item.id === ticket.id ? ticket : item)));
    });
    return () => {
      socket.disconnect();
    };
  }, [queryClient, role]);

  const metrics = useMemo(() => {
    const homeVisits = tickets.filter((ticket) => ticket.serviceType === "AT_HOME" && ticket.status === "PENDING").length;
    const lowStock = 6;
    return {
      total: String(tickets.length),
      homeVisits: String(homeVisits),
      revenue: "2.4M",
      lowStock: String(lowStock)
    };
  }, [tickets]);

  async function assignTicket(ticket: RepairTicketDto, technicianId: string) {
    if (!technicianId || ticket.id.startsWith("demo")) return;
    setAssigningId(ticket.id);
    try {
      const rawFee = feeInputValue(ticket);
      const transportFee =
        ticket.serviceType === "AT_HOME" && rawFee !== "" && Number.isFinite(Number(rawFee)) ? Number(rawFee) : undefined;
      const updated = await assignRepairTicket(ticket.id, technicianId, transportFee);
      queryClient.setQueryData<RepairTicketDto[]>(["repair-tickets"], (current = []) => current.map((item) => (item.id === updated.id ? updated : item)));
    } finally {
      setAssigningId("");
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="grid min-h-[calc(100vh-80px)] grid-cols-1 lg:grid-cols-[260px_1fr]">
        <aside className="border-r border-borderTech bg-slatePanel p-6">
          <div className="mb-8 text-2xl font-black text-buyCyan">BC Admin</div>
          {dictionary.admin.sidebar.map((item) => (
            <div key={item} className="mb-3 rounded-2xl px-4 py-3 text-sm font-bold text-textMuted hover:bg-[rgb(var(--text-main)/0.05)] hover:text-textMain">
              {item}
            </div>
          ))}
        </aside>
        <section className="p-5 lg:p-10">
          <Breadcrumb items={[{ label: dictionary.nav.home, href: "/" }, { label: dictionary.nav.admin }]} />
          <h1 className="text-4xl font-black text-textMain">{dictionary.admin.title}</h1>
          <div className="mt-8 grid gap-5 md:grid-cols-4">
            <Kpi label={dictionary.admin.tickets} value={metrics.total} accent="cyan" />
            <Kpi label={dictionary.admin.visits} value={metrics.homeVisits} accent="orange" />
            <Kpi label={dictionary.admin.revenue} value={metrics.revenue} accent="cyan" />
            <Kpi label={dictionary.admin.lowStock} value={metrics.lowStock} accent="orange" />
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {(["ALL", ...STATUSES] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-full border px-4 py-2 text-xs font-black transition ${
                    statusFilter === status
                      ? "border-buyCyan bg-buyCyan/10 text-buyCyan"
                      : "border-borderTech text-textMuted hover:text-textMain"
                  }`}
                >
                  {status === "ALL" ? dictionary.categories.ALL : status}
                </button>
              ))}
            </div>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={dictionary.admin.searchPlaceholder}
              className="cyan-focus w-full max-w-xs rounded-full border border-borderTech bg-void px-4 py-2 text-sm text-textMain"
            />
          </div>

          <div className="glass-card mt-4 overflow-x-auto rounded-3xl">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead className="text-xs uppercase tracking-normal text-textMuted">
                <tr>
                  {[
                    dictionary.admin.ticket,
                    dictionary.admin.client,
                    dictionary.admin.device,
                    dictionary.admin.type,
                    dictionary.admin.status,
                    dictionary.admin.transportFee,
                    dictionary.admin.action
                  ].map((head) => (
                    <th key={head} className="border-b border-borderTech p-4">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td className="border-b border-borderTech p-4 text-buyCyan">{ticket.ticketNumber}</td>
                    <td className="border-b border-borderTech p-4">{ticket.customerName}</td>
                    <td className="border-b border-borderTech p-4">{locale === "fr" ? dictionary.categories[ticket.deviceType] : dictionary.categories[ticket.deviceType]}</td>
                    <td className="border-b border-borderTech p-4">{ticket.serviceType}</td>
                    <td className="border-b border-borderTech p-4">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="border-b border-borderTech p-4">
                      {ticket.serviceType === "AT_HOME" ? (
                        <div className="grid gap-1">
                          <input
                            type="number"
                            min={0}
                            step={100}
                            className="cyan-focus w-28 rounded-full border border-borderTech bg-void px-3 py-2 text-sm text-textMain"
                            value={feeInputValue(ticket)}
                            onChange={(event) =>
                              setFeeInputs((current) => ({ ...current, [ticket.id]: event.target.value }))
                            }
                            placeholder="0"
                          />
                          {ticket.estimatedTransportFee != null ? (
                            <span className="text-xs text-textMuted">
                              {dictionary.admin.estimated}: {ticket.estimatedTransportFee.toLocaleString(locale === "fr" ? "fr-CM" : "en-CM")} FCFA
                            </span>
                          ) : null}
                        </div>
                      ) : (
                        <span className="text-textMuted">—</span>
                      )}
                    </td>
                    <td className="border-b border-borderTech p-4">
                      <select
                        className="cyan-focus rounded-full border border-borderTech bg-void px-4 py-2 text-sm text-textMain disabled:opacity-50"
                        disabled={assigningId === ticket.id}
                        defaultValue=""
                        onChange={(event) => void assignTicket(ticket, event.target.value)}
                      >
                        <option value="">{dictionary.admin.assign}</option>
                        <option value="tech-001">Technicien A</option>
                        <option value="tech-002">Technicien B</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6">
            <NeonButton intent="ghost" href="/reparation">{dictionary.nav.repair}</NeonButton>
          </div>
        </section>
      </main>
    </>
  );
}

function Kpi({ label, value, accent }: { label: string; value: string; accent: "cyan" | "orange" }) {
  return (
    <article className={`glass-card rounded-3xl p-5 ${accent === "cyan" ? "shadow-cyanGlow" : "shadow-orangeGlow"}`}>
      <p className="text-sm text-textMuted">{label}</p>
      <strong className={`mt-2 block text-4xl font-black ${accent === "cyan" ? "text-buyCyan" : "text-serviceOrange"}`}>{value}</strong>
    </article>
  );
}

function StatusBadge({ status }: { status: TicketStatus }) {
  const styles: Record<TicketStatus, string> = {
    PENDING: "bg-yellow-500/10 text-yellow-300",
    ASSIGNED: "bg-buyCyan/10 text-buyCyan",
    IN_PROGRESS: "bg-serviceOrange/10 text-serviceOrange",
    COMPLETED: "bg-successEmerald/10 text-successEmerald",
    CANCELLED: "bg-red-500/10 text-red-400"
  };

  return <span className={`rounded-full px-3 py-1 text-xs font-black ${styles[status]}`}>{status}</span>;
}
