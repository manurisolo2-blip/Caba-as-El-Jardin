# Pautas de Desarrollo del Proyecto

## Sincronización Obligatoria con GitHub
- Al completar cualquier tarea, funcionalidad, refactorización o corrección en el código:
  1. Verificar el estado de los archivos (`git status`, `git diff`).
  2. Agregar todos los archivos modificados (`git add -A` o archivos específicos).
  3. Realizar un commit con un mensaje claro y descriptivo en español (`git commit -m "..."`).
  4. Enviar los cambios al repositorio remoto en GitHub (`git push origin main`) y confirmar que el comando finalice con éxito.

## Verificación Local
- Mantener el servidor local en ejecución (`node server.js` en el puerto 8000).
- Comprobar que responda `HTTP 200 OK` antes de dar por finalizada la interacción.

## Lineamientos de Diseño y UI
- Respetar los fondos sólidos y limpios de la paleta botánica (verde pino `#244033`, arena suave `#EFE9DE`, lino `#FAF8F5`).
- No superponer imágenes tenues o veladas detrás de textos en bloques diseñados para fondos planos (evitar siluetas o sombras no deseadas).
- Preservar el efecto telón del Hero y el ritmo vertical compacto sin scrollings vacíos.
