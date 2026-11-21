"use client"

import { Layers, Pencil, Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/console/confirm-dialog"
import { DataTable, type DataColumn } from "@/components/console/data-table"
import { PageContainer, PageHeader } from "@/components/console/page-header"
import { Pagination } from "@/components/console/pagination"
import { SearchInput } from "@/components/console/search-input"
import { DropdownSelect } from "@/components/dropdown-select"
import { Field } from "@/components/field"
import { useI18n } from "@/components/i18n-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { intlLocale } from "@/lib/i18n"
import {
  useCreateManagedItem,
  useDeleteManagedItem,
  useManagedItems,
  useUpdateManagedItem,
  type ItemStatus,
  type ManagedItem,
} from "@/lib/items-store"

const PAGE_SIZE = 5

export default function AdminItemsPage() {
  const { t, locale } = useI18n()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<ItemStatus | "all">("all")
  const [page, setPage] = useState(1)

  const [editing, setEditing] = useState<ManagedItem | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<ManagedItem | null>(null)

  const query = useManagedItems(search, statusFilter)
  const createItem = useCreateManagedItem()
  const updateItem = useUpdateManagedItem()
  const deleteItem = useDeleteManagedItem()

  const rows = query.data ?? []
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const pageRows = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const statusLabel = (status: ItemStatus) => {
    if (status === "active") return t("admin.items.statusActive")
    if (status === "draft") return t("admin.items.statusDraft")
    return t("admin.items.statusArchived")
  }

  const columns: DataColumn<ManagedItem>[] = [
    {
      id: "name",
      header: t("admin.items.colName"),
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.name}</p>
          <p className="truncate font-mono text-xs text-muted-foreground">{row.slug}</p>
        </div>
      ),
    },
    {
      id: "owner",
      header: t("admin.items.colOwner"),
      cell: (row) => <span className="text-muted-foreground">{row.owner}</span>,
    },
    {
      id: "status",
      header: t("admin.items.colStatus"),
      cell: (row) => (
        <Badge variant={row.status === "active" ? "secondary" : "outline"}>
          {statusLabel(row.status)}
        </Badge>
      ),
    },
    {
      id: "updated",
      header: t("admin.items.colUpdated"),
      className: "text-right tabular-nums text-muted-foreground",
      cell: (row) => row.updatedAt,
    },
    {
      id: "actions",
      header: "",
      className: "w-24 text-right",
      cell: (row) => (
        <div className="flex justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={t("common.edit")}
            onClick={(event) => {
              event.stopPropagation()
              setEditing(row)
            }}
          >
            <Pencil />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={t("common.delete")}
            onClick={(event) => {
              event.stopPropagation()
              setDeleting(row)
            }}
          >
            <Trash2 />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <PageContainer>
      <PageHeader
        title={t("admin.items.title")}
        description={t("admin.items.description")}
        actions={
          <Button type="button" onClick={() => setCreating(true)}>
            <Plus data-icon="inline-start" />
            {t("admin.items.new")}
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          label={t("admin.items.searchPlaceholder")}
          placeholder={t("admin.items.searchPlaceholder")}
          onSearch={(next) => {
            setSearch(next)
            setPage(1)
          }}
        />
        <DropdownSelect
          label={t("admin.items.statusFilter")}
          value={statusFilter}
          onChange={(next) => {
            setStatusFilter(next)
            setPage(1)
          }}
          options={[
            { value: "all", label: t("common.all") },
            { value: "active", label: t("admin.items.statusActive") },
            { value: "draft", label: t("admin.items.statusDraft") },
            { value: "archived", label: t("admin.items.statusArchived") },
          ]}
        />
      </div>

      <DataTable
        rows={pageRows}
        columns={columns}
        rowId={(row) => row.id}
        pending={query.isPending}
        error={query.error}
        onRowClick={(row) => setEditing(row)}
        empty={{
          icon: Layers,
          title: t("admin.items.emptyTitle"),
          description: t("admin.items.emptyDescription"),
          action: (
            <Button type="button" size="sm" onClick={() => setCreating(true)}>
              {t("admin.items.new")}
            </Button>
          ),
        }}
      />

      <Pagination
        page={safePage}
        pageSize={PAGE_SIZE}
        total={rows.length}
        showTotal
        onPageChange={setPage}
        labels={{
          previous: t("common.previousPage"),
          next: t("common.nextPage"),
          formatPage: ({ page: current, pageCount: pages, total, showTotal }) => {
            const formatted = new Intl.NumberFormat(intlLocale(locale)).format(total)
            return showTotal
              ? t("common.pageOfTotal", { page: current, pageCount: pages, total: formatted })
              : t("common.pageOf", { page: current, pageCount: pages })
          },
        }}
      />

      <ItemEditorDialog
        key={creating ? "create" : editing?.id ?? "closed"}
        open={creating || Boolean(editing)}
        initial={editing}
        pending={createItem.isPending || updateItem.isPending}
        onOpenChange={(open) => {
          if (!open) {
            setCreating(false)
            setEditing(null)
          }
        }}
        onSubmit={(values) => {
          if (editing) {
            updateItem.mutate(
              { ...editing, ...values },
              {
                onSuccess: () => {
                  setEditing(null)
                  toast.success(t("admin.items.updated"))
                },
              }
            )
          } else {
            createItem.mutate(values, {
              onSuccess: () => {
                setCreating(false)
                toast.success(t("admin.items.created"))
              },
            })
          }
        }}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null)
        }}
        destructive
        pending={deleteItem.isPending}
        title={deleting ? t("admin.items.deleteTitle", { name: deleting.name }) : ""}
        description={t("admin.items.deleteDescription")}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        onConfirm={() => {
          if (!deleting) return
          deleteItem.mutate(deleting.id, {
            onSuccess: () => {
              setDeleting(null)
              toast.success(t("admin.items.deleted"))
            },
          })
        }}
      />
    </PageContainer>
  )
}

