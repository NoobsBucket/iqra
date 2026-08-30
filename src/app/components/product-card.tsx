import Link from "next/link";
import styles from "./CoursesSection.module.css";
import type { CourseRecord } from "@/lib/api";

type Product = CourseRecord;

export function ProductCard({ product }: { product: Product }) {
	const level = product.level ?? "Popular";
	const levelClass = level.toLowerCase().includes("intermediate")
		? styles.levelIntermediate
		: level.toLowerCase().includes("advanced")
			? styles.levelAdvanced
			: styles.levelBeginner;

	const title = product.title ?? product.name ?? "Course";
	const rawPrice = Number(product.price ?? 0);
	const discountPrice = Number(product.discount_price ?? 0);
	const hasDiscount = Number.isFinite(discountPrice) && discountPrice > 0 && discountPrice < rawPrice;
	const displayPrice = hasDiscount ? discountPrice : rawPrice;
	const originalPrice = hasDiscount ? rawPrice : product.originalPrice;

	const ratingValue =
		typeof product.rating === "string"
			? product.rating
			: typeof (product as unknown as { average_rating?: number }).average_rating === "number"
				? String((product as unknown as { average_rating?: number }).average_rating)
				: "4.9";

	const studentsValue =
		typeof product.students === "string"
			? product.students
			: typeof (product as unknown as { total_students?: number }).total_students === "number"
				? String((product as unknown as { total_students?: number }).total_students)
				: "1,000+";

	const lessonsValue =
		typeof product.lessons === "number"
			? product.lessons
			: Number.parseInt(product.duration ?? "12", 10) > 0
				? Number.parseInt(product.duration ?? "12", 10) * 3
				: 12;

	const thumbStyle = product.image_url
		? {
				backgroundImage: `linear-gradient(135deg, rgba(10, 20, 30, 0.10), rgba(10, 20, 30, 0.18)), url(${product.image_url})`,
				backgroundSize: "cover",
				backgroundPosition: "center",
			}
		: { background: product.thumbBg ?? "linear-gradient(135deg,#E6F4F4,#C5E8E8)" };

	return (
		<article className={styles.card}>
			<div className={styles.thumb} style={thumbStyle}>
				<span aria-hidden="true">{product.emoji ?? "📖"}</span>
			</div>
			<div className={styles.body}>
				<span className={`${styles.level} ${levelClass}`}>{level}</span>
				<h3 className={styles.courseTitle}>{title}</h3>
				<p className={styles.description}>{product.description}</p>
				<div className={styles.meta}>
					<span className={styles.rating}>★ {ratingValue}</span>
					<span>· {studentsValue} students</span>
					<span>· {lessonsValue} lessons</span>
				</div>
				<div className={styles.footer}>
					<div className={styles.price}>
						{originalPrice && <s className={styles.original}>${Number(originalPrice).toFixed(2)}</s>} ${displayPrice.toFixed(2)}
					</div>
					<Link href={`/register?course=${product.id}`} className={styles.btnEnrol}>Enrol Now</Link>
				</div>
			</div>
		</article>
	);
}

export type { Product };
