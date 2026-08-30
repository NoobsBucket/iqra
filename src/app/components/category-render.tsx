import { ProductCard, type Product } from "./product-card";
import Link from "next/link";
import styles from "./CoursesSection.module.css";
import { getCourses } from "@/lib/api";

export async function CategoryRender() {
	const productList = (await getCourses()) as Product[];

	return (
		<section className={styles.section} id="courses">
			<div className={styles.inner}>
				<div className={styles.header}>
					<div>
						<p className={styles.label}>Our Courses</p>
						<h2 className={styles.title}>Deepen Your Islamic Knowledge</h2>
						<p className={styles.sub}>From Quranic recitation to advanced study, structured learning paths designed for steady progress.</p>
					</div>
					<Link href="/courses" className={styles.viewAll}>View All Courses →</Link>
				</div>
				<div className={styles.grid}>
					{productList.map((product) => (
						<ProductCard key={product.id} product={product} />
					))}
				</div>
			</div>
		</section>
	);
}
