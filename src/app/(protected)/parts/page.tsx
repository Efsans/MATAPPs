"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BookX,
  Check,
  ChevronsUpDown,
  Edit2,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Imports para Bancos de Dados principais
import {
  createMaterialSolidworks,
  deleteMaterialSolidworks,
  getLibraries,
  getMaterialSolidworks,
  Library,
  MaterialSolidworks,
  updateMaterialSolidworks,
} from "@/actions/material-bank";
// Imports para Sub-Bancos
import {
  createSubMaterialSolidworks,
  deleteSubMaterialSolidworks,
  getSubMaterialSolidworks,
  updateSubMaterialSolidworks,
} from "@/actions/sub-material-bank";
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
import { cn } from "@/lib/utils";

// Interface para Sub-Banco
export interface SubMaterialSolidworks {
  id_sub: string;
  idMaterialSolidWorks: string;
  name: string;
  descricao?: string;
}

const formSchema = z.object({
  id_bank: z.string().optional(),
  name: z.string().min(1, { message: "O nome é obrigatório." }),
  idBliblioteca: z.string().min(1, { message: "A biblioteca é obrigatória." }),
});

type FormData = z.infer<typeof formSchema>;

// ------------------ Componente SubBankManager ------------------
interface SubBankManagerProps {
  subBanks: SubMaterialSolidworks[] | null;
  bankId: string;
  onRefresh: () => void;
  allBanks: MaterialSolidworks[] | null;
}

