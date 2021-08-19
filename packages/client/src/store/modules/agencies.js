const fetchApi = require('@/helpers/fetchApi');

function initialState() {
  return {
    agencies: [],
  };
}

export default {
  namespaced: true,
  state: initialState,
  getters: {
    agencies: (state) => state.agencies,
  },
  actions: {
    fetchAgencies({ commit }) {
      fetchApi.get('/api/agencies').then((data) => commit('SET_AGENCIES', data));
    },
    updateThresholds(context, { agencyId, warningThreshold, dangerThreshold }) {
      return fetchApi.put(`/api/agencies/${agencyId}`, {
        // Currently, agencies are seeded into db; only thresholds are mutable.
        warningThreshold,
        dangerThreshold,
      });
    },
  },
  mutations: {
    SET_AGENCIES(state, agencies) {
      state.agencies = agencies;
    },
  },
};
