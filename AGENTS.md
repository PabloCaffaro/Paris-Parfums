# Paris Parfums — Contexto para agentes

## Objetivo del proyecto

Paris Parfums es una SPA de catálogo de perfumes con estética oscura y premium. Incluye una portada pública, páginas de detalle y un panel administrativo de demostración para crear, editar, borrar y restaurar perfumes.

Actualmente no existe backend ni base de datos remota. El catálogo y la sesión administrativa se guardan en el navegador para validar el flujo antes de implementar persistencia real.

## Aplicación activa

- La aplicación que se desarrolla y despliega está en la raíz: `src/`, `package.json`, `vite.config.js` e `index.html`.
- `paris-parfums-react/` es una copia histórica. No debe modificarse ni tomarse como fuente de verdad.
- Vercel construye la rama `main` con `npm run build`.

## Stack y comandos

- React 18.
- React Router 6.
- Vite 5.
- Tests unitarios con `node:test` y `node:assert`, incluidos en Node.js.
- Sin TypeScript, backend ni librería de estado externa.

```bash
npm install
npm run dev
npm test
npm run test:watch
npm run build
```

Antes de entregar un cambio, ejecutar como mínimo `npm test` y `npm run build`.

## Ramas y publicación

- `Pablo`: rama de trabajo habitual.
- `desarrollo`: integración previa a producción.
- `main`: producción; su push activa el deployment de Vercel.

Flujo esperado: trabajar y validar en `Pablo`, mergear a `desarrollo` y finalmente a `main`. Al terminar una publicación, volver localmente a `Pablo`.

## Rutas

- `/`: portada, carrusel de destacados, filtros y catálogo.
- `/perfumes/:slug`: detalle de un perfume.
- `/acceso`: login administrativo.
- `/admin`: panel protegido por `AdminRoute`.

El acceso administrativo usa una contraseña hardcodeada y storage del navegador. Es una demostración, no seguridad real.

## Arquitectura y flujo de datos

```text
Páginas y componentes React
          ↓
PerfumeStore (estado, carga, errores y sesión)
          ↓
perfumeService (validación y casos de uso CRUD)
          ↓
localPerfumeRepository (persistencia local)
          ↓
window.localStorage
```

Piezas importantes:

- `src/data/perfumes.js`: catálogo inicial y fallback.
- `src/context/PerfumeStore.jsx`: estado global, operaciones asíncronas y sesión admin.
- `src/services/perfumeService.js`: frontera de negocio; valida antes de persistir.
- `src/repositories/localPerfumeRepository.js`: CRUD en `localStorage`. Debe poder reemplazarse por una API sin reescribir la UI.
- `src/utils/perfumeValidation.js`: saneamiento y reglas de entrada.
- `src/utils/image.js`: URL segura y procesamiento de uploads.
- `src/utils/adminSecurity.js`: intentos fallidos y bloqueo temporal.
- `src/styles/app.css`: layout completo y breakpoints responsive.

## Persistencia actual

- Catálogo: `localStorage`, clave `paris-parfums-perfumes`.
- Sesión admin: `sessionStorage`.
- Intentos fallidos: `localStorage`.
- Sin catálogo guardado se usan `defaultPerfumes`.
- El repositorio hidrata datos viejos para mantener compatibilidad.
- Las imágenes aceptan URL HTTPS o data URL segura; los uploads se reducen y convierten a WEBP.

## Comportamiento que debe preservarse

- El carrusel usa los primeros cuatro perfumes, rota cada 6 segundos y permite anterior, siguiente, selección directa y pausa.
- En el destacado apilado, el orden es: rótulo, imagen y después texto.
- Catálogo:
  - hasta 640 px: una columna;
  - de 641 a 1080 px: dos columnas;
  - más de 1080 px: tres columnas.
- Los filtros combinan precio, ocasión, familia, intensidad y concentración.
- La búsqueda normaliza mayúsculas y acentos.
- Crear o editar un perfume siempre pasa por `validateAndNormalizePerfumeInput`.
- Los errores de repositorio o servicio deben llegar al store y `isLoading` debe apagarse al finalizar.

## Tests

- Los tests viven en `tests/` y usan el runner incluido en Node.js.
- Priorizar comportamiento público; no probar detalles internos innecesarios.
- Para storage usar `MemoryStorage`, nunca el storage real del desarrollador.
- Toda corrección de lógica debe incluir un test que falle antes del arreglo y pase después.
- GitHub Actions ejecuta `npm test` y `npm run build` en pushes y pull requests.
- Los tests actuales cubren utilidades, validación, servicio, repositorio local y bloqueo del login. Los componentes React todavía no tienen tests de interfaz.

## Limitaciones y próximos pasos

- Falta backend, base de datos y autenticación segura.
- La contraseña admin está expuesta en el frontend.
- Los cambios del catálogo son por navegador y no se comparten entre dispositivos.
- Las imágenes data URL pueden consumir la cuota de `localStorage`.
- El siguiente salto arquitectónico esperado es reemplazar `localPerfumeRepository` por un repositorio HTTP manteniendo la interfaz del servicio.

## Checklist para agentes

1. Confirmar que se trabaja en la raíz y en la rama correcta.
2. Ignorar `paris-parfums-react/` salvo pedido explícito.
3. Preservar cambios ajenos presentes en el worktree.
4. Mantener la separación página → store → servicio → repositorio.
5. No introducir credenciales nuevas en el frontend.
6. Agregar o actualizar tests cuando cambie lógica existente.
7. Ejecutar tests y build.
8. No hacer commit, push o merge salvo pedido explícito del usuario.
