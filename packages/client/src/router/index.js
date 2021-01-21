import Vue from 'vue';
import VueRouter from 'vue-router';

import Login from '../views/Login.vue';
import Layout from '../components/Layout.vue';

import store from '../store';

Vue.use(VueRouter);

const routes = [
  {
    path: '/login',
    name: 'login',
    component: Login,
  },
  {
    path: '/',
    name: 'layout',
    redirect: '/grants',
    component: Layout,
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: '/grants',
        name: 'grants',
        component: () => import('../views/Grants.vue'),
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: '/eligibility-codes',
        name: 'eligibilityCodes',
        component: () => import('../views/EligibilityCodes.vue'),
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: '/keywords',
        name: 'keywords',
        component: () => import('../views/Keywords.vue'),
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: '/users',
        name: 'users',
        component: () => import('../views/Users.vue'),
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: '/agencies',
        name: 'agencies',
        component: () => import('../views/Agencies.vue'),
        meta: {
          requiresAuth: true,
        },
      },
    ],
  },
  {
    path: '*',
    redirect: '/grants',
  },
];

const router = new VueRouter({
  base: process.env.BASE_URL,
  routes,
});

function loggedIn() {
  const loggedInUser = store.getters['users/loggedInUser'];
  return loggedInUser != null;
}

router.beforeEach((to, from, next) => {
  const authenticated = loggedIn();
  if (to.meta.requiresAuth && !authenticated) {
    next({ name: 'login' });
  } else if (to.name === 'login' && authenticated) {
    next({ name: 'grants' });
  } else if (to.name === 'not-found') {
    if (authenticated) {
      next({ name: 'grants' });
    } else {
      next({ name: 'login' });
    }
  } else {
    next();
  }
  // console.log('hey');
  // if (!loggedIn()) {
  //   next({
  //     path: '/login',
  //   });
  // } else {
  //   next();
  // }
  // if (to.meta.requiresAuth) {
  //   if (!loggedIn()) {
  //     next({
  //       path: '/login',
  //     });
  //   } else {
  //     next();
  //   }
  // } else {
  //   next();
  // }
  // if (to.matched.some((record) => record.meta.requiresAuth)) {
  //   console.log('here');
  //   console.log(loggedIn());
  //   if (!loggedIn()) {
  //     next({
  //       path: '/login',
  //     });
  //   } else {
  //     next();
  //   }
  // } else {
  //   next(); // make sure to always call next()!
  // }
});

export default router;
