import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface JoinListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JoinListDialog({ open, onOpenChange }: JoinListDialogProps) {
  const [code, setCode] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const joinListMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest("POST", `/api/lists/join/${code}`);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/lists"] });
      onOpenChange(false);
      setCode("");
      setLocation(`/lists/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Failed to join list",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Join a Shopping List</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            joinListMutation.mutate(code);
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="code">List Code</Label>
            <Input
              id="code"
              placeholder="Enter 6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={joinListMutation.isPending || code.length !== 6}
          >
            {joinListMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Join List"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
