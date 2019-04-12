<template>
  <div
    v-if="empty"
    style="text-align:center;opacity:.4;padding-top:1rem"
  >
    <b-icon
      size="is-large"
      pack="fas"
      icon="history"
    />
    <p class="is-6 title">
      {{ tips }}
    </p>
  </div>
</template>

<script>
export default {
  props: {
    empty: {
      type: Boolean,
      default: true,
    },
    tips: {
      type: String,
      default: ''
    },
  },
};
</script>
