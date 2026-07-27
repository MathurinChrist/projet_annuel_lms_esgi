<template>
  <div v-if="editor" class="rich-text-editor">
    <div class="border border-[#e7ebf3] border-b-0 rounded-t-xl bg-[#f8f9fc] p-2 flex items-center gap-1 flex-wrap">
      <button
        type="button"
        :class="[btnBase, editor.isActive('bold') && btnActive]"
        @click="editor.chain().focus().toggleBold().run()"
      >
        <Bold :size="16" />
      </button>
      <button
        type="button"
        :class="[btnBase, editor.isActive('italic') && btnActive]"
        @click="editor.chain().focus().toggleItalic().run()"
      >
        <Italic :size="16" />
      </button>
      <button
        type="button"
        :class="[btnBase, editor.isActive('underline') && btnActive]"
        @click="editor.chain().focus().toggleUnderline().run()"
      >
        <UnderlineIcon :size="16" />
      </button>
      <button
        type="button"
        :class="[btnBase, editor.isActive('highlight') && btnActive]"
        @click="editor.chain().focus().toggleHighlight().run()"
      >
        <Highlighter :size="16" />
      </button>
      <button
        type="button"
        :class="[btnBase, editor.isActive('strike') && btnActive]"
        @click="editor.chain().focus().toggleStrike().run()"
      >
        <Strikethrough :size="16" />
      </button>

      <div class="h-5 w-px bg-[#e7ebf3]" />

      <button
        type="button"
        :class="[btnBase, btnHeading, editor.isActive('heading', { level: 1 }) && btnActive]"
        @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
      >
        H1
      </button>
      <button
        type="button"
        :class="[btnBase, btnHeading, editor.isActive('heading', { level: 2 }) && btnActive]"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
      >
        H2
      </button>
      <button
        type="button"
        :class="[btnBase, btnHeading, editor.isActive('heading', { level: 3 }) && btnActive]"
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
      >
        H3
      </button>

      <div class="h-5 w-px bg-[#e7ebf3]" />

      <button
        type="button"
        :class="[btnBase, editor.isActive('bulletList') && btnActive]"
        @click="editor.chain().focus().toggleBulletList().run()"
      >
        <List :size="16" />
      </button>
      <button
        type="button"
        :class="[btnBase, editor.isActive('orderedList') && btnActive]"
        @click="editor.chain().focus().toggleOrderedList().run()"
      >
        <ListOrdered :size="16" />
      </button>

      <div class="h-5 w-px bg-[#e7ebf3]" />

      <button
        type="button"
        :class="[btnBase, editor.isActive({ textAlign: 'left' }) && btnActive]"
        @click="editor.chain().focus().setTextAlign('left').run()"
      >
        <AlignLeft :size="16" />
      </button>
      <button
        type="button"
        :class="[btnBase, editor.isActive({ textAlign: 'center' }) && btnActive]"
        @click="editor.chain().focus().setTextAlign('center').run()"
      >
        <AlignCenter :size="16" />
      </button>
      <button
        type="button"
        :class="[btnBase, editor.isActive({ textAlign: 'right' }) && btnActive]"
        @click="editor.chain().focus().setTextAlign('right').run()"
      >
        <AlignRight :size="16" />
      </button>

      <div class="h-5 w-px bg-[#e7ebf3]" />

      <button
        type="button"
        :class="[btnBase, editor.isActive('link') && btnActive]"
        @click="toggleLink"
      >
        <Link2 :size="16" />
      </button>
      <button
        type="button"
        :class="[btnBase]"
        @click="insertImage"
      >
        <ImagePlus :size="16" />
      </button>
      <button
        type="button"
        :class="[btnBase, editor.isActive('codeBlock') && btnActive]"
        @click="editor.chain().focus().toggleCodeBlock().run()"
      >
        <Code :size="16" />
      </button>
      <button
        type="button"
        :class="[btnBase, editor.isActive('blockquote') && btnActive]"
        @click="editor.chain().focus().toggleBlockquote().run()"
      >
        <Quote :size="16" />
      </button>

      <div class="h-5 w-px bg-[#e7ebf3]" />

      <button
        type="button"
        :class="[btnBase]"
        @click="editor.chain().focus().undo().run()"
      >
        <Undo2 :size="16" />
      </button>
      <button
        type="button"
        :class="[btnBase]"
        @click="editor.chain().focus().redo().run()"
      >
        <Redo2 :size="16" />
      </button>
    </div>

    <div class="border border-[#e7ebf3] rounded-b-xl bg-white max-h-[60vh] overflow-y-auto" :style="{ minHeight: props.minHeight }">
      <EditorContent :editor="editor" />
    </div>
  </div>
