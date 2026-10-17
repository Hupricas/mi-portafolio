# Guía rápida: editor visual del portafolio

## 1. Primera configuración en Windows

1. Instala **Python 3** desde https://www.python.org/downloads/ si no lo tienes. Marca **Add Python to PATH** durante la instalación.
2. Descomprime este ZIP. Abre la carpeta `mi-portafolio`.
3. Haz doble clic en **`ABRIR-EDITOR.bat`**. Se abrirá el panel en Chrome o Edge, en `http://127.0.0.1:8765/editor.html`.
4. Si el navegador no se abre automáticamente, copia esa dirección en él. Mantén abierta la ventana del programa mientras editas.

En macOS/Linux, usa `python3 editor_local.py` desde la carpeta del proyecto (o `./abrir-editor-linux-mac.sh`).

## 2. Editar sin programar

- **Perfil**: escribe tu presentación y enlaces.
- **Proyectos**: selecciona **Editar** para mantener las galerías y los botones originales, o añade uno nuevo. Puedes subir imágenes y APK con los botones del panel.
- **Certificados**: edita los existentes o sube el PDF y su miniatura.
- **Orden**: usa las flechas ↑ y ↓.
- **Guardar**: pulsa **Guardar todos los cambios**. Esto actualiza `contenido.js` y deja una copia anterior en `copias-seguridad/`.

Al subir imágenes o APK, pulsa también **Aplicar edición** en su formulario y después **Guardar todos los cambios**. La subida de archivos es inmediata; el cambio de su referencia se guarda al pulsar Guardar.

## 3. Publicar sin comandos, con GitHub Desktop

1. Instala https://desktop.github.com/ e inicia sesión con tu cuenta de GitHub.
2. Clona o abre el repositorio que publica tu portafolio.
3. Coloca **el contenido de la carpeta `mi-portafolio`** en la **raíz de ese repositorio**. Debe existir `index.html` en la raíz, salvo que tu web esté configurada para otra carpeta.
4. Para tus siguientes cambios, ejecuta `ABRIR-EDITOR.bat` **dentro de esa carpeta del repositorio**, edita y guarda.
5. Abre GitHub Desktop, comprueba los archivos modificados, escribe el resumen y pulsa **Commit to main** (o la rama de publicación), después **Push origin**.
6. GitHub Pages publicará los cambios cuando termine el despliegue.

**Importante:** `copias-seguridad/` está ignorada por `.gitignore` para que no se publiquen las copias. Los APK actuales pesan menos de 100 MB cada uno. Evita incluir binarios muy grandes en el repositorio.

## Si algo falla

- Si el panel indica **Sin conexión**, ábrelo desde `ABRIR-EDITOR.bat`, no haciendo doble clic en `editor.html`.
- Si Python no se encuentra, instálalo y vuelve a abrir el archivo BAT.
- Si no ves cambios en la web, pulsa Guardar y recarga `index.html` (Ctrl+F5).
- Si cometes un error, recupera una versión anterior de `contenido.js` desde `copias-seguridad/` o desde el historial de GitHub Desktop.
- Cierra el servidor local con Ctrl+C en la ventana de comandos.
