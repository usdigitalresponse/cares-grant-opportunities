const fetchApi = require('@/helpers/fetchApi');

function initialState() {
  return {
    loggedInUser: null,
    settings: {
      selectedAgency: null,
    },
    users: [],
  };
}

export default {
  namespaced: true,
  state: initialState,
  getters: {
    loggedInUser: (state) => state.loggedInUser,
    users: (state) => state.users,
    userRole: (state, getters) => (getters.loggedInUser ? getters.loggedInUser.role.name : null),
    agency: (state, getters) => (getters.loggedInUser ? getters.loggedInUser.agency : null),
    selectedAgency: (state) => state.settings.selectedAgency || localStorage.getItem('selectedAgency'),
  },
  actions: {
    login({ dispatch, commit, getters }, user) {
      dispatch('changeSelectedAgency', getters.selectedAgency);
      commit('SET_LOGGED_IN_USER', user);
    },
    async logout({ commit }) {
      await fetchApi.get('/api/sessions/logout');
      commit('SET_LOGGED_IN_USER', null);
      localStorage.setItem('selectedAgency', null);
    },
    async changeSelectedAgency({ commit }, agencyId) {
      commit('SET_SELECTED_AGENCY', agencyId);
      localStorage.setItem('selectedAgency', agencyId);
    },
    fetchUsers({ commit }) {
      return fetchApi.get('/api/users')
        .then((data) => commit('SET_USERS', data));
    },
    async createUser({ dispatch }, user) {
      await fetchApi.post('/api/users', user);
      await dispatch('fetchUsers');
    },
    async deleteUser({ dispatch }, userId) {
      await fetchApi.deleteRequest(`/api/users/${userId}`);
      await dispatch('fetchUsers');
    },
  },
  mutations: {
    SET_LOGGED_IN_USER(state, user) {
      state.loggedInUser = user;
    },
    SET_USERS(state, users) {
      state.users = users;
    },
    SET_SELECTED_AGENCY(state, agencyId) {
      state.settings.selectedAgency = agencyId;
    },
  },
};
