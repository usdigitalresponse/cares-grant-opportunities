const fetchApi = require('@/helpers/fetchApi');

function initialState() {
  return {
    dashboard: {},
    totalGrants: null,
    totalViewedGrants: null,
    totalInterestedGrants: null,
  };
}

export default {
  namespaced: true,
  state: initialState,
  getters: {
    dashboard: (state) => state.dashboard,
    totalGrants: (state) => state.totalGrants,
    totalViewedGrants: (state) => state.totalViewedGrants,
    totalInterestedGrants: (state) => state.totalInterestedGrants,
  },
  actions: {
    async fetchDashboard({ commit }) {
      const result = await fetchApi.get('/api/dashboard?totalGrants=true&totalViewedGrants=true&totalInterestedGrants=true');
      if (result.totalGrants) {
        commit('SET_TOTAL_GRANTS', result.totalGrants);
      }
      if (result.totalViewedGrants) {
        commit('SET_TOTAL_VIEWED_GRANTS', result.totalViewedGrants);
      }
      if (result.totalInterestedGrants) {
        commit('SET_TOTAL_INTERESTED_GRANTS', result.totalInterestedGrants);
      }
    },
  },
  mutations: {
    SET_TOTAL_GRANTS(state, data) {
      state.totalGrants = data;
    },
    SET_TOTAL_VIEWED_GRANTS(state, data) {
      state.totalViewedGrants = data;
    },
    SET_TOTAL_INTERESTED_GRANTS(state, data) {
      state.totalInterestedGrants = data;
    },
    SET_DASHBOARD(state, dashboard) {
      state.dashboard = dashboard;
    },
  },
};
