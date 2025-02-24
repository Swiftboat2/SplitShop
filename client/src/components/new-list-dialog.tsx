import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertListSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

interface NewListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewListDialog({ open, onOpenChange }: NewListDialogProps) {
  const [, setLocation] = useLocation();
  
  const form = useForm({
    resolver: zodResolver(insertListSchema),
    defaultValues: {
      name: "",
    },
  });

  const createListMutation = useMutation({
    mutationFn: async (data: typeof insertListSchema._type) => {
      const response = await apiRequest("POST", "/api/lists", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/lists"] });
      onOpenChange(false);
      form.reset();
      setLocation(`/lists/${data.id}`);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Shopping List</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit((data) => createListMutation.mutate(data))}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="name">List Name</Label>
            <Input
              id="name"
              placeholder="e.g. Weekend Groceries"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={createListMutation.isPending}
          >
            {createListMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Create List"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
