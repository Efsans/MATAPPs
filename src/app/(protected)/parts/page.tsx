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
import { useAction } from "next-safe-action/hooks";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  createMaterialSolidworks,
  deleteMaterialSolidworks,
  getLibraries,
  getMaterialSolidworks,
  Library,
  MaterialSolidworks,
  updateMaterialSolidworks,
} from "@/actions/material-bank";
import {
  subcreateMaterialSolidworks,
  subdeleteMaterialSolidworks,
  subgetMaterialSolidworks,
  subupdateMaterialSolidworks,
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

const formSchema = z.object({
  id_bank: z.string().optional(),
  name: z.string().min(1, { message: "O nome é obrigatório." }),
  idBliblioteca: z.string().min(1, { message: "A biblioteca é obrigatória." }),
});

type FormData = z.infer<typeof formSchema>;

export default function MaterialBanksPage() {
  const [openLibrary, setOpenLibrary] = useState(false);
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  const [banks, setBanks] = useState<MaterialSolidworks[] | null>(null);
  const [libraries, setLibraries] = useState<Library[] | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
        if (response.data?.success && response.data.data) {
          setBanks(response.data.data);
        } else {
          toast.error(
            response.data?.message || "Erro ao carregar bancos de dados.",
          );
        }
      },
      onError: (error) => {
        toast.error(error.error?.serverError || "Erro inesperado do servidor.");
      },
    },
  );

  const { execute: getLibrariesAction, status: fetchLibrariesStatus } =
    useAction(getLibraries, {
      onSuccess: (response) => {
        if (response.data?.success && response.data.data) {
          setLibraries(response.data.data);
        } else {
          toast.error(
            response.data?.message || "Erro ao carregar bibliotecas.",
          );
        }
      },
      onError: (error) => {
        toast.error(error.error?.serverError || "Erro inesperado do servidor.");
      },
    });

  useEffect(() => {
    getBanksAction({});
    getLibrariesAction({});
  }, [getBanksAction, getLibrariesAction]);

  const { execute: createBankAction, status: createStatus } = useAction(
    createMaterialSolidworks,
    {
      onSuccess(response) {
        if (response.data?.success) {
          toast.success(response.data.message);
          setIsDialogOpen(false);
          onResetForm();
          getBanksAction({});
        } else {
          toast.error(response.data?.message || "Erro ao criar.");
        }
      },
      onError(error) {
        console.error("Erro ao criar:", error);
        toast.error(error.error?.serverError || "Erro inesperado ao criar.");
      },
    },
  );

  const { execute: updateBankAction, status: updateStatus } = useAction(
    updateMaterialSolidworks,
    {
      onSuccess(response) {
        if (response.data?.success) {
          toast.success(response.data.message);
          setIsDialogOpen(false);
          onResetForm();
          getBanksAction({});
        } else {
          toast.error(response.data?.message || "Erro ao alterar.");
        }
      },
      onError(error) {
        console.error("Erro ao alterar:", error);
        toast.error(error.error?.serverError || "Erro inesperado ao alterar.");
      },
    },
  );

  const { execute: deleteBankAction, status: deleteStatus } = useAction(
    deleteMaterialSolidworks,
    {
      onSuccess(response) {
        if (response.data?.success) {
          toast.success(response.data.message);
          setIsDialogOpen(false);
          onResetForm();
          getBanksAction({});
        } else {
          toast.error(response.data?.message || "Erro ao excluir.");
        }
      },
      onError(error) {
        console.error("Erro ao excluir:", error);
        toast.error(error.error?.serverError || "Erro inesperado ao excluir.");
      },
    },
  );

  const handleEditBank = (bank: MaterialSolidworks) => {
    setSelectedBankId(bank.id_bank);
    form.reset({
      name: bank.name,
      idBliblioteca: bank.idBliblioteca,
    });
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
    fetchLibrariesStatus === "executing";

  const refreshData = () => {
    getBanksAction({});
    getLibrariesAction({});
  };

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
                  {/* Assumindo que 'banco' tem um array 'subBanks'. Ajuste conforme sua estrutura de dados. */}
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
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Excluir
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirmação de Exclusão</DialogTitle>
                        <DialogDescription>
                          Tem certeza que deseja excluir o banco **{banco.name}
                          **? Esta ação não pode ser desfeita.
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
