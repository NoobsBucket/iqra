import Link from "next/link";
import { AuthForm } from "../components/auth-form";
import { AuthShell } from "../components/auth-shell";

export default function LoginPage() {
	return (
		<AuthShell title="Welcome back" description="Log in to continue your learning journey with Iqra International." footer={<>New to Iqra? <Link href="/signup" className="font-bold text-blue-700 hover:text-blue-800">Sign up</Link></>}>
			<AuthForm mode="login" />
		</AuthShell>
	);
}
