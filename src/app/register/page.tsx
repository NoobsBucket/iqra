import Link from "next/link";
import { AuthShell } from "../components/auth-shell";
import { RegisterForm } from "../components/register-form";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ course?: string | string[] }> }) {
	const params = await searchParams;
	const selectedCourse = typeof params.course === "string" ? params.course : undefined;

	return (
		<AuthShell title="Register for a course" description="Choose your course, share your details, and take the next step with our learning community." footer={<>Already registered? <Link href="/login" className="font-bold text-blue-700 hover:text-blue-800">Log in</Link></>}>
			<RegisterForm selectedCourse={selectedCourse} />
		</AuthShell>
	);
}
