<template>
  <div>
    <ul>
      <li
        v-for="(item, index) in snapshotList"
        :key="index"
      >
        {{ item }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    store: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      snapshotList: [],
    };
  },
  async created() {
    this.updateSnapshot();
    this.store.on('change', this.updateSnapshot.bind(this));
  },
  methods: {
    async updateSnapshot() {
      this.snapshotList = await this.store.get('all');
    },
  },
};
</script>
