# Bingo Musical Web

Sitio estático para generar un cartón de bingo musical aleatorio en el navegador.

## Archivos

- `index.html`: pantalla inicial y pantalla del cartón.
- `style.css`: diseño responsive para teléfono.
- `bingo.js`: carga el CSV, genera el cartón y maneja los clics.
- `canciones.csv`: playlist que podés reemplazar cuando quieras.

## Cómo cambiar la playlist

Reemplazá `canciones.csv` por otro archivo con el mismo nombre.

El JavaScript reconoce estos nombres de columnas para la canción:

- `cancion`
- `canción`
- `titulo`
- `título`
- `Track Name`
- `track`
- `song`
- `name`

Y estos para artista:

- `artista`
- `artist`
- `Artist Name(s)`
- `artists`

Ejemplos válidos:

```csv
cancion,artista
Billie Jean,Michael Jackson
Dancing Queen,ABBA
```

o:

```csv
Track Name,Artist Name(s)
Billie Jean,Michael Jackson
Dancing Queen,ABBA
```

## Configuración

Al principio de `bingo.js`:

```js
const CONFIG = {
  csvPath: "canciones.csv",
  gridSize: 5,
  freeCenter: true,
};
```

- `gridSize: 5` genera una grilla 5×5.
- `freeCenter: true` deja el centro como `LIBRE`.
- Con esa configuración se necesitan al menos 24 canciones distintas.

## Importante: cómo probarlo

No conviene abrir `index.html` directamente con doble clic porque algunos navegadores bloquean `fetch()` de archivos locales.

Desde esta carpeta podés ejecutar:

```bash
python3 -m http.server 8000
```

Luego abrir:

```text
http://localhost:8000
```

Desde otro dispositivo de la misma red podés abrir:

```text
http://IP-DE-TU-PC:8000
```

si el firewall permite el puerto.

## Hosting

Como no necesita backend ni base de datos, puede publicarse en cualquier hosting estático.

Cada navegador genera su propio cartón. El estado vive únicamente en la pestaña abierta. Si el usuario actualiza la página, empieza nuevamente.
