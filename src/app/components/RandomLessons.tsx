import { getCourseLessons, getCourses, type CourseRecord, type LessonRecord } from "@/lib/api";
import { LessonCard } from "@/components/lesson-card";

type CourseLesson = {
  course: CourseRecord;
  lesson: LessonRecord;
};

export default async function RandomLessons() {
  const courses = await getCourses();
  const courseLessons = await Promise.all(courses.map(async (course) => {
    const lessons = await getCourseLessons(course.id);
    return lessons.map((lesson) => ({ course, lesson }));
  }));
  const randomLessons = courseLessons.flat().sort(() => Math.random() - 0.5).slice(0, 8);

  if (!randomLessons.length) return null;

  return (
    <section className="bg-[#f5f7f2] px-5 py-16 md:px-10 md:py-20" aria-labelledby="random-lessons-title">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#9b7d2c]">Try a lesson</p>
            <h2 id="random-lessons-title" className="mt-3 text-3xl font-black tracking-tight text-[#102b2a] md:text-5xl">A few places to begin</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#536866] md:text-base">Explore a handful of lessons from across the Iqra catalogue.</p>
          </div>
          <a href="/courses" className="text-sm font-bold text-[#197052] hover:text-[#102b2a]">Browse all courses <span aria-hidden="true">→</span></a>
        </div>
        <div className="grid auto-cols-[calc((100%-1.25rem)/2)] grid-flow-col grid-rows-2 gap-5 overflow-x-auto pb-2 sm:auto-cols-auto sm:grid-flow-row sm:grid-cols-2 sm:grid-rows-none sm:overflow-visible lg:grid-cols-4">
          {randomLessons.map(({ course, lesson }, index) => (
            <LessonCard key={`${course.id}-${lesson.id}`} lesson={lesson} index={index} courseId={course.id} courseTitle={course.title} />
          ))}
        </div>
      </div>
    </section>
  );
}