import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  if (user) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t('auth.welcome')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">{t('auth.login')}</TabsTrigger>
                <TabsTrigger value="register">{t('auth.register')}</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <LoginForm />
              </TabsContent>
              <TabsContent value="register">
                <RegisterForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      <div className="hidden md:flex flex-col justify-center p-8 bg-gradient-to-br from-primary/10 to-primary/5">
        <h1 className="text-4xl font-bold mb-4">
          {t('auth.tagline')}
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          {t('auth.description')}
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-card rounded-lg">
            <h3 className="font-semibold mb-2">{t('auth.features.realtime.title')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('auth.features.realtime.description')}
            </p>
          </div>
          <div className="p-4 bg-card rounded-lg">
            <h3 className="font-semibold mb-2">{t('auth.features.smart.title')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('auth.features.smart.description')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginForm() {
  const { loginMutation } = useAuth();
  const { t } = useTranslation();
  const form = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  return (
    <form onSubmit={form.handleSubmit((data) => loginMutation.mutate(data))} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">{t('auth.username')}</Label>
        <Input id="username" {...form.register("username")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">{t('auth.password')}</Label>
        <Input id="password" type="password" {...form.register("password")} />
      </div>
      <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
        {loginMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          t('auth.login')
        )}
      </Button>
    </form>
  );
}

function RegisterForm() {
  const { registerMutation } = useAuth();
  const { t } = useTranslation();
  const form = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  return (
    <form onSubmit={form.handleSubmit((data) => registerMutation.mutate(data))} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="reg-username">{t('auth.username')}</Label>
        <Input id="reg-username" {...form.register("username")} />
        {form.formState.errors.username && (
          <p className="text-sm text-destructive">
            {form.formState.errors.username.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-email">{t('auth.email')}</Label>
        <Input 
          id="reg-email" 
          type="email" 
          {...form.register("email")} 
          placeholder="you@example.com"
        />
        {form.formState.errors.email && (
          <p className="text-sm text-destructive">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-password">{t('auth.password')}</Label>
        <Input id="reg-password" type="password" {...form.register("password")} />
        {form.formState.errors.password && (
          <p className="text-sm text-destructive">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
        {registerMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          t('auth.register')
        )}
      </Button>
    </form>
  );
}