function ItemEditorDialog({
  open,
  initial,
  pending,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  initial: ManagedItem | null
  pending: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: { name: string; slug: string; owner: string; status: ItemStatus }) => void
}) {
  const { t } = useI18n()
  const [name, setName] = useState(initial?.name ?? "")
  const [slug, setSlug] = useState(initial?.slug ?? "")
  const [owner, setOwner] = useState(initial?.owner ?? "admin@anywhere.dev")
  const [status, setStatus] = useState<ItemStatus>(initial?.status ?? "active")

  const canSubmit = name.trim().length > 0 && slug.trim().length > 0 && owner.trim().length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initial ? t("admin.items.dialogEdit") : t("admin.items.dialogCreate")}
          </DialogTitle>
          <DialogDescription>{t("admin.items.dialogDescription")}</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            if (!canSubmit) return
            onSubmit({ name, slug, owner, status })
          }}
          className="flex flex-col gap-4"
        >
          <Field label={t("admin.items.fieldName")} htmlFor="item-name">
            <Input
              id="item-name"
              value={name}
              onChange={(event) => {
                const next = event.target.value
                setName(next)
                if (!initial) {
                  setSlug(
                    next
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-|-$/g, "")
                  )
                }
              }}
            />
          </Field>
          <Field label={t("admin.items.fieldSlug")} htmlFor="item-slug">
            <Input
              id="item-slug"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
            />
          </Field>
          <Field label={t("admin.items.fieldOwner")} htmlFor="item-owner">
            <Input
              id="item-owner"
              type="email"
              value={owner}
              onChange={(event) => setOwner(event.target.value)}
            />
          </Field>
          <Field label={t("admin.items.fieldStatus")}>
            <DropdownSelect
              label={t("admin.items.fieldStatus")}
              value={status}
              onChange={setStatus}
              options={[
                { value: "active", label: t("admin.items.statusActive") },
                { value: "draft", label: t("admin.items.statusDraft") },
                { value: "archived", label: t("admin.items.statusArchived") },
              ]}
            />
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={!canSubmit || pending}>
              {initial ? t("common.save") : t("common.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
