import Link from "next/link";
import { getCourses, type CourseRecord } from "@/lib/api";
import styles from "./FeaturedCourse.module.css";

const FEATURED_COURSE_ID = "6ffe58b3-d68e-47b4-8712-4efe3665d87e";

const includes = [
  "120+ video lessons with audio recitation",
  "Weekly one-on-one sessions with your Hafiz",
  "Personalised memorisation schedule",
  "Progress tracking and revision tools",
  "Certificate upon completing each Juz",
  "Community of 2,000+ fellow Huffaz",
];

const modules = [
  "Al-Fatiha and Juz 'Amma - Foundation",
  "Juz 1-5 - Surah Al-Baqarah",
  "Juz 6-10 - Al Imran to Al-Maidah",
  "Advanced Revision and Completion",
];

export default async function FeaturedCourse() {
  const courses = await getCourses();
  const course = courses.find((item) => item.id === FEATURED_COURSE_ID) ?? courses.find((item) => /hafiz|hifz|quran memor/i.test(item.title)) ?? null;

  if (!course) return null;

  const price = course.discount_price && course.discount_price > 0 && course.discount_price < course.price ? course.discount_price : course.price;
  const description = course.description || "A structured, step-by-step programme to help you memorise the Quran with proper Tajweed under the supervision of a certified Hafiz. Suitable for all ages.";

  return (
    <section className={styles.section} aria-labelledby="featured-course-title">
      <div className={styles.inner}>
        <div className={styles.content}>
          <div className={styles.badge}>Most popular course</div>
          <h2 id="featured-course-title" className={styles.title}>{course.title || "Complete Hifz Programme"}</h2>
          <p className={styles.sub}>{description}</p>
          <ul className={styles.includes}>
            {includes.map((item) => <li key={item} className={styles.includeItem}><span className={styles.check} aria-hidden="true">✓</span>{item}</li>)}
          </ul>
          <div className={styles.priceRow}>
            <div className={styles.price}><strong>${Number(price ?? 0).toFixed(2)}</strong><span>/ month</span></div>
            <div className={styles.actions}>
              <Link href={`/payment?course=${course.id}`} className={styles.btnCta}>Begin Hifz journey <span aria-hidden="true">→</span></Link>
              <Link href={`/courses/${course.id}`} className={styles.btnDetails}>View details</Link>
            </div>
          </div>
        </div>
        <div className={styles.visual}>
          <p className={`${styles.arabic} arabic`}>وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ<br />فَهَلْ مِن مُّدَّكِرٍ</p>
          <p className={styles.translation}>“And We have certainly made the Quran easy for remembrance, so is there any who will remember?” - 54:17</p>
          <div className={styles.modules}>{modules.map((item, index) => <div key={item} className={styles.moduleItem}><span className={styles.moduleNum}>{index + 1}</span><span>{item}</span></div>)}</div>
        </div>
      </div>
    </section>
  );
}