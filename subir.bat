@echo off
echo =========================================
echo Subiendo proyecto a GitHub...
echo =========================================

IF NOT EXIST ".git" (
    echo Inicializando repositorio Git...
    git init
    git branch -M main
    git remote add origin https://github.com/danasvetliza-ui/canufeelme.git
) ELSE (
    echo Verificando remote origin...
    git remote set-url origin https://github.com/danasvetliza-ui/canufeelme.git
)

git config user.name "danasvetliza-ui"
git config user.email "danasvetliza@users.noreply.github.com"
git config http.postBuffer 524288000

git lfs install
git lfs track "*.MP4"
git lfs track "*.mp4"
git add .gitattributes

echo Agregando archivos...
git add .

echo Creando commit...
git commit -m "Publicacion Can U Feel Me"

echo Subiendo a GitHub (branch main)...
git push -u origin main

echo =========================================
echo Proceso completado.
echo ===================