import { ProductCard, type Product } from "./product-card";
import Link from "next/link";
import styles from "./CoursesSection.module.css";
import { getCategories, getCourses } from "@/lib/api";

function getCategoryKeywords(category: { name: string; title?: string; slug?: string }) {
	const raw = [category.name, category.title ?? "", category.slug ?? ""]
		.join(" ")
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, " ")
		.replace(/-/g, " ");

	return Array.from(new Set(raw.split(/\s+/).filter(Boolean).filter((word) => word.length > 2)));
}

function matchesCategory(product: Product, category: { id: string; name: string; title?: string; slug?: string }) {
	const productText = `${product.title ?? ""} ${product.description ?? ""}`.toLowerCase();
	const explicitMatch =
		product.categoryId === category.id ||
		product.category_id === category.id ||
		product.category_ids?.includes(category.id);

	if (explicitMatch) return true;

	const keywords = getCategoryKeywords(category);
	if (keywords.length === 0) return false;

	return keywords.some((keyword) => productText.includes(keyword));
}

export async function CategoryRender() {
	const categoryList = await getCategories();
	const productList = (await getCourses()) as Product[];

	const categoriesWithProducts = categoryList.map((category) => {
		const categoryProducts = productList.filter((product) => matchesCategory(product, category));
		return { category, categoryProducts };
	});

	const hasVisibleCategories = categoriesWithProducts.some(({ categoryProducts }) => categoryProducts.length > 0);

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
				<div className={styles.categoryList}>
					{categoriesWithProducts.map(({ category, categoryProducts }) => {
						if (categoryProducts.length === 0 && hasVisibleCategories) return null;

						return (
							<section key={category.id} className={styles.categorySection} aria-labelledby={`${category.id}-title`}>
								<div className={styles.categoryHeader}>
									<div>
										<h3 id={`${category.id}-title`} className={styles.categoryTitle}>{category.title ?? category.name}</h3>
										<p className={styles.categoryDescription}>{category.description}</p>
									</div>
									<span className={styles.categoryCount}>{categoryProducts.length} {categoryProducts.length === 1 ? "course" : "courses"}</span>
								</div>
								<div className={styles.grid}>
									{categoryProducts.map((product) => <ProductCard key={product.id} product={product} />)}
								</div>
							</section>
						);
					})}
				</div>
			</div>
		</section>
	);
}
