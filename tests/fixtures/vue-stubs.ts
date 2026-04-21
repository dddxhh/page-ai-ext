import { config } from '@vue/test-utils'

export const elementPlusStubs = {
  ElAlert: {
    template: '<div class="el-alert" v-if="$props.title">{{ $props.title }}</div>',
    props: ['type', 'title', 'closable'],
  },
  ElButton: {
    template:
      '<button class="el-button" :class="{ \'is-disabled\': disabled, \'is-loading\': loading }" :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
    props: ['type', 'size', 'disabled', 'loading'],
    emits: ['click'],
  },
  ElButtonGroup: {
    template: '<div class="el-button-group"><slot /></div>',
  },
  ElDialog: {
    template:
      '<div class="el-dialog" v-if="modelValue"><div class="dialog-title">{{ title }}</div><slot /><slot name="footer" /></div>',
    props: ['modelValue', 'title', 'width'],
    emits: ['update:modelValue', 'close'],
  },
  ElDivider: {
    template: '<hr class="el-divider" />',
    props: ['contentPosition'],
  },
  ElForm: {
    template: '<form class="el-form"><slot /></form>',
    props: ['model', 'rules', 'labelWidth'],
    emits: ['validate'],
    methods: {
      resetFields: () => {},
      validate: () => Promise.resolve(true),
    },
  },
  ElFormItem: {
    template: '<div class="el-form-item"><slot /></div>',
    props: ['label', 'prop'],
  },
  ElInput: {
    template:
      '<input class="el-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ['modelValue', 'type', 'rows', 'placeholder', 'clearable'],
    emits: ['update:modelValue', 'input'],
  },
  ElMessage: {
    template: '<div class="el-message"></div>',
  },
  ElOption: {
    template: '<option class="el-option" :value="value">{{ label }}</option>',
    props: ['label', 'value'],
  },
  ElScrollbar: {
    template: '<div class="el-scrollbar"><slot /></div>',
    props: ['maxHeight'],
  },
  ElSelect: {
    template: '<select class="el-select"><slot /></select>',
    props: ['modelValue', 'multiple', 'filterable', 'allowCreate', 'placeholder', 'clearable'],
    emits: ['update:modelValue', 'change'],
  },
  ElSwitch: {
    template: '<input type="checkbox" class="el-switch" />',
    props: ['modelValue'],
    emits: ['update:modelValue'],
  },
  ElTabPane: {
    template: '<div class="el-tab-pane"><slot /></div>',
    props: ['label', 'name'],
  },
  ElTabs: {
    template: '<div class="el-tabs"><slot /></div>',
    props: ['modelValue'],
    emits: ['update:modelValue'],
  },
  ElTag: {
    template: '<span class="el-tag" :class="type ? \'el-tag--\' + type : \'\'"><slot /></span>',
    props: ['type', 'size'],
  },
  ElText: {
    template: '<span class="el-text"><slot /></span>',
    props: ['type', 'size'],
  },
  ElTooltip: {
    template: '<div class="el-tooltip"><slot /></div>',
    props: ['content', 'placement'],
  },
}

export function setupGlobalStubs() {
  config.global.stubs = elementPlusStubs
}
