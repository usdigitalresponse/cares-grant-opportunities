<template>
<section class="container-fluid">
  <b-row>
    <b-col><h2>Keywords</h2></b-col>
    <b-col></b-col>
    <b-col class="d-flex justify-content-end">
      <div>
        <b-button v-if="userRole === 'admin'" variant="success" @click="openAddKeywordModal">Add</b-button>
      </div>
    </b-col>
  </b-row>
  <b-table sticky-header="600px" hover :items="keywords" :fields="fields">
    <template #cell(actions)="row">
      <b-button v-if="userRole === 'admin'" variant="danger" class="mr-1" size="sm" @click="deleteKeyword(row.item.id)">
        <b-icon icon="trash-fill" aria-hidden="true"></b-icon>
      </b-button>
    </template>
  </b-table>
  <AddKeywordModal :showModal.sync="showAddKeywordModal"/>
</section>
</template>

<script>

import { mapActions, mapGetters } from 'vuex';

import AddKeywordModal from '@/components/Modals/AddKeyword.vue';

export default {
  components: {
    AddKeywordModal,
  },
  data() {
    return {
      fields: [
        {
          key: 'search_term',
        },
        {
          key: 'notes',
        },
        {
          key: 'created_at',
        },
        {
          key: 'updated_at',
        },
        { key: 'actions', label: 'Actions' },
      ],
      showAddKeywordModal: false,
    };
  },
  mounted() {
    this.setup();
  },
  computed: {
    ...mapGetters({
      keywords: 'grants/keywords',
      userRole: 'users/userRole',
      selectedAgency: 'users/selectedAgency',
    }),
  },
  watch: {
    selectedAgency() {
      this.setup();
    },
  },
  methods: {
    ...mapActions({
      fetchKeywords: 'grants/fetchKeywords',
      deleteKeyword: 'grants/deleteKeyword',
    }),
    setup() {
      this.fetchKeywords();
    },
    openAddKeywordModal() {
      this.showAddKeywordModal = true;
    },
  },
};
</script>
