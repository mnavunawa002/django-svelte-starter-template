# Django + Inertia.js + Svelte + Vite

This project wires Django (backend) to a Svelte (frontend) single-page app using **Inertia.js** and **Vite**. Django handles routing and data; Svelte provides the reactive UI.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           REQUEST FLOW                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Browser  ──►  Django (URL routing)  ──►  Inertia view (render)              │
│       │                    │                         │                       │
│       │                    │                         ▼                       │
│       │                    │              Layout template (layout.html)      │
│       │                    │                         │                       │
│       │                    │                         ├── {% vite_asset %}    │
│       │                    │                         └── {% block inertia %}  │
│       │                    │                                   │             │
│       │                    │                                   ▼             │
│       │                    │              inertia.html (extends layout)       │
│       │                    │              Renders: <div id="app"             │
│       │                    │                     data-page="{{ page }}">    │
│       │                    │                                   │             │
│       │                    ▼                                   │             │
│       │         HTML + JSON page data                         │             │
│       │                    │                                   │             │
│       ◄────────────────────┴───────────────────────────────────┘             │
│       │                                                                      │
│       │  Browser loads JS from Vite (dev) or staticfiles (prod)              │
│       │                    │                                                 │
│       ▼                    ▼                                                 │
│   Svelte app mounts on #app, reads data-page, renders component             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## How the Pieces Connect

### 1. Django → Inertia

**Packages:** `inertia-django`

- **`inertia`** in `INSTALLED_APPS` and **`inertia.middleware.InertiaMiddleware`** in `MIDDLEWARE`
- **`INERTIA_LAYOUT`** points to the base HTML template (`layout.html`)

**Views** use `inertia.render()` instead of returning HTML:

```python
from inertia import render

def welcome(request):
    return render(request, 'Welcome', {'username': 'Guest'})
```

- First arg: `request`
- Second arg: **component name** (maps to `Pages/Welcome.svelte`)
- Third arg: **props** (passed to the Svelte component)

### 2. Template Chain

**layout.html** (your base):

- Loads Vite assets via `{% vite_asset 'src/main.js' %}` and `{% vite_hmr_client %}`
- Defines `{% block inertia %}` for Inertia to fill

**inertia.html** (from `inertia-django`):

- Extends `layout.html` (via `inertia_layout`)
- Fills the inertia block with:

  ```html
  <div id="app" data-page="{{ page|escape }}"></div>
  ```

- `page` is JSON: `{ component, props, url, version }`

### 3. Django Vite → Vite

**Package:** `django-vite`

**Settings** (`DJANGO_VITE`):

- **`dev_mode`**: `True` in dev → assets from Vite dev server; `False` in prod → from manifest
- **`dev_server_port`**: 5173 (Vite default)
- **`manifest_path`**: `frontend/dist/.vite/manifest.json` (production)
- **`static_url_prefix`**: prefix for asset URLs (empty here)

**Template tags:**

- `{% vite_asset 'src/main.js' %}` → script tag for the entry
- `{% vite_hmr_client %}` → HMR client script (dev only)

**URL construction:** django-vite builds URLs as `STATIC_URL` + `static_url_prefix` + path. With `STATIC_URL = 'static/'`, dev URLs look like `http://localhost:5173/static/src/main.js`.

### 4. Vite → Svelte

**`base: '/static/'`** in `vite.config.js`:

- Must match the path django-vite uses
- Ensures dev server serves assets at `/static/src/main.js`, etc.

**Entry:** `frontend/src/main.js`

- Imports `createInertiaApp` from `@inertiajs/svelte`
- **`resolve(name)`**: maps component names to Svelte files via `import.meta.glob('./Pages/**/*.svelte')`
  - `'Welcome'` → `./Pages/Welcome.svelte`
  - `'Event/Index'` → `./Pages/Event/Index.svelte`
- **`setup()`**: mounts the Inertia App on `#app` with Svelte’s `mount()`

### 5. Component Name Mapping

| Django `render(request, name, props)` | Svelte file        |
|---------------------------------------|--------------------|
| `'Welcome'`                           | `Pages/Welcome.svelte` |
| `'Event/Index'`                       | `Pages/Event/Index.svelte` |

The `name` in `render()` must match the path under `Pages/` (without `.svelte`).

---

## Development vs Production

### Development

1. **Vite dev server** serves JS/CSS and HMR:
   ```bash
   cd frontend && npm run dev
   ```


2. **Django** serves the app:
   ```bash
   python manage.py runserver
   ```

3. `{% vite_asset %}` and `{% vite_hmr_client %}` point to `http://localhost:5173/static/...`

### Production

1. Build the frontend:
   ```bash
   cd frontend && npm run build
   ```

2. Collect static files:
   ```bash
   python manage.py collectstatic --noinput
   ```

3. Set `DEBUG = False` so `dev_mode` becomes `False` and django-vite uses the manifest instead of the Vite dev server.

---

## File Structure

```
demo/
├── core/
│   ├── settings.py      # Inertia, django-vite, static config
│   └── urls.py          # Django routes
├── myapp/
│   └── views.py         # Inertia views (render)
├── templates/
│   └── layout.html      # Base template, Vite tags, inertia block
├── frontend/
│   ├── vite.config.js   # base, build, manifest
│   ├── src/
│   │   ├── main.js      # createInertiaApp, resolve, mount
│   │   ├── app.css
│   │   └── Pages/
│   │       └── Welcome.svelte
│   └── dist/            # Build output (Vite)
└── staticfiles/         # collectstatic output (Django)
```

---

## CSRF

Inertia uses Axios. Django’s default CSRF cookie/header names differ from Axios’ defaults, so `main.js` configures:

```javascript
axios.defaults.xsrfHeaderName = 'X-CSRFToken'
axios.defaults.xsrfCookieName = 'csrftoken'
```

---

## Quick Start

```bash
# Backend (from project root)
pip install django inertia-django django-vite
python manage.py runserver

# Frontend (separate terminal)
cd frontend && npm install && npm run dev
```

Then open `http://localhost:8000/`. Both servers must run during development.
# django-svelte-starter-template
