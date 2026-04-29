export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn, fetch } = useUserSession();

  // Ждём загрузки состояния сессии
  await fetch();

  console.log('Logged in status:', loggedIn.value);

  if (loggedIn.value && to.path === '/login') {
    return navigateTo('/');
  }

  if (!loggedIn.value && to.path !== '/login') {
    return navigateTo('/login');
  }
});
