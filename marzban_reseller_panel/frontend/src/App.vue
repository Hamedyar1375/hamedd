<template>
  <router-view />
</template>

<script>
export default {
  name: 'App',
};
</script>

<style>
/* Minimal global styles, or can be moved to a global CSS file */
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

/* Reset some default browser styles */
body, html {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}
</style>
