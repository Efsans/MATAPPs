"use client";

// Importações necessárias
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, Trash2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// ✅ Server Action para criação
import { createLibrary } from "@/actions/create-library";
import { deleteLibrary } from "@/actions/delete-library";
import { getLibraries } from "@/actions/get-libraries";
import { updateLibrary } from "@/actions/update-library";
// Componentes da interface
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
  id: z.string().optional(),
  name: z.string().min(1, { message: "O nome é obrigatório." }),
});

type FormData = z.infer<typeof formSchema>;

interface Library {
  id: string;
  name: string;
}

export default function ProjectsPage() {
  const [open, setOpen] = React.useState(false);
  const [selectedLibraryId, setSelectedLibraryId] = React.useState<
    string | null
  >(null);
  const [libraries, setLibraries] = React.useState<Library[] | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const { execute: getLibrariesAction, status: fetchStatus } = useAction(
    getLibraries,
    {
      onSuccess: (response) => {
        if (response.data?.success && response.data.data) {
          setLibraries(response.data.data);
        } else {
          toast.error(
            response.data?.message || "Erro ao carregar bibliotecas.",
          );
        }
      },
    },
  );

  React.useEffect(() => {
    getLibrariesAction();
  }, [getLibrariesAction]);

  // ✅ Corrigido: Usando a nova Server Action de criação
  const { execute: createLibraryAction, status: createStatus } = useAction(
    createLibrary,
    {
      onSuccess(response) {
        if (response.data?.success) {
          toast.success(response.data.message);
          form.reset();
          getLibrariesAction();
        } else {
          toast.error(response.data?.message || "Erro ao criar.");
        }
      },
      onError(error) {
        console.error("Erro ao criar:", error);
        toast.error("Erro inesperado ao criar.");
      },
    },
  );

  const { execute: updateLibraryAction, status: updateStatus } = useAction(
    updateLibrary,
    {
      onSuccess(response) {
        if (response.data?.success) {
          toast.success(response.data.message);
          form.reset();
          setSelectedLibraryId(null);
          getLibrariesAction();
        } else {
          toast.error(response.data?.message || "Erro ao alterar.");
        }
      },
      onError(error) {
        console.error("Erro ao alterar:", error);
        toast.error("Erro inesperado ao alterar.");
      },
    },
  );

  const { execute: deleteLibraryAction, status: deleteStatus } = useAction(
    deleteLibrary,
    {
      onSuccess(response) {
        if (response.data?.success) {
          toast.success(response.data.message);
          form.reset();
          setSelectedLibraryId(null);
          getLibrariesAction();
        } else {
          toast.error(response.data?.message || "Erro ao excluir.");
        }
      },
      onError(error) {
        console.error("Erro ao excluir:", error);
        toast.error("Erro inesperado ao excluir.");
      },
    },
  );

  const onSelectLibrary = (libraryId: string) => {
    console.log("ID da biblioteca selecionada:", libraryId);
    setSelectedLibraryId(libraryId);
    const selected = libraries?.find((lib) => lib.id === libraryId);
    if (selected) {
      form.reset({
        name: selected.name,
      });
    }
    setOpen(false);
  };

  const onResetForm = () => {
    form.reset();
    setSelectedLibraryId(null);
  };

  const onSubmit = (values: FormData) => {
    if (selectedLibraryId) {
      updateLibraryAction({ id: selectedLibraryId, name: values.name });
    } else {
      // ✅ Corrigido: Chamando a nova ação de forma correta
      createLibraryAction({ name: values.name });
    }
  };

  const isLoading =
    createStatus === "executing" ||
    updateStatus === "executing" ||
    deleteStatus === "executing" ||
    fetchStatus === "executing";

  return (
    <PageContainer>
      <h1 className="mb-6 text-3xl font-bold">Gerenciar Bibliotecas</h1>

      <div className="mb-8">
        <h2 className="mb-4 text-xl font-bold">
          Alterar ou Excluir Biblioteca
        </h2>
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-2">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-[300px] justify-between"
                disabled={fetchStatus === "executing" || !libraries}
              >
                {selectedLibraryId
                  ? libraries?.find((lib) => lib.id === selectedLibraryId)?.name
                  : "Selecione uma biblioteca..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput placeholder="Buscar biblioteca..." />
                <CommandEmpty>Nenhuma biblioteca encontrada.</CommandEmpty>
                <CommandGroup>
                  {libraries?.map((lib) => (
                    <CommandItem
                      key={lib.id}
                      onSelect={() => onSelectLibrary(lib.id)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedLibraryId === lib.id
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

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={!selectedLibraryId || isLoading}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Excluir
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Você tem certeza?</DialogTitle>
                <DialogDescription>
                  Esta ação não pode ser desfeita. Isso excluirá a biblioteca
                  {libraries?.find((lib) => lib.id === selectedLibraryId)?.name}
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
                      deleteLibraryAction({ id: selectedLibraryId! })
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
            disabled={!selectedLibraryId || isLoading}
          >
            Limpar
          </Button>
        </div>
      </div>

      <div className="bg-card w-full max-w-md rounded-lg border p-6 shadow-lg">
        <h2 className="mb-6 text-center text-xl font-bold">
          {selectedLibraryId ? "Alterar Biblioteca" : "Cadastrar Biblioteca"}
        </h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Biblioteca</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite a biblioteca..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading
                ? "Processando..."
                : selectedLibraryId
                  ? "Alterar"
                  : "Cadastrar"}
            </Button>
          </form>
        </Form>
      </div>
    </PageContainer>
  );
}
