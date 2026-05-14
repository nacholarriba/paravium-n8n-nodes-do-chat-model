# @paravium/n8n-nodes-do-chat-model

Nodo de comunidad para **n8n** que añade un *Chat Model* basado en **DigitalOcean Gradient Serverless Inference**, para usarlo dentro del nodo **AI Agent** (y cualquier otro nodo LangChain de n8n).

A diferencia del nodo oficial de DigitalOcean (que es un nodo de acción normal), este es un **sub-nodo**: se engancha directamente en el conector "Chat Model" del AI Agent, igual que los nodos integrados *OpenAI Chat Model* u *OpenRouter Chat Model*.

---

## Índice

- [Parte 0 — Qué vas a hacer y qué necesitas entender](#parte-0)
- [Parte 1 — Instalar las herramientas (una sola vez)](#parte-1)
- [Parte 2 — Descargar el proyecto a tu ordenador](#parte-2)
- [Parte 3 — Instalar dependencias y compilar](#parte-3)
- [Parte 4 — Probarlo en tu propio n8n antes de publicar](#parte-4)
- [Parte 5 — Subir el código a GitHub](#parte-5)
- [Parte 6 — Publicarlo en npm](#parte-6)
- [Parte 7 — Instalarlo en tu n8n de producción](#parte-7)
- [Parte 8 — Usarlo en un workflow](#parte-8)
- [Parte 9 — Actualizar el nodo en el futuro](#parte-9)
- [Parte 10 — Resolución de problemas](#parte-10)

---

<a name="parte-0"></a>
## Parte 0 — Qué vas a hacer y qué necesitas entender

El objetivo final: que en tu n8n, al pulsar el `+` del conector "Chat Model" de un AI Agent, aparezca un nodo llamado **"DigitalOcean Chat Model"** que puedas seleccionar, igual que aparece "OpenRouter Chat Model".

Para llegar ahí hay dos grandes fases:

1. **Construir el paquete** en tu ordenador (convertir el código TypeScript en JavaScript que n8n entiende).
2. **Instalarlo en n8n**, que puede hacerse de dos formas:
   - *Para probar*: enlazándolo localmente a un n8n que corra en tu propio ordenador.
   - *Para producción*: publicándolo en npm (el repositorio público de paquetes JavaScript) e instalándolo desde la pantalla de "Community Nodes" de tu n8n de `n8n.paravium.com`.

**Conceptos mínimos que conviene tener claros:**

- **Terminal** (también llamada "consola" o "línea de comandos"): es una ventana donde escribes comandos de texto en vez de hacer clic. Todos los comandos de este README (`npm`, `git`, `cd`, `unzip`…) se escriben **en la terminal**. Más abajo explico cómo abrirla.
- **`cd`**: comando para "entrar" en una carpeta desde la terminal (*change directory*). La terminal siempre está "situada" en una carpeta; `cd` cambia esa ubicación.
- **npm**: el gestor de paquetes de Node.js. Sirve para instalar dependencias (`npm install`), ejecutar tareas (`npm run build`) y publicar paquetes (`npm publish`).
- **Node.js**: el motor que ejecuta JavaScript fuera del navegador. n8n está hecho con Node.js, y para construir este nodo también lo necesitas.
- **Repositorio (repo)**: una carpeta de proyecto cuyo historial de cambios gestiona Git. "Subir el repo a GitHub" significa copiar esa carpeta y su historial a la nube.

---

<a name="parte-1"></a>
## Parte 1 — Instalar las herramientas (una sola vez)

Esto se hace una vez en tu ordenador. Si ya las tienes, salta a la Parte 2.

### 1.1 — Abrir una terminal

- **Windows**: pulsa la tecla Windows, escribe `PowerShell`, ábrelo. (También vale la "Terminal" de Windows si la tienes).
- **macOS**: pulsa `Cmd + Espacio`, escribe `Terminal`, ábrelo.
- **Linux**: `Ctrl + Alt + T`, o busca "Terminal" en el menú de aplicaciones.

Cuando abras la terminal verás una línea esperando que escribas. Ahí van todos los comandos.

### 1.2 — Instalar Node.js (versión 22 o superior)

n8n necesita Node.js 22+. Para instalarlo:

- Ve a **https://nodejs.org** y descarga la versión "LTS" (la recomendada). Asegúrate de que sea **v22 o superior**.
- Ejecuta el instalador y acepta las opciones por defecto.

Comprueba que quedó bien instalado escribiendo esto en la terminal:

```bash
node --version
npm --version
```

Deberías ver algo como `v22.x.x` y `10.x.x`. Si la terminal dice "command not found" o "no se reconoce", cierra y vuelve a abrir la terminal, o reinicia el ordenador.

### 1.3 — Instalar Git

Git es el sistema que gestiona el historial del código y permite subirlo a GitHub.

- **Windows**: descarga desde **https://git-scm.com/download/win** y ejecuta el instalador (opciones por defecto).
- **macOS**: escribe `git --version` en la terminal; si no lo tienes, macOS te ofrecerá instalarlo automáticamente. Alternativamente, instala desde **https://git-scm.com/download/mac**.
- **Linux (Ubuntu/Debian)**: `sudo apt update && sudo apt install git`

Comprueba:

```bash
git --version
```

### 1.4 — Instalar un editor de código (recomendado)

No es obligatorio, pero te facilita la vida para editar archivos. Descarga **Visual Studio Code** desde **https://code.visualstudio.com**. Es gratis.

### 1.5 — Crear las cuentas que necesitarás

Crea estas dos cuentas ahora (son gratis) para no tener que parar más adelante:

- **GitHub**: regístrate en **https://github.com/signup**. Aquí vivirá el código fuente.
- **npm**: regístrate en **https://www.npmjs.com/signup**. Desde aquí se publica el paquete para que n8n lo pueda instalar.

> Apunta el nombre de usuario y la contraseña de ambas. Los necesitarás en las Partes 5 y 6.

---

<a name="parte-2"></a>
## Parte 2 — Descargar el proyecto a tu ordenador

### 2.1 — Decidir dónde va a vivir el proyecto

Crea (o elige) una carpeta donde guardas tus proyectos. Por ejemplo:

- **Windows**: `C:\Users\TuUsuario\Proyectos`
- **macOS / Linux**: `/Users/TuUsuario/Proyectos` o `~/Proyectos`

Si esa carpeta no existe, créala con el explorador de archivos normal, o desde la terminal:

```bash
# macOS / Linux
mkdir -p ~/Proyectos

# Windows (PowerShell)
mkdir $HOME\Proyectos
```

### 2.2 — Colocar y descomprimir el ZIP

Mueve el archivo `paravium-n8n-nodes-do-chat-model.zip` (el que descargaste de Claude) a esa carpeta `Proyectos`. Puedes hacerlo arrastrándolo con el ratón en el explorador de archivos.

Ahora **descomprímelo**:

- **Windows**: clic derecho sobre el ZIP → "Extraer todo…" → elige la misma carpeta `Proyectos`.
- **macOS**: doble clic sobre el ZIP (se descomprime solo al lado).
- **Linux**: clic derecho → "Extraer aquí", o desde la terminal: `unzip paravium-n8n-nodes-do-chat-model.zip`

Te quedará una carpeta llamada `paravium-n8n-nodes-do-chat-model` dentro de `Proyectos`.

### 2.3 — "Entrar" en la carpeta desde la terminal

Aquí es donde respondemos a tu pregunta: *"¿dónde se hace eso?"*. **Se hace en la terminal**, y consiste en mover la "ubicación" de la terminal hasta dentro de la carpeta del proyecto, con el comando `cd`.

Abre la terminal y escribe (ajusta la ruta a donde la pusiste tú):

```bash
# macOS / Linux
cd ~/Proyectos/paravium-n8n-nodes-do-chat-model

# Windows (PowerShell)
cd $HOME\Proyectos\paravium-n8n-nodes-do-chat-model
```

**Truco para no equivocarte con la ruta**: en el explorador de archivos, entra en la carpeta `paravium-n8n-nodes-do-chat-model`, y arrastra esa carpeta hasta la ventana de la terminal justo después de escribir `cd ` (con un espacio). La terminal pegará la ruta completa automáticamente. Luego pulsa Enter.

Para confirmar que estás dentro, escribe:

```bash
# macOS / Linux
ls

# Windows
dir
```

Deberías ver los archivos del proyecto: `package.json`, `tsconfig.json`, las carpetas `nodes` y `credentials`, el `README.md`, etc. Si los ves, estás en el sitio correcto. **A partir de aquí, todos los comandos se ejecutan desde esta ubicación.**

### 2.4 — Estructura del proyecto (para que sepas qué es cada cosa)

```
paravium-n8n-nodes-do-chat-model/
├── package.json                       Identidad del paquete + qué nodos/credenciales expone
├── tsconfig.json                      Configuración del compilador TypeScript
├── .eslintrc.js                       Reglas del linter (revisa errores de estilo)
├── .gitignore / .npmignore            Qué archivos NO subir a Git / npm
├── .github/workflows/publish.yml      Automatización para publicar en npm desde GitHub
├── README.md                          Este archivo
├── credentials/
│   └── DigitalOceanInferenceApi.credentials.ts   La credencial (tu Model Access Key)
└── nodes/LmChatDigitalOcean/
    ├── LmChatDigitalOcean.node.ts      El nodo en sí (la lógica)
    ├── LmChatDigitalOcean.node.json    Metadatos del nodo
    └── paravium.png                    El icono del nodo (logo de Paravium)
```

---

<a name="parte-3"></a>
## Parte 3 — Instalar dependencias y compilar

Ahora vas a convertir el código fuente en algo que n8n pueda ejecutar. Todo esto desde la terminal, situada dentro de la carpeta del proyecto (Parte 2.3).

### 3.1 — Instalar las dependencias

```bash
npm install
```

Esto lee `package.json`, descarga todas las librerías necesarias (LangChain, herramientas de compilación, etc.) y las guarda en una carpeta nueva llamada `node_modules`. Puede tardar uno o dos minutos. Es normal que aparezcan mensajes; mientras no diga "ERR!" en rojo, va bien.

### 3.2 — Compilar el nodo

```bash
npm run build
```

Esto hace dos cosas: traduce el TypeScript (`.ts`) a JavaScript (`.js`), y copia el icono y los metadatos. El resultado aparece en una carpeta nueva llamada `dist`.

### 3.3 — Comprobar que la compilación fue bien

```bash
# macOS / Linux
ls dist/nodes/LmChatDigitalOcean

# Windows
dir dist\nodes\LmChatDigitalOcean
```

Deberías ver `LmChatDigitalOcean.node.js`, `LmChatDigitalOcean.node.json` y `paravium.png`. Si están ahí, el paquete está construido correctamente.

> Si quieres editar el código y que se recompile solo cada vez que guardas, usa `npm run dev` en lugar de `npm run build`. Déjalo corriendo en una terminal aparte.

---

<a name="parte-4"></a>
## Parte 4 — Probarlo en tu propio n8n antes de publicar

Antes de publicar nada en internet, conviene probar el nodo en un n8n que corra en tu propio ordenador. Así verificas que funciona sin afectar a `n8n.paravium.com`.

### Opción A — n8n local con `npm link` (la más sencilla para probar)

`npm link` crea un "atajo" que hace que n8n vea tu paquete como si estuviera instalado, sin tener que publicarlo.

**Paso 1.** Desde la carpeta del proyecto (donde estás situado), ejecuta:

```bash
npm link
```

Esto registra tu paquete en el sistema con su nombre `@paravium/n8n-nodes-do-chat-model`.

**Paso 2.** n8n busca nodos personalizados en una carpeta especial llamada `custom`, dentro de la carpeta de configuración de n8n (`.n8n`). Créala y entra en ella:

```bash
# macOS / Linux
mkdir -p ~/.n8n/custom
cd ~/.n8n/custom

# Windows (PowerShell)
mkdir $HOME\.n8n\custom
cd $HOME\.n8n\custom
```

**Paso 3.** Solo la primera vez, inicializa esa carpeta como proyecto npm (crea un `package.json` vacío ahí):

```bash
npm init -y
```

**Paso 4.** Engancha tu nodo dentro de esa carpeta `custom`:

```bash
npm link @paravium/n8n-nodes-do-chat-model
```

**Paso 5.** Si no tienes n8n instalado en tu ordenador, instálalo de forma global:

```bash
npm install -g n8n
```

**Paso 6.** Arranca n8n:

```bash
n8n start
```

Abre el navegador en `http://localhost:5678`. Crea un workflow de prueba con un AI Agent, pulsa el `+` del conector "Chat Model" y busca "DigitalOcean". Debería aparecer tu nodo con el logo de Paravium.

> Cada vez que cambies el código, tienes que volver a hacer `npm run build` en la carpeta del proyecto y **reiniciar n8n** (cierra con `Ctrl + C` en la terminal y vuelve a `n8n start`).

### Opción B — n8n local con Docker

Si prefieres Docker, crea un archivo `docker-compose.yml` en cualquier carpeta con este contenido (ajusta la ruta del volumen a donde tengas el proyecto):

```yaml
services:
  n8n:
    image: docker.n8n.io/n8nio/n8n:latest
    ports:
      - "5678:5678"
    environment:
      - N8N_CUSTOM_EXTENSIONS=/home/node/.n8n/custom
    volumes:
      - n8n_data:/home/node/.n8n
      - /ruta/a/Proyectos/paravium-n8n-nodes-do-chat-model:/home/node/.n8n/custom/node_modules/@paravium/n8n-nodes-do-chat-model

volumes:
  n8n_data:
```

Luego, desde la carpeta donde está ese archivo: `docker compose up -d`. n8n estará en `http://localhost:5678`. Tras cada `npm run build`, reinicia con `docker compose restart`.

---

<a name="parte-5"></a>
## Parte 5 — Subir el código a GitHub

Tener el código en GitHub es necesario si más adelante quieres usar la publicación automática, y en general es buena práctica. Todo esto desde la terminal, situado en la carpeta del proyecto (vuelve ahí con `cd` si te moviste).

### 5.1 — Configurar Git (solo la primera vez en tu ordenador)

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@paravium.com"
```

Usa el mismo email con el que te registraste en GitHub.

### 5.2 — Convertir la carpeta en un repositorio y hacer el primer commit

```bash
git init
git add .
git commit -m "Versión inicial del nodo DigitalOcean Chat Model"
```

- `git init` crea el repositorio (empieza a llevar el historial).
- `git add .` marca todos los archivos para guardar (el punto significa "todo"). El archivo `.gitignore` se encarga de que `node_modules` y `dist` no se suban.
- `git commit` guarda una "foto" del estado actual con un mensaje descriptivo.

### 5.3 — Crear el repositorio vacío en GitHub

1. Entra en **https://github.com** con tu cuenta.
2. Arriba a la derecha, pulsa el `+` → **New repository**.
3. En "Repository name" escribe: `paravium-n8n-nodes-do-chat-model`.
4. Déjalo como **Public** (necesario si luego publicas en npm como paquete público).
5. **No** marques "Add a README", "Add .gitignore" ni "license" — el proyecto ya los tiene.
6. Pulsa **Create repository**.

### 5.4 — Conectar tu carpeta local con el repositorio de GitHub y subir

GitHub te mostrará unos comandos tras crear el repo. Son estos (sustituye `TU-USUARIO` por tu usuario real de GitHub):

```bash
git remote add origin https://github.com/TU-USUARIO/paravium-n8n-nodes-do-chat-model.git
git branch -M main
git push -u origin main
```

La primera vez que hagas `push`, GitHub te pedirá autenticarte. Lo más sencillo: cuando te pida la contraseña, **no uses tu contraseña normal** — GitHub ya no la acepta. En su lugar:

1. Ve a **https://github.com/settings/tokens** → "Generate new token" → "Generate new token (classic)".
2. Marca la casilla `repo`. Genera el token y cópialo.
3. Cuando la terminal pida "Password", pega ese token.

Tras esto, recarga la página del repo en GitHub: deberías ver todos tus archivos.

---

<a name="parte-6"></a>
## Parte 6 — Publicarlo en npm

Publicar en npm es lo que permite que tu n8n de producción instale el nodo desde su pantalla de "Community Nodes".

### 6.1 — Preparar el "scope" de Paravium en npm

El paquete se llama `@paravium/n8n-nodes-do-chat-model`. La parte `@paravium` es un **scope**, y npm exige que ese scope sea o bien tu nombre de usuario, o bien una organización tuya.

Lo más limpio: crea una organización gratuita llamada `paravium`:

1. Entra en **https://www.npmjs.com** con tu cuenta.
2. Arriba a la derecha, tu avatar → **Add Organization**.
3. Nombre de la organización: `paravium`. Elige el plan **Free** (permite paquetes públicos ilimitados).

> Si el nombre `paravium` ya estuviera cogido en npm, tienes dos alternativas: usar otro scope (por ejemplo `@paravium-tech`) y cambiar el campo `name` del `package.json` en consecuencia, o publicarlo sin scope renombrándolo a `n8n-nodes-do-chat-model` (sin `@paravium/`). Cualquiera de las dos vale; solo recuerda usar ese mismo nombre en todos los comandos posteriores.

### 6.2 — Iniciar sesión en npm desde la terminal

Desde la carpeta del proyecto:

```bash
npm login
```

Te pedirá usuario, contraseña y probablemente un código de verificación por email o navegador. Sigue las instrucciones.

Comprueba que quedaste logueado:

```bash
npm whoami
```

Debe mostrar tu nombre de usuario.

### 6.3 — Publicar

```bash
npm publish
```

El `package.json` ya tiene configurado `publishConfig.access = public`, así que se publicará como paquete público (los paquetes con scope son privados por defecto, y esto lo evita).

Si todo va bien, en unos segundos tu paquete estará visible en `https://www.npmjs.com/package/@paravium/n8n-nodes-do-chat-model`.

> **Importante**: cada vez que quieras publicar una versión nueva, primero tienes que **subir el número de versión** en `package.json` (por ejemplo de `0.1.0` a `0.1.1`). npm no deja publicar dos veces la misma versión. Puedes hacerlo a mano editando el archivo, o con el comando `npm version patch` (sube el último dígito automáticamente).

### 6.4 — (Opcional) Publicación automática desde GitHub

El proyecto incluye `.github/workflows/publish.yml`, que publica en npm automáticamente cada vez que creas una "etiqueta de versión" en Git. Esto es además **obligatorio** si algún día quieres que n8n verifique oficialmente tu nodo (desde el 1 de mayo de 2026, los nodos verificados deben publicarse así, con "provenance").

Para activarlo:

1. En **https://www.npmjs.com**, ajustes de tu paquete → **Publishing access** → **Trusted Publishers** → añade un publisher de tipo "GitHub Actions" apuntando a tu repo `TU-USUARIO/paravium-n8n-nodes-do-chat-model`, con workflow `publish.yml`.
2. A partir de ahí, para publicar una versión: sube la versión en `package.json`, haz commit, y crea la etiqueta:
   ```bash
   git add package.json
   git commit -m "v0.1.1"
   git tag v0.1.1
   git push && git push --tags
   ```
   GitHub se encarga del resto.

---

<a name="parte-7"></a>
## Parte 7 — Instalarlo en tu n8n de producción

Ya con el paquete publicado en npm, instálalo en tu n8n de `n8n.paravium.com`.

1. Entra en n8n como administrador.
2. Ve a **Settings** (ajustes) → **Community Nodes**.
3. Pulsa **Install a community node**.
4. En "npm Package Name" escribe exactamente: `@paravium/n8n-nodes-do-chat-model`
5. Marca la casilla de aceptación de riesgos y pulsa **Install**.
6. Espera a que termine. En algunas versiones de n8n hay que reiniciar la instancia para que el nodo aparezca. Si lo tienes con Docker: `docker compose restart n8n` (o el comando equivalente de tu despliegue).

> Los nodos de comunidad funcionan en n8n self-hosted (como el tuyo). En n8n Cloud solo están disponibles en ciertos planes.

---

<a name="parte-8"></a>
## Parte 8 — Usarlo en un workflow

### 8.1 — Crear el Model Access Key en DigitalOcean

1. Entra en el panel de DigitalOcean.
2. Menú lateral → **Agent Platform** → **Serverless Inference** → pestaña **Model Access Keys**.
3. Pulsa **Create model access key**, ponle un nombre (por ejemplo `n8n-paravium`) y **copia el valor inmediatamente** — solo se muestra una vez.

### 8.2 — Crear la credencial en n8n

1. En n8n, menú **Credentials** → **New**.
2. Busca y elige **DigitalOcean Inference API**.
3. Rellena:
   - **Model Access Key**: el valor que copiaste en el paso anterior.
   - **Base URL**: deja el valor por defecto `https://inference.do-ai.run/v1` (solo se cambia si usas un endpoint dedicado).
4. Pulsa **Save**. n8n hará una prueba automática (una llamada a `/v1/models`); si la clave es válida, la credencial quedará verificada.

### 8.3 — Sustituir el nodo en tu workflow

1. Abre tu workflow del AI Agent.
2. Borra el nodo "OpenRouter Chat Model" que cuelga del conector **Chat Model**.
3. Pulsa el `+` de ese conector → busca **"DigitalOcean Chat Model"** → añádelo.
4. En **Credential**, elige la credencial que creaste.
5. En **Model**, el desplegable se rellena solo con los modelos disponibles en tu cuenta de DigitalOcean. Para un agente conversacional, `anthropic-claude-haiku-4.5` es un buen punto de partida; sube a `anthropic-claude-4.6-sonnet` si necesitas más contexto o mejor razonamiento.
6. Si tu workflow tiene un segundo Chat Model colgando de un "Structured Output Parser", repite el cambio ahí también (para parsing, un modelo pequeño como `openai-gpt-4o-mini` es suficiente; activa además la opción **Response Format: JSON Object**).

### Nota sobre tool calling

Para que el AI Agent pueda invocar herramientas (tus nodos de búsqueda en knowledge base, consultas SQL, etc.), elige un modelo que soporte "Agents" en el catálogo de DigitalOcean: todos los Anthropic Claude, los OpenAI GPT-4o/4.1/5, Llama 3.3 70B, DeepSeek, Kimi, GLM-5 y Gemma 4 lo soportan. **Evita la familia GPT-5.4**, que en serverless solo funciona con la Responses API y no con este nodo.

---

<a name="parte-9"></a>
## Parte 9 — Actualizar el nodo en el futuro

Cuando quieras cambiar algo del nodo:

1. Edita los archivos en `nodes/` o `credentials/` con tu editor.
2. Recompila: `npm run build`.
3. Pruébalo localmente (Parte 4).
4. Sube el número de versión en `package.json` (por ejemplo `0.1.0` → `0.1.1`).
5. Guarda los cambios en Git:
   ```bash
   git add .
   git commit -m "Descripción del cambio"
   git push
   ```
6. Publica la nueva versión en npm: `npm publish` (o crea la etiqueta de versión si usas la publicación automática).
7. En tu n8n de producción, ve a **Settings → Community Nodes**, y actualiza el paquete a la versión nueva.

---

<a name="parte-10"></a>
## Parte 10 — Resolución de problemas

**`npm install` falla con errores rojos**
Comprueba que Node.js es v22 o superior (`node --version`). Si lo acabas de instalar, cierra y reabre la terminal.

**`npm run build` da errores de TypeScript**
Asegúrate de haber hecho `npm install` antes. Si editaste el código, revisa el error que indica el archivo y la línea.

**El nodo no aparece en n8n tras instalarlo**
Reinicia la instancia de n8n. Si es local, `Ctrl + C` y `n8n start` de nuevo. Si es Docker, `docker compose restart`. Verifica también que en `package.json` el bloque `n8n` apunta a los archivos `.js` dentro de `dist/`.

**`npm publish` dice "402 Payment Required" o "403 Forbidden"**
Los paquetes con scope (`@paravium/...`) son privados por defecto. El `package.json` ya incluye `publishConfig.access = public` para evitarlo; si aun así falla, ejecuta `npm publish --access public`. Si dice que no tienes permisos sobre el scope, revisa que la organización `paravium` existe en tu cuenta de npm (Parte 6.1).

**`npm publish` dice "version already exists"**
No puedes publicar dos veces la misma versión. Sube el número en `package.json` y vuelve a publicar.

**La credencial no se valida en n8n**
Comprueba que el Model Access Key es correcto y está activo en DigitalOcean, y que la Base URL es exactamente `https://inference.do-ai.run/v1`.

**El AI Agent no usa las herramientas**
Estás usando un modelo que no soporta "Agents", o uno de la familia GPT-5.4. Cambia a un modelo Anthropic Claude o a Llama 3.3 70B.

---

## Licencia

MIT
