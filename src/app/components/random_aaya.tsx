'use client'
import { useEffect, useRef, useState } from "react"
import { BookOpen, Pause, Play } from "lucide-react"

export type Aaya = {
  surah: { name_arabic: string; name_english: string; name_translation: string; number: number }
  verse: {
    arabic: string; ayah: number
    translations: { sahih_international: string; yusuf_ali: string; pickthall: string }
    transliteration: string; verse_key: string
  }
  audio: { reciter_id: number; reciter: string; style: string; surah_audio: string; ayah_audio: string }[]
  total_verses_in_quran: number
}
type ApiResponse = { success: boolean; data: Aaya }

const HERO = "https://images.unsplash.com/photo-1711202675843-ccdb194d2b7d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200"

export function useRandomAaya() {
  const [aaya, setAaya] = useState<Aaya | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [ayahPlaying, setAyahPlaying] = useState(false)
  const [surahPlaying, setSurahPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  const ayahRef = useRef<HTMLAudioElement>(null)
  const surahRef = useRef<HTMLAudioElement>(null)

  const aayaApiUrl = process.env.NEXT_PUBLIC_AAYA_API
  if (!aayaApiUrl) throw new Error('NEXT_PUBLIC_AAYA_API is not defined')

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(aayaApiUrl)
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`)
        const raw = (await res.json()) as ApiResponse
        setAaya(raw.data)
      } catch (e) {
        console.error(e)
        setError('Failed to load. Please try again.')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const toggleAyah = () => {
    if (!ayahPlaying) { surahRef.current?.pause(); setSurahPlaying(false) }
    ayahPlaying ? ayahRef.current?.pause() : ayahRef.current?.play()
    setAyahPlaying(!ayahPlaying)
  }

  const toggleSurah = () => {
    if (!surahPlaying) { ayahRef.current?.pause(); setAyahPlaying(false) }
    surahPlaying ? surahRef.current?.pause() : surahRef.current?.play()
    setSurahPlaying(!surahPlaying)
  }

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const a = surahRef.current
    if (!a) return
    a.currentTime = (Number(e.target.value) / 100) * a.duration
    setProgress(Number(e.target.value))
  }

  const fmt = (s: number) =>
    isNaN(s) ? '0:00' : `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`

  const onTimeUpdate = () => {
    if (surahRef.current && surahRef.current.duration) {
      setProgress((surahRef.current.currentTime / surahRef.current.duration) * 100)
    }
  }

  const onLoadedMetadata = () => {
    if (surahRef.current) setDuration(surahRef.current.duration)
  }

  const reciter = aaya?.audio[7]

  return {
    aaya,
    loading,
    error,
    ayahPlaying,
    surahPlaying,
    progress,
    duration,
    reciter,
    ayahRef,
    surahRef,
    toggleAyah,
    toggleSurah,
    seek,
    fmt,
    onTimeUpdate,
    onLoadedMetadata,
  }
}

export default function RandomAaya() {
  const {
    aaya,
    loading,
    error,
    ayahPlaying,
    surahPlaying,
    progress,
    duration,
    reciter,
    ayahRef,
    surahRef,
    toggleAyah,
    toggleSurah,
    seek,
    fmt,
    onTimeUpdate,
    onLoadedMetadata,
  } = useRandomAaya()

  if (!aaya) return null

  return (
    <div className="w-full bg-white text-zinc-950" style={{ fontFamily: "'Jost', sans-serif" }}>
      <div className="w-full border border-zinc-200 shadow-sm overflow-hidden">

        {/* Image section with names + surah player + ayah controls */}
        <div className="relative w-full h-44 md:h-64 overflow-hidden">
          <img alt="Mosque architecture" className="object-cover w-full h-full" src={HERO} />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-white/10" />

          <div className="flex absolute inset-x-0 top-0 p-5 md:p-6 justify-between items-center">
            <span className="font-semibold text-lg md:text-xl">Let's recite</span>
            <span className="font-medium rounded-full bg-white/80 backdrop-blur-sm text-sm flex px-4 py-2 items-center gap-2">
              <BookOpen className="size-4" /> Ayah {aaya.verse.ayah}
            </span>
          </div>

          <div className="absolute inset-x-4 md:inset-x-8 bottom-3 md:bottom-6 flex flex-col gap-2 md:gap-3">
            <div className="flex flex-row justify-between items-center gap-2">
              <div className="flex flex-col gap-0.5 min-w-0 justify-center">
                <span className="font-extrabold text-xl md:text-4xl tracking-tight truncate">{aaya.surah.name_english}</span>
                <span className="text-zinc-600 font-medium text-xs md:text-base truncate">{aaya.surah.name_translation} · {aaya.verse.verse_key}</span>
              </div>
              <span className="font-extrabold text-xl md:text-4xl shrink-0">{aaya.surah.name_arabic}</span>
            </div>

            <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-full pl-2 pr-4 py-2">
              <button
                onClick={toggleSurah}
                className="size-10 md:size-12 shrink-0 shadow-lg rounded-full bg-blue-600 text-white flex justify-center items-center"
              >
                {surahPlaying ? <Pause className="size-5 fill-current" /> : <Play className="size-5 fill-current" />}
              </button>
              <div className="flex-1 flex flex-col gap-1">
                <input
                  type="range" min={0} max={100} value={progress} onChange={seek}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-zinc-200"
                  style={{ background: `linear-gradient(90deg, #2b7fff ${progress}%, #e4e4e7 ${progress}%)` }}
                />
                <div className="text-zinc-500 text-xs flex justify-between">
                  <span>{reciter?.reciter} · {fmt((progress / 100) * duration)}</span>
                  <span>{fmt(duration)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Verse text — same card as image now */}
        <div className="flex flex-col gap-6 p-6 md:p-8">
          <div className="flex justify-center items-center gap-3">
            <span className="font-bold text-base md:text-xl text-white tracking-wide bg-blue-600 border border-blue-500 rounded-full px-6 py-3 shadow-sm leading-none flex items-center h-11.5 md:h-12">
              Random Aaya for you
            </span>
            <button
              onClick={toggleAyah}
              className="size-10 shrink-0 shadow-sm rounded-full bg-red-600 text-white flex justify-center items-center"
              aria-label="Play this ayah"
            >
              {ayahPlaying ? <Pause className="size-4 fill-current" /> : <Play className="size-4 fill-current" />}
            </button>
          </div>
          <p className="font-extrabold text-center text-3xl md:text-4xl leading-[1.9] md:leading-[65px]" dir="rtl">
            {aaya.verse.arabic}
          </p>
          <p className="italic font-semibold text-base md:text-lg leading-relaxed md:leading-8 -mt-4">{aaya.verse.transliteration}</p>
          <div className="bg-zinc-200 w-full h-px" />
          <div className="flex flex-col gap-2">
            <span className="font-bold uppercase text-zinc-500 text-xs tracking-[3px]">Translation</span>
            <p className="text-zinc-700 font-medium text-base md:text-lg leading-relaxed md:leading-8">
              {aaya.verse.translations.sahih_international}
            </p>
          </div>
        </div>

      </div>

      <audio ref={ayahRef} src={reciter?.ayah_audio} onEnded={() => undefined} />
      <audio
        ref={surahRef}
        src={reciter?.surah_audio}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={() => undefined}
      />
    </div>
  )
}