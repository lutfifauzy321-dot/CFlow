import { AuthForm } from "@/components/auth/AuthForm";

type LoginPageProps = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <AuthForm
      mode="login"
      nextPath={params.next}
      initialError={
        params.error === "auth_callback_failed"
          ? "Tautan konfirmasi tidak valid atau sudah kedaluwarsa."
          : undefined
      }
    />
  );
}