</template>

<script setup>
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Placeholder from '@tiptap/extension-placeholder'
import UnderlineExt from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import { common, createLowlight } from 'lowlight'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Highlighter,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link2,
  ImagePlus,
  Code,
  Quote,
  Undo2,
  Redo2,
} from 'lucide-vue-next'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  minHeight: { type: String, default: '400px' },
})

const emit = defineEmits(['update:modelValue'])

const { t } = useI18n()

const resolvedPlaceholder = computed(() => props.placeholder || t('ui.editor_placeholder'))

const btnBase = 'p-1.5 rounded-md transition-colors text-[#4c669a] hover:text-[#0d121b] hover:bg-[#f8f9fc]'
const btnActive = 'bg-primary/10 text-primary'
const btnHeading = 'text-xs font-black w-7 h-7 flex items-center justify-center'

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({
      codeBlock: false,
      heading: { levels: [1, 2, 3] },
    }),
    UnderlineExt,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Highlight.configure({ multicolor: false }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: { class: 'text-primary underline' },
    }),
    Image.configure({ inline: false, allowBase64: true }),
    CodeBlockLowlight.configure({ lowlight: createLowlight(common) }),
    Placeholder.configure({ placeholder: resolvedPlaceholder.value }),
  ],
  onUpdate: () => {
    emit('update:modelValue', editor.value?.getHTML() ?? '')
  },
})

watch(
  () => props.modelValue,
  (val) => {
    if (!editor.value) return
    const current = editor.value.getHTML()
    if (val !== current) {
      editor.value.commands.setContent(val, false)
    }
  },
)

watch(resolvedPlaceholder, (placeholder) => {
  if (!editor.value) return
  editor.value.extensionManager.extensions
    .filter((ext) => ext.name === 'placeholder')
    .forEach((ext) => { ext.options.placeholder = placeholder })
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})

function toggleLink() {
  if (!editor.value) return
  if (editor.value.isActive('link')) {
    editor.value.chain().focus().unsetLink().run()
    return
  }
  const url = window.prompt('URL du lien :')
  if (url) {
    editor.value.chain().focus().setLink({ href: url }).run()
  }
}

function insertImage() {
  if (!editor.value) return
  const url = window.prompt("URL de l'image :")
  if (url) {
    editor.value.chain().focus().setImage({ src: url }).run()
  }
}
</script>

<style scoped>
:deep(.ProseMirror) {
  padding: 1.5rem;
  outline: none;
  min-height: v-bind('props.minHeight');
}

:deep(.ProseMirror p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  color: #9ca3af;
  pointer-events: none;
  height: 0;
}

:deep(.ProseMirror h1) { font-size: 1.75rem; font-weight: 800; margin: 1rem 0 0.5rem; }
:deep(.ProseMirror h2) { font-size: 1.35rem; font-weight: 700; margin: 1rem 0 0.5rem; }
:deep(.ProseMirror h3) { font-size: 1.1rem; font-weight: 600; margin: 0.75rem 0 0.5rem; }
:deep(.ProseMirror p) { margin: 0.5rem 0; line-height: 1.7; }
:deep(.ProseMirror ul) { list-style: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
:deep(.ProseMirror ol) { list-style: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
:deep(.ProseMirror li) { margin: 0.25rem 0; }
:deep(.ProseMirror blockquote) {
  border-left: 3px solid #e7ebf3;
  padding-left: 1rem;
  margin: 1rem 0;
  color: #4c669a;
  font-style: italic;
}
:deep(.ProseMirror code) {
  background: #f8f9fc;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-family: monospace;
}
:deep(.ProseMirror pre) {
  background: #1e293b;
  color: #e2e8f0;
  padding: 1rem;
  border-radius: 0.75rem;
  margin: 1rem 0;
  overflow-x: auto;
  font-size: 0.875rem;
  line-height: 1.5;
}
:deep(.ProseMirror pre code) {
  background: none;
  padding: 0;
  color: inherit;
}
:deep(.ProseMirror img) {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  margin: 1rem 0;
}
:deep(.ProseMirror mark) {
  background-color: #fef08a;
  padding: 0.1rem 0.2rem;
  border-radius: 2px;
}
:deep(.ProseMirror a) {
  color: #135bec;
  text-decoration: underline;
}
</style>
