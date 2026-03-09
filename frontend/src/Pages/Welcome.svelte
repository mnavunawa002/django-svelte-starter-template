<script>
  export let username = 'Guest'
  import Counter from '../lib/Counter.svelte'
</script>

<main>
  <h1>Welcome, {username}!</h1>
  <p>You're viewing this page with Django + Inertia.js + Svelte. Made with </p>
  <Counter />
  <p>
    Check out <a href="https://github.com/sveltejs/kit#readme" target="_blank" rel="noreferrer">SvelteKit</a>, the official Svelte app framework powered by Vite!
  </p>

  <p class="read-the-docs">
    Click on the Vite and Svelte logos to learn more
  </p>
</main>

<style>
  main {
    font-family: system-ui, sans-serif;
    max-width: 42rem;
    margin: 4rem auto;
    padding: 0 1rem;
  }
  h1 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }
  p {
    color: #6b7280;
  }
</style>
