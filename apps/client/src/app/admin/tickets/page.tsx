"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import type { PaginatedRepairTickets, RepairTicketDto, TicketStatus } from "@bc-store/shared-types";
import { Kpi } from "@/components/admin/kpi";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLanguage } from "@/components/language-provider";
import { useRole } from "@/components/role-provider";
import { assignRepairTicket, fetchRepairTickets, fetchTechnicians } from "@/lib/api";
import { getToken } from "@/lib/auth";

const STATUSES: TicketStatus[] = ["PENDING", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:4000";

export default function AdminTicketsPage() {
  const { dictionary, locale } = useLanguage();
  const { role, userId, isTechnician, isStaff } = useRole();
  const queryClient = useQueryClient();
  const [assigningId, setAssigningId] = useState("");
  const [feeInputs, setFeeInputs] = useState<Record<string, string>>({});
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const { data } = useQuery({
    queryKey: ["repair-tickets"],
    queryFn: () => fetchRepairTickets(),
    enabled: isStaff
  });
  const { data: technicians = [] } = useQuery({
    queryKey: ["technicians"],
    queryFn: fetchTechnicians,
    enabled: isStaff && !isTechnician
  });

  // Technicians only ever see the tickets assigned to them.
  const tickets = useMemo(() => {
    const all = data?.tickets ?? [];
    return isTechnician ? all.filter((ticket) => ticket.assignedTo === userId) : all;
  }, [data, isTechnician, userId]);

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
    // The gateway rejects sockets that don't present the JWT in the handshake.
    const socket = io(WS_URL, { transports: ["websocket"], auth: { token: getToken() } });
    socket.emit("join-admin-room");
    socket.on("ticket-created", (ticket: RepairTicketDto) => {
      queryClient.setQueryData<PaginatedRepairTickets>(["repair-tickets"], (current) =>
        current ? { ...current, tickets: [ticket, ...current.tickets], total: current.total + 1 } : current
      );
    });
    socket.on("ticket-updated", (ticket: RepairTicketDto) => {
      queryClient.setQueryData<PaginatedRepairTickets>(["repair-tickets"], (current) => {
        if (!current) return current;
        const exists = current.tickets.some((item) => item.id === ticket.id);
        const tickets = exists
          ? current.tickets.map((item) => (item.id === ticket.id ? ticket : item))
          : [ticket, ...current.tickets];
        return { ...current, tickets };
      });
    });
    return () => {
      socket.disconnect();
    };
  }, [queryClient, role]);

  const homeVisits = tickets.filter((ticket) => ticket.serviceType === "AT_HOME" && ticket.status === "PENDING").length;

  async function assignTicket(ticket: RepairTicketDto, technicianId: string) {
    if (!technicianId) return;
    setAssigningId(ticket.id);
    try {
      const rawFee = feeInputValue(ticket);
      const transportFee =
        ticket.serviceType === "AT_HOME" && rawFee !== "" && Number.isFinite(Number(rawFee)) ? Number(rawFee) : undefined;
      const updated = await assignRepairTicket(ticket.id, technicianId, transportFee);
      queryClient.setQueryData<PaginatedRepairTickets>(["repair-tickets"], (current) =>
        current ? { ...current, tickets: current.tickets.map((item) => (item.id === updated.id ? updated : item)) } : current
      );
    } finally {
      setAssigningId("");
    }
  }

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-black text-textMain sm:text-3xl">{isTechnician ? dictionary.admin.myTickets : dictionary.admin.nav.tickets}</h1>

      <div className="grid gap-3 sm:grid-cols-2 md:max-w-md">
        <Kpi label={dictionary.admin.tickets} value={String(tickets.length)} accent="cyan" />
        <Kpi label={dictionary.admin.visits} value={String(homeVisits)} accent="orange" />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {(["ALL", ...STATUSES] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-full border px-4 py-2 text-xs font-black transition ${
                statusFilter === status ? "border-buyCyan bg-buyCyan/10 text-buyCyan" : "border-borderTech text-textMuted hover:text-textMain"
              }`}
            >
              {status === "ALL" ? dictionary.categories.ALL : status}
            </button>
          ))}
        </div>
        <Input
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder={dictionary.admin.searchPlaceholder}
          className="w-full rounded-full border-borderTech bg-void text-sm text-textMain sm:max-w-xs"
        />
      </div>

      <div className="glass-card overflow-x-auto rounded-3xl">
        <Table className="min-w-[760px]">
          <TableHeader>
            <TableRow className="border-borderTech hover:bg-transparent">
              <TableHead className="text-textMuted">{dictionary.admin.ticket}</TableHead>
              <TableHead className="text-textMuted">{dictionary.admin.client}</TableHead>
              <TableHead className="text-textMuted">{dictionary.admin.device}</TableHead>
              <TableHead className="text-textMuted">{dictionary.admin.type}</TableHead>
              <TableHead className="text-textMuted">{dictionary.admin.status}</TableHead>
              <TableHead className="text-textMuted">{dictionary.admin.transportFee}</TableHead>
              {!isTechnician ? <TableHead className="text-textMuted">{dictionary.admin.action}</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTickets.map((ticket) => (
              <TableRow key={ticket.id} className="border-borderTech hover:bg-[rgb(var(--text-main)/0.03)]">
                <TableCell className="text-buyCyan">{ticket.ticketNumber}</TableCell>
                <TableCell className="text-textMain">{ticket.customerName}</TableCell>
                <TableCell className="text-textMain">{dictionary.categories[ticket.deviceType]}</TableCell>
                <TableCell className="text-textMain">{ticket.serviceType}</TableCell>
                <TableCell>
                  <StatusBadge status={ticket.status} />
                </TableCell>
                <TableCell>
                  {ticket.serviceType === "AT_HOME" ? (
                    <div className="grid gap-1">
                      <Input
                        type="number"
                        min={0}
                        step={100}
                        disabled={isTechnician}
                        className="w-28 rounded-full border-borderTech bg-void text-sm text-textMain"
                        value={feeInputValue(ticket)}
                        onChange={(event) => setFeeInputs((current) => ({ ...current, [ticket.id]: event.target.value }))}
                        placeholder="0"
                      />
                      {ticket.estimatedTransportFee != null ? (
                        <span className="text-xs text-textMuted">
                          {dictionary.admin.estimated}: {Number(ticket.estimatedTransportFee).toLocaleString(locale === "fr" ? "fr-CM" : "en-CM")} FCFA
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <span className="text-textMuted">—</span>
                  )}
                </TableCell>
                {!isTechnician ? (
                  <TableCell>
                    <Select
                      value={ticket.assignedTo ?? undefined}
                      disabled={assigningId === ticket.id}
                      onValueChange={(value) => void assignTicket(ticket, value)}
                    >
                      <SelectTrigger className="w-40 rounded-full border-borderTech bg-void text-sm text-textMain">
                        <SelectValue placeholder={dictionary.admin.assign} />
                      </SelectTrigger>
                      <SelectContent>
                        {technicians.map((technician) => (
                          <SelectItem key={technician.id} value={technician.id}>
                            {technician.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!filteredTickets.length ? <p className="p-6 text-center text-sm text-textMuted">{dictionary.admin.noTickets}</p> : null}
      </div>
    </div>
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

  return <Badge className={`${styles[status]} border-transparent font-black`}>{status}</Badge>;
}
