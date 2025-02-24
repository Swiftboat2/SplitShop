import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { List, Item, Debt } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertItemSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { DebtSummary } from "@/components/debt-summary";
import { useAuth } from "@/hooks/use-auth";
import { Checkbox } from "@/components/ui/checkbox";
import { Share2, Plus, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export default function ListPage() {
  const [, params] = useRoute("/lists/:id");
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation();
  const listId = parseInt(params!.id);

  const { data: list } = useQuery<List>({
    queryKey: [`/api/lists/${listId}`],
  });

  const { data: items } = useQuery<Item[]>({
    queryKey: [`/api/lists/${listId}/items`],
  });

  const { data: debts } = useQuery<Debt[]>({
    queryKey: [`/api/lists/${listId}/debts`],
  });

  const addItemMutation = useMutation({
    mutationFn: async (data: typeof insertItemSchema._type) => {
      const response = await apiRequest("POST", `/api/lists/${listId}/items`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/lists/${listId}/items`] });
      form.reset();
    },
  });

  const toggleItemMutation = useMutation({
    mutationFn: async (item: Item) => {
      await apiRequest("PATCH", `/api/items/${item.id}`, {
        completed: !item.completed,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/lists/${listId}/items`] });
    },
  });

  const calculateDebtsMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/lists/${listId}/calculate-debts`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/lists/${listId}/debts`] });
      toast({
        title: "Debts calculated",
        description: "The expenses have been split between all members",
      });
    },
  });

  const form = useForm({
    resolver: zodResolver(insertItemSchema),
    defaultValues: {
      name: "",
      price: "",
      paidBy: user?.id,
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">{list?.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-muted-foreground">{t('list.shareCode')}:</p>
              <code className="bg-muted px-2 py-1 rounded">{list?.code}</code>
            </div>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => {
              navigator.clipboard.writeText(list?.code || "");
              toast({
                title: "Code copied",
                description: "Share this code with others to invite them",
              });
            }}>
              <Share2 className="h-4 w-4 mr-2" />
              {t('list.share')}
            </Button>
            <Button onClick={() => calculateDebtsMutation.mutate()}>
              <Calculator className="h-4 w-4 mr-2" />
              {t('list.calculateDebts')}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('list.shoppingList')}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit((data) => {
                  addItemMutation.mutate({
                    name: data.name,
                    price: data.price,
                    paidBy: user?.id
                  });
                })} className="flex gap-4 mb-6">
                  <Input 
                    placeholder={t('list.itemName')}
                    {...form.register("name")}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder={t('list.price')}
                    {...form.register("price")}
                  />
                  <Button type="submit" disabled={addItemMutation.isPending}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </form>

                <div className="space-y-4">
                  {items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex items-center gap-4">
                        <Checkbox
                          checked={item.completed || false}
                          onCheckedChange={() => toggleItemMutation.mutate(item)}
                        />
                        <span className={item.completed ? "line-through" : ""}>
                          {item.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          ${Number(item.price || 0).toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {t('list.paidBy.you')}: {item.paidBy === user?.id ? t('list.paidBy.you') : t('list.paidBy.other')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <DebtSummary debts={debts || []} currentUserId={user?.id || 0} />
          </div>
        </div>
      </div>
    </div>
  );
}