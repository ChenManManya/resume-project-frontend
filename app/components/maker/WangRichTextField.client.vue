<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch, ref } from 'vue'
import '@wangeditor/editor/dist/css/style.css'

const props = withDefaults(
  defineProps<{
    modelValue: string
    placeholder?: string
  }>(),
  {
    placeholder: '请输入内容'
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const toolbarRef = ref<HTMLDivElement | null>(null)
const editorRef = ref<HTMLDivElement | null>(null)
let editor: any = null

const toolbarConfig = {
  toolbarKeys: ['headerSelect', 'bold', 'italic', 'underline', 'bulletedList', 'numberedList', 'insertLink', 'clearStyle']
}

onMounted(async () => {
  if (!toolbarRef.value || !editorRef.value) {
    return
  }

  const { createEditor, createToolbar } = await import('@wangeditor/editor')

  const editorConfig = {
    placeholder: props.placeholder,
    onChange(currentEditor) {
      emit('update:modelValue', currentEditor.getHtml())
    }
  }

  editor = createEditor({
    selector: editorRef.value,
    html: props.modelValue || '<p></p>',
    config: editorConfig,
    mode: 'default'
  })

  createToolbar({
    editor,
    selector: toolbarRef.value,
    config: toolbarConfig,
    mode: 'default'
  })
})

watch(
  () => props.modelValue,
  (value) => {
    if (!editor) {
      return
    }

    const nextHtml = value || '<p></p>'
    if (editor.getHtml() !== nextHtml) {
      editor.setHtml(nextHtml)
    }
  }
)

onBeforeUnmount(() => {
  editor?.destroy()
  editor = null
})
</script>

<template>
  <div class="wang-field">
    <div ref="toolbarRef" class="wang-field__toolbar" />
    <div ref="editorRef" class="wang-field__editor" />
  </div>
</template>

<style scoped lang="scss">
.wang-field {
  border: 1px solid rgba(203, 213, 225, 0.9);
  border-radius: 14px;
  overflow: hidden;
  background: #fff;
}

.wang-field__toolbar {
  border-bottom: 1px solid rgba(226, 232, 240, 0.95);
}

.wang-field__editor {
  min-height: 180px;

  :deep(.w-e-text-container [data-slate-editor]) {
    min-height: 160px;
    padding: 12px 14px;
    font-size: 14px;
    line-height: 1.7;
    color: #0f172a;
  }
}
</style>
