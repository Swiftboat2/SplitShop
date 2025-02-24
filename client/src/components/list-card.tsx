import { List } from "@shared/schema";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";

interface ListCardProps {
  list: List;
}

export function ListCard({ list }: ListCardProps) {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  const formattedDate = new Intl.DateTimeFormat(
    t('language') === 'en' ? 'en-US' : 'es-AR',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }
  ).format(new Date(list.createdAt));

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary" />
          {list.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {t('list.created')} {formattedDate}
        </p>
        <Button 
          variant="secondary" 
          className="w-full"
          onClick={() => setLocation(`/lists/${list.id}`)}
        >
          {t('list.viewList')}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}