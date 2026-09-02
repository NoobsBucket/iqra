import Link from "next/link";
import { AuthForm } from "../components/auth-form";
import { AuthShell } from "../components/auth-shell";

export default function SignupPage() {
	return (
		<AuthShell title="Start learning" description="Create your account and find a course that fits your next step." footer={<>Already have an account? <Link href="/login" className="font-bold text-rose-700 hover:text-black">Log in</Link></>}>
			<AuthForm mode="signup" />
		</AuthShell>
	);
}
