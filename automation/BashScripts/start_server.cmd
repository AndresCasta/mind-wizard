set gameName=YourGameNameHere
set devPath=%~p0..\

cd %devPath%
gulp bundle ---gameName %gameName% ---serve true
echo %devPath%