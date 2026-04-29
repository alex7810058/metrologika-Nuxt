export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession();
  
  // Проверка состояния сессии (уже загружено автоматически)
  if (!loggedIn.value && to.path !== '/login') {
    return navigateTo('/login');
  }
  
  if (loggedIn.value && to.path === '/login') {
    return navigateTo('/');
  }
});
