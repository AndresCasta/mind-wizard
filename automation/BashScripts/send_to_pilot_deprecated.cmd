:: copy bundle file to html5-content, pull, commit canges, and push changes to develop and webapp
set gameName=YourGameHere
set devPath=C:\Users\w3d\Documents\mind_projects\0004_numberLineExponents\mind-games-numberlineexponents
set pilotPath=C:\Users\w3d\Documents\mind_projects\html5-content\content\arenas

echo ..........................................
echo Copying %gameName%.js.map html5-content...
del %pilotPath%\%gameName%.js
del %pilotPath%\%gameName%.js.map
copy %devPath%\%gameName%.js %pilotPath%\%gameName%.js
copy %devPath%\%gameName%.js.map %pilotPath%\%gameName%.js.map

echo ..........................................
echo Pulling from remote repo
cd %pilotPath%
git pull origin webapp
git add -A
git commit -m "%1"

echo ..........................................
echo Commit to develop branch
cd %devPath%
git add -A 
git commit -m "%1"

:: set path to dev again
cd %devPath%;