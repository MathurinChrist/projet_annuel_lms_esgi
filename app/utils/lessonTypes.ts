import { PlayCircle, FileText, AlignLeft, HelpCircle, Video, Paperclip } from 'lucide-vue-next'

export const LESSON_TYPE_CONFIG: Record<string, { icon: unknown; color: string; bg: string; label: string }> = {
  video: { icon: PlayCircle, color: 'text-primary', bg: 'bg-primary/5', label: 'Vidéo' },
  pdf: { icon: FileText, color: 'text-orange-500', bg: 'bg-orange-500/5', label: 'PDF' },
  text: { icon: AlignLeft, color: 'text-purple-500', bg: 'bg-purple-500/5', label: 'Texte' },
  quiz: { icon: HelpCircle, color: 'text-green-500', bg: 'bg-green-500/5', label: 'Quiz' },
}

export const LESSON_CONTENT_TYPES = [
  { value: 'video', label: 'Vidéo', icon: Video },
  { value: 'text', label: 'Texte', icon: AlignLeft },
  { value: 'quiz', label: 'Quiz', icon: HelpCircle },
  { value: 'pdf', label: 'PDF', icon: Paperclip },
]
