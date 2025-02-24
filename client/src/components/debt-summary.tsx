import { Debt } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";

interface DebtSummaryProps {
  debts: Debt[];
  currentUserId: number;
}

export function DebtSummary({ debts, currentUserId }: DebtSummaryProps) {
  const { t } = useTranslation();

  const settleDebtMutation = useMutation({
    mutationFn: async (debtId: number) => {
      await apiRequest("POST", `/api/debts/${debtId}/settle`);
    },
    onSuccess: (_data, _variables, _context) => {
      // Invalidate all debt queries since settling one debt might affect others
      queryClient.invalidateQueries({ queryKey: ["/api/lists"] });
    },
  });

  const youOwe = debts.filter(
    (debt) => debt.fromUser === currentUserId && !debt.settled
  );
  const owedToYou = debts.filter(
    (debt) => debt.toUser === currentUserId && !debt.settled
  );
  const settledDebts = debts.filter((debt) => debt.settled);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          {t('debts.summary')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {youOwe.length > 0 && (
          <div>
            <h3 className="font-semibold text-destructive mb-2">{t('debts.youOwe')}</h3>
            <div className="space-y-3">
              {youOwe.map((debt) => (
                <div
                  key={debt.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-destructive/20 bg-destructive/5"
                >
                  <div>
                    <div className="font-medium">${Number(debt.amount).toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">
                      {t('debts.to', { user: debt.toUser })}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => settleDebtMutation.mutate(debt.id)}
                    disabled={settleDebtMutation.isPending}
                  >
                    {t('debts.markAsPaid')}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {owedToYou.length > 0 && (
          <div>
            <h3 className="font-semibold text-primary mb-2">{t('debts.owedToYou')}</h3>
            <div className="space-y-3">
              {owedToYou.map((debt) => (
                <div
                  key={debt.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-primary/20 bg-primary/5"
                >
                  <div>
                    <div className="font-medium">${Number(debt.amount).toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">
                      {t('debts.from', { user: debt.fromUser })}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => settleDebtMutation.mutate(debt.id)}
                    disabled={settleDebtMutation.isPending}
                  >
                    {t('debts.markAsReceived')}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {settledDebts.length > 0 && (
          <div>
            <h3 className="font-semibold text-muted-foreground mb-2">{t('debts.settled')}</h3>
            <div className="space-y-3">
              {settledDebts.map((debt) => (
                <div
                  key={debt.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted"
                >
                  <div>
                    <div className="font-medium">${Number(debt.amount).toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">
                      {debt.fromUser === currentUserId
                        ? t('debts.to', { user: debt.toUser })
                        : t('debts.from', { user: debt.fromUser })}
                    </div>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>
        )}

        {debts.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            {t('debts.noDebts')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}