import Link from "next/link";
import { AuthForm } from "../components/auth-form";
import { AuthShell } from "../components/auth-shell";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ oauth_error?: string }> }) {
	const { oauth_error: oauthError } = await searchParams;
	return (
		<AuthShell title="Welcome back" description={oauthError ?? "Log in to continue your learning journey with Iqra International."} footer={<>New to Iqra? <Link href="/signup" className="font-bold text-rose-700 hover:text-black">Sign up</Link></>}>
			<AuthForm mode="login" />
		</AuthShell>
	);
}
