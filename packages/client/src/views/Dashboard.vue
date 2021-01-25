<template>
  <section class="container-fluid">
    <b-card-group columns>
        <b-card bg-variant="secondary" text-variant="white" header="Total Grants" class="text-center">
          <h3>{{totalGrants}}</h3>
        </b-card>
        <b-card bg-variant="secondary" text-variant="white" header="Total Viewed Grants" class="text-center">
          <h3>{{totalViewedGrants}}</h3>
        </b-card>
        <b-card bg-variant="secondary" text-variant="white" header="Total Interested Grants" class="text-center">
          <h3>{{totalInterestedGrants}}</h3>
        </b-card>
      </b-card-group>
  </section>
</template>

<script>

import { mapActions, mapGetters } from 'vuex';

export default {
  components: {
  },
  data() {
    return {
    };
  },
  mounted() {
    this.fetchDashboard();
  },
  computed: {
    ...mapGetters({
      totalGrants: 'dashboard/totalGrants',
      totalViewedGrants: 'dashboard/totalViewedGrants',
      totalInterestedGrants: 'dashboard/totalInterestedGrants',
    }),
  },
  methods: {
    ...mapActions({
      fetchDashboard: 'dashboard/fetchDashboard',
    }),
  },
};
</script>
