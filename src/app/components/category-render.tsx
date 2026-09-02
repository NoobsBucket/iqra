import { ProductCard, type Product } from "./product-card";
import styles from "./CoursesSection.module.css";
import { getCourses } from "@/lib/api";

function shuffleProducts(products: Product[]): Product[] {
	const shuffled = [...products];

	for (let index = shuffled.length - 1; index > 0; index -= 1) {
		const randomIndex = Math.floor(Math.random() * (index + 1));
		[shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
	}

	return shuffled;
}

export async function CategoryRender({ limit }: { limit?: number }) {
	const productList = shuffleProducts((await getCourses()) as Product[]);
	const visibleProducts = typeof limit === "number" ? productList.slice(0, limit) : productList;

	return (
		<section className={styles.section} id="courses">
			<div className={styles.inner}>
				<div className={styles.header}>
					<div>
						<p className={styles.label}>Our Courses</p>
						<h2 className={styles.title}>Deepen Your Islamic Knowledge</h2>
						<p className={styles.sub}>From Quranic recitation to advanced study, structured learning paths designed for steady progress.</p>
					</div>
				</div>
				<div className={styles.grid}>
					{visibleProducts.map((product) => (
						<ProductCard key={product.id} product={product} />
					))}
				</div>
			</div>
		</section>
	);
}