function SubBankManager({
  subBanks,
  bankId,
  onRefresh,
  allBanks,
}: SubBankManagerProps) {
  const [selectedSubBank, setSelectedSubBank] =
    useState<SubMaterialSolidworks | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [subBankName, setSubBankName] = useState("");
  const [selectedParentBankId, setSelectedParentBankId] = useState<
    string | null
  >(null);
  const [isComboBoxOpen, setIsComboBoxOpen] = useState(false);

  const { execute: createSubBankAction } = useAction(
    createSubMaterialSolidworks,
    {
      onSuccess: () => {
        onRefresh();
        setIsDialogOpen(false);
      },
    },
  );

  const { execute: updateSubBankAction } = useAction(
    updateSubMaterialSolidworks,
    {
      onSuccess: () => {
        onRefresh();
        setIsDialogOpen(false);
      },
    },
  );

  const { execute: deleteSubBankAction } = useAction(
    deleteSubMaterialSolidworks,
    {
      onSuccess: () => onRefresh(),
    },
  );

  const handleEdit = (sub: SubMaterialSolidworks) => {
    setSelectedSubBank(sub);
    setSubBankName(sub.name);
    setSelectedParentBankId(sub.idMaterialSolidWorks);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedSubBank(null);
    setSubBankName("");
    selectedParentBankId && setSelectedParentBankId(bankId);
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!subBankName.trim())
      return toast.error("O nome do Sub-Banco é obrigatório.");
    if (selectedSubBank) {
      updateSubBankAction({
        id_sub: selectedSubBank.id_sub,
        name: subBankName,
        idMaterialSolidWorks: selectedParentBankId!,
      });
    } else {
      createSubBankAction({ idMaterialSolidWorks: bankId, name: subBankName });
    }
  };

  return (
    <div className="mt-4 max-h-96 overflow-y-auto rounded-md border border-gray-300 bg-gray-100 p-2">
      <div className="mb-2 flex justify-between">
        <h3 className="font-semibold">Sub-Bancos</h3>
        <Button size="sm" onClick={handleAdd}>
          <Plus className="mr-1 h-3 w-3" /> Adicionar
        </Button>
      </div>
      <ul>
        {subBanks
          ?.filter((sub) => sub.idMaterialSolidWorks === bankId)
          .map((sub) => (
            <li
              key={`${bankId}-${sub.id_sub}`}
              className="flex justify-between border-b border-gray-300 px-4 py-2 last:border-b-0 hover:bg-gray-200"
            >
              <span>{sub.name}</span>
              <div className="flex space-x-1">
                <Button variant="outline" onClick={() => handleEdit(sub)}>
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteSubBankAction({ id: sub.id_sub })}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </li>
          ))}
      </ul>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedSubBank ? "Alterar Sub-Banco" : "Adicionar Sub-Banco"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Input
              value={subBankName}
              onChange={(e) => setSubBankName(e.target.value)}
              placeholder="Nome do Sub-Banco"
            />
            {selectedSubBank && (
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium">Mover para Banco</label>
                <Popover open={isComboBoxOpen} onOpenChange={setIsComboBoxOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={isComboBoxOpen}
                      className="w-full justify-between"
                    >
                      {selectedParentBankId
                        ? allBanks?.find(
                            (bank) => bank.id_bank === selectedParentBankId,
                          )?.name
                        : "Selecione um banco..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput placeholder="Buscar banco..." />
                      <CommandEmpty>Nenhum banco encontrado.</CommandEmpty>
                      <CommandGroup>
                        {allBanks?.map((bank) => (
                          <CommandItem
                            key={bank.id_bank}
                            value={bank.name}
                            onSelect={() => {
                              setSelectedParentBankId(bank.id_bank);
                              setIsComboBoxOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedParentBankId === bank.id_bank
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            {bank.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
          <DialogFooter className="mt-4 flex justify-end space-x-2">
            <DialogClose asChild>
              <Button variant="secondary">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleSubmit}>
              {selectedSubBank ? "Alterar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
// ----------------------------------------------------------------

export default function MaterialBanksPage() {
  const [openLibrary, setOpenLibrary] = useState(false);
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  const [banks, setBanks] = useState<MaterialSolidworks[] | null>(null);
  const [libraries, setLibraries] = useState<Library[] | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [subBanks, setSubBanks] = useState<SubMaterialSolidworks[] | null>(
    null,
  );

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      idBliblioteca: "",
    },
  });

  const onResetForm = () => {
    form.reset({
      name: "",
      idBliblioteca: "",
    });
    setSelectedBankId(null);
  };

  const { execute: getBanksAction, status: fetchBanksStatus } = useAction(
    getMaterialSolidworks,
    {
      onSuccess: (response) => {
        if (response.data?.success && response.data.data)
          setBanks(response.data.data);
        else
          toast.error(
            response.data?.message || "Erro ao carregar bancos de dados.",
          );
      },
      onError: (error) =>
        toast.error(error.error?.serverError || "Erro inesperado do servidor."),
    },
  );

  const { execute: getLibrariesAction, status: fetchLibrariesStatus } =
    useAction(getLibraries, {
      onSuccess: (response) => {
        if (response.data?.success && response.data.data)
          setLibraries(response.data.data);
        else
          toast.error(
            response.data?.message || "Erro ao carregar bibliotecas.",
          );
      },
      onError: (error) =>
        toast.error(error.error?.serverError || "Erro inesperado do servidor."),
    });

  const { execute: getSubBanksAction, status: fetchSubBanksStatus } = useAction(
    getSubMaterialSolidworks,
    {
      onSuccess: (response) => {
        if (response.data?.success && response.data.data)
          setSubBanks(response.data.data);
        else
          toast.error(response.data?.message || "Erro ao carregar sub-bancos.");
      },
      onError: (error) =>
        toast.error(error.error?.serverError || "Erro inesperado do servidor."),
    },
  );

  const refreshData = () => {
    getBanksAction({});
    getLibrariesAction({});
    getSubBanksAction({});
  };

  useEffect(() => {
    refreshData();
  }, []);

  const { execute: createBankAction, status: createStatus } = useAction(
    createMaterialSolidworks,
    {
      onSuccess: () => {
        toast.success("Banco criado com sucesso.");
        setIsDialogOpen(false);
        onResetForm();
        refreshData();
      },
    },
  );

  const { execute: updateBankAction, status: updateStatus } = useAction(
    updateMaterialSolidworks,
    {
      onSuccess: () => {
        toast.success("Banco alterado com sucesso.");
        setIsDialogOpen(false);
        onResetForm();
        refreshData();
      },
    },
  );

  const { execute: deleteBankAction, status: deleteStatus } = useAction(
    deleteMaterialSolidworks,
    {
      onSuccess: () => {
        toast.success("Banco excluído com sucesso.");
        setIsDialogOpen(false);
        onResetForm();
        refreshData();
      },
    },
  );

  const handleEditBank = (bank: MaterialSolidworks) => {
    setSelectedBankId(bank.id_bank);
    form.reset({ name: bank.name, idBliblioteca: bank.idBliblioteca });
    setIsDialogOpen(true);
  };

  const handleCreateBank = () => {
    onResetForm();
    setIsDialogOpen(true);
  };

  const onSubmit = (values: FormData) => {
    if (selectedBankId) {
      updateBankAction({
        id_bank: selectedBankId,
        name: values.name,
        idBliblioteca: values.idBliblioteca,
      });
    } else {
      createBankAction({
        name: values.name,
        idBliblioteca: values.idBliblioteca,
      });
    }
  };

  const isLoading =
    createStatus === "executing" ||
    updateStatus === "executing" ||
    deleteStatus === "executing" ||
    fetchBanksStatus === "executing" ||
    fetchLibrariesStatus === "executing" ||
    fetchSubBanksStatus === "executing";

  return (
    <PageContainer>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gerenciamento de Bancos</h1>
        <div className="flex gap-2">
          <Button onClick={refreshData} disabled={isLoading} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" /> Atualizar
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreateBank}>
                <Plus className="mr-2 h-4 w-4" /> Novo Banco
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {selectedBankId
                    ? "Alterar Banco de Dados"
                    : "Cadastrar Banco de Dados"}
                </DialogTitle>
                <DialogDescription>
                  {selectedBankId
                    ? "Altere os dados do banco selecionado."
                    : "Preencha os campos para cadastrar um novo banco."}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Banco de Dados</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Digite o nome do banco..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="idBliblioteca"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Biblioteca</FormLabel>
                        <Popover
                          open={openLibrary}
                          onOpenChange={setOpenLibrary}
                        >
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between",
                                  !field.value && "text-muted-foreground",
                                )}
                                disabled={
                                  fetchLibrariesStatus === "executing" ||
                                  !libraries
                                }
                              >
                                {field.value
                                  ? libraries?.find(
                                      (lib) => lib.id_lib === field.value,
                                    )?.name
                                  : "Selecione uma biblioteca"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                              <CommandInput placeholder="Buscar biblioteca..." />
                              <CommandEmpty>
                                Nenhuma biblioteca encontrada.
                              </CommandEmpty>
                              <CommandGroup>
                                {libraries?.map((lib) => (
                                  <CommandItem
                                    key={lib.id_lib}
                                    onSelect={() => {
                                      form.setValue(
                                        "idBliblioteca",
                                        lib.id_lib,
                                      );
                                      setOpenLibrary(false);
                                    }}
                                    value={lib.name}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        lib.id_lib === field.value
                                          ? "opacity-100"
                                          : "opacity-0",
                                      )}
                                    />
                                    {lib.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="mt-6 flex justify-between space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={isLoading}
                    >
                      {isLoading
                        ? "Processando..."
                        : selectedBankId
                          ? "Alterar"
                          : "Cadastrar"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {banks && banks.length > 0 ? (
          banks.map((banco) => {
            const relatedLibrary = libraries?.find(
              (lib) => lib.id_lib === banco.idBliblioteca,
            );
            return (
              <div
                key={banco.id_bank}
                className="bg-card flex flex-col justify-between rounded-lg border p-6 shadow-md"
              >
                <div>
                  <h2 className="text-primary mb-2 text-xl font-bold">
                    {banco.name}
                  </h2>
                  <p className="text-muted-foreground mb-4 text-sm">
                    ID: {banco.id_bank}
                  </p>
                  {relatedLibrary && (
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold">Biblioteca:</h3>
                      <p className="text-sm text-gray-700">
                        {relatedLibrary.name}
                      </p>
                    </div>
                  )}

                  {/* SubBankManager */}
                  <SubBankManager
                    subBanks={subBanks}
                    bankId={banco.id_bank}
                    onRefresh={refreshData}
                    allBanks={banks}
                  />
                </div>
                <div className="mt-4 flex space-x-2">
                  <Button
                    onClick={() => handleEditBank(banco)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Edit2 className="mr-2 h-4 w-4" /> Editar
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <BookX className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirmação de Exclusão</DialogTitle>
                        <DialogDescription>
                          Tem certeza que deseja excluir o banco{" "}
                          <span
                            style={{
                              fontFamily:
                                '"Comic Sans MS", cursive, sans-serif',
                            }}
                            className="font-comicsans text-red-500"
                          >
                            {banco.name}
                          </span>
                          ? Esta ação não pode ser desfeita.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="secondary">Cancelar</Button>
                        </DialogClose>
                        <Button
                          variant="destructive"
                          onClick={() =>
                            deleteBankAction({ id_bank: banco.id_bank })
                          }
                          disabled={isLoading}
                        >
                          Confirmar Exclusão
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-muted-foreground col-span-full text-center">
            {fetchBanksStatus === "executing"
              ? "Carregando bancos..."
              : "Nenhum banco de dados encontrado."}
          </p>
        )}
      </div>
    </PageContainer>
  );
}
