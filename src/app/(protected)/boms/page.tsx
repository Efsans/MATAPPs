"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  ChevronsUpDown,
  Edit2,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  Bliblioteca,
  getBancos,
  getBlibliotecas,
  getSubBancos,
  MaterialSolidWorks,
  SubMaterialSolidWorks,
} from "@/actions/hierarchy";
import {
  createFullHierarchyMaterial,
  deleteMaterial,
  getMaterials,
  updateMaterial,
} from "@/actions/material-and-details";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PageContainer } from "@/components/ui/page-container";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { createFullMaterialHierarchyRequestSchema } from "@/lib/validations/contact";

type FormData =
  React.ComponentProps<
    typeof createFullMaterialHierarchyRequestSchema
  > extends never
    ? any
    : z.infer<typeof createFullMaterialHierarchyRequestSchema>;

// derive material type from getMaterials return
type MaterialsApiReturn = Awaited<ReturnType<typeof getMaterials>>;
type MaterialFromApi = MaterialsApiReturn extends Array<infer U> ? U : never;

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<MaterialFromApi[]>([]);
  const [libraries, setLibraries] = useState<Bliblioteca[]>([]);
  const [banks, setBanks] = useState<MaterialSolidWorks[]>([]);
  const [subBanks, setSubBanks] = useState<SubMaterialSolidWorks[]>([]);
  const [fetching, setFetching] = useState(false);

  const [popoverOpen, setPopoverOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [dialogDeleteOpen, setDialogDeleteOpen] = useState(false);
  const [opInProgress, setOpInProgress] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(createFullMaterialHierarchyRequestSchema),
    defaultValues: {
      MaterialName: "",
      MatId: 0,
      Description: "",
      BlibliotecaId: "",
      BlibliotecaName: "",
      BancoId: "",
      BancoName: "",
      SubBancoId: "",
      SubBancoName: "",
    },
  });

  // fetch all lists
  const fetchAll = async () => {
    setFetching(true);
    try {
      const [matRes, libs, bks, sbs] = await Promise.all([
        getMaterials(),
        getBlibliotecas(),
        getBancos(),
        getSubBancos(),
      ]);
      setMaterials(matRes);
      setLibraries(libs);
      setBanks(bks);
      setSubBanks(sbs);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar dados (veja console).");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    void fetchAll();
  }, []);

  // when user selects a material from popover -> fill form
  const onSelectMaterial = (id: string) => {
    setSelectedId(id);
    const m = materials.find((x) => x.id_material === id);
    if (!m) {
      form.reset();
      setPopoverOpen(false);
      return;
    }
    // map API fields into the form expected by createFullMaterialHierarchyRequestSchema
    form.reset({
      MaterialName: (m as any).name ?? "",
      MatId: (m as any).mat_id ?? 0,
      Description: (m as any).description ?? "",
      BlibliotecaId:
        (m as any).SubMaterialSolidWorks?.MaterialSolidWorks?.Bliblioteca
          ?.id_lib ?? "",
      BlibliotecaName:
        (m as any).SubMaterialSolidWorks?.MaterialSolidWorks?.Bliblioteca
          ?.name ?? "",
      BancoId:
        (m as any).SubMaterialSolidWorks?.MaterialSolidWorks?.id_bank ?? "",
      BancoName:
        (m as any).SubMaterialSolidWorks?.MaterialSolidWorks?.name ?? "",
      SubBancoId: (m as any).IdSubMaterialSolidWorks ?? "",
      SubBancoName: (m as any).SubMaterialSolidWorks?.name ?? "",
    });
    setPopoverOpen(false);
  };

  const onResetForm = () => {
    setSelectedId(null);
    form.reset();
  };

  const handleSubmit = async (values: FormData) => {
    try {
      setOpInProgress(true);
      if (selectedId) {
        // updateMaterial(id, input)
        await updateMaterial(selectedId, {
          MaterialName: values.MaterialName,
          MatId: values.MatId,
          Description: values.Description,
          BlibliotecaId: values.BlibliotecaId,
          BlibliotecaName: values.BlibliotecaName,
          BancoId: values.BancoId,
          BancoName: values.BancoName,
          SubBancoId: values.SubBancoId,
          SubBancoName: values.SubBancoName,
        } as Parameters<typeof updateMaterial>[1]);
        toast.success("Material alterado com sucesso.");
      } else {
        // create via hierarchy
        await createFullHierarchyMaterial(values);
        toast.success("Material criado com sucesso.");
      }
      await fetchAll();
      onResetForm();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setOpInProgress(false);
    }
  };

  const confirmDelete = (id: string) => {
    setSelectedId(id);
    setDialogDeleteOpen(true);
  };

  const doDelete = async () => {
    if (!selectedId) return;
    try {
      setOpInProgress(true);
      await deleteMaterial(selectedId);
      toast.success("Material excluído.");
      await fetchAll();
      onResetForm();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Erro ao excluir.");
    } finally {
      setOpInProgress(false);
      setDialogDeleteOpen(false);
    }
  };

  // dependent selects
  const currentLibId = form.watch("BlibliotecaId") ?? "";
  const currentBankId = form.watch("BancoId") ?? "";
  const filteredBanks = banks.filter((b) => b.IdBliblioteca === currentLibId);
  const filteredSubBanks = subBanks.filter(
    (s) => s.IdMaterialSolidWorks === currentBankId,
  );

  return (
    <PageContainer>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Materiais</h1>
          <p className="text-muted-foreground text-sm">
            Listar, criar, alterar e excluir materiais
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => void fetchAll()}
            disabled={fetching || opInProgress}
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Atualizar
          </Button>

          <Dialog open={dialogDeleteOpen} onOpenChange={setDialogDeleteOpen}>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={!selectedId || opInProgress}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Excluir
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirma exclusão?</DialogTitle>
                <DialogDescription>
                  Essa ação não pode ser desfeita.{" "}
                  <span className="font-semibold">
                    {materials.find((m) => m.id_material === selectedId)
                      ?.name ?? ""}
                  </span>
                </DialogDescription>
              </DialogHeader>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button
                  variant="destructive"
                  onClick={() => void doDelete()}
                  disabled={opInProgress}
                >
                  Confirmar exclusão
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            onClick={() => {
              onResetForm();
              setSelectedId(null);
            }}
            variant="outline"
            disabled={opInProgress}
          >
            Limpar
          </Button>
        </div>
      </div>

      <div className="mb-6 flex flex-col md:flex-row md:gap-6">
        <div className="w-full md:w-1/3">
          <h2 className="mb-3 text-lg font-semibold">Selecionar material</h2>
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={popoverOpen}
                className="w-full justify-between"
                disabled={fetching}
              >
                {selectedId
                  ? materials.find((m) => m.id_material === selectedId)?.name
                  : "Selecione um material..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput placeholder="Buscar material..." />
                <CommandEmpty>Nenhum material encontrado.</CommandEmpty>
                <CommandGroup>
                  {materials.map((m) => (
                    <CommandItem
                      key={m.id_material}
                      onSelect={() => onSelectMaterial(m.id_material)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedId === m.id_material
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      {(m as any).name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="w-full md:w-2/3">
          <div className="bg-card w-full rounded-lg border p-4 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold">
              {selectedId ? "Alterar Material" : "Cadastrar Material"}
            </h3>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="MaterialName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do material</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="MatId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>MatId</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="MatId"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="Description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value ?? ""}
                          placeholder="Descrição (opcional)"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="BlibliotecaId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Biblioteca</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          value={field.value ?? ""}
                          className="w-full rounded border px-2 py-2"
                        >
                          <option value="">
                            -- selecione ou deixe vazio --
                          </option>
                          {libraries.map((lib) => (
                            <option key={lib.id_lib} value={lib.id_lib}>
                              {lib.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="BancoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Banco</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          value={field.value ?? ""}
                          disabled={!currentLibId}
                          className="w-full rounded border px-2 py-2"
                        >
                          <option value="">
                            {currentLibId
                              ? "-- selecione --"
                              : "Selecione biblioteca antes"}
                          </option>
                          {filteredBanks.map((b) => (
                            <option key={b.id_bank} value={b.id_bank}>
                              {b.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="SubBancoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sub-Banco</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          value={field.value ?? ""}
                          disabled={!currentBankId}
                          className="w-full rounded border px-2 py-2"
                        >
                          <option value="">
                            {currentBankId
                              ? "-- selecione --"
                              : "Selecione banco antes"}
                          </option>
                          {filteredSubBanks.map((s) => (
                            <option key={s.id_sub} value={s.id_sub}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => onResetForm()}
                    disabled={opInProgress}
                  >
                    Limpar
                  </Button>
                  <Button type="submit" disabled={opInProgress}>
                    {opInProgress
                      ? "Processando..."
                      : selectedId
                        ? "Salvar"
                        : "Criar"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {fetching && materials.length === 0 ? (
          <div className="text-muted-foreground col-span-full text-center">
            Carregando...
          </div>
        ) : materials.length === 0 ? (
          <div className="text-muted-foreground col-span-full text-center">
            Nenhum material encontrado.
          </div>
        ) : (
          materials.map((m) => {
            const sub = (m as any).SubMaterialSolidWorks;
            const bank = sub?.MaterialSolidWorks;
            const lib = bank?.Bliblioteca;
            return (
              <div
                key={m.id_material}
                className="bg-card flex flex-col justify-between rounded-lg border p-4 shadow-sm"
              >
                <div>
                  <h3 className="text-lg font-semibold">{(m as any).name}</h3>
                  <p className="text-muted-foreground text-sm">
                    ID: {m.id_material}
                  </p>

                  <div className="mt-3 text-sm">
                    <p>
                      <strong>Biblioteca: </strong>
                      {lib?.name ?? "—"}
                    </p>
                    <p>
                      <strong>Banco: </strong>
                      {bank?.name ?? "—"}
                    </p>
                    <p>
                      <strong>Sub-Banco: </strong>
                      {sub?.name ?? "—"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => onSelectMaterial(m.id_material)}
                  >
                    <Edit2 className="mr-2 h-4 w-4" /> Editar
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => confirmDelete(m.id_material)}
                    disabled={opInProgress}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Excluir
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </PageContainer>
  );
}
