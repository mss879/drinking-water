"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState, useTransition, type KeyboardEventHandler } from "react";
import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Download, Ellipsis, GripHorizontal, Lock, Pencil, Plus, Trash2 } from "lucide-react";
import { addStage, moveLead, setStageOrder } from "@/app/actions/admin/crm";
import { LeadCard, LeadCardBody } from "@/components/admin/crm/lead-card";
import { LeadSheet } from "@/components/admin/crm/lead-sheet";
import { DeleteStageDialog, EditStageDialog, NewLeadDialog } from "@/components/admin/crm/stage-dialogs";
import { Badge } from "@/components/admin/ui/badge";
import { Input } from "@/components/admin/ui/field";
import { PageHeader } from "@/components/admin/ui/panel";
import { toast } from "@/components/admin/ui/toaster";
import { Button, buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { formatNumber, formatPercent } from "@/lib/admin/format";
import { formatLKR } from "@/lib/format";
import type { Lead, Stage } from "@/lib/supabase/types";

type Columns = Record<string, string[]>;

export type CrmSummary = { openLeads: number; pipelineValue: number; wonThisMonth: number; wonValue: number; winRate: number | null };

function buildColumns(stages: Stage[], leads: Lead[]): Columns {
  const columns: Columns = Object.fromEntries(stages.map((stage) => [stage.id, []]));
  for (const lead of leads) columns[lead.stage_id]?.push(lead.id);
  return columns;
}

/**
 * The pipeline. Stages are columns (New Leads fixed first), leads are cards. Cards and columns move by drag and
 * drop (mouse, touch, or keyboard via their grip buttons); a lead's sheet also has a "Stage" field for moving it
 * without dragging. Every move is shown at once and saved in the background; if saving fails it snaps back.
 */
export function CrmBoard({
  stages: initialStages,
  leads,
  summary,
  today,
  openLeadId,
  hiddenClosed,
  showAll,
}: {
  stages: Stage[];
  leads: Lead[];
  summary: CrmSummary;
  today: string;
  openLeadId: string | null;
  hiddenClosed: number;
  showAll: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  // A stable id keeps dnd-kit's screen-reader ids the same on the server and in the browser.
  const dndId = useId();

  const stagesById = useMemo(() => new Map(initialStages.map((stage) => [stage.id, stage])), [initialStages]);
  const leadsById = useMemo(() => new Map(leads.map((lead) => [lead.id, lead])), [leads]);
  const [stageIds, setStageIds] = useState(() => initialStages.map((stage) => stage.id));
  const [columns, setColumns] = useState<Columns>(() => buildColumns(initialStages, leads));
  const [active, setActive] = useState<{ id: string; type: "card" | "column" } | null>(null);
  const snapshot = useRef<{ columns: Columns; stageIds: string[] } | null>(null);

  const [editing, setEditing] = useState<Stage | null>(null);
  const [deleting, setDeleting] = useState<Stage | null>(null);
  const [adding, setAdding] = useState(false);

  const stages = stageIds.map((id) => stagesById.get(id)).filter((stage): stage is Stage => Boolean(stage));
  const lockedId = initialStages.find((stage) => stage.is_locked)?.id ?? stageIds[0];

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const href = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value === null) next.delete(key);
      else next.set(key, value);
    }
    const query = next.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  const columnOf = (id: UniqueIdentifier) => {
    const key = String(id);
    if (key in columns) return key;
    return Object.keys(columns).find((column) => columns[column].includes(key)) ?? null;
  };

  const nameOf = (id: UniqueIdentifier) => leadsById.get(String(id))?.name ?? `the ${stagesById.get(String(id))?.name ?? ""} stage`;
  const announcements: Announcements = {
    onDragStart: ({ active: item }) => `Picked up ${nameOf(item.id)}.`,
    onDragOver: ({ active: item, over }) =>
      over ? `${nameOf(item.id)} is over ${stagesById.get(columnOf(over.id) ?? "")?.name ?? "a stage"}.` : `${nameOf(item.id)} is outside the board.`,
    onDragEnd: ({ active: item, over }) =>
      over ? `${nameOf(item.id)} dropped in ${stagesById.get(columnOf(over.id) ?? "")?.name ?? "the board"}.` : `${nameOf(item.id)} put back.`,
    onDragCancel: ({ active: item }) => `Moving ${nameOf(item.id)} was cancelled.`,
  };

  function onDragStart({ active: item }: DragStartEvent) {
    snapshot.current = { columns, stageIds };
    setActive({ id: String(item.id), type: item.data.current?.type === "column" ? "column" : "card" });
  }

  // Cards change column as they're dragged across, so the drop preview is right.
  function onDragOver({ active: item, over }: DragOverEvent) {
    if (!over || item.data.current?.type !== "card") return;
    const from = columnOf(item.id);
    const to = columnOf(over.id);
    if (!from || !to || from === to) return;
    setColumns((current) => {
      const target = current[to].filter((id) => id !== item.id);
      const overIndex = target.indexOf(String(over.id));
      target.splice(overIndex >= 0 ? overIndex : target.length, 0, String(item.id));
      return { ...current, [from]: current[from].filter((id) => id !== item.id), [to]: target };
    });
  }

  function onDragEnd({ active: item, over }: DragEndEvent) {
    const before = snapshot.current;
    snapshot.current = null;
    setActive(null);
    if (!before) return;

    if (item.data.current?.type === "column") {
      const overColumn = over ? columnOf(over.id) : null;
      if (!overColumn || overColumn === item.id) return;
      const from = stageIds.indexOf(String(item.id));
      const to = Math.max(1, stageIds.indexOf(overColumn)); // New Leads stays first
      if (from === to) return;
      const next = arrayMove(stageIds, from, to);
      setStageIds(next);
      startTransition(async () => {
        const result = await setStageOrder(next.filter((id) => id !== lockedId));
        if (!result.ok) {
          setStageIds(before.stageIds);
          toast(result.error, "error");
        } else router.refresh();
      });
      return;
    }

    const id = String(item.id);
    const column = columnOf(id);
    if (!column) return setColumns(before.columns);
    let items = columns[column];
    const overIndex = over ? items.indexOf(String(over.id)) : -1;
    const fromIndex = items.indexOf(id);
    if (overIndex >= 0 && overIndex !== fromIndex) items = arrayMove(items, fromIndex, overIndex);
    setColumns({ ...columns, [column]: items });

    const fromColumn = Object.keys(before.columns).find((key) => before.columns[key].includes(id));
    if (fromColumn === column && before.columns[column].join() === items.join()) return;
    const beforeId = items[items.indexOf(id) + 1] ?? null;
    startTransition(async () => {
      const result = await moveLead(id, column, beforeId);
      if (!result.ok) {
        setColumns(before.columns);
        toast(result.error, "error");
        return;
      }
      if (fromColumn !== column) toast(`Moved to ${stagesById.get(column)?.name}.`);
      router.refresh();
    });
  }

  function onDragCancel() {
    if (snapshot.current) {
      setColumns(snapshot.current.columns);
      setStageIds(snapshot.current.stageIds);
    }
    snapshot.current = null;
    setActive(null);
  }

  const openLead = openLeadId ? leadsById.get(openLeadId) : undefined;
  const activeLead = active?.type === "card" ? leadsById.get(active.id) : undefined;
  const activeStage = active?.type === "column" ? stagesById.get(active.id) : undefined;

  return (
    <>
      <PageHeader
        title="CRM pipeline"
        description="Drag leads from stage to stage. New Leads is fixed; every other stage can be renamed, reordered, marked won or lost, or deleted."
        actions={
          <>
            <a href="/admin/crm/export" download className={buttonClasses({ variant: "outline", size: "sm" })}>
              <Download aria-hidden className="size-4" />
              Export CSV
            </a>
            <Button size="sm" onClick={() => setAdding(true)}>
              <Plus aria-hidden className="size-4" />
              Add lead
            </Button>
          </>
        }
      />

      <dl className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Open leads", value: formatNumber(summary.openLeads) },
          { label: "Pipeline value", value: formatLKR(summary.pipelineValue) },
          { label: "Won this month", value: `${summary.wonThisMonth}${summary.wonValue ? ` · ${formatLKR(summary.wonValue)}` : ""}` },
          { label: "Win rate (90 days)", value: summary.winRate === null ? "—" : formatPercent(summary.winRate) },
        ].map((tile) => (
          <div key={tile.label} className="card-line rounded-card-sm px-4 py-3.5">
            <dt className="text-[13px] text-muted">{tile.label}</dt>
            <dd className="mt-1 truncate font-display text-xl font-bold text-ink tabular-nums">{tile.value}</dd>
          </div>
        ))}
      </dl>

      <DndContext
        id={dndId}
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
        accessibility={{ announcements }}
      >
        <SortableContext items={stageIds} strategy={horizontalListSortingStrategy}>
          <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory items-start gap-3 overflow-x-auto scroll-px-4 px-4 pb-4 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:snap-none lg:px-0">
            {stages.map((stage) => (
              <StageColumn
                key={stage.id}
                stage={stage}
                leadIds={columns[stage.id] ?? []}
                leadsById={leadsById}
                today={today}
                onOpenLead={(id) => router.push(href({ lead: id }), { scroll: false })}
                onEdit={() => setEditing(stage)}
                onDelete={() => setDeleting(stage)}
              />
            ))}
            <AddStageColumn onAdded={() => router.refresh()} />
          </div>
        </SortableContext>
        <DragOverlay>
          {activeLead && (
            <div className="w-72 rotate-2 rounded-card-sm border border-brand bg-white p-3.5 shadow-float">
              <LeadCardBody lead={activeLead} today={today} />
            </div>
          )}
          {activeStage && (
            <div className="w-72 rounded-card bg-tint-2 px-4 py-3 font-display font-bold text-ink shadow-float">{activeStage.name}</div>
          )}
        </DragOverlay>
      </DndContext>

      {(hiddenClosed > 0 || showAll) && (
        <p className="mt-2 text-[13px] text-muted">
          {showAll ? "Showing every closed lead. " : `${hiddenClosed} won or lost ${hiddenClosed === 1 ? "lead" : "leads"} older than 90 days hidden. `}
          <Link href={href({ all: showAll ? null : "1" })} className="font-semibold text-deep underline-offset-4 hover:underline">
            {showAll ? "Hide old ones" : "Show all"}
          </Link>
        </p>
      )}

      {openLead && (
        <LeadSheet
          key={`${openLead.id}-${openLead.updated_at}`}
          lead={openLead}
          stages={stages}
          onClose={() => router.push(href({ lead: null }), { scroll: false })}
          onChanged={() => router.refresh()}
        />
      )}
      {editing && <EditStageDialog stage={editing} onClose={() => setEditing(null)} onChanged={() => router.refresh()} />}
      {deleting && (
        <DeleteStageDialog
          stage={deleting}
          stages={stages}
          leadCount={(columns[deleting.id] ?? []).length}
          onClose={() => setDeleting(null)}
          onChanged={() => router.refresh()}
        />
      )}
      {adding && (
        <NewLeadDialog
          stages={stages}
          defaultStageId={lockedId}
          onClose={() => setAdding(false)}
          onCreated={() => router.refresh()}
        />
      )}
    </>
  );
}

