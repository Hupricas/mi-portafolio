# Mi portafolio de certificados y proyectos

Página web de presentación profesional para compartir desde tu currículum. Está hecha con HTML, CSS y JavaScript, **sin necesidad de instalar nada**.

## 1. Abrir la web

Abre `index.html` haciendo doble clic. Funciona sin servidor (para cargar fuentes opcionales necesitarás conexión).

## 2. Añadir tus datos, proyectos y certificados

1. Abre `editor.html` haciendo doble clic.
2. Rellena tu perfil y tus habilidades. Añade los proyectos y certificados que quieras.
3. Si tienes un certificado en PDF, cópialo a la carpeta `certificados/`. Por ejemplo: `certificados/curso-java.pdf`.
4. Si quieres poner una captura de pantalla de tu aplicación, cópiala a `imagenes/`, por ejemplo `imagenes/calculadora.png`.
5. En el editor, utiliza esas rutas exactas en los campos de archivo o imagen. Los enlaces externos de GitHub, LinkedIn o credenciales pueden ser URL completas `https://...`.
6. Pulsa **Descargar contenido.js**. Sustituye el archivo `contenido.js` de la carpeta principal por el archivo descargado.
7. Vuelve a abrir `index.html` y comprueba los cambios. Si no se ven, recarga la pestaña con `Ctrl + F5`.

**Muy importante:** los formularios del editor cambian los datos solo en tu navegador. **No actualizan por sí mismos la web pública**. Para publicar los cambios debes actualizar `contenido.js` y, cuando corresponda, subir los PDF y las imágenes nuevos al repositorio.

Si prefieres no usar el editor, también puedes modificar directamente las listas `proyectos`, `certificados` y `habilidades` del archivo `contenido.js`.

### Ejemplo de proyecto para `contenido.js`

```js
{
  "titulo": "Mi calculadora Java",
  "categoria": "Java",
  "descripcion": "Calculadora de escritorio con interfaz gráfica.",
  "tecnologias": ["Java", "AWT"],
  "github": "https://github.com/TU-USUARIO/tu-repositorio",
  "demo": "",
  "imagen": "imagenes/calculadora.png"
}
```

### Ejemplo de certificado

```js
{
  "titulo": "Curso de Java",
  "entidad": "Entidad que lo emitió",
  "fecha": "2026",
  "tipo": "Curso",
  "descripcion": "Programación orientada a objetos",
  "archivo": "certificados/curso-java.pdf"
}
```

## 3. Publicarla GRATIS con GitHub Pages

1. Inicia sesión en [GitHub](https://github.com) y crea un repositorio nuevo, por ejemplo `mi-portafolio`, con visibilidad **Public** (con el plan gratuito).
2. Descomprime el ZIP y sube al repositorio **todo el contenido de la carpeta `mi-portafolio`**: `index.html`, `estilos.css`, `contenido.js`, `app.js`, etc. Es importante que `index.html` esté en la raíz del repositorio, no dentro de otra subcarpeta.
3. Confirma los archivos en `main` (en la web de GitHub, usando **Add file → Upload files → Commit changes**).
4. En tu repositorio abre **Settings → Pages**.
5. En **Build and deployment**, selecciona **Deploy from a branch**, la rama **main** y la carpeta **/(root)**; pulsa **Save**.
6. GitHub mostrará el enlace de tu sitio en la sección **Pages**, normalmente `https://TU-USUARIO.github.io/mi-portafolio/`.
7. Copia esa dirección y añádela a tu currículum o perfil de LinkedIn.

La publicación puede tardar unos minutos. Si creas en cambio un repositorio llamado exactamente `TU-USUARIO.github.io`, tu URL base será `https://TU-USUARIO.github.io/`.

Para futuras actualizaciones: usa el editor, descarga `contenido.js`, súbelo reemplazando el anterior y agrega los nuevos PDF/imágenes. GitHub Pages publicará la nueva versión.

## 4. Consejos para compartir certificados

- Puedes usar un archivo PDF o la **URL oficial de verificación** del emisor; esta última es útil cuando existe.
- No publiques el DNI, números personales, domicilios, firmas o códigos que no quieras hacer públicos. Oculta esos datos en el PDF antes de subirlo.
- Utiliza nombres de archivo cortos, sin espacios ni caracteres especiales (`curso-java.pdf`, `proyecto-01.png`).
- El repositorio público y los archivos del sitio son accesibles para cualquiera. No guardes contraseñas ni información privada.

## Archivos

- `index.html`: página que verán las empresas.
- `estilos.css`: diseño y adaptación a móviles.
- `app.js`: muestra proyectos y certificados automáticamente a partir de tus datos.
- `contenido.js`: tus datos, tus proyectos y tus certificados.
- `editor.html`, `editor.css`, `editor.js`: editor local para añadir o actualizar contenido.
- `favicon.svg`: icono de la página.
- `certificados/`: tus PDFs.
- `imagenes/`: capturas de tus aplicaciones.

No necesitas base de datos. Todo está preparado para funcionar en GitHub Pages.


## APK de prototipos

En `descargas/` se incluyen los APK de desarrollo de **Kaos** y **FocusBlocker**. Son compilaciones debug extraídas de los proyectos Android proporcionados. Los enlaces en `contenido.js` permiten su descarga desde GitHub Pages. No se han verificado en dispositivos reales ni firmado como versiones de publicación. Las aplicaciones requieren Android 11 o posterior (minSdk 30). FocusBlocker utiliza un servicio de accesibilidad que el usuario debe activar voluntariamente.
