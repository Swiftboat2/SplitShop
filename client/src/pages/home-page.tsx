import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { List } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { NewListDialog } from "@/components/new-list-dialog";
import { useState } from "react";
import { ListCard } from "@/components/list-card";

export default function HomePage() {
  const { user } = useAuth();
  const [showNewList, setShowNewList] = useState(false);
  
  const { data: lists } = useQuery<List[]>({
    queryKey: ["/api/lists"],
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {user?.username}!</h1>
            <p className="text-muted-foreground">Manage your shopping lists and expenses</p>
          </div>
          <Button onClick={() => setShowNewList(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New List
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lists?.map((list) => (
            <ListCard key={list.id} list={list} />
          ))}
        </div>

        <NewListDialog open={showNewList} onOpenChange={setShowNewList} />
      </div>
    </div>
  );
}