function StageColumn({
  stage,
  leadIds,
  leadsById,
  today,
  onOpenLead,
  onEdit,
  onDelete,
}: {
  stage: Stage;
  leadIds: string[];
  leadsById: Map<string, Lead>;
  today: string;
  onOpenLead: (id: string) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  // The fixed stage can't be dragged, but cards can still be dropped into it.
  const { setNodeRef, setActivatorNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: stage.id,
    data: { type: "column" },
    disabled: { draggable: stage.is_locked, droppable: false },
  });
  const total = leadIds.reduce((sum, id) => sum + (leadsById.get(id)?.value ?? 0), 0);

  return (
    <section
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      aria-label={`${stage.name}: ${leadIds.length} ${leadIds.length === 1 ? "lead" : "leads"}`}
      className={cn(
        "flex w-[85vw] max-w-[20rem] shrink-0 snap-start flex-col rounded-card bg-tint sm:w-72 lg:w-[17.5rem]",
        isDragging && "opacity-40",
      )}
    >
      <header className="flex items-center gap-2 px-3 pt-3">
        {stage.is_locked ? (
          <span title="Fixed stage" className="grid size-7 place-items-center text-deep">
            <Lock aria-hidden className="size-3.5" />
            <span className="sr-only">Fixed stage</span>
          </span>
        ) : (
          <button
            ref={setActivatorNodeRef}
            type="button"
            {...attributes}
            {...(listeners as Record<string, KeyboardEventHandler<HTMLButtonElement>>)}
            aria-label={`Move the ${stage.name} stage`}
            className="grid size-7 cursor-grab place-items-center rounded-full text-mist transition-colors hover:bg-white hover:text-deep active:cursor-grabbing"
          >
            <GripHorizontal aria-hidden className="size-4" />
          </button>
        )}
        <h2 className="min-w-0 truncate font-display text-[15px] font-bold text-ink">{stage.name}</h2>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-deep tabular-nums">{leadIds.length}</span>
        {stage.outcome !== "open" && <Badge tone={stage.outcome === "won" ? "solid" : "muted"}>{stage.outcome === "won" ? "Won" : "Lost"}</Badge>}
        {!stage.is_locked && <StageMenu name={stage.name} onEdit={onEdit} onDelete={onDelete} />}
      </header>
      <p className="px-4 pt-1 text-xs text-muted tabular-nums">{total > 0 ? formatLKR(total) : " "}</p>
      <SortableContext items={leadIds} strategy={verticalListSortingStrategy}>
        <ul className="flex min-h-28 flex-col gap-2 overflow-y-auto overscroll-contain p-2 lg:max-h-[calc(100dvh-20rem)]">
          {leadIds.map((id) => {
            const lead = leadsById.get(id);
            return lead ? <LeadCard key={id} lead={lead} today={today} onOpen={() => onOpenLead(id)} /> : null;
          })}
          {leadIds.length === 0 && (
            <li className="grid min-h-24 place-items-center rounded-card-sm border border-dashed border-line px-4 text-center text-[13px] text-muted">
              {stage.is_locked ? "Inquiries you move to the CRM arrive here." : "Drop leads here"}
            </li>
          )}
        </ul>
      </SortableContext>
    </section>
  );
}

