"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, Trash2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import React from "react";
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
  const [openBank, setOpenBank] = React.useState(false);
  const [openLibrary, setOpenLibrary] = React.useState(false);

  const [selectedBankId, setSelectedBankId] = React.useState<string | null>(
    null,
  );
  const [banks, setBanks] = React.useState<MaterialSolidworks[] | null>(null);
  const [libraries, setLibraries] = React.useState<Library[] | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      idBliblioteca: "",
    },
  });

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

  React.useEffect(() => {
    getBanksAction({});
    getLibrariesAction({});
  }, [getBanksAction, getLibrariesAction]);

  const { execute: createBankAction, status: createStatus } = useAction(
    createMaterialSolidworks,
    {
      onSuccess(response) {
        if (response.data?.success) {
          toast.success(response.data.message);
          form.reset();
          setSelectedBankId(null);
          getBanksAction({});
          getLibrariesAction({});
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
          form.reset();
          setSelectedBankId(null);
          getBanksAction({});
          getLibrariesAction({});
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
          form.reset();
          setSelectedBankId(null);
          getBanksAction({});
          getLibrariesAction({});
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

  const onSelectBank = (bankId: string) => {
    setSelectedBankId(bankId);
    const selected = banks?.find((bank) => bank.id_bank === bankId);
    if (selected) {
      form.reset({
        name: selected.name,
        idBliblioteca: selected.idBliblioteca,
      });
    }
    setOpenBank(false);
  };

  const onResetForm = () => {
    form.reset({
      id_bank: "",
      name: "",
      idBliblioteca: "",
    });
    setSelectedBankId(null);
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

  return (
    <PageContainer>
      <h1 className="mb-6 text-3xl font-bold">Gerenciar Bancos de Dados</h1>

      <div className="mb-8">
        <h2 className="mb-4 text-xl font-bold">
          Alterar ou Excluir Banco de Dados
        </h2>
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-2">
          <Popover open={openBank} onOpenChange={setOpenBank}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openBank}
                className="w-[300px] justify-between"
                disabled={fetchBanksStatus === "executing" || !banks}
              >
                {selectedBankId
                  ? banks?.find((bank) => bank.id_bank === selectedBankId)?.name
                  : "Selecione um banco de dados..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput placeholder="Buscar banco de dados..." />
                <CommandEmpty>Nenhum banco de dados encontrado.</CommandEmpty>
                <CommandGroup>
                  {banks?.map((bank) => (
                    <CommandItem
                      key={bank.id_bank}
                      onSelect={() => onSelectBank(bank.id_bank)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedBankId === bank.id_bank
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

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={!selectedBankId || isLoading}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Excluir
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Você tem certeza?</DialogTitle>
                <DialogDescription>
                  Esta ação não pode ser desfeita. Isso excluirá o banco de
                  dados{" "}
                  {banks?.find((bank) => bank.id_bank === selectedBankId)?.name}
                  .
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Cancelar
                  </Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() =>
                      deleteBankAction({ id_bank: selectedBankId! })
                    }
                  >
                    Confirmar Exclusão
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            onClick={onResetForm}
            disabled={!selectedBankId || isLoading}
          >
            Limpar
          </Button>
        </div>
      </div>

      <div className="bg-card w-full max-w-md rounded-lg border p-6 shadow-lg">
        <h2 className="mb-6 text-center text-xl font-bold">
          {selectedBankId
            ? "Alterar Banco de Dados"
            : "Cadastrar Banco de Dados"}
        </h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Banco de Dados</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o nome do banco..." {...field} />
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
                  <Popover open={openLibrary} onOpenChange={setOpenLibrary}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground",
                          )}
                          disabled={fetchLibrariesStatus === "executing"}
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
                                form.setValue("idBliblioteca", lib.id_lib);
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

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading
                ? "Processando..."
                : selectedBankId
                  ? "Alterar"
                  : "Cadastrar"}
            </Button>
          </form>
        </Form>
      </div>
    </PageContainer>
  );
}
