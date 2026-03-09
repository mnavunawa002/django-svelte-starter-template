import axios from 'axios'
import { createInertiaApp } from '@inertiajs/svelte'
import { mount } from 'svelte'
import './app.css'

// Django CSRF compatibility
axios.defaults.xsrfHeaderName = 'X-CSRFToken'
axios.defaults.xsrfCookieName = 'csrftoken'

createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob('./Pages/**/*.svelte')
    const path = `./Pages/${name}.svelte`
    if (!(path in pages)) {
      throw new Error(`Page not found: ${name}`)
    }
    return pages[path]()
  },
  setup({ el, App, props }) {
    mount(App, { target: el, props })
  },
  progress: {
    color: '#4B5563',
    showSpinner: true,
  },
})