function StageMenu({ name, onEdit, onDelete }: { name: string; onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (event: Event) => {
      if (event instanceof KeyboardEvent ? event.key === "Escape" : !ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);
  return (
    <div ref={ref} className="relative ml-auto">
      <button
        type="button"
        aria-expanded={open}
        aria-label={`Options for ${name}`}
        onClick={() => setOpen((value) => !value)}
        className="grid size-8 cursor-pointer place-items-center rounded-full text-muted transition-colors hover:bg-white hover:text-ink"
      >
        <Ellipsis aria-hidden className="size-4" />
      </button>
      {open && (
        <div className="absolute top-full right-0 z-30 mt-1 w-44 animate-fade-up rounded-card-sm border border-line bg-white p-1.5 shadow-float">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-chip px-3 py-2 text-sm font-medium hover:bg-tint"
          >
            <Pencil aria-hidden className="size-4 text-deep" /> Edit stage
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-chip px-3 py-2 text-sm font-medium hover:bg-tint"
          >
            <Trash2 aria-hidden className="size-4 text-deep" /> Delete stage
          </button>
        </div>
      )}
    </div>
  );
}

function AddStageColumn({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-14 w-[85vw] max-w-[20rem] shrink-0 cursor-pointer snap-start items-center justify-center gap-2 rounded-card border border-dashed border-mist text-sm font-semibold text-deep transition-colors hover:border-deep hover:bg-white sm:w-72 lg:w-[17.5rem]"
      >
        <Plus aria-hidden className="size-4" /> Add stage
      </button>
    );
  }
  return (
    <form
      className="flex w-[85vw] max-w-[20rem] shrink-0 snap-start flex-col gap-2 rounded-card bg-tint p-3 sm:w-72 lg:w-[17.5rem]"
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(async () => {
          const result = await addStage(name);
          if (!result.ok) return toast(result.error, "error");
          toast(result.message ?? "Stage added.");
          setName("");
          setOpen(false);
          onAdded();
        });
      }}
    >
      <Input aria-label="Stage name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Demo booked" maxLength={40} autoFocus />
      <div className="flex gap-2">
        <Button type="submit" size="sm" loading={pending} disabled={!name.trim()}>
          Add
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
