"use client";

import { BookOpen, Pause, Play } from "lucide-react";
import { useRandomAaya } from "./random_aaya";
import styles from "./Hero.module.css";

const stats = [{ value: "50K+", label: "Students enrolled" }, { value: "120+", label: "Courses available" }, { value: "40+", label: "Qualified scholars" }];
export default function Hero() {
  const { aaya, loading, error, ayahPlaying, surahPlaying, progress, duration, reciter, ayahRef, surahRef, toggleAyah, toggleSurah, seek, fmt, onTimeUpdate, onLoadedMetadata } = useRandomAaya();

  return <section className={styles.hero}>
    <div className={styles.pattern} aria-hidden="true" /><div className={styles.glow} aria-hidden="true" />
    <div className={styles.inner}>
      <div className={styles.content}>
        <p className={`${styles.bismillah} arabic`}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
        <div className={styles.tag}><span className={styles.tagDot} />Trusted by 50,000+ Muslims worldwide</div>
        <h1 className={styles.heading}>Learn Quran &amp; <em>Islamic Knowledge</em> with Certified Scholars</h1>
        <p className={styles.sub}>Structured online courses in Quranic recitation, Tajweed, Arabic, Fiqh, Hadith, and more, taught by qualified Islamic scholars.</p>
        <div className={styles.actions}><a href="#courses" className={styles.btnHeroPrimary}>Explore Courses</a><a href="#aaya" className={styles.btnHeroSecondary}><BookOpen className="size-4" /> Read today&apos;s Ayah</a></div>
        <div className={styles.statsRow}>{stats.map((stat) => <div key={stat.label} className={styles.stat}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}</div>
      </div>
      <div className={styles.visual}>
        <div className={styles.card}>
          <div className={styles.quranBox}>
            <p className={`${styles.quranArabic} arabic`}>إِنَّ هَـٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ</p>
            <p className={styles.quranTrans}>Indeed, this Quran guides to that which is most suitable — 17:9</p>
          </div>
        </div>
      </div>
      <div id="aaya" className={styles.ayahPanel}>
        <div className={styles.ayahHeading}><div><span className={styles.ayahEyebrow}>Daily reflection</span><div className={styles.ayahTitleRow}><button type="button" onClick={toggleAyah} className={styles.ayahPlay} aria-label="Play this ayah">{ayahPlaying ? <Pause className="size-4 fill-current" /> : <Play className="size-4 fill-current" />}</button><h2>Random Ayah for you</h2></div></div>{aaya && <span className={styles.ayahBadge}><BookOpen className="size-4" />Ayah {aaya.verse.ayah}</span>}</div>
        {loading && <p className={styles.ayahState}>Loading today&apos;s ayah...</p>}{error && <p className={styles.ayahError}>{error}</p>}
        {aaya && <><div className={styles.ayahMeta}><div><strong>{aaya.surah.name_english}</strong><span>{aaya.surah.name_translation} · {aaya.verse.verse_key}</span></div><span className={`${styles.ayahArabic} arabic`}>{aaya.surah.name_arabic}</span></div><p className={`${styles.verse} arabic`} dir="rtl">{aaya.verse.arabic}</p><p className={styles.transliteration}>{aaya.verse.transliteration}</p><div className={styles.ayahDivider} /><p className={styles.translation}>{aaya.verse.translations.sahih_international}</p><div className={styles.audioBar}><button type="button" onClick={toggleSurah} className={styles.audioButton} aria-label="Play surah audio">{surahPlaying ? <Pause className="size-4 fill-current" /> : <Play className="size-4 fill-current" />}</button><div className={styles.audioContent}><input type="range" min="0" max="100" value={progress} onChange={seek} aria-label="Surah audio progress" style={{ background: `linear-gradient(90deg, #d6a63a ${progress}%, rgba(255,255,255,.16) ${progress}%)` }} /><div><span>{reciter?.reciter ?? "Quran recitation"}</span><span>{fmt((progress / 100) * duration)} / {fmt(duration)}</span></div></div></div></>}
        <audio ref={ayahRef} src={reciter?.ayah_audio} onEnded={() => undefined} /><audio ref={surahRef} src={reciter?.surah_audio} onTimeUpdate={onTimeUpdate} onLoadedMetadata={onLoadedMetadata} onEnded={() => undefined} />
      </div>
    </div>
  </section>;
}